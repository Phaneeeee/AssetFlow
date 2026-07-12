# AssetFlow

Enterprise Asset & Resource Management System.

## First feature slice

This initial commit sets up the project foundation and the authentication shell:

- FastAPI backend with health/auth endpoints
- React frontend with login and employee-only signup screens
- Dark ERP visual style based on the provided mockup
- Role model prepared for Admin, Asset Manager, Department Head, and Employee workflows

## Run locally

Backend:

```bash
python -m uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

