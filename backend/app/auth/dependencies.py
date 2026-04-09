# ============================================================
# get_current_user — FastAPI dependency used by every protected route.
# get_current_user — FastAPI dependency used by every protected route.
#
# HOW IT WORKS:
# HOW IT WORKS:
#   1. Frontend sends:  Authorization: Bearer <jwt_token>
#   2. This function decodes the JWT, extracts user_id from "sub",
#      queries the DB, and returns the full User object.
#   3. If token is missing, invalid, or expired → HTTP 401 automatically.
#   2. This function decodes the JWT, extracts user_id from "sub",
#      queries the DB, and returns the full User object.
#   3. If token is missing, invalid, or expired → HTTP 401 automatically.
#
# FRONTEND CONTRACT:
# FRONTEND CONTRACT:
#   After POST /api/auth/login succeeds:
#     localStorage.setItem('token', data.access_token)
#   Every protected API request must include:
#   Every protected API request must include:
#     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
#   On logout:
#     localStorage.removeItem('token') → redirect to /login
#   If any API call returns 401:
#     Redirect user to /login (token expired or invalid)
# ============================================================

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional
from typing import Optional
from app.database import get_db
from app.models import User
from app.auth.security import SECRET_KEY, ALGORITHM
from app.auth.security import SECRET_KEY, ALGORITHM
import uuid

# This scheme tells FastAPI to look for the 'Authorization: Bearer <token>' header.
# This scheme tells FastAPI to look for the 'Authorization: Bearer <token>' header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
   # Returns the authenticated User for the current request.
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
