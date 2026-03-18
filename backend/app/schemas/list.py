from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ListCreate(BaseModel):
    """
    POST /api/boards/{board_id}/lists request body.
    Frontend: use this when the user adds a new column to a board.
    Omit `position` to let the backend assign the next available slot.
    """
    name: str = Field(..., min_length=1, max_length=50)
    position: int | None = None


class ListUpdate(BaseModel):
    """
    PATCH /api/lists/{id} request body.
    Use to rename a column or update its position.
    """
    name: str | None = Field(None, min_length=1, max_length=50)
    position: int | None = None


class ListResponse(BaseModel):
    """
    List (column) object returned by the API.
    Frontend: sort your rendered columns by `position` (ascending) to maintain order.
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    board_id: UUID
    name: str
    position: int  # sort columns by this value left-to-right
    created_at: datetime
    updated_at: datetime
