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
#   from passlib.hash import bcrypt
#
#   Create token:
#     jwt.encode({"sub": str(user.id), "exp": expiry}, settings.SECRET_KEY, settings.ALGORITHM)
#
#   Verify password:
#     bcrypt.verify(plain_password, user.password_hash)
#
#   Hash password:
#     bcrypt.hash(plain_password)
# ============================================================

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
import uuid

# Reads the JWT from: Authorization: Bearer <token>
# tokenUrl is the login endpoint — oAuth creates this in app/routers/auth.py
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Returns the authenticated User for the current request.

    ⚠️ oAuth: Replace the PLACEHOLDER BLOCK with real JWT decoding.

    Real implementation template:
    ─────────────────────────────────────────────────────────────
    from jose import jwt, JWTError
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
    # Returns a fake user so other members can test routes without a real token.
    # To test: pass any non-empty string as Bearer token in Swagger (/docs).
    fake_user = User(
        id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
        email="dev@focusdesk.test",
        name="Dev User",
        password_hash="placeholder",
    )
    return fake_user
    # ── PLACEHOLDER END ──
