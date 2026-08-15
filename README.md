# Dear-Memory

Dear-Memory is a full-stack photography portfolio and event gallery platform designed for photographers and photography studios.

It allows photographers to manage their studio, create photography events, upload and organize photos, create albums, publish public galleries, manage leads, customize studio branding, view analytics, and offer subscription plans.

The project contains:

- A React/TanStack frontend at the repository root
- A FastAPI backend inside `backend/`
- PostgreSQL for production
- SQLAlchemy ORM and Alembic migrations
- JWT-based authentication
- Image upload and processing
- eSewa sandbox payment integration

---

## Repository

GitHub: https://github.com/ranju024/Dear-MemoryT

Production backend: https://dear-memoryt.onrender.com

> The frontend deployment is separate from the backend deployment.

---

# Features

## Authentication

- User registration
- User login
- JWT authentication
- Password hashing with bcrypt
- Current-user authentication
- Automatic frontend logout when a `401 Unauthorized` response is received
- JWT token stored in browser `localStorage`

The frontend sends the JWT using:

```text
Authorization: Bearer <token>
```

---

## Studio Management

- Create and manage a photography studio
- Studio profile
- Studio slug
- Studio logo upload
- Studio statistics
- Public studio information

---

## Events

Photographers can:

- Create events
- Edit events
- View events
- Delete events
- Publish events
- Access events through public slugs
- Organize photography work by event

Public event route:

```text
/event/:slug
```

---

## Photos

- Upload photos to events
- View event photos
- Update photo information
- Favorite/unfavorite photos
- Delete photos
- Download photos
- Image processing through Pillow
- JPEG, PNG, WebP, and GIF support

---

## Albums

Photographers can:

- Create albums
- Edit albums
- Delete albums
- Add photos to albums
- Remove photos from albums
- View album contents

---

## Public Galleries

Examples:

```text
/event/:slug
/studio/:slug
```

---

## Portfolio

The portfolio system supports:

- Portfolio sections
- Section ordering
- Section visibility
- Portfolio editing
- Public portfolio access through studio slugs

---

## Studio Brand Kit

Studios can customize:

- Primary color
- Background color
- Accent color
- Text color
- Heading font
- Body font
- Watermark text

---

## Leads / CRM

Supported operations include:

- Create leads
- Create public leads
- List leads
- Filter leads by status
- View individual leads
- Update leads
- Update lead status
- Delete leads

---

## Analytics

The backend provides analytics for:

- Dashboard statistics
- Event traffic
- Event performance
- Lead funnel
- Top-performing photos

---

## Guestbook

Visitors can sign the guestbook.

Studio owners can:

- View guestbook entries
- View pending entries
- Approve entries
- Remove entries

---

## Subscription Plans

### Starter

- Free
- 1 active event
- Up to 250 photos
- Watermarked downloads
- Free plan is currently intended to remain active indefinitely

### Creative

- Rs. 29
- Unlimited events
- Up to 10,000 photos per event
- Original downloads
- One-month subscription period

### Agency

- Rs. 89
- Unlimited events
- Unlimited photos
- Original downloads
- Lifetime plan

Subscription checkout is integrated with the backend and eSewa sandbox payment flow.

> Payment functionality is currently using the eSewa sandbox environment and is not yet a production payment configuration.

---

# Tech Stack

## Frontend

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Hook Form
- Recharts

The frontend lives at the repository root.

There is **no separate `frontend/` directory**.

## Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- Psycopg 3
- Alembic
- Pydantic
- Pydantic Settings
- python-dotenv
- Passlib
- bcrypt
- python-jose
- PyJWT
- Pillow
- python-multipart
- HTTPX

---

# Project Structure

```text
Dear-MemoryT/
│
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── uploads/
│   ├── logs/
│   ├── .env
│   ├── .env.example
│   ├── alembic.ini
│   └── requirements.txt
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── config.server.ts
│   │   └── utils.ts
│   ├── routes/
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
│
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── components.json
├── .env.example
├── .gitignore
└── README.md
```

---

# Backend Setup

## Requirements

- Python 3.10+
- PostgreSQL
- Node.js 18+
- npm

From the project root:

```bash
cd backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# Backend Environment Variables

Create:

```text
backend/.env
```

The `.env` file must not be committed to Git.

Example:

```env
DATABASE_URL=postgresql+psycopg://dear_memory_user:password@localhost:5432/dear_memory

SECRET_KEY=your-local-development-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads

API_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:8080

ENV=development

CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

SUBSCRIPTIONS_ALLOW_TEST_CHANGES=false

ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=your-esewa-sandbox-secret
ESEWA_PAYMENT_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_STATUS_URL=https://rc.esewa.com.np/api/epay/transaction/status/

ESEWA_SUCCESS_URL=http://localhost:8000/api/subscription/esewa/success
ESEWA_FAILURE_URL=http://localhost:8000/api/subscription/esewa/failure
```

Do not commit real database credentials, JWT secrets, or payment credentials.

---

# Database

The deployed application uses PostgreSQL.

The database connection is configured through:

```text
DATABASE_URL
```

The database layer is implemented in:

```text
backend/app/database.py
```

Alembic handles schema migrations.

Run:

```bash
alembic upgrade head
```

---

# Running the Backend Locally

From:

```text
Dear-MemoryT/backend
```

run:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# API Structure

The API is mounted under:

```text
/api
```

Examples:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET  /api/events/
POST /api/events/
GET  /api/events/{id}
PUT  /api/events/{id}
DELETE /api/events/{id}

GET  /api/studio/me
PUT  /api/studio/me

GET  /api/subscription/plans
GET  /api/subscription/me
POST /api/subscription/checkout
```

---

# Frontend Setup

The frontend is located at the repository root.

