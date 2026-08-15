import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./dear_memory.db"  # Default to SQLite for development
)

# Environment
ENV = os.getenv("ENV", "development")


# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# File upload
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

# API
API_URL = os.getenv("API_URL", "http://localhost:8000").rstrip("/")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080").rstrip("/")

# eSewa sandbox
ESEWA_PAYMENT_URL = os.getenv(
    "ESEWA_PAYMENT_URL",
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
)

ESEWA_STATUS_URL = os.getenv(
    "ESEWA_STATUS_URL",
    "https://rc-epay.esewa.com.np/api/epay/transaction/status/",
)

ESEWA_PRODUCT_CODE = os.getenv(
    "ESEWA_PRODUCT_CODE",
    "EPAYTEST",
)

ESEWA_SECRET_KEY = os.getenv(
    "ESEWA_SECRET_KEY",
    "8gBm/:&EnhH.1/q",
)

ESEWA_SUCCESS_URL = os.getenv(
    "ESEWA_SUCCESS_URL",
    f"{API_URL}/api/subscription/esewa/success",
)

ESEWA_FAILURE_URL = os.getenv(
    "ESEWA_FAILURE_URL",
    f"{API_URL}/api/subscription/esewa/failure",
)

