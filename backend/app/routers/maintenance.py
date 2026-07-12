from fastapi import APIRouter, HTTPException, status

from app.models.maintenance import (
    MaintenanceCreateRequest,
    MaintenancePriority,
    MaintenanceRequest,
    MaintenanceStatus,
    MaintenanceTransitionRequest,
    MaintenanceWorkspace,
)

router = APIRouter()

REQUESTS: list[MaintenanceRequest] = []


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

