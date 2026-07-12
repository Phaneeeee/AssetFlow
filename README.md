# AssetFlow

Enterprise Asset & Resource Management System.

## Current scope

AssetFlow starts as an empty organization workspace:

- FastAPI backend with health/auth endpoints
- React frontend with Admin and Employee login entry points
- First signup becomes the organization Admin; later signups become Employees
- No seeded assets, employees, reports, bookings, notifications, or maintenance records
- Role model prepared for Admin, Asset Manager, Department Head, and Employee workflows

## Run locally

Backend:

```bash
python -m uvicorn main:app --reload
```

Create the first account from the signup screen. That first account becomes the
organization Admin.

Frontend:

```bash
cd frontend
npm install
npm run dev
```
