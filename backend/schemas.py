from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    is_digital: bool = True
    category: str = "digital"
    stock: Optional[int] = None
    image_url: Optional[str] = None
    features: Optional[list[str]] = None


class ProductOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    is_digital: bool
    category: str
    stock: Optional[int]
    image_url: Optional[str]
    features: Optional[list[str]]
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class PaymentInfo(BaseModel):
    card_last4: str
    card_holder: str


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    billing_email: EmailStr
    billing_name: str
    payment: PaymentInfo


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    is_digital: bool
    download_token: Optional[str]

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    billing_name: str
    billing_email: str
    total: float
    status: str
    payment_ref: Optional[str]
    created_at: datetime
    items: list[OrderItemOut]

    model_config = {"from_attributes": True}


class AdminStats(BaseModel):
    revenue: float
    orders: int
    products: int
    customers: int
