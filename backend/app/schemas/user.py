from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from typing import Optional
import re

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = Field(
        None,
        pattern=r"^[a-zA-Z\s]*$",
        description="Only letters and spaces allowed."
    )


class UserCreate(UserBase):
    """
    POST /api/auth/register request body.
    oAuth: receive this, hash `password`, store `password_hash` in DB.
    Frontend: this is the shape of your register form payload.
    """
    password: str = Field(
        ...,
        min_length=8
    )

    @field_validator('email')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()

    @field_validator('password')
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if " " in v:
            raise ValueError("Password cannot contain spaces.")

        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter.")

        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one number.")

        special_chars = r"[@$!%*?&]"
        if not re.search(special_chars, v):
            raise ValueError("Password must contain at least one special character (@$!%*?&).")

        return v

class UserResponse(BaseModel):
    """
    Safe user object returned after login or register.
    password_hash is NEVER included here.
    Frontend: this is the shape of the user you'll store in your auth context.
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
