from fastapi import APIRouter, HTTPException, status

from backend.app.models.maintenance import (
    MaintenanceCreateRequest,
    MaintenancePriority,
    MaintenanceRequest,
    MaintenanceStatus,
    MaintenanceTransitionRequest,
    MaintenanceWorkspace,
)

router = APIRouter()

REQUESTS = [
    MaintenanceRequest(
        id=1,
        asset_tag="AF-0062",
        asset_name="Projector",
        issue="Bulb not turning on",
        priority=MaintenancePriority.HIGH,
        raised_by="Priya Shah",
        status=MaintenanceStatus.PENDING,
    ),
    MaintenanceRequest(
        id=2,
        asset_tag="AF-0033",
        asset_name="Forklift",
        issue="Noisy compressor",
        priority=MaintenancePriority.MEDIUM,
        raised_by="Rahul Nair",
        status=MaintenanceStatus.APPROVED,
    ),
    MaintenanceRequest(
        id=3,
        asset_tag="AF-0078",
        asset_name="Forklift",
        issue="Check R valve",
        priority=MaintenancePriority.CRITICAL,
        raised_by="Sana Iqbal",
        technician="Vikram",
        status=MaintenanceStatus.TECHNICIAN_ASSIGNED,
    ),
    MaintenanceRequest(
        id=4,
        asset_tag="AF-0197",
        asset_name="Printer",
        issue="Jam parts ordered",
        priority=MaintenancePriority.LOW,
        raised_by="Arjun Mehta",
        technician="Meera",
        status=MaintenanceStatus.IN_PROGRESS,
    ),
    MaintenanceRequest(
        id=5,
        asset_tag="AF-573",
        asset_name="Chair",
        issue="Repair resolved",
        priority=MaintenancePriority.LOW,
        raised_by="Facilities",
        technician="Kiran",
        status=MaintenanceStatus.RESOLVED,
    ),
]


@router.get("", response_model=MaintenanceWorkspace)
def maintenance_workspace():
    return MaintenanceWorkspace(requests=REQUESTS, statuses=list(MaintenanceStatus))


@router.post("", response_model=MaintenanceRequest, status_code=status.HTTP_201_CREATED)
def raise_request(payload: MaintenanceCreateRequest):
    request = MaintenanceRequest(
        id=len(REQUESTS) + 1,
        asset_tag=payload.asset_tag,
        asset_name=payload.asset_name,
        issue=payload.issue,
        priority=payload.priority,
        raised_by=payload.raised_by,
        status=MaintenanceStatus.PENDING,
    )
    REQUESTS.append(request)
    return request


@router.patch("/{request_id}", response_model=MaintenanceRequest)
def transition_request(request_id: int, payload: MaintenanceTransitionRequest):
    for request in REQUESTS:
        if request.id == request_id:
            request.status = payload.status
            if payload.technician:
                request.technician = payload.technician
            return request

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Maintenance request not found",
    )

