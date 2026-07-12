from fastapi import APIRouter, HTTPException, status

from backend.app.models.allocation import (
    Allocation,
    AllocationConflict,
    AllocationCreateRequest,
    AllocationStatus,
    AllocationWorkspace,
    ReturnRequest,
    TransferCreateRequest,
    TransferRequest,
    TransferStatus,
)

router = APIRouter()

ALLOCATIONS = [
    Allocation(
        id=1,
        asset_tag="AF-0012",
        asset_name="Dell Laptop",
        holder="Priya Shah",
        holder_type="Employee",
        department="Engineering",
        expected_return_date="2026-07-05",
        status=AllocationStatus.OVERDUE,
    ),
]

TRANSFER_REQUESTS = [
    TransferRequest(
        id=1,
        asset_tag="AF-0012",
        from_holder="Priya Shah",
        to_holder="Raj Mehta",
        reason="Needs laptop for client demo",
        status=TransferStatus.REQUESTED,
    )
]

ASSET_NAMES = {
    "AF-0012": "Dell Laptop",
    "AF-0062": "Projector",
    "AF-0201": "Office Chair",
}


@router.get("", response_model=AllocationWorkspace)
def allocation_workspace():
    return AllocationWorkspace(
        allocations=ALLOCATIONS,
        transfer_requests=TRANSFER_REQUESTS,
    )


@router.post("", response_model=Allocation, status_code=status.HTTP_201_CREATED)
def allocate_asset(payload: AllocationCreateRequest):
    active = _active_allocation(payload.asset_tag)
    if active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=AllocationConflict(
                message="Asset is already allocated. Create a transfer request instead.",
                current_holder=active.holder,
                asset_tag=active.asset_tag,
            ).model_dump(),
        )

    allocation = Allocation(
        id=len(ALLOCATIONS) + 1,
        asset_tag=payload.asset_tag,
        asset_name=ASSET_NAMES.get(payload.asset_tag, "Registered Asset"),
        holder=payload.holder,
        holder_type=payload.holder_type,
        department=payload.department,
        expected_return_date=payload.expected_return_date,
        status=AllocationStatus.ACTIVE,
    )
    ALLOCATIONS.append(allocation)
    return allocation


@router.post("/transfer-requests", response_model=TransferRequest, status_code=status.HTTP_201_CREATED)
def create_transfer_request(payload: TransferCreateRequest):
    active = _active_allocation(payload.asset_tag)
    if not active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only currently allocated assets need a transfer request",
        )

    request = TransferRequest(
        id=len(TRANSFER_REQUESTS) + 1,
        asset_tag=payload.asset_tag,
        from_holder=active.holder,
        to_holder=payload.to_holder,
        reason=payload.reason,
        status=TransferStatus.REQUESTED,
    )
    TRANSFER_REQUESTS.append(request)
    return request


@router.post("/{allocation_id}/return", response_model=Allocation)
def return_asset(allocation_id: int, payload: ReturnRequest):
    for allocation in ALLOCATIONS:
        if allocation.id == allocation_id:
            allocation.status = AllocationStatus.RETURNED
            allocation.check_in_notes = payload.condition_notes
            return allocation

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Allocation not found",
    )


def _active_allocation(asset_tag: str) -> Allocation | None:
    for allocation in ALLOCATIONS:
        if allocation.asset_tag == asset_tag and allocation.status != AllocationStatus.RETURNED:
            return allocation
    return None

