from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas.user import UserCreate, UserResponse
from app.auth.security import verify_password, create_access_token, get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Login route
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
  user = db.query(User).filter(User.email == form_data.username).first()

  if not user or not verify_password(form_data.password, user.password_hash):
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Incorrect email or password",
      headers={"WWW-Authenticate": "Bearer"},
    )

  access_token = create_access_token(
    data={"sub": user.email}
  )

  return {"access_token": access_token, "token_type": "bearer"}


# Register route
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