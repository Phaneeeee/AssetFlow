from pydantic import BaseModel, EmailStr

from backend.app.models.user import UserRole, UserStatus


class Department(BaseModel):
    id: int
    name: str
    head: str | None = None
    parent_department: str | None = None
    status: str


class AssetCategory(BaseModel):
    id: int
    name: str
    field: str | None = None
    status: str


class EmployeeDirectoryItem(BaseModel):
    id: int
    name: str
    email: EmailStr
    department: str
    role: UserRole
    status: UserStatus


class RoleUpdateRequest(BaseModel):
    role: UserRole


class OrganizationSetup(BaseModel):
    departments: list[Department]
    categories: list[AssetCategory]
    employees: list[EmployeeDirectoryItem]

