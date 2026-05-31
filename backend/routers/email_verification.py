import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database import get_db
import models
from auth import get_current_user
from email_utils import send_verification_email

router = APIRouter(prefix="/auth", tags=["auth"])

TOKEN_EXPIRY_HOURS = 24


class ResendBody(BaseModel):
    email: EmailStr


def create_and_send_verification(db: Session, user: models.User) -> str:
    """Create a new verification token and email it. Returns the token string."""
    # Invalidate old tokens
    db.query(models.EmailVerificationToken).filter(
        models.EmailVerificationToken.user_id == user.id,
        models.EmailVerificationToken.used == False,
    ).update({"used": True})

    token = secrets.token_urlsafe(48)
    db.add(models.EmailVerificationToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS),
    ))
    db.commit()

    sent = send_verification_email(user.email, user.name, token)
    if not sent:
        print(f"[VERIFY] Token for {user.email}: {token}")
    return token


@router.post("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    evt = db.query(models.EmailVerificationToken).filter(
        models.EmailVerificationToken.token == token,
    ).first()

    if not evt:
        raise HTTPException(status_code=400, detail="Неверная ссылка подтверждения")
    if evt.used:
        # Already used — but if user is verified, that's OK
        user = db.get(models.User, evt.user_id)
        if user and user.email_verified:
            return {"message": "Email уже подтверждён", "already": True}
        raise HTTPException(status_code=400, detail="Ссылка уже использована")
    if evt.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Ссылка истекла. Запросите новую.")

    user = db.get(models.User, evt.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user.email_verified = True
    evt.used = True
    db.commit()
    return {"message": "Email успешно подтверждён!", "email": user.email}


@router.post("/resend-verification")
def resend_verification(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.email_verified:
        raise HTTPException(status_code=400, detail="Email уже подтверждён")
    create_and_send_verification(db, current_user)
    return {"message": "Письмо с подтверждением отправлено на ваш email."}
