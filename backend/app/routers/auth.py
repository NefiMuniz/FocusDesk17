from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas.user import UserCreate, UserResponse
from app.auth.security import get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
  query = select(User).where(User.email == user_in.email)
  existing_user = db.execute(query).scalar_one_or_none()

  if existing_user:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="A user with this email already exists."
    )

  hashed_password = get_password_hash(user_in.password)

  new_user = User(
    email=user_in.email,
    password_hash=hashed_password,
    name=user_in.name
  )

  db.add(new_user)
  db.commit()
  db.refresh(new_user)

  return new_user