from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class BoardCreate(BaseModel):
    """
    POST /api/boards/ — request body.
    Frontend: send this from the "New Board" form.
    Do NOT send user_id — backend injects it from the JWT token automatically.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "My Project Board",
                "description": "Tracks all tasks for the spring semester project."
            }
        }
    )

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Board name, 1–100 characters.",
        examples=["My Project Board"]
    )
    description: str | None = Field(
        None,
        max_length=500,
        description="Optional description for this board.",
        examples=["Tracks all tasks for the spring semester project."]
    )


class BoardUpdate(BaseModel):
    """
    PATCH /api/boards/{id} — request body.
    All fields optional — only send what changed.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Renamed Board",
                "description": "Updated description."
            }
        }
    )

    name: str | None = Field(None, min_length=1, max_length=100, examples=["Renamed Board"])
    description: str | None = Field(None, max_length=500, examples=["Updated description."])


class BoardResponse(BaseModel):
    """
    Board object returned by the API.
    Frontend: use `id` as the React key when mapping boards to UI cards.
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime
