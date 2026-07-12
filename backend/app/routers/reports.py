from fastapi import APIRouter

from app.models.reports import ReportsWorkspace

router = APIRouter()


@router.get("", response_model=ReportsWorkspace)
def reports_workspace():
    return ReportsWorkspace(
        utilization_by_department=[],
        maintenance_frequency=[],
        booking_heatmap=[],
        most_used_assets=[],
        idle_assets=[],
        due_for_maintenance=[],
    )
