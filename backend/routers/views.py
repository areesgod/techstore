from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/views", tags=["views"])

class ViewEvent(BaseModel):
    product_id: int
    duration_seconds: int = 0

@router.post("")
def record_view(body: ViewEvent, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    view = models.ProductView(
        user_id=current_user.id,
        product_id=body.product_id,
        duration_seconds=max(0, body.duration_seconds),
    )
    db.add(view)
    db.commit()
    return {"ok": True}

@router.get("/top")
def top_products(limit: int = 10, db: Session = Depends(get_db)):
    from sqlalchemy import func
    rows = (
        db.query(models.ProductView.product_id, func.count().label("views"), func.avg(models.ProductView.duration_seconds).label("avg_duration"))
        .group_by(models.ProductView.product_id)
        .order_by(func.avg(models.ProductView.duration_seconds).desc())
        .limit(limit)
        .all()
    )
    return [{"product_id": r.product_id, "views": r.views, "avg_duration": round(r.avg_duration or 0)} for r in rows]
