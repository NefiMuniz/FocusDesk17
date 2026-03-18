from uuid import UUID
from datetime import datetime, date
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.label import LabelResponse


class TaskCreate(BaseModel):
    """
    POST /api/lists/{list_id}/tasks request body.
    Frontend: use this when user adds a card to a column.
    `status` is optional — defaults to 'todo'. Valid: 'todo' | 'in_progress' | 'done'.
    Remember: status does NOT determine which list the task is in — it's just a tag that we can use to filter later.
    """
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    due_date: date | None = None  # ISO format: "2026-03-20"
    status: Literal["todo", "in_progress", "done"] = "todo"
    position: int | None = None  # omit to append at the end of the list


class TaskUpdate(BaseModel):
    """
    PATCH /api/tasks/{id} request body.
    All fields optional — only send what changed.
    """
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    due_date: date | None = None
    status: Literal["todo", "in_progress", "done"] | None = None


class TaskReorder(BaseModel):
    """
    PATCH /api/tasks/{id}/reorder request body.
    Frontend (dnd-kit): call this endpoint immediately after a drag-drop event.
    - new_list_id: the column the card was dropped into (can be the same list)
    - new_position: 0-based index of where the card landed
    Example:
        onDragEnd: (result) => {
            fetch(`/api/tasks/${taskId}/reorder`, {
                method: 'PATCH',
                body: JSON.stringify({
                    new_list_id: destinationListId,
                    new_position: destinationIndex
                })
            })
        }
    """
    new_list_id: UUID
    new_position: int = Field(..., ge=0)


class TaskResponse(BaseModel):
    """
    Full task object returned by the API.
    Frontend: this is the shape of a task card.
    - labels: array of LabelResponse — render as colored badges on the card
    - due_date: ISO date string or null — highlight red if overdue
    - position: integer — sort cards within a column by this value (ascending)
    - status: 'todo' | 'in_progress' | 'done' — optional visual indicator
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    list_id: UUID
    title: str
    description: str | None
    due_date: date | None
    position: int
    status: str
    labels: list[LabelResponse] = []  # empty list if no labels assigned
    created_at: datetime
    updated_at: datetime
