# DearMemory Backend

FastAPI backend for DearMemory photo gallery platform.

## Quick Start

### 1. Setup Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example .env
cp .env.example .env

# Edit .env with your settings (change SECRET_KEY at minimum)
```

### 4. Run Development Server

```bash
uvicorn app.main:app --reload
```

Server runs on `http://localhost:8000`
API docs: `http://localhost:8000/docs` (Swagger)

---

## Project Structure

```
backend/
├── app/
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── event.py
│   │   ├── photo.py
│   │   ├── album.py
│   │   ├── lead.py
│   │   └── studio.py
│   ├── schemas/             # Pydantic request/response models
│   │   ├── auth.py
│   │   ├── event.py
│   │   ├── photo_album.py
│   │   └── lead_studio.py
│   ├── api/routes/          # API endpoints
│   │   ├── auth.py
│   │   ├── events.py
│   │   ├── photos.py
│   │   ├── albums.py
│   │   ├── leads.py
│   │   ├── analytics.py
│   │   └── studio.py
│   ├── main.py              # FastAPI app initialization
│   ├── database.py          # Database setup
│   └── config.py            # Configuration
├── requirements.txt         # Dependencies
├── .env.example            # Environment template
└── README.md               # This file
```

---

## API Endpoints

### Authentication

* `POST /api/auth/register` - Register new user
* `POST /api/auth/login` - Login (returns JWT token)
* `GET /api/auth/me` - Get current user info

### Events

* `POST /api/events/` - Create event
* `GET /api/events/` - List user's events
* `GET /api/events/{event_id}` - Get event details
* `GET /api/events/slug/{slug}` - Get event by slug
* `PUT /api/events/{event_id}` - Update event
* `DELETE /api/events/{event_id}` - Delete event
* `POST /api/events/{event_id}/publish` - Publish event

### Photos

* `POST /api/photos/{event_id}/upload` - Upload photo
* `GET /api/photos/{event_id}` - List event photos
* `GET /api/photos/photo/{photo_id}` - Get photo details
* `PUT /api/photos/photo/{photo_id}` - Update photo metadata
* `DELETE /api/photos/photo/{photo_id}` - Delete photo
* `POST /api/photos/photo/{photo_id}/favorite` - Add to favorites
* `POST /api/photos/photo/{photo_id}/download` - Track download

### Albums

* `POST /api/albums/{event_id}` - Create album
* `GET /api/albums/{event_id}` - List event albums
* `GET /api/albums/album/{album_id}` - Get album with photos
* `PUT /api/albums/album/{album_id}` - Update album
* `DELETE /api/albums/album/{album_id}` - Delete album
* `POST /api/albums/album/{album_id}/photos/{photo_id}` - Add photo to album
* `DELETE /api/albums/album/{album_id}/photos/{photo_id}` - Remove photo from album

### Leads

* `POST /api/leads/` - Create lead
* `GET /api/leads/` - List user's leads
* `GET /api/leads/{lead_id}` - Get lead details
* `PUT /api/leads/{lead_id}` - Update lead
* `DELETE /api/leads/{lead_id}` - Delete lead
* `POST /api/leads/{lead_id}/status/{status}` - Update lead status

### Analytics

* `GET /api/analytics/dashboard/{user_id}` - Dashboard stats
* `GET /api/analytics/events/{user_id}/traffic` - Event traffic
* `GET /api/analytics/event/{event_id}/performance` - Event performance
* `GET /api/analytics/leads/{user_id}/funnel` - Sales funnel
* `GET /api/analytics/top-photos/{user_id}` - Top photos

### Studio

* `POST /api/studio/` - Create studio profile
* `GET /api/studio/me` - Get my studio
* `GET /api/studio/slug/{slug}` - Get studio by slug (public)
* `GET /api/studio/{user_id}` - Get user's studio (public)
* `PUT /api/studio/me` - Update my studio
* `POST /api/studio/me/stats/update` - Recalculate stats

---

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer {token}
```

To get token:

1. Register: `POST /api/auth/register` with email, username, password
2. Login: `POST /api/auth/login` with email and password
3. Use returned `access_token` in subsequent requests

---

## Database

Default uses SQLite for development. To use PostgreSQL:

```bash
# Install PostgreSQL driver
pip install psycopg2-binary

# Update .env:
DATABASE_URL=postgresql://user:password@localhost:5432/dear_memory

# Create database first
psql -U postgres -c "CREATE DATABASE dear_memory;"
```

---

## File Uploads

Photos are saved to `./uploads` directory. Configure in `.env`:

```
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760  # 10MB
```

Supported formats: JPEG, PNG, WebP, GIF

---

## Deployment

### Using Gunicorn (Production)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

### Environment Variables for Production

```
DATABASE_URL=postgresql://user:password@prodhost/dear_memory
SECRET_KEY=your-production-secret-key-generate-new-one
ENV=production
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

---

## Development

### Create Initial User (SQLite)

```python
from app.database import SessionLocal
from app.models.user import User
from app.api.routes.auth import hash_password

db = SessionLocal()
user = User(
    email="test@example.com",
    username="testuser",
    hashed_password=hash_password("password123"),
    full_name="Test User"
)
db.add(user)
db.commit()
print(f"User created: {user.id}")
```

### Run Tests

```bash
pip install pytest pytest-asyncio
pytest
```

---

## Common Issues

**CORS errors?**

* Check `app.main` CORS settings
* Add your frontend URL to `allow_origins`

**File upload fails?**

* Create `uploads/` directory
* Check file permissions
* Ensure file size < MAX_UPLOAD_SIZE

**Database locked?**

* SQLite with concurrent writes can lock
* Use PostgreSQL for production

---

## Next Steps

1. Run frontend concurrently (separate terminal): `npm run dev`
2. Test endpoints via Swagger: `http://localhost:8000/docs`
3. Connect frontend to backend API
4. Deploy to production

---

## Support

For issues, check the frontend repo or create an issue in GitHub.
