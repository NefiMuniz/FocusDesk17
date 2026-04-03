from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate, LoginResponse
from app.auth.security import verify_password, create_access_token, get_password_hash
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Login route
@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Log in and receive a JWT access token",
    responses={
        401: {"description": "Incorrect email or password"},
    },
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Authenticates a user and returns a JWT access token.
    Uses OAuth2 form fields — the `username` field must contain the email address.

    Frontend — Login form submit button:

  access_token = create_access_token(
    data={"sub": str(user.id)}
  )

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: formData,   // ← send as form-data, NOT JSON
        });

        200 → { access_token, token_type }
              → localStorage.setItem('token', data.access_token)
              → redirect to /dashboard
        401 → "Incorrect email or password" → show inline error
    """
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


# Register route
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    responses={
        400: {"description": "Email already registered"},
        422: {"description": "Validation error — see detail for per-field messages"},
    },
)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Creates a new user account. Returns the created user (no password).

    Frontend — Register form submit button:

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.email,
                name: formData.name,
                password: formData.password,
            }),
        });

        201 → UserResponse → redirect to /login
        400 → "A user with this email already exists." → show inline error
        422 → validation failed → res.detail[0].message has the per-field message
    """
    query = select(User).where(User.email == user_in.email)
    existing_user = db.execute(query).scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    hashed_password = get_password_hash(user_in.password)

    new_user = User(
        email=user_in.email,
        password_hash=hashed_password,
        name=user_in.name,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Get current user
@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the currently authenticated user",
    responses={
        401: {"description": "Missing or invalid token"},
    },
)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the profile of the currently logged-in user.
    Call this on app startup to restore session state.

    Frontend — check session on app load:

        const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        200 → UserResponse → hydrate auth context (store user in state)
        401 → token expired or missing → redirect to /login
    """
    return current_user


# Update current user
@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update the authenticated user's name or email",
    responses={
        400: {"description": "Email already taken by another account"},
        401: {"description": "Missing or invalid token"},
        422: {"description": "Validation error"},
    },
)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates the authenticated user's name and/or email.
    Only send the fields you want to change — everything else stays the same.

    Frontend — Profile settings save button:

        const res = await fetch('/api/auth/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ name: 'New Name' }),  // only changed fields
        });

        200 → updated UserResponse → refresh auth context
        400 → email already taken → show inline error
        401 → not authenticated
        422 → validation error
    """
    if payload.email and payload.email != current_user.email:
        taken = db.execute(
            select(User).where(
                User.email == payload.email,
                User.id != current_user.id,
            )
        ).scalar_one_or_none()
        if taken:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already taken by another account.",
            )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


# Logout
@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Log out the current user",
    responses={
        401: {"description": "Missing or invalid token"},
    },
)
def logout(current_user: User = Depends(get_current_user)):
    """
    Confirms the token is valid and signals the client to discard it.
    JWTs are stateless — the actual invalidation happens on the frontend
    by removing the token from localStorage.

    Frontend — Logout button:

        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        Always clear the token regardless of the response
        localStorage.removeItem('token');
        redirect to /login;
    """
    # Stateless logout: no server-side action needed.
    # The 204 response signals the frontend to clear its token.
    return