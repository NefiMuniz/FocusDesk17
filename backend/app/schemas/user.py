from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from typing import Optional
import re


class UserBase(BaseModel):
    email: EmailStr = Field(
        ...,
        description="Valid email address. Will be lowercased automatically.",
        examples=["john.doe@example.com"]
    )
    name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=80,
        pattern=r"^[a-zA-Z\s]*$",
        description="Full name — letters and spaces only, 2–80 characters.",
        examples=["John Doe"]
    )


class UserCreate(UserBase):
    """
    POST /api/auth/register — request body.

    Password rules:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one number
    - At least one special character: @$!%*?&
    - No spaces
    - Maximum 72 characters (bcrypt limit)
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "john.doe@example.com",
                "name": "John Doe",
                "password": "Secret@123"
            }
        }
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=72,
        description="8–72 chars, must include uppercase, number, and special char (@$!%*?&). No spaces.",
        examples=["Secret@123"]
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
        if not re.search(r"[@$!%*?&]", v):
            raise ValueError("Password must contain at least one special character (@$!%*?&).")
        return v


class UserResponse(BaseModel):
    """
    Safe user object returned after register.
    password_hash is NEVER included here.
    Frontend: store this in your auth context after successful register/login.
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    name: Optional[str]
    created_at: datetime
    updated_at: datetime
