from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import get_current_user
from data.loyalty import TIERS, get_tier, get_next_tier, tier_progress_pct

router = APIRouter(prefix="/cashback", tags=["cashback"])

CASHBACK_MAX_USE = 0.20   # max 20% of order can be paid with cashback
CASHBACK_MIN_USE = 500    # minimum ₸500 to redeem


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


@router.get("/loyalty")
def get_loyalty(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns current loyalty tier, progress to next tier, and all tier definitions."""
    user = db.get(models.User, current_user.id)
    tier = get_tier(user.total_spent)
    next_t = get_next_tier(user.total_spent)
    progress = tier_progress_pct(user.total_spent)

    return {
        "total_spent": round(user.total_spent, 2),
        "cashback_balance": round(user.cashback_balance, 2),
        "current_tier": tier,
        "next_tier": next_t,
        "progress_pct": progress,
        "all_tiers": TIERS,
    }


@router.get("/preview")
def preview_cashback(order_total: float, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns how much cashback the user can use and will earn (card payment only)."""
    user = db.get(models.User, current_user.id)
    tier = get_tier(user.total_spent)
    max_usable = min(user.cashback_balance, order_total * CASHBACK_MAX_USE)
    will_earn = round(order_total * tier["rate"], 2)
    return {
        "balance": round(user.cashback_balance, 2),
        "max_usable": round(max_usable, 2) if max_usable >= CASHBACK_MIN_USE else 0,
        "will_earn": will_earn,
        "rate_pct": round(tier["rate"] * 100, 0),
        "tier_name": tier["name"],
        "tier_color": tier["color"],
    }
