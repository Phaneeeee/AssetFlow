from fastapi import APIRouter

from app.models.notifications import NotificationsWorkspace

router = APIRouter()


@router.get("", response_model=NotificationsWorkspace)
def notifications_workspace():
    return NotificationsWorkspace(
        notifications=[],
        activity_log=[],
    )
