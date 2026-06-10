from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/pc-builder", tags=["pc-builder"])

# PSU wattage calculation constants
BASE_WATTAGE = 75  # motherboard + RAM + storage + fans

# Typical TDP values by product specs field "tdp"
# If not specified, we use category defaults
CATEGORY_TDP_DEFAULT = {
    "cpu": 65,
    "gpu": 150,
}

class PsuCalcRequest(BaseModel):
    cpu_tdp: Optional[int] = 65
    gpu_tdp: Optional[int] = 0
    ram_sticks: Optional[int] = 2
    storage_count: Optional[int] = 1
    extra_fans: Optional[int] = 3

@router.post("/calc-psu")
def calc_psu(body: PsuCalcRequest):
    total = (
        body.cpu_tdp +
        body.gpu_tdp +
        BASE_WATTAGE +
        (body.ram_sticks * 5) +
        (body.storage_count * 7) +
        (body.extra_fans * 3)
    )
    # Add 20% headroom
    recommended_raw = total * 1.2
    # Round up to nearest standard PSU tier
    tiers = [400, 450, 500, 550, 600, 650, 750, 850, 1000, 1200, 1600]
    recommended = next((t for t in tiers if t >= recommended_raw), 1600)
    return {
        "estimated_load_watts": round(total),
        "recommended_psu_watts": recommended,
        "headroom_percent": round((recommended / total - 1) * 100),
    }

# Compatibility rules
SOCKET_COMPAT = {
    # Intel
    "LGA1700": ["Z790", "Z690", "B760", "H770", "H610"],
    "LGA1200": ["Z590", "Z490", "B560", "H570", "H510"],
    # AMD
    "AM5": ["X670E", "X670", "B650E", "B650", "A620"],
    "AM4": ["X570", "B550", "B450", "X470", "B350", "A320"],
}

RAM_COMPAT = {
    "LGA1700": ["DDR5", "DDR4"],
    "LGA1200": ["DDR4"],
    "AM5": ["DDR5"],
    "AM4": ["DDR4"],
}

class CompatCheckRequest(BaseModel):
    cpu_socket: Optional[str] = None
    motherboard_socket: Optional[str] = None
    motherboard_chipset: Optional[str] = None
    ram_type: Optional[str] = None
    case_form_factor: Optional[str] = None
    motherboard_form_factor: Optional[str] = None

FORM_FACTOR_COMPAT = {
    "Full Tower": ["ATX", "mATX", "ITX"],
    "Mid Tower": ["ATX", "mATX", "ITX"],
    "Mini Tower": ["mATX", "ITX"],
    "ITX": ["ITX"],
}

@router.post("/check-compatibility")
def check_compatibility(body: CompatCheckRequest):
    issues = []
    warnings = []

    # CPU <-> Motherboard socket
    if body.cpu_socket and body.motherboard_socket:
        if body.cpu_socket != body.motherboard_socket:
            issues.append(f"Сокет CPU ({body.cpu_socket}) не совместим с материнской платой ({body.motherboard_socket})")

    # CPU socket <-> Chipset
    if body.cpu_socket and body.motherboard_chipset:
        allowed = SOCKET_COMPAT.get(body.cpu_socket, [])
        if allowed and body.motherboard_chipset not in allowed:
            issues.append(f"Чипсет {body.motherboard_chipset} не поддерживает сокет {body.cpu_socket}")

    # RAM type compatibility
    if body.cpu_socket and body.ram_type:
        allowed_ram = RAM_COMPAT.get(body.cpu_socket, [])
        if allowed_ram and body.ram_type not in allowed_ram:
            issues.append(f"Тип памяти {body.ram_type} не совместим с платформой {body.cpu_socket}")

    # Case <-> Motherboard form factor
    if body.case_form_factor and body.motherboard_form_factor:
        allowed_ff = FORM_FACTOR_COMPAT.get(body.case_form_factor, [])
        if allowed_ff and body.motherboard_form_factor not in allowed_ff:
            issues.append(f"Корпус {body.case_form_factor} не поддерживает форм-фактор материнской платы {body.motherboard_form_factor}")

    return {
        "compatible": len(issues) == 0,
        "issues": issues,
        "warnings": warnings,
    }
