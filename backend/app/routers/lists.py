# ============================================================
# (CRUD) — SPRINT 2: Implement all endpoints here
# ============================================================
# ENDPOINTS TO BUILD:
#   GET    /api/boards/{board_id}/lists/    → all lists for a board, sorted by position
#   POST   /api/boards/{board_id}/lists/    → add a new column to a board
#   PATCH  /api/lists/{id}                 → rename column or change its position
#   DELETE /api/lists/{id}                 → delete column (DB cascades → tasks)
#
# POSITION LOGIC (important for Sprint 2):
#   When creating: assign position = max(existing positions) + 1
#   When reordering: if a column moves from pos 2 to pos 0,
#     shift all columns between the old and new position by ±1 first,
#     then set the moved column to new_position.
#
# SECURITY RULE: Verify that the parent board belongs to current_user before any write.
#
# Frontend — API contract:
#   GET response: array of ListResponse sorted ascending by `position`
#   Frontend: render board columns in the order they come from the API.
#     lists.sort((a, b) => a.position - b.position)  ← already done on backend
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User, Board, TaskList, Task, Label
from app.schemas.list import ListCreate, ListUpdate, ListResponse

router = APIRouter(tags=["Lists"])


@router.get("/api/boards/{board_id}/lists/", response_model=list[ListResponse])
def get_lists(
    board_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all columns for a board, sorted by position (left to right).
    Frontend: include this in the same query as board data when loading a board page.
        queryKey: ['lists', boardId]
        Render columns in the order they arrive — already sorted by backend.
    """
    # Sprint 2:
    #   verify_board_owner(db, board_id, current_user.id)
    #   return db.query(TaskList).filter(TaskList.board_id == board_id)
    #            .order_by(TaskList.position).all()
    return []


@router.post(
    "/api/boards/{board_id}/lists/",
    response_model=ListResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_list(
    board_id: UUID,
    payload: ListCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Adds a new column to a board.
    Frontend: call from the "+ Add List" button at the end of a board.
        After success: invalidateQueries({ queryKey: ['lists', boardId] })
    If `position` is omitted in the request, backend appends it at the end.
    """
    # Sprint 2:
    #   verify_board_owner(db, board_id, current_user.id)
    #   max_pos = db.query(func.max(TaskList.position))
    #               .filter(TaskList.board_id == board_id).scalar() or -1
    #   position = payload.position if payload.position is not None else max_pos + 1
    #   new_list = TaskList(board_id=board_id, name=payload.name, position=position)
    #   db.add(new_list); db.commit(); db.refresh(new_list); return new_list
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.patch("/api/lists/{list_id}", response_model=ListResponse)
def update_list(
    list_id: UUID,
    payload: ListUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Renames a column or updates its position (column reorder).
    Frontend: call PATCH /api/lists/{id} after user renames a column header.
        After success: invalidateQueries({ queryKey: ['lists', boardId] })
    """
    # Sprint 2:
    #   task_list = get_list_or_404(db, list_id)
    #   verify_board_owner(db, task_list.board_id, current_user.id)
    #   for field, value in payload.model_dump(exclude_unset=True).items():
    #       setattr(task_list, field, value)
    #   db.commit(); db.refresh(task_list); return task_list
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.delete("/api/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(
    list_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a column. DB cascades: all tasks inside are also deleted.
    Frontend: show a confirmation dialog before calling this endpoint.
        After success: invalidateQueries({ queryKey: ['lists', boardId] })
    """
    # Sprint 2:
    #   task_list = get_list_or_404(db, list_id)
    #   verify_board_owner(db, task_list.board_id, current_user.id)
    #   db.delete(task_list); db.commit()
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")
