from fastapi import APIRouter, HTTPException, status

from app.routers.organization import add_employee
from app.models.user import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserPublic,
    UserRole,
)

router = APIRouter()

USERS: dict[str, dict[str, object]] = {}


def _public_user(user: dict[str, object]) -> UserPublic:
    return UserPublic(
        id=int(user["id"]),
        name=str(user["name"]),
        email=str(user["email"]),
        role=user["role"],
        department=str(user["department"]) if user.get("department") else None,
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    user = USERS.get(payload.email)
    if not user or user["password"] != payload.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return AuthResponse(user=_public_user(user), token=f"session-token-{user['id']}")


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest):
    if payload.email in USERS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    role = UserRole.ADMIN if not USERS else UserRole.EMPLOYEE
    user = {
        "id": len(USERS) + 1,
        "name": payload.name,
        "email": payload.email,
        "password": payload.password,
        "role": role,
        "department": "Unassigned",
    }
    USERS[payload.email] = user
    add_employee(payload.name, str(payload.email), role)

    return AuthResponse(user=_public_user(user), token=f"session-token-{user['id']}")
