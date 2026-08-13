from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from ...database import get_db
from ...config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from ...schemas.auth import LoginRequest, TokenResponse, UserCreate, UserResponse
from ...models.user import User
import logging
import re
from contextvars import ContextVar

logger = logging.getLogger(__name__)

# The middleware in app.main puts the Bearer token here. Query-string tokens are
# still accepted temporarily for backwards compatibility with older clients.
_request_token: ContextVar[str | None] = ContextVar("request_token", default=None)


def set_request_token(token: str | None) -> None:
    _request_token.set(token)

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str | None = None, db: Session = Depends(get_db)) -> User:
    """Resolve the authenticated user.

    Prefer the standard ``Authorization: Bearer <token>`` header.  ``?token=``
    remains supported temporarily so existing deployments do not break while
    the frontend is migrated.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    raw_token = token or _request_token.get()
    if not raw_token:
        raise credentials_exception

    if raw_token.lower().startswith("bearer "):
        raw_token = raw_token[7:].strip()

    try:
        payload = jwt.decode(raw_token, SECRET_KEY, algorithms=[ALGORITHM])
        subject = payload.get("sub")
        if subject is None:
            raise credentials_exception
        user_id = int(subject)
    except (JWTError, ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Every account gets a usable studio immediately. This removes the
    # "create your studio" dead-end after registration and makes onboarding
    # deterministic for both the dashboard and public studio URL.
    from ...models.studio import Studio
    base_slug = re.sub(r"[^a-z0-9]+", "-", (user_data.username or "studio").lower()).strip("-") or "studio"
    slug = base_slug
    suffix = 2
    while db.query(Studio).filter(Studio.slug == slug).first():
        slug = f"{base_slug}-{suffix}"
        suffix += 1
    db.add(Studio(
        user_id=new_user.id,
        name=user_data.full_name or user_data.username,
        slug=slug,
        tagline="Photography worth remembering.",
    ))
    db.commit()

    logger.info(f"New user registered: {new_user.email}")
    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is disabled")
    
    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(token: str | None = None, db: Session = Depends(get_db)):
    """Get current user information"""
    user = get_current_user(token, db)
    return user

# @router.get("/me", response_model=UserResponse)
# async def get_current_user_info(
#     authorization: str = Header(...),
#     db: Session = Depends(get_db)
# ):
#     """Get current user information"""
#     print(f"DEBUG: Authorization header: {authorization}")
    
#     if not authorization:
#         raise HTTPException(status_code=401, detail="No authorization header")
    
#     if not authorization.startswith("Bearer "):
#         raise HTTPException(status_code=401, detail="Invalid format - must start with 'Bearer '")
    
#     token = authorization.replace("Bearer ", "")
#     print(f"DEBUG: Extracted token: {token[:50]}...")
    
#     try:
#         user = get_current_user(token, db)
#         print(f"DEBUG: User found: {user.email}")
#         return user
#     except Exception as e:
#         print(f"DEBUG: Error validating token: {str(e)}")
#         raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")
    