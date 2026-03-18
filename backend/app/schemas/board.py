from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class BoardCreate(BaseModel):
    """
    POST /api/boards/ request body.
    Frontend: send this from the "New Board" form.
    Do NOT send user_id — backend injects it from the JWT token automatically.
    """
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None


class BoardUpdate(BaseModel):
    """
    PATCH /api/boards/{id} request body.
    All fields optional — only send what changed.
    """
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None


class BoardResponse(BaseModel):
    """
    Board object returned by the API.
    Frontend: this is the shape of a board in your TanStack Query cache.
    Use `id` as the React key when mapping boards to UI cards.
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime
