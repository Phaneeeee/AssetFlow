from fastapi import APIRouter

from backend.app.models.notifications import (
    ActivityLogItem,
    NotificationItem,
    NotificationType,
    NotificationsWorkspace,
)

router = APIRouter()


@router.get("", response_model=NotificationsWorkspace)
def notifications_workspace():
    return NotificationsWorkspace(
        notifications=[
            NotificationItem(
                id=1,
                message="Laptop AF-0019 assigned to Priya Shah",
                type=NotificationType.ACTIVITY,
                age="2m ago",
            ),
            NotificationItem(
                id=2,
                message="Maintenance request AF-0055 approved",
                type=NotificationType.APPROVAL,
                age="18m ago",
            ),
            NotificationItem(
                id=3,
                message="Booking confirmed: Room B2 2:00 to 3:00 PM",
                type=NotificationType.BOOKING,
                age="1h ago",
            ),
            NotificationItem(
                id=4,
                message="Transfer approved: AF-0033 to Facilities Dept",
                type=NotificationType.APPROVAL,
                age="3h ago",
            ),
            NotificationItem(
                id=5,
                message="Overdue return: AF-0201 was due 3 days ago",
                type=NotificationType.ALERT,
                age="1d ago",
            ),
            NotificationItem(
                id=6,
                message="Audit discrepancy flagged: AF-0088 damaged",
                type=NotificationType.ALERT,
                age="2d ago",
            ),
        ],
        activity_log=[
            ActivityLogItem(
                id=1,
                actor="AssetFlow Admin",
                action="promoted",
                target="Rahul Nair to Asset Manager",
                timestamp="2026-07-12 09:10",
            ),
            ActivityLogItem(
                id=2,
                actor="Rahul Nair",
                action="approved maintenance",
                target="AF-0062",
                timestamp="2026-07-12 10:25",
            ),
            ActivityLogItem(
                id=3,
                actor="Aditi Rao",
                action="closed audit cycle",
                target="Q3 Engineering Audit",
                timestamp="2026-07-12 11:05",
            ),
        ],
    )

