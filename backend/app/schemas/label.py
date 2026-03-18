from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class LabelCreate(BaseModel):
    """
    POST /api/labels/ request body.
    Frontend: use this in the "Manage Labels" form.
    color: CSS-compatible hex string, e.g. '#FF5733'.
    """
    name: str = Field(..., min_length=1, max_length=50)
    color: str | None = None


class LabelUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50)
    color: str | None = None


class LabelResponse(BaseModel):
    """
    Label object returned by the API.
    Frontend: render as a colored badge/chip on task cards.
    Use `color` as the badge's CSS background-color value.
    If `color` is null, use a default gray.
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID | None
    name: str
    color: str | None  # hex string e.g. '#FF5733' — use for badge background-color
    created_at: datetime
