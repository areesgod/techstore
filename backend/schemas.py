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
    is_employee: bool
    branch_id: Optional[int]
    cashback_balance: float
    total_spent: float
    email_verified: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


# ── Branch ────────────────────────────────────────────────────────
class BranchCreate(BaseModel):
    name: str
    city: str
    address: str
    phone: Optional[str] = None


class BranchOut(BaseModel):
    id: int
    name: str
    city: str
    address: str
    phone: Optional[str]
    is_active: bool
    model_config = {"from_attributes": True}


class BranchStockOut(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    model_config = {"from_attributes": True}


# ── Product ───────────────────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    is_digital: bool = True
    category: str = "digital"
    stock: Optional[int] = None
    image_url: Optional[str] = None
    features: Optional[list[str] | dict] = None


class ProductOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    is_digital: bool
    category: str
    stock: Optional[int]
    image_url: Optional[str]
    features: Optional[list[str] | dict]
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Order ─────────────────────────────────────────────────────────
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
    delivery_city: Optional[str] = None
    use_cashback: bool = False
    payment_method: str = "card"          # card | cash | installment
    installment_months: Optional[int] = None  # 3 | 6 | 12
    payment: Optional[PaymentInfo] = None


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
    delivery_city: Optional[str]
    total: float
    cashback_used: float
    cashback_earned: float
    payment_method: str
    installment_months: Optional[int]
    status: str
    payment_ref: Optional[str]
    branch_id: Optional[int]
    created_at: datetime
    items: list[OrderItemOut]
    model_config = {"from_attributes": True}


# ── Cashback ──────────────────────────────────────────────────────
class CashbackTransactionOut(BaseModel):
    id: int
    amount: float
    type: str
    description: str
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Delivery ──────────────────────────────────────────────────────
class DeliveryEstimate(BaseModel):
    city: str
    is_digital: bool
    in_stock: bool
    stock_qty: int
    delivery_days: int
    delivery_date: str
    branch_city: str
    message: str


# ── Admin stats ───────────────────────────────────────────────────
class AdminStats(BaseModel):
    revenue: float
    orders: int
    products: int
    customers: int
