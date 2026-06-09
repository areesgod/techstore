import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import get_current_user
from email_utils import send_receipt_email
from data.cities import CITIES
from data.loyalty import get_tier

router = APIRouter(prefix="/orders", tags=["orders"])

CASHBACK_MAX_USE = 0.20
CASHBACK_MIN_USE = 500


def _order_item_out(item: models.OrderItem) -> schemas.OrderItemOut:
    return schemas.OrderItemOut(
        id=item.id,
        product_id=item.product_id,
        product_name=item.product.name if item.product else "Unknown",
        quantity=item.quantity,
        unit_price=item.unit_price,
        is_digital=item.product.is_digital if item.product else False,
        download_token=item.download_token,
    )


def _order_out(order: models.Order) -> schemas.OrderOut:
    return schemas.OrderOut(
        id=order.id,
        billing_name=order.billing_name,
        billing_email=order.billing_email,
        delivery_city=order.delivery_city,
        total=order.total,
        cashback_used=order.cashback_used,
        cashback_earned=order.cashback_earned,
        payment_method=order.payment_method,
        installment_months=order.installment_months,
        status=order.status,
        payment_ref=order.payment_ref,
        branch_id=order.branch_id,
        created_at=order.created_at,
        items=[_order_item_out(i) for i in order.items],
    )


@router.post("", response_model=schemas.OrderOut)
def create_order(
    body: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not body.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    method = body.payment_method  # card | cash | installment
    if method not in ("card", "cash", "installment"):
        raise HTTPException(status_code=400, detail="Invalid payment method")
    if method == "installment" and body.installment_months not in (3, 6, 12):
        raise HTTPException(status_code=400, detail="Installment months must be 3, 6, or 12")

    # Build order items
    subtotal = 0.0
    order_items_data = []
    for item_in in body.items:
        product = db.get(models.Product, item_in.product_id)
        if not product or not product.is_active:
            raise HTTPException(status_code=404, detail=f"Product {item_in.product_id} not found")
        if not product.is_digital and product.stock is not None and product.stock < item_in.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        subtotal += product.price * item_in.quantity
        order_items_data.append((product, item_in.quantity, product.price))

    # Cashback redemption (only card payments can use cashback)
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    cashback_used = 0.0
    if method == "card" and body.use_cashback and user.cashback_balance >= CASHBACK_MIN_USE:
        max_use = min(user.cashback_balance, subtotal * CASHBACK_MAX_USE)
        cashback_used = round(max_use, 2)

    total = round(subtotal - cashback_used, 2)

    # Cashback earned — only on card payments, rate based on loyalty tier
    cashback_earned = 0.0
    if method == "card":
        tier = get_tier(user.total_spent)
        cashback_earned = round(total * tier["rate"], 2)

    # Determine branch from city
    branch_id = None
    if body.delivery_city and body.delivery_city in CITIES:
        branch_id = CITIES[body.delivery_city]["branch_id"]

    payment_ref = f"{'CASH' if method=='cash' else 'INST' if method=='installment' else 'MOCK'}-{uuid.uuid4().hex[:10].upper()}"

    order = models.Order(
        user_id=current_user.id,
        branch_id=branch_id,
        billing_name=body.billing_name,
        billing_email=body.billing_email,
        delivery_city=body.delivery_city,
        total=total,
        cashback_used=cashback_used,
        cashback_earned=cashback_earned,
        payment_method=method,
        installment_months=body.installment_months if method == "installment" else None,
        status="pending",
        payment_ref=payment_ref,
    )
    db.add(order)
    db.flush()

    email_items = []
    for product, qty, price in order_items_data:
        token = uuid.uuid4().hex if product.is_digital else None
        oi = models.OrderItem(
            order_id=order.id, product_id=product.id,
            quantity=qty, unit_price=price, download_token=token,
        )
        db.add(oi)
        if not product.is_digital and product.stock is not None:
            product.stock -= qty
            if branch_id:
                bs = db.query(models.BranchStock).filter(
                    models.BranchStock.branch_id == branch_id,
                    models.BranchStock.product_id == product.id,
                ).first()
                if bs and bs.quantity >= qty:
                    bs.quantity -= qty
        email_items.append({"name": product.name, "quantity": qty, "price": price * qty})

    # Apply cashback changes (card only)
    if method == "card":
        if cashback_used > 0:
            user.cashback_balance = round(user.cashback_balance - cashback_used, 2)
            db.add(models.CashbackTransaction(
                user_id=user.id, order_id=order.id,
                amount=-cashback_used, type="used",
                description=f"Использован кэшбэк для заказа #{order.id}",
            ))
        if cashback_earned > 0:
            user.cashback_balance = round(user.cashback_balance + cashback_earned, 2)
            db.add(models.CashbackTransaction(
                user_id=user.id, order_id=order.id,
                amount=cashback_earned, type="earned",
                description=f"Кэшбэк за заказ #{order.id} ({round(get_tier(user.total_spent)['rate']*100)}%)",
            ))

    # Update total spent (all payment methods count toward loyalty)
    user.total_spent = round(user.total_spent + total, 2)

    db.commit()
    db.refresh(order)

    try:
        send_receipt_email(
            to_email=body.billing_email, to_name=body.billing_name,
            order_id=order.id, items=email_items, total=total,
        )
    except Exception as e:
        print(f"[EMAIL] Error: {e}")

    return _order_out(order)


@router.get("", response_model=list[schemas.OrderOut])
def list_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    orders = db.query(models.Order).filter(
        models.Order.user_id == current_user.id
    ).order_by(models.Order.created_at.desc()).all()
    return [_order_out(o) for o in orders]


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    order = db.get(models.Order, order_id)
    if not order or (order.user_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=404, detail="Order not found")
    return _order_out(order)
