# Kazakhstan cities mapped to nearest branch + delivery days
# days_local   = branch has the item in stock
# days_transit = item must come from another branch

CITIES = {
    # ── Алматы branch (id=1) ──────────────────────────────────────
    "Алматы":        {"branch_id": 1, "days_local": 1, "days_transit": 3},
    "Қапшағай":      {"branch_id": 1, "days_local": 1, "days_transit": 3},
    "Есік":          {"branch_id": 1, "days_local": 1, "days_transit": 3},
    "Талдықорған":   {"branch_id": 1, "days_local": 2, "days_transit": 4},
    "Текелі":        {"branch_id": 1, "days_local": 2, "days_transit": 4},
    "Жаркент":       {"branch_id": 1, "days_local": 3, "days_transit": 5},
    "Қонаев":        {"branch_id": 1, "days_local": 1, "days_transit": 3},
    "Үштөбе":        {"branch_id": 1, "days_local": 2, "days_transit": 4},

    # ── Астана branch (id=2) ──────────────────────────────────────
    "Астана":        {"branch_id": 2, "days_local": 1, "days_transit": 3},
    "Көкшетау":      {"branch_id": 2, "days_local": 2, "days_transit": 4},
    "Степногорск":   {"branch_id": 2, "days_local": 2, "days_transit": 4},
    "Щучинск":       {"branch_id": 2, "days_local": 2, "days_transit": 4},
    "Петропавловск": {"branch_id": 2, "days_local": 2, "days_transit": 5},
    "Павлодар":      {"branch_id": 2, "days_local": 2, "days_transit": 5},
    "Екібастұз":     {"branch_id": 2, "days_local": 2, "days_transit": 5},
    "Аксу":          {"branch_id": 2, "days_local": 3, "days_transit": 5},
    "Ақкөл":         {"branch_id": 2, "days_local": 2, "days_transit": 4},
    "Атбасар":       {"branch_id": 2, "days_local": 3, "days_transit": 5},

    # ── Шымкент branch (id=3) ─────────────────────────────────────
    "Шымкент":       {"branch_id": 3, "days_local": 1, "days_transit": 3},
    "Тараз":         {"branch_id": 3, "days_local": 2, "days_transit": 4},
    "Түркістан":     {"branch_id": 3, "days_local": 2, "days_transit": 4},
    "Кентау":        {"branch_id": 3, "days_local": 2, "days_transit": 4},
    "Арыс":          {"branch_id": 3, "days_local": 2, "days_transit": 4},
    "Сарыағаш":      {"branch_id": 3, "days_local": 2, "days_transit": 4},
    "Қызылорда":     {"branch_id": 3, "days_local": 3, "days_transit": 5},
    "Байқоңыр":      {"branch_id": 3, "days_local": 3, "days_transit": 6},
    "Шардара":       {"branch_id": 3, "days_local": 3, "days_transit": 5},
    "Жетісай":       {"branch_id": 3, "days_local": 3, "days_transit": 5},

    # ── Қарағанды branch (id=4) ───────────────────────────────────
    "Қарағанды":     {"branch_id": 4, "days_local": 1, "days_transit": 3},
    "Теміртау":      {"branch_id": 4, "days_local": 1, "days_transit": 3},
    "Жезқазған":     {"branch_id": 4, "days_local": 2, "days_transit": 5},
    "Балқаш":        {"branch_id": 4, "days_local": 2, "days_transit": 5},
    "Сәтбаев":       {"branch_id": 4, "days_local": 2, "days_transit": 5},
    "Шахтинск":      {"branch_id": 4, "days_local": 2, "days_transit": 4},
    "Өскемен":       {"branch_id": 4, "days_local": 2, "days_transit": 5},
    "Семей":         {"branch_id": 4, "days_local": 2, "days_transit": 5},
    "Риддер":        {"branch_id": 4, "days_local": 3, "days_transit": 6},
    "Курчатов":      {"branch_id": 4, "days_local": 3, "days_transit": 6},
    "Зыряновск":     {"branch_id": 4, "days_local": 3, "days_transit": 6},
    "Абай":          {"branch_id": 4, "days_local": 2, "days_transit": 4},

    # ── Ақтөбе branch (id=5) ──────────────────────────────────────
    "Ақтөбе":        {"branch_id": 5, "days_local": 1, "days_transit": 3},
    "Орал":          {"branch_id": 5, "days_local": 2, "days_transit": 5},
    "Атырау":        {"branch_id": 5, "days_local": 2, "days_transit": 5},
    "Ақтау":         {"branch_id": 5, "days_local": 3, "days_transit": 6},
    "Жаңаөзен":      {"branch_id": 5, "days_local": 3, "days_transit": 7},
    "Қостанай":      {"branch_id": 5, "days_local": 2, "days_transit": 5},
    "Рудный":        {"branch_id": 5, "days_local": 2, "days_transit": 5},
    "Лисаковск":     {"branch_id": 5, "days_local": 3, "days_transit": 5},
    "Житіқара":      {"branch_id": 5, "days_local": 3, "days_transit": 6},
    "Хромтау":       {"branch_id": 5, "days_local": 2, "days_transit": 5},
    "Ембі":          {"branch_id": 5, "days_local": 3, "days_transit": 6},
    "Форт-Шевченко": {"branch_id": 5, "days_local": 4, "days_transit": 7},
}

CITY_NAMES = sorted(CITIES.keys())

BRANCH_CITIES = {
    1: "Алматы",
    2: "Астана",
    3: "Шымкент",
    4: "Қарағанды",
    5: "Ақтөбе",
}
