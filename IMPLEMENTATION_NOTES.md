# DearMemory implementation pass

This branch now uses the real API for the core product flows.

## Important deployment settings

Frontend:
- `VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api`

Backend:
- `DATABASE_URL=...`
- `SECRET_KEY=...` (use a long random secret)
- `API_URL=https://YOUR-BACKEND-DOMAIN`
- `FRONTEND_URL=https://YOUR-FRONTEND-DOMAIN`
- `CORS_ORIGINS=https://YOUR-FRONTEND-DOMAIN`
- `UPLOAD_DIR=./uploads` (use a persistent volume or object storage in production)

## What was fixed in this pass

- Standard Bearer-token authentication is now used by the frontend.
- Backend still accepts legacy `?token=` requests during migration.
- CORS no longer uses a wildcard together with credentials.
- New accounts automatically receive a studio profile.
- Event listing now returns the calculated photo count.
- Public event views/unique visitors are recorded in `event_views`.
- Analytics traffic no longer returns hard-coded demo numbers.
- Image URLs are resolved against the configured API origin instead of localhost.
- Photo thumbnails no longer point at files that are never generated.
- Photo deletion removes the actual uploaded file.
- Public studio pages use real studio/events/photos data.
- Studio and event contact forms create real CRM leads.
- Leads/CRM dashboard uses the existing backend CRUD/status endpoints.
- Website Builder and Customize persist event design configuration.
- Settings persists the studio profile.
- Fake Team/Album Editor demo data was removed instead of presenting it as real functionality.

## Validation

- Python backend files were AST-parsed successfully.
- All frontend TypeScript/TSX files were parsed successfully with the TypeScript compiler API.
- A full dependency install/build could not be run in this sandbox because external package downloads are unavailable.
