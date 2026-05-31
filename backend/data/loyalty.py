# Loyalty tier system based on cumulative spending (KZT)
# Cashback is earned ONLY on online card payments.

TIERS = [
    {"key": "new",      "name": "Новичок",    "min_spent": 0,           "rate": 0.00, "color": "#9ca3af"},
    {"key": "bronze",   "name": "Бронза",     "min_spent": 100_000,     "rate": 0.02, "color": "#b45309"},
    {"key": "silver",   "name": "Серебро",    "min_spent": 250_000,     "rate": 0.05, "color": "#6b7280"},
    {"key": "gold",     "name": "Золото",     "min_spent": 500_000,     "rate": 0.08, "color": "#d97706"},
    {"key": "platinum", "name": "Платина",    "min_spent": 1_000_000,   "rate": 0.12, "color": "#3b82f6"},
    {"key": "diamond",  "name": "Бриллиант",  "min_spent": 2_500_000,   "rate": 0.18, "color": "#06b6d4"},
    {"key": "elite",    "name": "Элита",      "min_spent": 5_000_000,   "rate": 0.25, "color": "#8b5cf6"},
    {"key": "vip",      "name": "VIP",        "min_spent": 10_000_000,  "rate": 0.35, "color": "#ef4444"},
    {"key": "legend",   "name": "Легенда",    "min_spent": 25_000_000,  "rate": 0.50, "color": "#f59e0b"},
]


def get_tier(total_spent: float) -> dict:
    current = TIERS[0]
    for t in TIERS:
        if total_spent >= t["min_spent"]:
            current = t
    return current


def get_next_tier(total_spent: float) -> dict | None:
    tier = get_tier(total_spent)
    idx = next((i for i, t in enumerate(TIERS) if t["key"] == tier["key"]), 0)
    if idx + 1 < len(TIERS):
        return TIERS[idx + 1]
    return None


def tier_progress_pct(total_spent: float) -> float:
    tier = get_tier(total_spent)
    next_t = get_next_tier(total_spent)
    if not next_t:
        return 100.0
    span = next_t["min_spent"] - tier["min_spent"]
    done = total_spent - tier["min_spent"]
    return round(min(done / span * 100, 100), 1)
