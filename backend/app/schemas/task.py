from uuid import UUID
from datetime import datetime, date
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.label import LabelResponse


class TaskCreate(BaseModel):
    """
    POST /api/lists/{list_id}/tasks — request body.
    Frontend: use this when user adds a card to a column.
    `status` defaults to 'todo' — it's a tag, not a column assignment.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Design the login page",
                "description": "Create wireframes and finalize the color scheme.",
                "due_date": "2026-04-15",
                "status": "todo",
                "position": 0
            }
        }
    )

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title, 1–200 characters.",
        examples=["Design the login page"]
    )
    description: str | None = Field(
        None,
        max_length=2000,
        description="Optional detailed description of the task.",
        examples=["Create wireframes and finalize the color scheme."]
    )
    due_date: date | None = Field(
        None,
        description="Due date in ISO format: YYYY-MM-DD.",
        examples=["2026-04-15"]
    )
    status: Literal["todo", "in_progress", "done"] = Field(
        "todo",
        description="Task status tag. One of: 'todo', 'in_progress', 'done'. Defaults to 'todo'.",
        examples=["todo"]
    )
    position: int | None = Field(
        None,
        ge=0,
        description="0-based position within the list. Omit to append at end.",
        examples=[0]
    )


class TaskUpdate(BaseModel):
    """
    PATCH /api/tasks/{id} — request body.
    All fields optional — only send what changed.
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Design the login page (revised)",
                "description": "Updated wireframes after client feedback.",
                "due_date": "2026-04-20",
                "status": "in_progress"
            }
        }
    )

    title: str | None = Field(None, min_length=1, max_length=200, examples=["Design the login page (revised)"])
    description: str | None = Field(None, max_length=2000, examples=["Updated wireframes after client feedback."])
    due_date: date | None = Field(None, examples=["2026-04-20"])
    status: Literal["todo", "in_progress", "done"] | None = Field(None, examples=["in_progress"])


class TaskReorder(BaseModel):
    """
    PATCH /api/tasks/{id}/reorder — request body.
    Frontend (dnd-kit): call this immediately after a drag-drop event.
    - new_list_id: the column the card was dropped into (can be the same list)
    - new_position: 0-based index of where the card landed

    Example drag handler:
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
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "new_list_id": "123e4567-e89b-12d3-a456-426614174000",
                "new_position": 2
            }
        }
    )

    new_list_id: UUID = Field(..., description="UUID of the destination list (column).")
    new_position: int = Field(..., ge=0, description="0-based target position within the destination list.")


class TaskResponse(BaseModel):
    """
    Full task object returned by the API.
    Frontend:
    - labels: array of LabelResponse — render as colored badges on the card
    - due_date: ISO date string or null — highlight red if overdue
    - position: integer — sort cards within a column by this value ascending
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
    labels: list[LabelResponse] = []
    created_at: datetime
    updated_at: datetime
