import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base
import models

from routers import auth, products, orders, downloads, admin, branches, cashback, employee, delivery, password_reset, email_verification, views, pc_builder

Base.metadata.create_all(bind=engine)


def run_migrations():
    """Add missing columns to existing tables without dropping data."""
    migrations = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS cashback_balance FLOAT DEFAULT 0.0",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent FLOAT DEFAULT 0.0",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS cashback_earned FLOAT DEFAULT 0.0",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS cashback_used FLOAT DEFAULT 0.0",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS installment_months INTEGER DEFAULT NULL",
        """CREATE TABLE IF NOT EXISTS product_views (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            duration_seconds INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        )""",
    ]
    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(text(sql))
            except Exception:
                pass
        conn.commit()


from sqlalchemy import text
run_migrations()

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

for router in [auth, products, orders, downloads, admin, branches, cashback, employee, delivery, password_reset, email_verification, views, pc_builder]:
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


def seed_pc_parts(db):
    # Only insert if no pc-part categories exist yet
    existing = db.query(models.Product).filter(models.Product.category == "cpu").count()
    if existing > 0:
        return
    parts = [
        # CPUs
        models.Product(name="AMD Ryzen 5 7600X", description="6-ядерный процессор AM5, 4.7 ГГц base / 5.3 ГГц boost, TDP 105 Вт.", price=89990, is_digital=False, category="cpu", stock=50, features={"socket":"AM5","cores":6,"threads":12,"base_ghz":4.7,"boost_ghz":5.3,"tdp":105,"ram_type":"DDR5"}),
        models.Product(name="AMD Ryzen 7 7700X", description="8-ядерный процессор AM5, 4.5 ГГц base / 5.4 ГГц boost, TDP 105 Вт.", price=129990, is_digital=False, category="cpu", stock=40, features={"socket":"AM5","cores":8,"threads":16,"base_ghz":4.5,"boost_ghz":5.4,"tdp":105,"ram_type":"DDR5"}),
        models.Product(name="AMD Ryzen 9 7900X", description="12-ядерный процессор AM5, 4.7 ГГц base / 5.6 ГГц boost, TDP 170 Вт.", price=189990, is_digital=False, category="cpu", stock=30, features={"socket":"AM5","cores":12,"threads":24,"base_ghz":4.7,"boost_ghz":5.6,"tdp":170,"ram_type":"DDR5"}),
        models.Product(name="Intel Core i5-13600K", description="14-ядерный (6P+8E) процессор LGA1700, 3.5 ГГц / 5.1 ГГц boost, TDP 125 Вт.", price=99990, is_digital=False, category="cpu", stock=45, features={"socket":"LGA1700","cores":14,"threads":20,"base_ghz":3.5,"boost_ghz":5.1,"tdp":125,"ram_type":"DDR5"}),
        models.Product(name="Intel Core i7-13700K", description="16-ядерный (8P+8E) LGA1700, 3.4 ГГц / 5.4 ГГц boost, TDP 125 Вт.", price=159990, is_digital=False, category="cpu", stock=35, features={"socket":"LGA1700","cores":16,"threads":24,"base_ghz":3.4,"boost_ghz":5.4,"tdp":125,"ram_type":"DDR5"}),
        models.Product(name="AMD Ryzen 5 5600X", description="6-ядерный AM4, 3.7 ГГц / 4.6 ГГц boost, TDP 65 Вт. Отличное соотношение цена/качество.", price=59990, is_digital=False, category="cpu", stock=60, features={"socket":"AM4","cores":6,"threads":12,"base_ghz":3.7,"boost_ghz":4.6,"tdp":65,"ram_type":"DDR4"}),
        # GPUs
        models.Product(name="NVIDIA GeForce RTX 4060", description="8 ГБ GDDR6, 1080p/1440p гейминг, TDP 115 Вт, DLSS 3.", price=149990, is_digital=False, category="gpu", stock=30, features={"vram_gb":8,"vram_type":"GDDR6","tdp":115,"slot_width":2,"length_mm":240}),
        models.Product(name="NVIDIA GeForce RTX 4070", description="12 ГБ GDDR6X, 1440p/4K гейминг, TDP 200 Вт, DLSS 3.", price=249990, is_digital=False, category="gpu", stock=25, features={"vram_gb":12,"vram_type":"GDDR6X","tdp":200,"slot_width":2,"length_mm":285}),
        models.Product(name="NVIDIA GeForce RTX 4080", description="16 ГБ GDDR6X, 4K гейминг, TDP 320 Вт, Ada Lovelace.", price=449990, is_digital=False, category="gpu", stock=15, features={"vram_gb":16,"vram_type":"GDDR6X","tdp":320,"slot_width":3,"length_mm":336}),
        models.Product(name="AMD Radeon RX 7600", description="8 ГБ GDDR6, 1080p гейминг, TDP 165 Вт, FSR 3.", price=119990, is_digital=False, category="gpu", stock=35, features={"vram_gb":8,"vram_type":"GDDR6","tdp":165,"slot_width":2,"length_mm":255}),
        models.Product(name="AMD Radeon RX 7800 XT", description="16 ГБ GDDR6, 1440p гейминг, TDP 263 Вт, FSR 3.", price=219990, is_digital=False, category="gpu", stock=20, features={"vram_gb":16,"vram_type":"GDDR6","tdp":263,"slot_width":2,"length_mm":267}),
        # Motherboards
        models.Product(name="ASUS ROG STRIX B650-A", description="AM5, B650, DDR5, ATX, PCIe 5.0, Wi-Fi 6E.", price=89990, is_digital=False, category="motherboard", stock=25, features={"socket":"AM5","chipset":"B650","form_factor":"ATX","ram_type":"DDR5","ram_slots":4,"max_ram_gb":128}),
        models.Product(name="MSI MAG X670E TOMAHAWK", description="AM5, X670E, DDR5, ATX, PCIe 5.0, 2.5G LAN.", price=129990, is_digital=False, category="motherboard", stock=20, features={"socket":"AM5","chipset":"X670E","form_factor":"ATX","ram_type":"DDR5","ram_slots":4,"max_ram_gb":128}),
        models.Product(name="ASUS PRIME B760M-A", description="LGA1700, B760, DDR5, mATX, PCIe 4.0, Aura Sync.", price=59990, is_digital=False, category="motherboard", stock=30, features={"socket":"LGA1700","chipset":"B760","form_factor":"mATX","ram_type":"DDR5","ram_slots":2,"max_ram_gb":64}),
        models.Product(name="MSI PRO B550-VC", description="AM4, B550, DDR4, ATX, PCIe 4.0, USB 3.2.", price=44990, is_digital=False, category="motherboard", stock=40, features={"socket":"AM4","chipset":"B550","form_factor":"ATX","ram_type":"DDR4","ram_slots":4,"max_ram_gb":128}),
        # RAM
        models.Product(name="Kingston Fury Beast DDR5 32GB", description="DDR5-6000 МГц, 2×16 ГБ, CL36, XMP 3.0.", price=34990, is_digital=False, category="ram", stock=60, features={"ram_type":"DDR5","capacity_gb":32,"speed_mhz":6000,"modules":2,"cl":36}),
        models.Product(name="Corsair Vengeance DDR5 16GB", description="DDR5-5200 МГц, 2×8 ГБ, CL40, Intel XMP 3.0.", price=19990, is_digital=False, category="ram", stock=70, features={"ram_type":"DDR5","capacity_gb":16,"speed_mhz":5200,"modules":2,"cl":40}),
        models.Product(name="G.Skill Ripjaws V DDR4 32GB", description="DDR4-3200 МГц, 2×16 ГБ, CL16, XMP 2.0.", price=18990, is_digital=False, category="ram", stock=80, features={"ram_type":"DDR4","capacity_gb":32,"speed_mhz":3200,"modules":2,"cl":16}),
        models.Product(name="Kingston Fury Beast DDR4 16GB", description="DDR4-3200 МГц, 2×8 ГБ, CL16, Intel XMP 2.0.", price=11990, is_digital=False, category="ram", stock=90, features={"ram_type":"DDR4","capacity_gb":16,"speed_mhz":3200,"modules":2,"cl":16}),
        # Storage
        models.Product(name="Samsung 990 Pro NVMe 1TB", description="PCIe 4.0 NVMe, 7450/6900 МБ/с, M.2 2280.", price=39990, is_digital=False, category="storage", stock=50, features={"type":"NVMe","interface":"PCIe 4.0","capacity_gb":1000,"read_mbs":7450,"write_mbs":6900,"form_factor":"M.2 2280"}),
        models.Product(name="WD Black SN850X 2TB", description="PCIe 4.0 NVMe, 7300/6600 МБ/с, M.2 2280, без радиатора.", price=69990, is_digital=False, category="storage", stock=35, features={"type":"NVMe","interface":"PCIe 4.0","capacity_gb":2000,"read_mbs":7300,"write_mbs":6600,"form_factor":"M.2 2280"}),
        models.Product(name="Seagate Barracuda HDD 2TB", description="7200 RPM SATA 3.5\", 256 МБ кэш, надёжное хранение данных.", price=14990, is_digital=False, category="storage", stock=60, features={"type":"HDD","interface":"SATA","capacity_gb":2000,"rpm":7200,"form_factor":"3.5 inch"}),
        models.Product(name="Kingston NV2 SSD 500GB", description="PCIe 3.0 NVMe, 3500/2100 МБ/с, M.2 2280, бюджетный.", price=12990, is_digital=False, category="storage", stock=80, features={"type":"NVMe","interface":"PCIe 3.0","capacity_gb":500,"read_mbs":3500,"write_mbs":2100,"form_factor":"M.2 2280"}),
        # PSU
        models.Product(name="Seasonic Focus GX-650", description="650 Вт, 80+ Gold, полностью модульный, тихий вентилятор 120 мм.", price=44990, is_digital=False, category="psu", stock=30, features={"wattage":650,"rating":"80+ Gold","modular":"Full","fan_mm":120}),
        models.Product(name="Corsair RM750x", description="750 Вт, 80+ Gold, полностью модульный, нулевой оборот при низкой нагрузке.", price=54990, is_digital=False, category="psu", stock=25, features={"wattage":750,"rating":"80+ Gold","modular":"Full","fan_mm":135}),
        models.Product(name="DeepCool PQ850M", description="850 Вт, 80+ Gold, модульный, ATX 3.0, PCIe 5.0 коннектор.", price=59990, is_digital=False, category="psu", stock=20, features={"wattage":850,"rating":"80+ Gold","modular":"Full","fan_mm":120}),
        models.Product(name="Cooler Master MWE 550 Bronze", description="550 Вт, 80+ Bronze, не модульный, бюджетный вариант.", price=24990, is_digital=False, category="psu", stock=40, features={"wattage":550,"rating":"80+ Bronze","modular":"None","fan_mm":120}),
        # Cases
        models.Product(name="Fractal Design Meshify C", description="Mid Tower, ATX, 2× 120мм вентилятора, сетчатая передняя панель.", price=39990, is_digital=False, category="case", stock=20, features={"form_factor":"Mid Tower","motherboard":"ATX","fans_included":2,"usb_c":True,"glass_side":True}),
        models.Product(name="NZXT H510", description="Mid Tower, ATX/mATX, кабель-менеджмент, стекло, 2× 120мм.", price=34990, is_digital=False, category="case", stock=25, features={"form_factor":"Mid Tower","motherboard":"ATX","fans_included":2,"usb_c":True,"glass_side":True}),
        models.Product(name="Cooler Master Q300L", description="Mini Tower, mATX/ITX, магнитные фильтры, бюджетный.", price=18990, is_digital=False, category="case", stock=30, features={"form_factor":"Mini Tower","motherboard":"mATX","fans_included":1,"usb_c":False,"glass_side":False}),
        # Cooling
        models.Product(name="Noctua NH-D15", description="Двухбашенный воздушный кулер, 2× 140мм, 65 дБА, AM4/AM5/LGA1700.", price=29990, is_digital=False, category="cooling", stock=25, features={"type":"Air","fan_mm":140,"fans":2,"max_tdp":250,"height_mm":165}),
        models.Product(name="DeepCool AK620", description="Двухбашенный воздушный кулер, 2× 120мм, до 260 Вт TDP.", price=19990, is_digital=False, category="cooling", stock=30, features={"type":"Air","fan_mm":120,"fans":2,"max_tdp":260,"height_mm":160}),
        models.Product(name="Corsair iCUE H100i RGB Elite", description="240мм СВО, 2× 120мм вентилятора, RGB, AM5/LGA1700.", price=54990, is_digital=False, category="cooling", stock=20, features={"type":"AIO","radiator_mm":240,"fan_mm":120,"fans":2,"max_tdp":300}),
        # Keyboards, mice - update existing gadgets categories
        models.Product(name="Logitech G Pro X TKL", description="Механическая игровая клавиатура TKL, переключаемые свитчи, RGB.", price=54990, is_digital=False, category="keyboard", stock=35, features={"type":"Mechanical","layout":"TKL","switches":"GX Blue","rgb":True,"connection":"USB-C"}),
        models.Product(name="Logitech G502 X Plus", description="Игровая мышь 25600 DPI, HERO сенсор, 13 кнопок, RGB, беспроводная.", price=44990, is_digital=False, category="mouse", stock=40, features={"dpi":25600,"sensor":"HERO","buttons":13,"wireless":True,"rgb":True}),
        # Monitors
        models.Product(name="LG 27GP850-B 27\" QHD", description="27\", QHD 2560×1440, IPS, 180 Гц, 1 мс GtG, HDR400.", price=149990, is_digital=False, category="monitor", stock=20, features={"size_inch":27,"resolution":"2560x1440","panel":"IPS","hz":180,"response_ms":1,"hdr":"HDR400"}),
        models.Product(name="Samsung Odyssey G5 27\"", description="27\", QHD, VA, 165 Гц, изогнутый 1000R, FreeSync Premium.", price=119990, is_digital=False, category="monitor", stock=15, features={"size_inch":27,"resolution":"2560x1440","panel":"VA","hz":165,"response_ms":1,"curved":"1000R"}),
    ]
    for p in parts:
        db.add(p)
    db.flush()
    print(f"[SEED] {len(parts)} PC parts inserted.")


@app.on_event("startup")
def on_startup():
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_branches(db)
        seed_products(db)
        seed_pc_parts(db)
        seed_branch_stock(db)
        db.commit()
    except Exception as e:
        print(f"[SEED] Error: {e}")
        db.rollback()
    finally:
        db.close()
