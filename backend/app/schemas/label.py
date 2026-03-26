from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class LabelCreate(BaseModel):
    """
    POST /api/labels/ — request body.
    Frontend: use this in the "Manage Labels" form.
    color: CSS hex string, must start with '#' followed by 6 hex digits.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Bug",
                "color": "#FF5733"
            }
        }
    )

    name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Label name, 1–50 characters.",
        examples=["Bug"]
    )
    color: str | None = Field(
        None,
        pattern=r"^#[0-9A-Fa-f]{6}$",
        description="CSS hex color, e.g. '#FF5733'. Must be exactly 7 characters (#RRGGBB).",
        examples=["#FF5733"]
    )


class LabelUpdate(BaseModel):
    """
    PATCH /api/labels/{id} — request body.
    All fields optional.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Enhancement",
                "color": "#3498DB"
            }
        }
    )

    name: str | None = Field(None, min_length=1, max_length=50, examples=["Enhancement"])
    color: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$", examples=["#3498DB"])


class LabelResponse(BaseModel):
    """
    Label object returned by the API.
    Frontend: render as a colored badge on task cards.
    Use `color` as the badge's CSS background-color. Default to gray if null.
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID | None
    name: str
    color: str | None
    created_at: datetime
