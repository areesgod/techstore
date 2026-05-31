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

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", ""),   # set this in Render env vars
]
# Also allow all Vercel preview URLs and onrender.com frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_origin_regex=r"https://.*\.(vercel\.app|onrender\.com|pages\.dev)",
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
    """Seed 30 sample products in KZT if none exist."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(models.Product).count() > 0:
            return
        demo_products = [
            # ── Digital products (15) ──────────────────────────────────────
            models.Product(name="Pro UI Kit", description="Премиум библиотека React-компонентов с 200+ элементами, тёмной темой и исходниками Figma.", price=24990, is_digital=True, category="digital", features=["200+ компонентов", "Тёмная тема", "Исходники Figma", "Пожизненные обновления"]),
            models.Product(name="Python Mastery Course", description="Полный курс Python от новичка до профессионала: Data Science, автоматизация и веб-разработка.", price=14990, is_digital=True, category="digital", features=["12 часов видео", "Jupyter-ноутбуки", "Сертификат", "Пожизненный доступ"]),
            models.Product(name="SEO Toolkit Pro", description="Комплект SEO-скриптов, шаблоны для исследования ключевых слов и трекер обратных ссылок.", price=9990, is_digital=True, category="digital", features=["Исследование ключевых слов", "Трекер ссылок", "Ежемесячные обновления", "Email-поддержка"]),
            models.Product(name="eBook: Запусти свой SaaS", description="Пошаговое руководство по созданию и запуску первого SaaS-продукта — от идеи до первых клиентов.", price=7490, is_digital=True, category="digital", features=["PDF + EPUB", "200+ страниц", "Реальные кейсы", "Чек-листы"]),
            models.Product(name="React & Next.js Мастер-класс", description="Углублённый курс по React и Next.js: хуки, SSR, оптимизация и деплой на Vercel.", price=19990, is_digital=True, category="digital", features=["15 часов видео", "5 реальных проектов", "Исходный код", "Поддержка в чате"]),
            models.Product(name="Figma Design System Pro", description="Готовая дизайн-система Figma с 300+ компонентами, типографикой и цветовыми токенами.", price=18990, is_digital=True, category="digital", features=["300+ компонентов", "Авто-лейаут", "Цветовые токены", "Тёмная и светлая тема"]),
            models.Product(name="WordPress Plugin Bundle", description="Набор из 10 мощных WordPress-плагинов для SEO, кэширования, безопасности и форм.", price=12990, is_digital=True, category="digital", features=["10 плагинов", "Пожизненные лицензии", "Обновления включены", "Поддержка 1 год"]),
            models.Product(name="Social Media Templates 200+", description="200+ готовых шаблонов для Instagram, TikTok и LinkedIn в форматах Canva и PSD.", price=4990, is_digital=True, category="digital", features=["200+ шаблонов", "Форматы Canva и PSD", "Анимированные сторис", "Коммерческая лицензия"]),
            models.Product(name="Excel Financial Models", description="Профессиональные финансовые модели Excel: P&L, Cash Flow, DCF-оценка и бюджетирование.", price=8990, is_digital=True, category="digital", features=["10 готовых моделей", "Инструкции", "Excel и Google Sheets", "Обновления включены"]),
            models.Product(name="Кибербезопасность — Полный справочник", description="Практическое руководство по кибербезопасности: пентестинг, защита сетей и этичный хакинг.", price=6990, is_digital=True, category="digital", features=["500+ страниц", "Практические упражнения", "PDF + EPUB", "Обновляется ежегодно"]),
            models.Product(name="JavaScript Algorithms Course", description="Курс по алгоритмам и структурам данных на JavaScript для прохождения технических интервью.", price=16990, is_digital=True, category="digital", features=["100+ задач", "Разбор Big-O", "Видеоуроки", "Подготовка к FAANG-интервью"]),
            models.Product(name="Email Marketing Templates", description="50 готовых HTML-шаблонов писем для e-commerce, онбординга, рассылок и акций.", price=3990, is_digital=True, category="digital", features=["50 шаблонов", "Адаптивная вёрстка", "Тёмная тема", "Любой ESP"]),
            models.Product(name="Logo Design Bundle 500+", description="500+ векторных логотипов в стилях минимализм, ретро и модерн. Форматы AI, SVG, PNG.", price=11990, is_digital=True, category="digital", features=["500+ логотипов", "Форматы AI / SVG / PNG", "Коммерческая лицензия", "Бесплатные обновления"]),
            models.Product(name="Premiere Pro Video Presets", description="200 профессиональных пресетов для Premiere Pro: LUT-таблицы, цветокоррекция и переходы.", price=7990, is_digital=True, category="digital", features=["200 пресетов", "LUT-таблицы", "Кинематографические цвета", "Работает в PR 2022+"]),
            models.Product(name="Notion Productivity Workspace", description="Полная Notion-система для управления задачами, привычками, финансами и целями.", price=4490, is_digital=True, category="digital", features=["10 шаблонов", "GTD-система", "Трекер привычек", "Видеообзор настройки"]),
            # ── Gadgets (15) ──────────────────────────────────────────────
            models.Product(name="Беспроводные наушники TWS Pro", description="Наушники TWS с активным шумоподавлением, 30-часовым аккумулятором и Hi-Fi звуком.", price=39990, is_digital=False, category="gadgets", stock=50, features=["ANC", "30 часов работы", "IPX5 влагозащита", "Быстрая зарядка"]),
            models.Product(name="Умная LED-лампа для стола", description="Регулируемая настольная лампа с USB-C зарядкой, сенсорным управлением и 5 цветовыми режимами.", price=18990, is_digital=False, category="gadgets", stock=30, features=["USB-C зарядка", "5 режимов цвета", "Сенсорное управление", "Режим защиты глаз"]),
            models.Product(name="Механическая клавиатура TKL", description="Компактная TKL-клавиатура с RGB-подсветкой, горячей заменой свитчей и алюминиевым корпусом.", price=59990, is_digital=False, category="gadgets", stock=20, features=["Горячая замена свитчей", "RGB на каждую клавишу", "Алюминиевый корпус", "Кабель USB-C"]),
            models.Product(name="Портативный SSD 1ТБ", description="Сверхбыстрый SSD USB 3.2 Gen 2 со скоростью до 1050 МБ/с, ударопрочный и компактный.", price=34990, is_digital=False, category="gadgets", stock=40, features=["1050 МБ/с чтение", "USB 3.2 Gen 2", "Ударопрочный", "Гарантия 5 лет"]),
            models.Product(name="USB-C Хаб 7-в-1", description="Компактный хаб с HDMI 4K, 3× USB-A, SD/MicroSD и PD 100W для ноутбуков.", price=14990, is_digital=False, category="gadgets", stock=60, features=["HDMI 4K@60Hz", "3× USB-A 3.0", "SD + MicroSD", "PD 100W сквозная зарядка"]),
            models.Product(name="Веб-камера 4K Pro", description="Профессиональная 4K-вебкамера с автофокусом, шумоподавляющим микрофоном и крышкой конфиденциальности.", price=44990, is_digital=False, category="gadgets", stock=25, features=["4K 30fps", "Автофокус", "Шумоподавление микрофона", "Крышка конфиденциальности"]),
            models.Product(name="Накладные наушники ANC", description="Накладные наушники с гибридным ANC, 40-часовым аккумулятором и складной конструкцией.", price=54990, is_digital=False, category="gadgets", stock=35, features=["Гибридный ANC", "40 часов работы", "Складной корпус", "Bluetooth 5.3"]),
            models.Product(name="Смарт-часы Fitness Pro", description="Смарт-часы с мониторингом ЧСС, SpO2, GPS и 14-дневным аккумулятором.", price=49990, is_digital=False, category="gadgets", stock=45, features=["GPS встроенный", "ЧСС + SpO2", "14 дней батарея", "150+ режимов спорта"]),
            models.Product(name="Портативная Bluetooth-колонка", description="Водонепроницаемая колонка IPX7 с 360° звуком, 20-часовым аккумулятором и функцией TWS-стерео.", price=22990, is_digital=False, category="gadgets", stock=55, features=["IPX7 водонепроницаемая", "20 часов музыки", "TWS-стерео пара", "Встроенный микрофон"]),
            models.Product(name="Беспроводная зарядка 15W", description="Быстрая беспроводная зарядка Qi 15W, совместима с iPhone, Samsung и любыми Qi-устройствами.", price=9990, is_digital=False, category="gadgets", stock=70, features=["15W быстрая зарядка", "Qi совместимость", "LED-индикатор", "Зарядка через чехол"]),
            models.Product(name="Игровая мышь RGB", description="Эргономичная игровая мышь с сенсором 26000 DPI, RGB-подсветкой и 11 программируемыми кнопками.", price=16990, is_digital=False, category="gadgets", stock=40, features=["Сенсор 26000 DPI", "11 кнопок", "RGB-подсветка", "Плетёный кабель"]),
            models.Product(name="Подставка для ноутбука Aluminium", description="Регулируемая алюминиевая подставка для ноутбуков 11–17 дюймов, совместима с MacBook и Windows.", price=12990, is_digital=False, category="gadgets", stock=50, features=["Алюминий авиационный", "6 высот", "MacBook совместима", "Антискользящие накладки"]),
            models.Product(name="Мини-проектор 4K Portable", description="Портативный 4K-проектор с Wi-Fi, Bluetooth, встроенными динамиками и 2-часовым аккумулятором.", price=79990, is_digital=False, category="gadgets", stock=15, features=["4K разрешение", "Wi-Fi + Bluetooth", "Встроенный аккумулятор", "Авто-трапеция"]),
            models.Product(name="Умная розетка Wi-Fi (4 шт.)", description="Набор из 4 умных Wi-Fi розеток с мониторингом энергопотребления и голосовым управлением.", price=11990, is_digital=False, category="gadgets", stock=65, features=["Мониторинг энергии", "Alexa + Google Home", "Таймер и расписание", "Установка без хаба"]),
            models.Product(name="Повербанк 20000 мАч", description="Ёмкий повербанк на 20000 мАч с быстрой зарядкой 65W PD, двумя USB-A и USB-C выходами.", price=18990, is_digital=False, category="gadgets", stock=60, features=["20000 мАч", "65W PD выход", "Заряжает ноутбуки", "LED-индикатор заряда"]),
        ]
        for p in demo_products:
            db.add(p)
        db.commit()
        print(f"[SEED] {len(demo_products)} products inserted.")
    except Exception as e:
        print(f"[SEED] Error: {e}")
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    seed_demo_data()
