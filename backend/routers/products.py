from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import get_admin_user
from data.categories import CATEGORIES

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/categories")
def get_categories():
    return CATEGORIES


@router.get("", response_model=list[schemas.ProductOut])
def list_products(
    search: str = Query(None),
    category: str = Query(None),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(models.Product).filter(or_(models.Product.is_active == True, models.Product.is_active == None))
    if search:
        q = q.filter(models.Product.name.ilike(f"%{search}%"))
    if category == "digital":
        q = q.filter(models.Product.is_digital == True)
    elif category == "gadgets":
        q = q.filter(models.Product.is_digital == False)
    elif category:
        q = q.filter(models.Product.category == category)
    return q.order_by(models.Product.created_at.desc()).limit(limit).all()


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(models.Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=schemas.ProductOut)
def create_product(body: schemas.ProductCreate, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    product = models.Product(**body.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, body: schemas.ProductCreate, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in body.model_dump().items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"ok": True}
