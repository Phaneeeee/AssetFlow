from fastapi import APIRouter

from app.models.dashboard import DashboardSummary, KpiCard

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary():
    return DashboardSummary(
        kpis=[
            KpiCard(label="Assets Available", value=0),
            KpiCard(label="Assets Allocated", value=0),
            KpiCard(label="Maintenance Today", value=0),
            KpiCard(label="Active Bookings", value=0),
            KpiCard(label="Pending Transfers", value=0),
            KpiCard(label="Upcoming Returns", value=0),
        ],
        overdue_returns=0,
        recent_activity=[],
    )
