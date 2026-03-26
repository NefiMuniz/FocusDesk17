# ============================================================
# oAuth — THIS IS YOUR PRIMARY FILE
# ============================================================
#
# `get_current_user` is a FastAPI dependency used by EVERY
# protected route to identify who is making the request.
#
# HOW IT WORKS (once you implement it):
#   1. Frontend sends:  Authorization: Bearer <jwt_token>
#   2. This function decodes the JWT, extracts user_id from
#      the "sub" claim, queries the DB, returns the User.
#   3. If invalid/expired → raise HTTP 401 automatically.
#
# USAGE BY CRUD MEMBER (already wired in all routers):
#   current_user: User = Depends(get_current_user)
#   → gives you the full User object for that request
#
# FRONTEND CONTRACT — Member 2 needs to follow this:
#   After POST /api/auth/login succeeds:
#     localStorage.setItem('token', data.access_token)
#   Every API request must include:
#     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
#   On logout:
#     localStorage.removeItem('token') → redirect to /login
#   If any API call returns 401:
#     Redirect user to /login (token expired or invalid)
#
# YOUR TASKS — Sprint 2:
#   [ ] Create app/routers/auth.py with:
#         POST /api/auth/register  → hash password, insert user, return UserResponse
#         POST /api/auth/login     → verify password, return { access_token, token_type }
#   [ ] Replace the PLACEHOLDER below with real JWT decoding
#   [ ] Add app.include_router(auth.router) in main.py (comment already there)
#
# JWT IMPLEMENTATION GUIDE:
#   from jose import jwt, JWTError
#   from app.config import settings
#
#   Create token:
#     jwt.encode({"sub": str(user.id), "exp": expiry}, settings.SECRET_KEY, settings.ALGORITHM)
#
#   Verify password:
#     verify_password(plain_password, user.password_hash)
#
#   Hash password:
#     get_password_hash(plain_password)
# ============================================================

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import User
import uuid

# auto_error=False means Swagger won't block requests that have no token at all.
# Any endpoint using Depends(get_current_user) is freely testable without authorization.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# Fixed dev user UUID — used as the owner for all resources created during testing.
DEV_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Returns the authenticated User for the current request.

    ⚠️  oAuth: Replace the PLACEHOLDER BLOCK below with real JWT decoding
        once login is implemented. The template is in the comment above.

    DEV MODE (current behaviour):
        - No token required. All endpoints work freely in Swagger.
        - A fixed dev user (id = 00000000-0000-0000-0000-000000000001) is
          used as the owner for every created resource.
        - To test user-specific data isolation later, just pass a real JWT.

    Real implementation template:
    ─────────────────────────────────────────────────────────────
    from jose import jwt, JWTError
    from fastapi import HTTPException, status
    from app.config import settings

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if user is None:
        raise credentials_exception
    return user
    ─────────────────────────────────────────────────────────────
    """

    # ── PLACEHOLDER START — remove once oAuth implements real JWT ──
    # Returns the fixed dev user so every CRUD can be tested in Swagger
    # without needing to authorize. The dev user is created on first use
    # if it doesn't already exist in the database.
    dev_user = db.query(User).filter(User.id == DEV_USER_ID).first()
    if not dev_user:
        dev_user = User(
            id=DEV_USER_ID,
            email="dev@focusdesk.test",
            name="Dev User",
            password_hash="placeholder",
        )
        db.add(dev_user)
        db.commit()
        db.refresh(dev_user)
    return dev_user
    # ── PLACEHOLDER END ──
