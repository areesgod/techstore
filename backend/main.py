import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base
import models

from routers import auth, products, orders, downloads, admin, branches, cashback, employee, delivery

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TechStore API", version="2.0.0")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", ""),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_origin_regex=r"https://.*\.(vercel\.app|onrender\.com|pages\.dev)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in [auth, products, orders, downloads, admin, branches, cashback, employee, delivery]:
    app.include_router(router.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ── Seed data ─────────────────────────────────────────────────────

def seed_branches(db):
    if db.query(models.Branch).count() > 0:
        return
    branches_data = [
        models.Branch(id=1, name="Алматы филиал",    city="Алматы",    address="пр. Абая 150, Алматы",          phone="+7 727 000 0001"),
        models.Branch(id=2, name="Астана филиал",    city="Астана",    address="пр. Республики 12, Астана",      phone="+7 717 000 0002"),
        models.Branch(id=3, name="Шымкент филиал",   city="Шымкент",   address="ул. Байтұрсынова 5, Шымкент",   phone="+7 725 000 0003"),
        models.Branch(id=4, name="Қарағанды филиал", city="Қарағанды", address="бул. Мира 30, Қарағанды",       phone="+7 721 000 0004"),
        models.Branch(id=5, name="Ақтөбе филиал",    city="Ақтөбе",    address="пр. Абилкайыр хана 1, Ақтөбе", phone="+7 713 000 0005"),
    ]
    for b in branches_data:
        db.add(b)
    db.flush()
    print("[SEED] 5 branches inserted.")


def seed_products(db):
    if db.query(models.Product).count() > 0:
        return
    products_data = [
        # ── Digital (15) ──────────────────────────────────────────
        models.Product(name="Pro UI Kit", description="Премиум библиотека React-компонентов с 200+ элементами, тёмной темой и исходниками Figma.", price=24990, is_digital=True, category="digital", features=["200+ компонентов","Тёмная тема","Исходники Figma","Пожизненные обновления"]),
        models.Product(name="Python Mastery Course", description="Полный курс Python от новичка до профессионала: Data Science, автоматизация и веб-разработка.", price=14990, is_digital=True, category="digital", features=["12 часов видео","Jupyter-ноутбуки","Сертификат","Пожизненный доступ"]),
        models.Product(name="SEO Toolkit Pro", description="Комплект SEO-скриптов, шаблоны для исследования ключевых слов и трекер обратных ссылок.", price=9990, is_digital=True, category="digital", features=["Исследование ключевых слов","Трекер ссылок","Ежемесячные обновления","Email-поддержка"]),
        models.Product(name="eBook: Запусти свой SaaS", description="Пошаговое руководство по созданию и запуску первого SaaS-продукта.", price=7490, is_digital=True, category="digital", features=["PDF + EPUB","200+ страниц","Реальные кейсы","Чек-листы"]),
        models.Product(name="React & Next.js Мастер-класс", description="Углублённый курс по React и Next.js: хуки, SSR, оптимизация и деплой.", price=19990, is_digital=True, category="digital", features=["15 часов видео","5 реальных проектов","Исходный код","Поддержка в чате"]),
        models.Product(name="Figma Design System Pro", description="Готовая дизайн-система Figma с 300+ компонентами, типографикой и цветовыми токенами.", price=18990, is_digital=True, category="digital", features=["300+ компонентов","Авто-лейаут","Цветовые токены","Тёмная и светлая тема"]),
        models.Product(name="WordPress Plugin Bundle", description="Набор из 10 WordPress-плагинов для SEO, кэширования, безопасности и форм.", price=12990, is_digital=True, category="digital", features=["10 плагинов","Пожизненные лицензии","Обновления включены","Поддержка 1 год"]),
        models.Product(name="Social Media Templates 200+", description="200+ шаблонов для Instagram, TikTok и LinkedIn в форматах Canva и PSD.", price=4990, is_digital=True, category="digital", features=["200+ шаблонов","Canva и PSD","Анимированные сторис","Коммерческая лицензия"]),
        models.Product(name="Excel Financial Models", description="Профессиональные финансовые модели Excel: P&L, Cash Flow, DCF-оценка.", price=8990, is_digital=True, category="digital", features=["10 готовых моделей","Инструкции","Excel и Google Sheets","Обновления включены"]),
        models.Product(name="Кибербезопасность — Полный справочник", description="Практическое руководство: пентестинг, защита сетей и этичный хакинг.", price=6990, is_digital=True, category="digital", features=["500+ страниц","Практические упражнения","PDF + EPUB","Обновляется ежегодно"]),
        models.Product(name="JavaScript Algorithms Course", description="Курс по алгоритмам и структурам данных на JavaScript для технических интервью.", price=16990, is_digital=True, category="digital", features=["100+ задач","Разбор Big-O","Видеоуроки","Подготовка к FAANG"]),
        models.Product(name="Email Marketing Templates", description="50 готовых HTML-шаблонов писем для e-commerce, онбординга и акций.", price=3990, is_digital=True, category="digital", features=["50 шаблонов","Адаптивная вёрстка","Тёмная тема","Любой ESP"]),
        models.Product(name="Logo Design Bundle 500+", description="500+ векторных логотипов в стилях минимализм, ретро и модерн.", price=11990, is_digital=True, category="digital", features=["500+ логотипов","AI / SVG / PNG","Коммерческая лицензия","Бесплатные обновления"]),
        models.Product(name="Premiere Pro Video Presets", description="200 профессиональных пресетов для Premiere Pro: LUT-таблицы и цветокоррекция.", price=7990, is_digital=True, category="digital", features=["200 пресетов","LUT-таблицы","Кинематографические цвета","PR 2022+"]),
        models.Product(name="Notion Productivity Workspace", description="Полная Notion-система для задач, привычек, финансов и целей.", price=4490, is_digital=True, category="digital", features=["10 шаблонов","GTD-система","Трекер привычек","Видеообзор настройки"]),
        # ── Gadgets (15) ──────────────────────────────────────────
        models.Product(name="Беспроводные наушники TWS Pro", description="TWS с ANC, 30-часовым аккумулятором и Hi-Fi звуком.", price=39990, is_digital=False, category="gadgets", stock=200, features=["ANC","30 часов работы","IPX5","Быстрая зарядка"]),
        models.Product(name="Умная LED-лампа для стола", description="Настольная лампа с USB-C зарядкой, сенсорным управлением и 5 режимами.", price=18990, is_digital=False, category="gadgets", stock=150, features=["USB-C зарядка","5 режимов","Сенсор","Защита глаз"]),
        models.Product(name="Механическая клавиатура TKL", description="TKL с RGB, горячей заменой свитчей и алюминиевым корпусом.", price=59990, is_digital=False, category="gadgets", stock=100, features=["Горячая замена","RGB","Алюминий","USB-C"]),
        models.Product(name="Портативный SSD 1ТБ", description="USB 3.2 Gen 2, 1050 МБ/с, ударопрочный.", price=34990, is_digital=False, category="gadgets", stock=120, features=["1050 МБ/с","USB 3.2 Gen 2","Ударопрочный","Гарантия 5 лет"]),
        models.Product(name="USB-C Хаб 7-в-1", description="HDMI 4K, 3×USB-A, SD/MicroSD, PD 100W.", price=14990, is_digital=False, category="gadgets", stock=200, features=["HDMI 4K@60Hz","3×USB-A 3.0","SD+MicroSD","PD 100W"]),
        models.Product(name="Веб-камера 4K Pro", description="4K-вебкамера с автофокусом и шумоподавляющим микрофоном.", price=44990, is_digital=False, category="gadgets", stock=80, features=["4K 30fps","Автофокус","Шумоподавление","Крышка конфиденциальности"]),
        models.Product(name="Накладные наушники ANC", description="Гибридный ANC, 40 часов, складной корпус, BT 5.3.", price=54990, is_digital=False, category="gadgets", stock=90, features=["Гибридный ANC","40 часов","Складной","BT 5.3"]),
        models.Product(name="Смарт-часы Fitness Pro", description="GPS, ЧСС, SpO2, 14 дней без зарядки.", price=49990, is_digital=False, category="gadgets", stock=110, features=["GPS","ЧСС+SpO2","14 дней","150+ режимов спорта"]),
        models.Product(name="Портативная Bluetooth-колонка", description="IPX7, 360° звук, 20 часов, TWS-стерео пара.", price=22990, is_digital=False, category="gadgets", stock=130, features=["IPX7","20 часов","TWS пара","Микрофон"]),
        models.Product(name="Беспроводная зарядка 15W", description="Qi 15W, совместима с iPhone, Samsung и любыми Qi-устройствами.", price=9990, is_digital=False, category="gadgets", stock=250, features=["15W","Qi","LED-индикатор","Зарядка через чехол"]),
        models.Product(name="Игровая мышь RGB", description="Сенсор 26000 DPI, 11 кнопок, RGB, плетёный кабель.", price=16990, is_digital=False, category="gadgets", stock=140, features=["26000 DPI","11 кнопок","RGB","Плетёный кабель"]),
        models.Product(name="Подставка для ноутбука Aluminium", description="Алюминий, 6 высот, MacBook совместима.", price=12990, is_digital=False, category="gadgets", stock=170, features=["Авиационный алюминий","6 высот","MacBook совместима","Антискользящие"]),
        models.Product(name="Мини-проектор 4K Portable", description="Wi-Fi, BT, встроенные динамики, авто-трапеция.", price=79990, is_digital=False, category="gadgets", stock=40, features=["4K","Wi-Fi+BT","Аккумулятор","Авто-трапеция"]),
        models.Product(name="Умная розетка Wi-Fi (4 шт.)", description="Мониторинг энергии, Alexa+Google Home, таймер.", price=11990, is_digital=False, category="gadgets", stock=200, features=["Мониторинг энергии","Alexa+Google","Таймер","Без хаба"]),
        models.Product(name="Повербанк 20000 мАч", description="65W PD, заряжает ноутбуки, 2×USB-A + USB-C.", price=18990, is_digital=False, category="gadgets", stock=180, features=["20000 мАч","65W PD","Для ноутбуков","LED-индикатор"]),
    ]
    for p in products_data:
        db.add(p)
    db.flush()
    print(f"[SEED] {len(products_data)} products inserted.")


def seed_branch_stock(db):
    if db.query(models.BranchStock).count() > 0:
        return
    products = db.query(models.Product).filter(models.Product.is_digital == False).all()
    branches = db.query(models.Branch).all()
    # Distribute stock across branches (total stock / number of branches per product)
    for p in products:
        per_branch = max(1, (p.stock or 0) // len(branches))
        for b in branches:
            db.add(models.BranchStock(branch_id=b.id, product_id=p.id, quantity=per_branch))
    print(f"[SEED] Branch stock distributed across {len(branches)} branches.")


@app.on_event("startup")
def on_startup():
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_branches(db)
        seed_products(db)
        seed_branch_stock(db)
        db.commit()
    except Exception as e:
        print(f"[SEED] Error: {e}")
        db.rollback()
    finally:
        db.close()
