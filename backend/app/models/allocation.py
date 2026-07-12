from datetime import date
from enum import StrEnum

from pydantic import BaseModel, Field


class AllocationStatus(StrEnum):
    ACTIVE = "Active"
    RETURNED = "Returned"
    OVERDUE = "Overdue"


class TransferStatus(StrEnum):
    REQUESTED = "Requested"
    APPROVED = "Approved"
    RE_ALLOCATED = "Re-allocated"


class Allocation(BaseModel):
    id: int
    asset_tag: str
    asset_name: str
    holder: str
    holder_type: str
    department: str
    expected_return_date: date | None = None
    status: AllocationStatus
    check_in_notes: str | None = None


class TransferRequest(BaseModel):
    id: int
    asset_tag: str
    from_holder: str
    to_holder: str
    reason: str
    status: TransferStatus


class AllocationCreateRequest(BaseModel):
    asset_tag: str
    holder: str = Field(min_length=2, max_length=120)
    holder_type: str = "Employee"
    department: str = Field(min_length=2, max_length=120)
    expected_return_date: date | None = None


class TransferCreateRequest(BaseModel):
    asset_tag: str
    to_holder: str = Field(min_length=2, max_length=120)
    reason: str = Field(min_length=2, max_length=400)


class ReturnRequest(BaseModel):
    condition_notes: str = Field(min_length=2, max_length=400)


class AllocationConflict(BaseModel):
    message: str
    current_holder: str
    asset_tag: str


class AllocationWorkspace(BaseModel):
    allocations: list[Allocation]
    transfer_requests: list[TransferRequest]

