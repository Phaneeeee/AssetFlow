from enum import StrEnum

from pydantic import BaseModel


class NotificationType(StrEnum):
    ALERT = "Alert"
    APPROVAL = "Approval"
    BOOKING = "Booking"
    ACTIVITY = "Activity"


class NotificationItem(BaseModel):
    id: int
    message: str
    type: NotificationType
    age: str
    read: bool = False


class ActivityLogItem(BaseModel):
    id: int
    actor: str
    action: str
    target: str
    timestamp: str


class NotificationsWorkspace(BaseModel):
    notifications: list[NotificationItem]
    activity_log: list[ActivityLogItem]

