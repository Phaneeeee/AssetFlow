from fastapi import APIRouter, HTTPException, status

from backend.app.models.audit import (
    AuditAsset,
    AuditCreateRequest,
    AuditCycle,
    AuditStatus,
    AuditVerificationRequest,
    AuditWorkspace,
    VerificationStatus,
)

router = APIRouter()

CYCLES = [
    AuditCycle(
        id=1,
        name="Q3 Audit",
        scope="Engineering Dept",
        date_range="1-15 Jul",
        auditors=["A. Rao", "S. Iqbal"],
        status=AuditStatus.OPEN,
        assets=[
            AuditAsset(
                asset_tag="AF-003",
                asset_name="Dell Laptop",
                expected_location="Desk #12",
                verification=VerificationStatus.VERIFIED,
            ),
            AuditAsset(
                asset_tag="AF-021",
                asset_name="Office Chair",
                expected_location="Desk #09",
                verification=VerificationStatus.MISSING,
            ),
            AuditAsset(
                asset_tag="AF-093",
                asset_name="Monitor",
                expected_location="Desk #15",
                verification=VerificationStatus.DAMAGED,
            ),
        ],
    )
]


@router.get("", response_model=AuditWorkspace)
def audit_workspace():
    return AuditWorkspace(cycles=CYCLES, discrepancy_count=_discrepancy_count())


@router.post("", response_model=AuditCycle, status_code=status.HTTP_201_CREATED)
def create_cycle(payload: AuditCreateRequest):
    cycle = AuditCycle(
        id=len(CYCLES) + 1,
        name=payload.name,
        scope=payload.scope,
        date_range=payload.date_range,
        auditors=payload.auditors,
        status=AuditStatus.OPEN,
        assets=[],
    )
    CYCLES.append(cycle)
    return cycle


@router.patch("/{cycle_id}/assets/{asset_tag}", response_model=AuditCycle)
def verify_asset(cycle_id: int, asset_tag: str, payload: AuditVerificationRequest):
    cycle = _find_cycle(cycle_id)
    for asset in cycle.assets:
        if asset.asset_tag == asset_tag:
            asset.verification = payload.verification
            return cycle

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Audit asset not found",
    )


@router.patch("/{cycle_id}/close", response_model=AuditCycle)
def close_cycle(cycle_id: int):
    cycle = _find_cycle(cycle_id)
    cycle.status = AuditStatus.CLOSED
    return cycle


def _find_cycle(cycle_id: int) -> AuditCycle:
    for cycle in CYCLES:
        if cycle.id == cycle_id:
            return cycle

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Audit cycle not found",
    )


def _discrepancy_count() -> int:
    return sum(
        1
        for cycle in CYCLES
        for asset in cycle.assets
        if asset.verification != VerificationStatus.VERIFIED
    )