Do **not** run:

```bash
cd frontend
```

Instead:

```bash
npm install
npm run dev
```

---

# Frontend API Configuration

The frontend API client is:

```text
src/lib/api/client.ts
```

The API base URL is controlled through:

```text
VITE_API_URL
```

It falls back to:

```text
http://localhost:8000/api
```

when the variable is not provided.

For production:

```env
VITE_API_URL=https://dear-memoryt.onrender.com/api
```

---

# Local Frontend Environment

A frontend `.env` file is optional for local development because of the localhost fallback.

If desired, create `.env` in the project root:

```env
VITE_API_URL=http://localhost:8000/api
```

This file is ignored by Git.

---

# Production Frontend

Production backend:

```text
https://dear-memoryt.onrender.com
```

Production API:

```text
https://dear-memoryt.onrender.com/api
```

The frontend hosting provider should define:

```text
VITE_API_URL=https://dear-memoryt.onrender.com/api
```

`VITE_*` variables are exposed to frontend code and must not contain private secrets.

---

# Authentication

The frontend stores the JWT access token in browser `localStorage`.

Authenticated requests use:

```http
Authorization: Bearer <token>
```

When the backend returns `401 Unauthorized`, the frontend clears the token and redirects the user to `/login`.

---

# Image Uploads

Image processing uses Pillow.

Supported image types include:

- JPEG
- PNG
- WebP
- GIF

Uploaded files are stored according to:

```text
UPLOAD_DIR
```

Production deployments should use persistent storage for uploaded media if files must survive service restarts or redeployments.

---

# eSewa

The current integration uses eSewa sandbox.

Sandbox product code:

```text
EPAYTEST
```

Sandbox endpoints:

```text
https://rc-epay.esewa.com.np/api/epay/main/v2/form
https://rc.esewa.com.np/api/epay/transaction/status/
```

Production eSewa credentials and endpoints must be configured separately before accepting real payments.

Never commit eSewa secrets to Git.

---

# Deployment

## Backend

The backend is deployed on Render:

```text
https://dear-memoryt.onrender.com
```

The Render service uses `backend/` as the backend application directory.

Production start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Important production environment variables include:

```text
DATABASE_URL
SECRET_KEY
FRONTEND_URL
CORS_ORIGINS
UPLOAD_DIR
ESEWA_PRODUCT_CODE
ESEWA_SECRET_KEY
ESEWA_PAYMENT_URL
ESEWA_STATUS_URL
ESEWA_SUCCESS_URL
ESEWA_FAILURE_URL
```

---

## Frontend

The frontend will be deployed separately.

Because the frontend is at the repository root, the frontend hosting service should build from the repository root.

Configure:

```text
VITE_API_URL=https://dear-memoryt.onrender.com/api
```

---

# Environment Variables and Secrets

Backend secrets belong in:

```text
backend/.env
```

Examples:

```text
DATABASE_URL
SECRET_KEY
ESEWA_SECRET_KEY
```

These must never be committed.

The frontend only needs the public API URL:

```text
VITE_API_URL
```

Do not place private credentials in frontend environment variables.

---

# Git

The repository ignores local environment files and local databases.

Important ignored files include:

```text
.env
.env.*
*.db
*.sqlite
*.sqlite3
node_modules/
dist/
```

Never commit:

```text
backend/.env
```

or files containing real credentials.

---

# Database Migrations

Create a migration from the backend directory:

```bash
alembic revision --autogenerate -m "describe the change"
```

Always review generated migrations before applying them.

Apply migrations:

```bash
alembic upgrade head
```

Useful commands:

```bash
alembic current
alembic heads
alembic history
```

---

# Development Workflow

```text
1. Make changes locally
        ↓
2. Test frontend
        ↓
3. Test backend
        ↓
4. Test API/database functionality
        ↓
5. Commit changes
        ↓
6. Push to GitHub
        ↓
7. Deploy
        ↓
8. Test production
        ↓
9. Collect client feedback
        ↓
10. Continue development
```

---

# Production Checklist

Before full production use:

- [ ] Configure persistent storage for uploaded photos
- [ ] Replace eSewa sandbox configuration with production configuration
- [ ] Verify CORS for the final frontend domain
- [ ] Verify database backups
- [ ] Use strong production secrets
- [ ] Review authentication and authorization
- [ ] Review file upload validation and limits
- [ ] Configure frontend production environment variables
- [ ] Test public galleries
- [ ] Test photo uploads/downloads
- [ ] Test subscription checkout
- [ ] Test payment callbacks
- [ ] Test database migrations
- [ ] Configure a custom domain if required

---

# Current Status

## Backend

Deployed and running on Render:

```text
https://dear-memoryt.onrender.com
```

## Frontend

The frontend is being prepared for its first deployment for this repository.

It will communicate with:

```text
https://dear-memoryt.onrender.com/api
```

---

# Roadmap

- [x] Authentication
- [x] User registration/login
- [x] JWT authentication
- [x] Studio management
- [x] Event management
- [x] Photo management
- [x] Album management
- [x] Public event galleries
- [x] Studio pages
- [x] Portfolio management
- [x] Studio Brand Kit
- [x] Analytics
- [x] Guestbook
- [x] Lead/CRM API
- [x] Subscription plans
- [x] eSewa sandbox integration
- [x] PostgreSQL production database
- [x] Alembic migrations
- [x] Production backend deployment
- [ ] Production frontend deployment
- [ ] Production eSewa integration
- [ ] Persistent production media storage
- [ ] Custom production domain
- [ ] Client feedback iteration
- [ ] Additional production hardening

---

# License

This project is currently maintained as a client project.

All rights and licensing terms should be determined according to the project's client agreement and deployment requirements.
