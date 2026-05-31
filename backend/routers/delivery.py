from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from data.cities import CITIES, CITY_NAMES, BRANCH_CITIES

router = APIRouter(prefix="/delivery", tags=["delivery"])

CASHBACK_RATE = 0.03          # 3 % earned on every order
CASHBACK_MAX_USE_RATE = 0.20  # up to 20 % of order total can be paid with cashback


@router.get("/cities")
def list_cities():
    return {"cities": CITY_NAMES}


@router.get("/estimate", response_model=schemas.DeliveryEstimate)
def estimate_delivery(
    city: str = Query(...),
    product_id: int = Query(...),
    db: Session = Depends(get_db),
):
    product = db.get(models.Product, product_id)
    if not product or not product.is_active:
        return schemas.DeliveryEstimate(
            city=city, is_digital=False, in_stock=False, stock_qty=0,
            delivery_days=0, delivery_date=str(date.today()),
            branch_city="", message="Товар не найден",
        )

    # Digital products — instant delivery
    if product.is_digital:
        return schemas.DeliveryEstimate(
            city=city, is_digital=True, in_stock=True, stock_qty=999,
            delivery_days=0, delivery_date=str(date.today()),
            branch_city="", message="Мгновенная доставка на вашу почту",
        )

    city_info = CITIES.get(city)
    if not city_info:
        return schemas.DeliveryEstimate(
            city=city, is_digital=False, in_stock=False, stock_qty=0,
            delivery_days=7, delivery_date=str(date.today() + timedelta(days=7)),
            branch_city="", message="Город не найден. Уточните у менеджера.",
        )

    branch_id = city_info["branch_id"]
    branch_city = BRANCH_CITIES.get(branch_id, "")

    # Check branch stock
    bs = db.query(models.BranchStock).filter(
        models.BranchStock.branch_id == branch_id,
        models.BranchStock.product_id == product_id,
    ).first()

    qty = bs.quantity if bs else 0
    in_stock = qty > 0

    if in_stock:
        days = city_info["days_local"]
        msg = f"Есть в наличии в филиале {branch_city}. Доставка {days} дн."
    else:
        # Find any branch that has stock
        any_stock = db.query(models.BranchStock).filter(
            models.BranchStock.product_id == product_id,
            models.BranchStock.quantity > 0,
        ).first()

        if any_stock:
            days = city_info["days_transit"]
            src = BRANCH_CITIES.get(any_stock.branch_id, "другого склада")
            msg = f"Доставим из {src}. Ориентировочно {days} дн."
        else:
            days = city_info["days_transit"] + 3
            msg = f"Товар под заказ. Ориентировочно {days} дн."

    delivery_date = str(date.today() + timedelta(days=days))
    return schemas.DeliveryEstimate(
        city=city, is_digital=False, in_stock=in_stock, stock_qty=qty,
        delivery_days=days, delivery_date=delivery_date,
        branch_city=branch_city, message=msg,
    )
