from fastapi import APIRouter, HTTPException, status

from app.models.organization import (
    AssetCategory,
    Department,
    EmployeeDirectoryItem,
    OrganizationSetup,
    RoleUpdateRequest,
)
from app.models.user import UserRole, UserStatus

router = APIRouter()

DEPARTMENTS: list[Department] = []
CATEGORIES: list[AssetCategory] = []
EMPLOYEES: list[EmployeeDirectoryItem] = []


def add_employee(
    name: str,
    email: str,
    role: UserRole,
    department: str = "Unassigned",
) -> EmployeeDirectoryItem:
    employee = EmployeeDirectoryItem(
        id=len(EMPLOYEES) + 1,
        name=name,
        email=email,
        department=department,
        role=role,
        status=UserStatus.ACTIVE,
    )
    EMPLOYEES.append(employee)
    return employee


@router.get("/setup", response_model=OrganizationSetup)
def get_organization_setup():
    return OrganizationSetup(
        departments=DEPARTMENTS,
        categories=CATEGORIES,
        employees=EMPLOYEES,
    )


@router.patch("/employees/{employee_id}/role", response_model=EmployeeDirectoryItem)
def update_employee_role(employee_id: int, payload: RoleUpdateRequest):
    for employee in EMPLOYEES:
        if employee.id == employee_id:
            employee.role = payload.role
            return employee

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Employee not found",
    )

