from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routers import auth, dashboard, organization

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
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(
    organization.router,
    prefix="/api/organization",
    tags=["organization"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "assetflow-api"}
