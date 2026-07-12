from fastapi import APIRouter

from backend.app.models.reports import ChartPoint, ReportInsight, ReportsWorkspace

router = APIRouter()


@router.get("", response_model=ReportsWorkspace)
def reports_workspace():
    return ReportsWorkspace(
        utilization_by_department=[
            ChartPoint(label="Engineering", value=82),
            ChartPoint(label="Facilities", value=64),
            ChartPoint(label="Field Ops", value=58),
            ChartPoint(label="HR", value=41),
            ChartPoint(label="Admin", value=36),
        ],
        maintenance_frequency=[
            ChartPoint(label="Jan", value=4),
            ChartPoint(label="Feb", value=8),
            ChartPoint(label="Mar", value=6),
            ChartPoint(label="Apr", value=11),
            ChartPoint(label="May", value=9),
            ChartPoint(label="Jun", value=14),
        ],
        booking_heatmap=[
            ChartPoint(label="09:00", value=7),
            ChartPoint(label="10:00", value=12),
            ChartPoint(label="11:00", value=9),
            ChartPoint(label="14:00", value=15),
            ChartPoint(label="16:00", value=8),
        ],
        most_used_assets=[
            ReportInsight(title="Room B2", detail="34 bookings this month"),
            ReportInsight(title="Van AF-022", detail="21 trips this month"),
            ReportInsight(title="Projector AF-335", detail="18 uses"),
        ],
        idle_assets=[
            ReportInsight(title="Camera AF-0801", detail="Unused 60+ days"),
            ReportInsight(title="Chair AF-0103", detail="Unused 45 days"),
        ],
        due_for_maintenance=[
            ReportInsight(title="Forklift AF-0097", detail="Service due in 5 days"),
            ReportInsight(title="Laptop AF-0020", detail="Warranty nearing retirement"),
        ],
    )

