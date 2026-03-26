from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ListCreate(BaseModel):
    """
    POST /api/boards/{board_id}/lists — request body.
    Frontend: use this when the user adds a new column to a board.
    Omit `position` to let the backend assign the next available slot.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "To Do",
                "position": 0
            }
        }
    )

    name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Column name, 1–50 characters.",
        examples=["To Do"]
    )
    position: int | None = Field(
        None,
        ge=0,
        description="0-based position of this column. Omit to append at the end.",
        examples=[0]
    )


class ListUpdate(BaseModel):
    """
    PATCH /api/lists/{id} — request body.
    Use to rename a column or update its position.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "In Review",
                "position": 2
            }
        }
    )

    name: str | None = Field(None, min_length=1, max_length=50, examples=["In Review"])
    position: int | None = Field(None, ge=0, examples=[2])


class ListResponse(BaseModel):
    """
    List (column) object returned by the API.
    Frontend: sort rendered columns by `position` ascending.
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    board_id: UUID
    name: str
    position: int
    created_at: datetime
    updated_at: datetime
