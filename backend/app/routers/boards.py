# ============================================================
# Frontend — API contract for this router:
#   Base URL prefix: /api/boards
#   Auth header required: Authorization: Bearer <token>
#   BoardCreate  → POST body shape  (see app/schemas/board.py)
#   BoardUpdate  → PATCH body shape (all fields optional)
#   BoardResponse → what every successful response returns
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User, Board
from app.schemas.board import BoardCreate, BoardUpdate, BoardResponse

router = APIRouter(prefix="/api/boards", tags=["Boards"])


def get_board_or_404(db: Session, board_id: UUID, user_id: UUID) -> Board:
    """
    Reusable helper — fetches a board and verifies ownership in one step.
    Raises 404 if not found or if it belongs to a different user.
    Use this in every endpoint instead of repeating the query + check.
    """
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.user_id == user_id
    ).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board


@router.get("/", response_model=list[BoardResponse])
def get_boards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all boards owned by the authenticated user.
    Member 2: call on dashboard load.
        queryKey: ['boards']
        Each board card links to GET /api/boards/{id} for the full view.
    """
    return db.query(Board).filter(Board.user_id == current_user.id).all()


@router.post("/", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(
    payload: BoardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new board for the authenticated user.
    Member 2: POST from the "New Board" modal.
        After success: invalidateQueries({ queryKey: ['boards'] })
    """
    new_board = Board(**payload.model_dump(), user_id=current_user.id)
    db.add(new_board)
    db.commit()
    db.refresh(new_board)
    return new_board


@router.get("/{board_id}", response_model=BoardResponse)
def get_board(
    board_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns one board.
    Member 2: call when user opens a board page.
        queryKey: ['boards', boardId]
    """
    return get_board_or_404(db, board_id, current_user.id)


@router.patch("/{board_id}", response_model=BoardResponse)
def update_board(
    board_id: UUID,
    payload: BoardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Renames a board or updates its description.
    Member 2: call from the board settings/rename UI.
        After success: invalidateQueries({ queryKey: ['boards', boardId] })
    """
    board = get_board_or_404(db, board_id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(board, field, value)
    db.commit()
    db.refresh(board)
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a board. DB cascades: lists → tasks → task_labels all deleted.
    Member 2: call from delete confirmation dialog.
        After success: invalidateQueries({ queryKey: ['boards'] }) + navigate to dashboard
    """
    board = get_board_or_404(db, board_id, current_user.id)
    db.delete(board)
    db.commit()
