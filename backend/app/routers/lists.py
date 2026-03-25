# ============================================================
# Frontend — API contract:
#   GET response: array of ListResponse sorted ascending by `position`
#   Frontend: render board columns in the order they come from the API.
#     lists.sort((a, b) => a.position - b.position)  ← already done on backend
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User, Board, TaskList
from app.schemas.list import ListCreate, ListUpdate, ListResponse

router = APIRouter(tags=["Lists"])


def verify_board_owner(db: Session, board_id: UUID, user_id: UUID) -> Board:
    """
    Confirms the board exists and belongs to current_user.
    Called before any list write to prevent unauthorized access.
    """
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.user_id == user_id
    ).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board


def get_list_or_404(db: Session, list_id: UUID, user_id: UUID) -> TaskList:
    """
    Fetches a list and verifies the parent board belongs to current_user.
    Traverses: list → board → user_id check.
    """
    task_list = (
        db.query(TaskList)
        .join(Board, TaskList.board_id == Board.id)
        .filter(TaskList.id == list_id, Board.user_id == user_id)
        .first()
    )
    if not task_list:
        raise HTTPException(status_code=404, detail="List not found")
    return task_list


@router.get("/api/boards/{board_id}/lists/", response_model=list[ListResponse])
def get_lists(
    board_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all columns for a board, sorted left-to-right by position.
    Member 2: fetch when loading a board page.
        queryKey: ['lists', boardId]
        Render columns in the exact order returned — already sorted.
    """
    verify_board_owner(db, board_id, current_user.id)
    return (
        db.query(TaskList)
        .filter(TaskList.board_id == board_id)
        .order_by(TaskList.position)
        .all()
    )


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
    If `position` is omitted, appends at the end automatically.
    Member 2: call from the "+ Add List" button.
        After success: invalidateQueries({ queryKey: ['lists', boardId] })
    """
    verify_board_owner(db, board_id, current_user.id)

    # Auto-assign position at the end if not provided
    if payload.position is None:
        max_pos = db.query(func.max(TaskList.position)).filter(
            TaskList.board_id == board_id
        ).scalar()
        position = (max_pos + 1) if max_pos is not None else 0
    else:
        position = payload.position

    new_list = TaskList(board_id=board_id, name=payload.name, position=position)
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list


@router.patch("/api/lists/{list_id}", response_model=ListResponse)
def update_list(
    list_id: UUID,
    payload: ListUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Renames a column or updates its position.
    Member 2: call after user renames a column header.
        After success: invalidateQueries({ queryKey: ['lists', boardId] })
    """
    task_list = get_list_or_404(db, list_id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task_list, field, value)
    db.commit()
    db.refresh(task_list)
    return task_list


@router.delete("/api/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(
    list_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a column. DB cascades: all tasks inside are also deleted.
    Member 2: show a confirmation dialog before calling this.
        After success: invalidateQueries({ queryKey: ['lists', boardId] })
    """
    task_list = get_list_or_404(db, list_id, current_user.id)
    db.delete(task_list)
    db.commit()
