import uuid
from datetime import datetime
from sqlalchemy import String, Float, Boolean, Integer, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_employee: Mapped[bool] = mapped_column(Boolean, default=False)
    branch_id: Mapped[int | None] = mapped_column(ForeignKey("branches.id"), nullable=True)
    cashback_balance: Mapped[float] = mapped_column(Float, default=0.0)
    total_spent: Mapped[float] = mapped_column(Float, default=0.0)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    orders: Mapped[list["Order"]] = relationship("Order", back_populates="user")
    cashback_transactions: Mapped[list["CashbackTransaction"]] = relationship("CashbackTransaction", back_populates="user")
    branch: Mapped["Branch | None"] = relationship("Branch", foreign_keys=[branch_id])


class Branch(Base):
    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    city: Mapped[str] = mapped_column(String(100))
    address: Mapped[str] = mapped_column(String(512))
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    stock: Mapped[list["BranchStock"]] = relationship("BranchStock", back_populates="branch")


class BranchStock(Base):
    __tablename__ = "branch_stock"

    id: Mapped[int] = mapped_column(primary_key=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=0)

    branch: Mapped["Branch"] = relationship("Branch", back_populates="stock")
    product: Mapped["Product"] = relationship("Product")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Float)
    is_digital: Mapped[bool] = mapped_column(Boolean, default=True)
    category: Mapped[str] = mapped_column(String(100), default="digital")
    stock: Mapped[int | None] = mapped_column(Integer, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    features: Mapped[list | None] = mapped_column(JSON, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    branch_id: Mapped[int | None] = mapped_column(ForeignKey("branches.id"), nullable=True)
    billing_name: Mapped[str] = mapped_column(String(255))
    billing_email: Mapped[str] = mapped_column(String(255))
    delivery_city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    total: Mapped[float] = mapped_column(Float)
    cashback_used: Mapped[float] = mapped_column(Float, default=0.0)
    cashback_earned: Mapped[float] = mapped_column(Float, default=0.0)
    payment_method: Mapped[str] = mapped_column(String(20), default="card")  # card | cash | installment
    installment_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    payment_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="orders")
    branch: Mapped["Branch | None"] = relationship("Branch")
    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order")
    cashback_transactions: Mapped[list["CashbackTransaction"]] = relationship("CashbackTransaction", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Float)
    download_token: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product"] = relationship("Product", back_populates="order_items")


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User")


class CashbackTransaction(Base):
    __tablename__ = "cashback_transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id"), nullable=True)
    amount: Mapped[float] = mapped_column(Float)   # positive = earned, negative = used
    type: Mapped[str] = mapped_column(String(20))  # "earned" | "used"
    description: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="cashback_transactions")
    order: Mapped["Order | None"] = relationship("Order", back_populates="cashback_transactions")
