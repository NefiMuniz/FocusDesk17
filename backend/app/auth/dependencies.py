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
#   [ X ] Create app/routers/auth.py with:
#         POST /api/auth/register  → hash password, insert user, return UserResponse
#         POST /api/auth/login     → verify password, return { access_token, token_type }
#   [ X ] Replace the PLACEHOLDER below with real JWT decoding
#   [ X ] Add app.include_router(auth.router) in main.py (comment already there)
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

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import User
from app.auth.security import SECRET_KEY, ALGORITHM
import uuid

# This scheme tells FastAPI to look for the 'Authorization: Bearer <token>' header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
   # Returns the authenticated User for the current request.

   credentials_exception = HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail= "Could not validate credentials",
      headers={"WWW-Authenticate": "Bearer"},
   )

   try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    email: str = payload.get("sub")

    if email is None:
       raise credentials_exception

   except JWTError:
    raise credentials_exception

   user= db.query(User).filter(User.email == email).first()

   return user
