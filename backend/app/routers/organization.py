from fastapi import APIRouter, HTTPException, status

from backend.app.models.organization import (
    AssetCategory,
    Department,
    EmployeeDirectoryItem,
    OrganizationSetup,
    RoleUpdateRequest,
)
from backend.app.models.user import UserRole, UserStatus

router = APIRouter()

DEPARTMENTS = [
    Department(id=1, name="Engineering", head="Aditi Rao", status="Active"),
    Department(id=2, name="Facilities", head="Rahul Nair", status="Active"),
    Department(
        id=3,
        name="Field Ops",
        head="Sana Iqbal",
        parent_department="Operations",
        status="Inactive",
    ),
]

CATEGORIES = [
    AssetCategory(id=1, name="Electronics", field="Warranty Period", status="Active"),
    AssetCategory(id=2, name="Furniture", field="Material", status="Active"),
    AssetCategory(id=3, name="Vehicles", field="Registration Renewal", status="Active"),
]

EMPLOYEES = [
    EmployeeDirectoryItem(
        id=1,
        name="AssetFlow Admin",
        email="admin@assetflow.local",
        department="Operations",
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    ),
    EmployeeDirectoryItem(
        id=2,
        name="Priya Shah",
        email="employee@assetflow.local",
        department="Engineering",
        role=UserRole.EMPLOYEE,
        status=UserStatus.ACTIVE,
    ),
    EmployeeDirectoryItem(
        id=3,
        name="Aditi Rao",
        email="aditi@assetflow.local",
        department="Engineering",
        role=UserRole.DEPARTMENT_HEAD,
        status=UserStatus.ACTIVE,
    ),
    EmployeeDirectoryItem(
        id=4,
        name="Rahul Nair",
        email="rahul@assetflow.local",
        department="Facilities",
        role=UserRole.ASSET_MANAGER,
        status=UserStatus.ACTIVE,
    ),
]


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

