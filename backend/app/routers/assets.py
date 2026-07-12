from fastapi import APIRouter

from backend.app.models.asset import (
    Asset,
    AssetCondition,
    AssetCreateRequest,
    AssetDirectory,
    AssetHistoryItem,
    AssetStatus,
)

router = APIRouter()

ASSETS = [
    Asset(
        id=1,
        tag="AF-0012",
        name="Dell Laptop",
        category="Electronics",
        serial_number="DL-9X114",
        acquisition_date="2025-04-12",
        acquisition_cost=98000,
        condition=AssetCondition.GOOD,
        location="Bengaluru",
        department="Engineering",
        status=AssetStatus.ALLOCATED,
        history=[
            AssetHistoryItem(
                date="2026-03-12",
                event="Allocated",
                detail="Assigned to Priya Shah - Engineering",
            )
        ],
    ),
    Asset(
        id=2,
        tag="AF-0062",
        name="Projector",
        category="Electronics",
        serial_number="PRJ-2219",
        acquisition_date="2024-11-02",
        acquisition_cost=43000,
        condition=AssetCondition.NEEDS_REPAIR,
        location="HQ Floor 2",
        department="Facilities",
        status=AssetStatus.UNDER_MAINTENANCE,
        shared_bookable=True,
        history=[
            AssetHistoryItem(
                date="2026-07-08",
                event="Maintenance",
                detail="Optical alignment issue approved for repair",
            )
        ],
    ),
    Asset(
        id=3,
        tag="AF-0201",
        name="Office Chair",
        category="Furniture",
        serial_number="CHR-8810",
        acquisition_date="2025-08-18",
        acquisition_cost=6500,
        condition=AssetCondition.GOOD,
        location="Warehouse",
        status=AssetStatus.AVAILABLE,
        history=[
            AssetHistoryItem(
                date="2026-01-04",
                event="Returned",
                detail="Returned by Arjun Mehta - condition good",
            )
        ],
    ),
]


@router.get("", response_model=AssetDirectory)
def list_assets():
    return AssetDirectory(assets=ASSETS, statuses=list(AssetStatus))


@router.post("", response_model=Asset, status_code=201)
def register_asset(payload: AssetCreateRequest):
    next_id = len(ASSETS) + 1
    asset = Asset(
        id=next_id,
        tag=f"AF-{next_id:04d}",
        name=payload.name,
        category=payload.category,
        serial_number=payload.serial_number,
        acquisition_date=payload.acquisition_date,
        acquisition_cost=payload.acquisition_cost,
        condition=payload.condition,
        location=payload.location,
        department=payload.department,
        status=AssetStatus.AVAILABLE,
        shared_bookable=payload.shared_bookable,
        history=[
            AssetHistoryItem(
                date=str(payload.acquisition_date),
                event="Registered",
                detail=f"{payload.name} registered in {payload.location}",
            )
        ],
    )
    ASSETS.append(asset)
    return asset

