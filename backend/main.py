import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base
import models  # ensure models are registered

from routers import auth, products, orders, downloads, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TechStore API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(downloads.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}


def seed_demo_data():
    """Seed sample products if none exist."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(models.Product).count() > 0:
            return
        demo_products = [
            models.Product(name="Pro UI Kit", description="A premium React component library with 200+ components, dark mode, and Figma source files.", price=49.99, is_digital=True, category="digital", features=["200+ components", "Dark mode included", "Figma source files", "Lifetime updates"]),
            models.Product(name="Python Mastery Course", description="Complete Python course from beginner to advanced, covering data science, automation, and web development.", price=29.99, is_digital=True, category="digital", features=["12 hours of video", "Downloadable notebooks", "Certificate of completion", "Lifetime access"]),
            models.Product(name="SEO Toolkit Pro", description="All-in-one SEO analysis scripts, keyword research templates, and backlink tracker spreadsheets.", price=19.99, is_digital=True, category="digital", features=["Keyword research tools", "Backlink tracker", "Monthly updates", "Email support"]),
            models.Product(name="eBook: Build a SaaS", description="Step-by-step guide to building and launching your first SaaS product from idea to paying customers.", price=14.99, is_digital=True, category="digital", features=["PDF + EPUB formats", "200+ pages", "Real case studies", "Bonus checklists"]),
            models.Product(name="Wireless Earbuds Pro", description="High-fidelity wireless earbuds with active noise cancellation, 30-hour battery life, and premium sound.", price=89.99, is_digital=False, category="gadgets", stock=50, features=["ANC technology", "30h battery", "IPX5 waterproof", "Fast charging"]),
            models.Product(name="Smart LED Desk Lamp", description="Adjustable brightness smart desk lamp with USB-C charging port, touch controls, and 5 color modes.", price=39.99, is_digital=False, category="gadgets", stock=30, features=["USB-C charging", "5 color modes", "Touch controls", "Eye-care mode"]),
            models.Product(name="Mechanical Keyboard TKL", description="Compact tenkeyless mechanical keyboard with RGB backlighting, hot-swappable switches, and aluminium frame.", price=129.99, is_digital=False, category="gadgets", stock=20, features=["Hot-swappable switches", "RGB per-key", "Aluminium frame", "USB-C detachable cable"]),
            models.Product(name="Portable SSD 1TB", description="Ultra-fast portable SSD with USB 3.2 Gen 2 speeds up to 1050 MB/s, compact and shockproof.", price=74.99, is_digital=False, category="gadgets", stock=40, features=["1050 MB/s read speed", "USB 3.2 Gen 2", "Shockproof build", "5-year warranty"]),
        ]
        for p in demo_products:
            db.add(p)
        db.commit()
        print("[SEED] Demo products inserted.")
    except Exception as e:
        print(f"[SEED] Error: {e}")
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    seed_demo_data()
