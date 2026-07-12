from pydantic import BaseModel


class KpiCard(BaseModel):
    label: str
    value: int


class ActivityItem(BaseModel):
    message: str
    meta: str


class DashboardSummary(BaseModel):
    kpis: list[KpiCard]
    overdue_returns: int
    recent_activity: list[ActivityItem]

