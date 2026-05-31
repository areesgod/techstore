from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/cashback", tags=["cashback"])

CASHBACK_RATE = 0.03        # 3% earned
CASHBACK_MAX_USE = 0.20     # max 20% of order can be paid with cashback
CASHBACK_MIN_USE = 500      # minimum ₸500 to redeem


@router.get("/balance")
def get_balance(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.get(models.User, current_user.id)
    return {"balance": round(user.cashback_balance, 2)}


@router.get("/history", response_model=list[schemas.CashbackTransactionOut])
def get_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(models.CashbackTransaction)
        .filter(models.CashbackTransaction.user_id == current_user.id)
        .order_by(models.CashbackTransaction.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/preview")
def preview_cashback(order_total: float, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns how much cashback the user can use and will earn on a given order total."""
    user = db.get(models.User, current_user.id)
    max_usable = min(user.cashback_balance, order_total * CASHBACK_MAX_USE)
    will_earn = round(order_total * CASHBACK_RATE, 2)
    return {
        "balance": round(user.cashback_balance, 2),
        "max_usable": round(max_usable, 2) if max_usable >= CASHBACK_MIN_USE else 0,
        "will_earn": will_earn,
        "rate_pct": int(CASHBACK_RATE * 100),
    }
