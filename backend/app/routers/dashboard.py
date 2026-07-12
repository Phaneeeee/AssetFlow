from fastapi import APIRouter

from backend.app.models.dashboard import ActivityItem, DashboardSummary, KpiCard

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary():
    return DashboardSummary(
        kpis=[
            KpiCard(label="Assets Available", value=128),
            KpiCard(label="Assets Allocated", value=96),
            KpiCard(label="Maintenance Today", value=4),
            KpiCard(label="Active Bookings", value=9),
            KpiCard(label="Pending Transfers", value=3),
            KpiCard(label="Upcoming Returns", value=12),
        ],
        overdue_returns=3,
        recent_activity=[
            ActivityItem(
                message="Laptop AF-0114 allocated to Priya Shah",
                meta="IT Dept",
            ),
            ActivityItem(
                message="Room B2 booking confirmed",
                meta="2:00 to 3:00 PM",
            ),
            ActivityItem(
                message="Projector AF-0062 maintenance resolved",
                meta="Facilities",
            ),
        ],
    )

