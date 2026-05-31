from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models, schemas
from auth import get_admin_user, hash_password
from routers.orders import _order_out
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/admin", tags=["admin"])


class UserAdminOut(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool
    is_employee: bool
    branch_id: Optional[int]
    cashback_balance: float
    created_at: datetime
    order_count: int
    total_spent: float
    model_config = {"from_attributes": True}


class CreateEmployeeBody(BaseModel):
    name: str
    email: EmailStr
    password: str
    branch_id: int


@router.get("/stats", response_model=schemas.AdminStats)
def get_stats(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    revenue = db.query(func.sum(models.Order.total)).scalar() or 0.0
    orders = db.query(func.count(models.Order.id)).scalar() or 0
    products = db.query(func.count(models.Product.id)).filter(models.Product.is_active == True).scalar() or 0
    customers = db.query(func.count(models.User.id)).filter(models.User.is_admin == False, models.User.is_employee == False).scalar() or 0
    return schemas.AdminStats(revenue=revenue, orders=orders, products=products, customers=customers)


@router.get("/orders", response_model=list[schemas.OrderOut])
def list_all_orders(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
    return [_order_out(o) for o in orders]


@router.get("/users", response_model=list[UserAdminOut])
def list_all_users(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    result = []
    for u in users:
        result.append(UserAdminOut(
            id=u.id, name=u.name, email=u.email,
            is_admin=u.is_admin, is_employee=u.is_employee,
            branch_id=u.branch_id, cashback_balance=u.cashback_balance,
            created_at=u.created_at,
            order_count=len(u.orders),
            total_spent=sum(o.total for o in u.orders),
        ))
    return result


@router.patch("/users/{user_id}/toggle-admin")
def toggle_admin(user_id: int, db: Session = Depends(get_db), current=Depends(get_admin_user)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current.id:
        raise HTTPException(status_code=400, detail="Cannot change your own admin status")
    user.is_admin = not user.is_admin
    db.commit()
    return {"id": user.id, "is_admin": user.is_admin}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current=Depends(get_admin_user)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()
    return {"ok": True}


# ── Employee management ───────────────────────────────────────────

@router.post("/employees", response_model=schemas.UserOut)
def create_employee(body: CreateEmployeeBody, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    branch = db.get(models.Branch, body.branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    user = models.User(
        name=body.name, email=body.email,
        hashed_password=hash_password(body.password),
        is_employee=True, branch_id=body.branch_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/employees/{user_id}/branch")
def assign_branch(user_id: int, branch_id: int, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.branch_id = branch_id
    user.is_employee = True
    db.commit()
    return {"ok": True}
