import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse
from sqlalchemy.orm import Session
from database import get_db
import models
from auth import get_current_user

router = APIRouter(prefix="/downloads", tags=["downloads"])

DOWNLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "downloads")


@router.get("/{token}")
def download_file(token: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    item = db.query(models.OrderItem).filter(models.OrderItem.download_token == token).first()
    if not item:
        raise HTTPException(status_code=404, detail="Download not found")

    if item.order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")

    product = item.product
    if product.file_path:
        full_path = os.path.join(DOWNLOADS_DIR, product.file_path)
        if os.path.exists(full_path):
            return FileResponse(full_path, filename=os.path.basename(full_path))

    # Return a placeholder text file if no real file is uploaded yet
    content = f"Thank you for purchasing {product.name}!\n\nThis is your digital download.\nOrder ID: {item.order_id}\nProduct: {product.name}\n\nPlease upload the actual file via the admin panel."
    return PlainTextResponse(content, headers={"Content-Disposition": f'attachment; filename="{product.name}.txt"'})
