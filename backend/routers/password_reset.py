import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
import models
from auth import hash_password
from email_utils import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])

TOKEN_EXPIRY_HOURS = 1


class ForgotPasswordBody(BaseModel):
    email: EmailStr


class ResetPasswordBody(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordBody, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Пользователь с таким email не найден")

    # Invalidate old tokens for this user
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used == False,
    ).update({"used": True})

    token = secrets.token_urlsafe(48)
    prt = models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS),
    )
    db.add(prt)
    db.commit()

    sent = send_password_reset_email(user.email, user.name, token)
    if not sent:
        print(f"[RESET] Token for {user.email}: {token}")

    return {"message": "Письмо со ссылкой для сброса пароля отправлено на ваш email."}


@router.post("/reset-password")
def reset_password(body: ResetPasswordBody, db: Session = Depends(get_db)):
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Пароль должен быть не менее 6 символов")

    prt = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == body.token,
    ).first()

    if not prt:
        raise HTTPException(status_code=400, detail="Неверная или истёкшая ссылка сброса пароля")
    if prt.used:
        raise HTTPException(status_code=400, detail="Ссылка уже использована. Запросите новую.")
    if prt.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Ссылка истекла. Запросите новую.")

    user = db.get(models.User, prt.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user.hashed_password = hash_password(body.new_password)
    prt.used = True
    db.commit()

    return {"message": "Пароль успешно изменён. Войдите с новым паролем."}


@router.get("/verify-reset-token")
def verify_reset_token(token: str, db: Session = Depends(get_db)):
    """Check if a reset token is valid before showing the new-password form."""
    prt = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == token,
        models.PasswordResetToken.used == False,
    ).first()

    if not prt or prt.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Неверная или истёкшая ссылка")

    return {"valid": True, "email": prt.user.email}
