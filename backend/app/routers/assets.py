from fastapi import APIRouter

from app.models.asset import (
    Asset,
    AssetCondition,
    AssetCreateRequest,
    AssetDirectory,
    AssetHistoryItem,
    AssetStatus,
)

router = APIRouter()

ASSETS: list[Asset] = []


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

