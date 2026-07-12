from fastapi import APIRouter, HTTPException, status

from backend.app.models.user import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserPublic,
    UserRole,
)

router = APIRouter()

DEMO_USERS: dict[str, dict[str, object]] = {
    "admin@assetflow.local": {
        "id": 1,
        "name": "AssetFlow Admin",
        "email": "admin@assetflow.local",
        "password": "password123",
        "role": UserRole.ADMIN,
        "department": "Operations",
    },
    "employee@assetflow.local": {
        "id": 2,
        "name": "Priya Shah",
        "email": "employee@assetflow.local",
        "password": "password123",
        "role": UserRole.EMPLOYEE,
        "department": "Engineering",
    },
}


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
    user = DEMO_USERS.get(payload.email)
    if not user or user["password"] != payload.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return AuthResponse(user=_public_user(user), token=f"demo-token-{user['id']}")


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest):
    if payload.email in DEMO_USERS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = {
        "id": len(DEMO_USERS) + 1,
        "name": payload.name,
        "email": payload.email,
        "password": payload.password,
        "role": UserRole.EMPLOYEE,
        "department": None,
    }
    DEMO_USERS[payload.email] = user

    return AuthResponse(user=_public_user(user), token=f"demo-token-{user['id']}")

