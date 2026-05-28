from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models, schemas
from auth import get_admin_user
from routers.orders import _order_out

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=schemas.AdminStats)
def get_stats(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    revenue = db.query(func.sum(models.Order.total)).scalar() or 0.0
    orders = db.query(func.count(models.Order.id)).scalar() or 0
    products = db.query(func.count(models.Product.id)).filter(models.Product.is_active == True).scalar() or 0
    customers = db.query(func.count(models.User.id)).filter(models.User.is_admin == False).scalar() or 0
    return schemas.AdminStats(revenue=revenue, orders=orders, products=products, customers=customers)


@router.get("/orders", response_model=list[schemas.OrderOut])
def list_all_orders(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    return [_order_out(o) for o in orders]
