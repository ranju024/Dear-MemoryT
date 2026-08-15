# DearMemory Backend

FastAPI backend for the DearMemory photography platform.

The complete project documentation is available in the [root README](../README.md).

## Backend Development

### Requirements

- Python 3.10+
- PostgreSQL
- pip
- Python virtual environment

### Setup

From the `backend/` directory:

```bash
python -m venv venv
```

Windows:

```powershell
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

Create a local `.env` file using `.env.example` and configure the required environment variables.

> Never commit `.env` or other files containing secrets, database credentials, JWT secrets, or payment-provider credentials.

## Database

The project uses PostgreSQL with SQLAlchemy and psycopg 3.

Run database migrations:

```bash
alembic upgrade head
```

Check the current migration:

```bash
alembic current
```

Check available migration heads:

```bash
alembic heads
```

## Run the API

Start the development server:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:

```text
http://localhost:8000
```

Interactive Swagger documentation:

```text
http://localhost:8000/docs
```

Health check:

```text
http://localhost:8000/health
```

## Production

The backend is deployed on Render.

Production API:

```text
https://dear-memoryt.onrender.com
```

Production health check:

```text
https://dear-memoryt.onrender.com/health
```

Production API documentation:

```text
https://dear-memoryt.onrender.com/docs
```

Production environment variables should be configured through the hosting platform and should not be committed to Git.

## Project Structure

```text
backend/
├── alembic/
│   └── versions/              # Database migration files
├── app/
│   ├── api/
│   │   └── routes/            # API route modules
│   ├── models/                # SQLAlchemy ORM models
│   ├── schemas/               # Pydantic schemas
│   ├── services/              # Business logic and subscription services
│   ├── config.py              # Environment/configuration
│   ├── database.py            # SQLAlchemy engine and sessions
│   └── main.py                # FastAPI application
├── uploads/                   # Local uploaded media directory
├── alembic.ini                # Alembic configuration
├── requirements.txt           # Python dependencies
├── .env.example               # Environment variable template
└── README.md
```

## Authentication

The backend uses JWT-based authentication.

Authentication-related functionality is implemented under:

```text
app/api/routes/auth.py
```

The JWT signing secret is supplied through the `SECRET_KEY` environment variable.

Do not place production secrets directly in source code.

## Subscriptions and Payments

The backend includes subscription plan management and eSewa sandbox payment processing.

Available plans:

- **Starter** — free plan
- **Creative** — paid plan
- **Agency** — paid plan

Subscription/payment functionality is implemented through:

```text
app/api/routes/subscription.py
app/services/subscription.py
app/models/payment.py
```

Database changes related to payments are managed through Alembic migrations.

The eSewa sandbox configuration is provided through environment variables. Payment credentials and secrets must never be committed to Git.

## File Uploads

Uploaded media is served from the configured upload directory.

The upload directory is controlled through:

```text
UPLOAD_DIR
```

The maximum upload size is controlled through:

```text
MAX_UPLOAD_SIZE
```

The production deployment should use an appropriate persistent storage strategy for uploaded media rather than relying on ephemeral local filesystem storage.

## API Routes

All API routes use the `/api` prefix.

Examples:

```text
/api/auth
/api/events
/api/photos
/api/albums
/api/analytics
/api/studio
/api/guestbook
/api/portfolio
/api/subscription
```

For the complete and current API documentation, use the Swagger UI at:

```text
/docs
```

## Development Workflow

When database models are changed:

1. Update the SQLAlchemy model.
2. Generate an Alembic migration when appropriate:

```bash
alembic revision --autogenerate -m "describe the change"
```

3. Review the generated migration.
4. Apply it locally:

```bash
alembic upgrade head
```

5. Commit the migration together with the model changes.

Do not manually modify production database tables when the change should be represented by an Alembic migration.

## Deployment

The backend is deployed from the repository through Render.

A typical deployment uses:

```bash
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Production configuration, including the PostgreSQL connection string, JWT secret, CORS origins, frontend URL, upload configuration, and eSewa configuration, should be supplied through Render environment variables.

## Related Documentation

For the full project documentation, including:

- frontend setup
- backend architecture
- features
- subscription plans
- payment flow
- deployment
- project structure
- roadmap

see the root project README:

```text
../README.md
```
