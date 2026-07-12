from enum import StrEnum

from pydantic import BaseModel, EmailStr, Field


class UserRole(StrEnum):
    ADMIN = "Admin"
    ASSET_MANAGER = "Asset Manager"
    DEPARTMENT_HEAD = "Department Head"
    EMPLOYEE = "Employee"


class UserStatus(StrEnum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"


class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    department: str | None = None
    status: UserStatus = UserStatus.ACTIVE


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8)


class AuthResponse(BaseModel):
    user: UserPublic
    token: str

