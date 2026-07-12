from fastapi import APIRouter, HTTPException, status

from backend.app.models.booking import (
    BookingConflict,
    BookingCreateRequest,
    BookingStatus,
    BookingWorkspace,
    ResourceBooking,
)

router = APIRouter()

RESOURCES = ["Conference Room B2", "Pool Vehicle 01", "Projector AF-0062"]

BOOKINGS = [
    ResourceBooking(
        id=1,
        resource_name="Conference Room B2",
        booked_by="Procurement Team",
        start_time="2026-07-12T09:00:00",
        end_time="2026-07-12T10:00:00",
        status=BookingStatus.UPCOMING,
        note="Weekly vendor review",
    )
]


@router.get("", response_model=BookingWorkspace)
def booking_workspace():
    return BookingWorkspace(resources=RESOURCES, bookings=BOOKINGS)


@router.post("", response_model=ResourceBooking, status_code=status.HTTP_201_CREATED)
def book_resource(payload: BookingCreateRequest):
    if payload.end_time <= payload.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time",
        )

    conflict = _find_overlap(payload)
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=BookingConflict(
                message="Requested slot overlaps an existing booking",
                conflicting_booking=conflict,
            ).model_dump(mode="json"),
        )

    booking = ResourceBooking(
        id=len(BOOKINGS) + 1,
        resource_name=payload.resource_name,
        booked_by=payload.booked_by,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=BookingStatus.UPCOMING,
        note=payload.note,
    )
    BOOKINGS.append(booking)
    return booking


@router.patch("/{booking_id}/cancel", response_model=ResourceBooking)
def cancel_booking(booking_id: int):
    for booking in BOOKINGS:
        if booking.id == booking_id:
            booking.status = BookingStatus.CANCELLED
            return booking

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Booking not found",
    )


def _find_overlap(payload: BookingCreateRequest) -> ResourceBooking | None:
    for booking in BOOKINGS:
        same_resource = booking.resource_name == payload.resource_name
        active_booking = booking.status != BookingStatus.CANCELLED
        overlaps = payload.start_time < booking.end_time and payload.end_time > booking.start_time
        if same_resource and active_booking and overlaps:
            return booking
    return None

