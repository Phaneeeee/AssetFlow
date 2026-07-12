from datetime import date
from enum import StrEnum

from pydantic import BaseModel, Field


class AssetStatus(StrEnum):
    AVAILABLE = "Available"
    ALLOCATED = "Allocated"
    RESERVED = "Reserved"
    UNDER_MAINTENANCE = "Under Maintenance"
    LOST = "Lost"
    RETIRED = "Retired"
    DISPOSED = "Disposed"


class AssetCondition(StrEnum):
    EXCELLENT = "Excellent"
    GOOD = "Good"
    FAIR = "Fair"
    NEEDS_REPAIR = "Needs Repair"


class AssetHistoryItem(BaseModel):
    date: str
    event: str
    detail: str


class Asset(BaseModel):
    id: int
    tag: str
    name: str
    category: str
    serial_number: str
    acquisition_date: date
    acquisition_cost: float
    condition: AssetCondition
    location: str
    department: str | None = None
    status: AssetStatus
    shared_bookable: bool = False
    history: list[AssetHistoryItem] = Field(default_factory=list)


class AssetCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    category: str
    serial_number: str = Field(min_length=2, max_length=80)
    acquisition_date: date
    acquisition_cost: float = Field(ge=0)
    condition: AssetCondition
    location: str = Field(min_length=2, max_length=120)
    department: str | None = None
    shared_bookable: bool = False


class AssetDirectory(BaseModel):
    assets: list[Asset]
    statuses: list[AssetStatus]

