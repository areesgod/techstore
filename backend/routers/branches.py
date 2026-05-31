from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import get_admin_user

router = APIRouter(prefix="/branches", tags=["branches"])


@router.get("", response_model=list[schemas.BranchOut])
def list_branches(db: Session = Depends(get_db)):
    return db.query(models.Branch).filter(models.Branch.is_active == True).all()


@router.post("", response_model=schemas.BranchOut)
def create_branch(body: schemas.BranchCreate, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    branch = models.Branch(**body.model_dump())
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


@router.put("/{branch_id}", response_model=schemas.BranchOut)
def update_branch(branch_id: int, body: schemas.BranchCreate, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    branch = db.get(models.Branch, branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    for k, v in body.model_dump().items():
        setattr(branch, k, v)
    db.commit()
    db.refresh(branch)
    return branch


@router.get("/{branch_id}/stock", response_model=list[schemas.BranchStockOut])
def get_branch_stock(branch_id: int, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    items = db.query(models.BranchStock).filter(models.BranchStock.branch_id == branch_id).all()
    return [
        schemas.BranchStockOut(
            product_id=i.product_id,
            product_name=i.product.name if i.product else "—",
            quantity=i.quantity,
        )
        for i in items
    ]


@router.put("/{branch_id}/stock/{product_id}")
def set_branch_stock(branch_id: int, product_id: int, quantity: int, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    bs = db.query(models.BranchStock).filter(
        models.BranchStock.branch_id == branch_id,
        models.BranchStock.product_id == product_id,
    ).first()
    if bs:
        bs.quantity = quantity
    else:
        bs = models.BranchStock(branch_id=branch_id, product_id=product_id, quantity=quantity)
        db.add(bs)
    db.commit()
    return {"ok": True, "quantity": quantity}
