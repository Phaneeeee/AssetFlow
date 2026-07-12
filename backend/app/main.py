from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    allocations,
    assets,
    audits,
    auth,
    bookings,
    dashboard,
    maintenance,
    notifications,
    organization,
    reports,
)

app = FastAPI(
    title="AssetFlow API",
    description="Enterprise Asset & Resource Management System API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])
app.include_router(allocations.router, prefix="/api/allocations", tags=["allocations"])
app.include_router(audits.router, prefix="/api/audits", tags=["audits"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(maintenance.router, prefix="/api/maintenance", tags=["maintenance"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(
    organization.router,
    prefix="/api/organization",
    tags=["organization"],
)
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "assetflow-api"}
