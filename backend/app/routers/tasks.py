# ============================================================
# (CRUD) — SPRINT 2 + SPRINT 3: Implement all endpoints here
# ============================================================
# ENDPOINTS TO BUILD:
#   GET    /api/lists/{list_id}/tasks/     → all tasks in a column, sorted by position
#   POST   /api/lists/{list_id}/tasks/     → create a task inside a column
#   GET    /api/tasks/{id}                 → get one task with labels
#   PATCH  /api/tasks/{id}                 → edit title, description, due_date, status
#   PATCH  /api/tasks/{id}/reorder         → move task to new column/position (Sprint 3)
#   POST   /api/tasks/{id}/labels/{label_id} → attach a label to a task
#   DELETE /api/tasks/{id}/labels/{label_id} → detach a label from a task
#   DELETE /api/tasks/{id}                 → delete a task
#
# REORDER LOGIC — Sprint 3 (critical for dnd-kit):
#   Called after every drag-drop event on the frontend.
#   1. If new_list_id != current list_id: move task to new list
#   2. In the destination list, shift all tasks at >= new_position up by 1
#   3. Set the moved task's list_id and position to the new values
#   4. Re-index the source list to close the gap (optional but keeps positions clean)
#
# SECURITY: Traverse list → board to confirm board.user_id == current_user.id
#
# Frontend — API contract:
#   GET /api/lists/{listId}/tasks/ → array of TaskResponse sorted by `position`
#   Render task cards in the order they arrive — already sorted by backend.
#   TaskResponse.labels → array of { id, name, color } — render as colored badges.
#   TaskResponse.due_date → "YYYY-MM-DD" string — highlight red if past today.
#
# dnd-kit contract — PATCH /api/tasks/{id}/reorder:
#   onDragEnd callback should call:
#     PATCH /api/tasks/{activeTaskId}/reorder
#     Body: { new_list_id: destinationListId, new_position: destinationIndex }
#   Then: invalidateQueries for both source and destination list keys.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User, Board, TaskList, Task, Label
from app.schemas.task import TaskCreate, TaskUpdate, TaskReorder, TaskResponse

router = APIRouter(tags=["Tasks"])


@router.get("/api/lists/{list_id}/tasks/", response_model=list[TaskResponse])
def get_tasks(
    list_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all tasks in a column, sorted by position (top to bottom).
    Frontend: fetch when rendering a list column.
        queryKey: ['tasks', listId]
        Render cards in the order they arrive — already sorted.
    """
    # Sprint 2:
    #   verify_list_owner(db, list_id, current_user.id)
    #   return db.query(Task).filter(Task.list_id == list_id)
    #            .order_by(Task.position).all()
    return []


@router.post(
    "/api/lists/{list_id}/tasks/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    list_id: UUID,
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a task inside a column.
    Frontend: call from the "+ Add Task" button inside a column.
        After success: invalidateQueries({ queryKey: ['tasks', listId] })
    """
    # Sprint 2:
    #   verify_list_owner(db, list_id, current_user.id)
    #   max_pos = db.query(func.max(Task.position))
    #               .filter(Task.list_id == list_id).scalar() or -1
    #   position = payload.position if payload.position is not None else max_pos + 1
    #   new_task = Task(**payload.model_dump(exclude={"position"}),
    #                   list_id=list_id, position=position)
    #   db.add(new_task); db.commit(); db.refresh(new_task); return new_task
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.get("/api/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns a single task with its labels.
    Frontend: call when user clicks a task card to open the detail modal.
        queryKey: ['tasks', taskId]
        Response includes `labels` array — render each as a colored badge.
    """
    # Sprint 2:
    #   task = get_task_or_404(db, task_id)
    #   verify_task_owner(db, task, current_user.id)
    #   return task
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.patch("/api/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Edits task fields (title, description, due_date, status).
    Does NOT move the task between lists — use /reorder for that.
    Frontend: call from the task detail modal's save button.
        After success: invalidateQueries({ queryKey: ['tasks', taskId] })
                    + invalidateQueries({ queryKey: ['tasks', listId] })
    """
    # Sprint 2:
    #   task = get_task_or_404(db, task_id)
    #   verify_task_owner(db, task, current_user.id)
    #   for field, value in payload.model_dump(exclude_unset=True).items():
    #       setattr(task, field, value)
    #   db.commit(); db.refresh(task); return task
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.patch("/api/tasks/{task_id}/reorder", response_model=TaskResponse)
def reorder_task(
    task_id: UUID,
    payload: TaskReorder,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Moves a task to a new column and/or position after a drag-drop event.
    Sprint 3 implementation.
    Frontend (dnd-kit): call this in your onDragEnd handler every time a card is dropped.
        Payload: { new_list_id: string (UUID), new_position: number }
        After success:
            invalidateQueries({ queryKey: ['tasks', sourceListId] })
            invalidateQueries({ queryKey: ['tasks', destinationListId] })
    See TaskReorder schema in app/schemas/task.py for the full usage example.
    """
    # Sprint 3:
    #   task = get_task_or_404(db, task_id)
    #   verify_task_owner(db, task, current_user.id)
    #   old_list_id = task.list_id
    #   if old_list_id != payload.new_list_id:
    #       # Re-index source list: close the gap left by the moved task
    #       db.query(Task).filter(Task.list_id == old_list_id,
    #                             Task.position > task.position) \
    #           .update({"position": Task.position - 1})
    #       task.list_id = payload.new_list_id
    #   # Shift tasks at destination down to make room
    #   db.query(Task).filter(Task.list_id == payload.new_list_id,
    #                         Task.position >= payload.new_position) \
    #       .update({"position": Task.position + 1})
    #   task.position = payload.new_position
    #   db.commit(); db.refresh(task); return task
    raise HTTPException(status_code=501, detail="Sprint 3: not yet implemented")


@router.post("/api/tasks/{task_id}/labels/{label_id}", response_model=TaskResponse)
def add_label_to_task(
    task_id: UUID,
    label_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Attaches an existing label to a task.
    Frontend: call when user selects a label from the label picker in the task detail modal.
        After success: invalidateQueries({ queryKey: ['tasks', taskId] })
    Label must already exist (create it via POST /api/labels/ first).
    """
    # Sprint 2:
    #   task = get_task_or_404(db, task_id)
    #   verify_task_owner(db, task, current_user.id)
    #   label = db.query(Label).filter(Label.id == label_id,
    #                                  Label.user_id == current_user.id).first()
    #   if not label: raise HTTPException(404, "Label not found")
    #   if label not in task.labels:
    #       task.labels.append(label)
    #       db.commit(); db.refresh(task)
    #   return task
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.delete("/api/tasks/{task_id}/labels/{label_id}", response_model=TaskResponse)
def remove_label_from_task(
    task_id: UUID,
    label_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Detaches a label from a task (does NOT delete the label itself).
    Frontend: call when user removes a label badge from the task detail modal.
        After success: invalidateQueries({ queryKey: ['tasks', taskId] })
    """
    # Sprint 2:
    #   task = get_task_or_404(db, task_id)
    #   verify_task_owner(db, task, current_user.id)
    #   task.labels = [l for l in task.labels if l.id != label_id]
    #   db.commit(); db.refresh(task); return task
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a task. DB cascades and removes all task_labels entries automatically.
    Frontend: call from the task detail modal's delete button (with confirmation).
        After success: invalidateQueries({ queryKey: ['tasks', listId] })
    """
    # Sprint 2:
    #   task = get_task_or_404(db, task_id)
    #   verify_task_owner(db, task, current_user.id)
    #   db.delete(task); db.commit()
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")
