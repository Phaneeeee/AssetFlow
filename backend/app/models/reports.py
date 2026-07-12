from pydantic import BaseModel


class ChartPoint(BaseModel):
    label: str
    value: int


class ReportInsight(BaseModel):
    title: str
    detail: str


class ReportsWorkspace(BaseModel):
    utilization_by_department: list[ChartPoint]
    maintenance_frequency: list[ChartPoint]
    booking_heatmap: list[ChartPoint]
    most_used_assets: list[ReportInsight]
    idle_assets: list[ReportInsight]
    due_for_maintenance: list[ReportInsight]

