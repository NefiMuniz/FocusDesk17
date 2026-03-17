from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    """
    POST /api/auth/register request body.
    oAuth: receive this, hash `password`, store `password_hash` in DB.
    Frontend: this is the shape of your register form payload.
    """
    email: str
    name: str | None = None
    password: str  # plain text — Member 3 hashes before saving, never store as-is


class UserResponse(BaseModel):
    """
    Safe user object returned after login or register.
    password_hash is NEVER included here.
    Frontend: this is the shape of the user you'll store in your auth context.
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    name: str | None
    created_at: datetime
