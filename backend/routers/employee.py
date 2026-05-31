from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import get_employee_user
from routers.orders import _order_out

router = APIRouter(prefix="/employee", tags=["employee"])

VALID_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]


@router.get("/orders", response_model=list[schemas.OrderOut])
def get_my_branch_orders(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_employee_user),
):
    q = db.query(models.Order)

    # Admins see all orders; employees see only their branch
    if current_user.is_employee and not current_user.is_admin:
        if not current_user.branch_id:
            return []
        q = q.filter(models.Order.branch_id == current_user.branch_id)

    if status:
        q = q.filter(models.Order.status == status)

    orders = q.order_by(models.Order.created_at.desc()).all()
    return [_order_out(o) for o in orders]


@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_employee_user),
):
    if status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {VALID_STATUSES}")

    order = db.get(models.Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Employees can only update orders of their own branch
    if current_user.is_employee and not current_user.is_admin:
        if order.branch_id != current_user.branch_id:
            raise HTTPException(status_code=403, detail="Order belongs to a different branch")

    order.status = status
    db.commit()
    return {"id": order_id, "status": status}


@router.get("/stats")
def get_branch_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_employee_user),
):
    q = db.query(models.Order)
    if current_user.is_employee and not current_user.is_admin:
        q = q.filter(models.Order.branch_id == current_user.branch_id)

    orders = q.all()
    pending = sum(1 for o in orders if o.status == "pending")
    processing = sum(1 for o in orders if o.status in ("confirmed", "processing"))
    shipped = sum(1 for o in orders if o.status == "shipped")
    delivered = sum(1 for o in orders if o.status == "delivered")
    revenue = sum(o.total for o in orders if o.status != "cancelled")

    branch_name = current_user.branch.name if current_user.branch else "All branches"
    return {
        "branch": branch_name,
        "pending": pending,
        "processing": processing,
        "shipped": shipped,
        "delivered": delivered,
        "revenue": round(revenue, 2),
        "total_orders": len(orders),
    }
