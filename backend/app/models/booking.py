from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class BookingStatus(StrEnum):
    UPCOMING = "Upcoming"
    ONGOING = "Ongoing"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class ResourceBooking(BaseModel):
    id: int
    resource_name: str
    booked_by: str
    start_time: datetime
    end_time: datetime
    status: BookingStatus
    note: str | None = None


class BookingCreateRequest(BaseModel):
    resource_name: str = Field(min_length=2, max_length=120)
    booked_by: str = Field(min_length=2, max_length=120)
    start_time: datetime
    end_time: datetime
    note: str | None = Field(default=None, max_length=240)


class BookingConflict(BaseModel):
    message: str
    conflicting_booking: ResourceBooking


class BookingWorkspace(BaseModel):
    resources: list[str]
    bookings: list[ResourceBooking]

