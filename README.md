
# Dear-Memory

A full-stack photographer portfolio & event gallery platform. Photographers can manage events, upload and organize photos, customize their studio's branding, and share beautiful public galleries with their clients.

**Repo:** [github.com/ranju024/Dear-Memory](https://github.com/ranju024/Dear-Memory) — active development on the `backend-feature` branch.

---

## ✨ Features

- **JWT authentication** — register/login with bcrypt-hashed passwords and token-based auth
- **Event management** — create, edit, and organize photography events (weddings, graduations, etc.)
- **Media library** — upload and manage photos per event
- **Albums** — group photos into curated collections
- **Studio Brand Kit** — customize primary/background/accent/text colors, heading & body fonts, and watermark text; applied dynamically across public-facing pages
- **Public galleries** — shareable event gallery pages (`/event/:slug`) and studio profile pages (`/studio/:slug`)
- **Analytics** — track views, visitors, favorites per event
- **Dashboard** — central hub for managing all studio activity
- 🚧 **Leads/CRM** — in progress

---

## 🛠 Tech Stack

**Backend**

- FastAPI (31+ REST endpoints)
- SQLAlchemy ORM
- SQLite
- Alembic (migrations)
- JWT auth via `python-jose`, password hashing via `passlib` (bcrypt)

**Frontend**

- TanStack Start
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components

---

## 📁 Project Structure

```
Dear-Memory/
├── backend/
│   ├── alembic/                 # DB migrations
│   │   └── versions/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/          # auth.py, studio.py, events, photos, albums, etc.
│   │   ├── models/               # SQLAlchemy models (user.py, studio.py, event.py, photo.py...)
│   │   ├── schemas/              # Pydantic schemas (auth.py, lead_studio.py, ...)
│   │   ├── config.py             # loads SECRET_KEY, ALGORITHM, etc. from .env
│   │   └── database.py           # DB session & engine setup
│   ├── uploads/                   # uploaded media (UPLOAD_DIR, relative to backend/)
│   ├── logs/
│   ├── alembic.ini
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── router.tsx, routeTree.gen.ts, server.ts, start.ts, styles.css
        ├── components/
        │   ├── ImageLightbox.tsx
        │   ├── app/AppShell.tsx
        │   ├── site/ (SiteNav.tsx, SiteFooter.tsx)
        │   └── ui/ (shadcn/ui primitives)
        ├── hooks/use-mobile.tsx
        ├── lib/
        │   ├── config.server.ts, utils.ts
        │   ├── api/client.ts       # API client
        │   └── mock/data.ts        # mock data, still used on some pages (e.g. studio.$slug.tsx)
        └── routes/                 # file-based routing
            ├── dashboard.tsx / dashboard.index.tsx
            ├── dashboard.events.$id.tsx / .index.tsx / .new.tsx
            ├── dashboard.albums.$id.tsx / .index.tsx / .new.tsx
            ├── dashboard.media.tsx, dashboard.analytics.tsx
            ├── dashboard.brand.tsx     # Brand Kit settings page
            ├── dashboard.portfolio.tsx, dashboard.customize.tsx, dashboard.builder.tsx
            ├── event.$slug.tsx         # public event gallery
            ├── studio.$slug.tsx        # public studio profile
            ├── login.tsx, register.tsx, index.tsx, pricing.tsx, templates.tsx
            └── __root.tsx
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or pnpm

### Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and adjust values as needed:

```env
# Database Configuration
DATABASE_URL=sqlite:///./dear_memory.db

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads

# API Configuration
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Environment
ENV=development
```

Run migrations, then start the server:

```bash
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`.
Interactive API docs: `http://localhost:8000/docs`

> All routes are mounted under an `/api` prefix (e.g. `/api/studio/me`, `/api/auth/login`) — keep this in mind when configuring the frontend's API base URL.

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:8080` (adjust if your dev server assigns a different port).

---

## 🔑 Authentication

Auth lives in `app/api/routes/auth.py`. Flow:

1. **`POST /api/auth/register`** — creates a user with a bcrypt-hashed password
2. **`POST /api/auth/login`** — verifies credentials, returns a JWT (`access_token`) signed with `SECRET_KEY`/`ALGORITHM` from `.env`, with a `sub` claim holding the user's id
3. **`GET /api/auth/me`** and all protected routes — expect the token and decode it via `get_current_user()`

> **Current convention:** the token is passed as a `?token=` query parameter (e.g. `PUT /api/studio/me?token=...`) rather than an `Authorization: Bearer` header, though `get_current_user()` will also strip a `Bearer ` prefix if present. This works, but isn't the typical FastAPI pattern (usually `OAuth2PasswordBearer` + header) — worth revisiting before this goes to production, since query-param tokens can end up logged in server/proxy access logs.

---

## 🎨 Studio Brand Kit

Each studio can customize, via the **Brand Kit** page (`dashboard.brand.tsx`):

| Field                | Description                               |
| -------------------- | ----------------------------------------- |
| `primary_color`    | Main brand accent color (buttons, labels) |
| `background_color` | Page background                           |
| `accent_color`     | Secondary accent                          |
| `text_color`       | Body text color                           |
| `heading_font`     | Font for headings                         |
| `body_font`        | Font for body text                        |
| `watermark_text`   | Text watermark applied to photos          |

Saved via `PUT /api/studio/me`, and applied on public pages as CSS custom properties (`--brand-primary`, `--brand-text`, etc.) set on the page's root element — currently wired into `event.$slug.tsx`; `studio.$slug.tsx` still runs on mock data and needs the same treatment.

---

## 🧭 Roadmap

- [X] Core auth, events, albums, media library
- [X] Studio Brand Kit (save + apply to `event.$slug.tsx`)
- [ ] Wire real data + brand colors into `studio.$slug.tsx` (currently mock data)
- [ ] Leads/CRM page
- [ ] Move token auth from query param to `Authorization: Bearer` header
- [ ] Move frontend off hardcoded `localhost:8000` API URLs to env-based config

---

## 🤝 Contributing

This is a collaborative project. Active work happens on the `backend-feature` branch — branch off of it rather than `main` unless told otherwise, and open a PR for review before merging.
