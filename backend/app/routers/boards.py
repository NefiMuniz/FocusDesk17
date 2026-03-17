# ============================================================
# MEMBER (CRUD) — SPRINT 2: Implement all endpoints here
# ============================================================
# ENDPOINTS TO BUILD:
#   GET    /api/boards/        → list all boards belonging to current user
#   POST   /api/boards/        → create a new board
#   GET    /api/boards/{id}    → get one board + its lists sorted by position
#   PATCH  /api/boards/{id}    → rename board or update description
#   DELETE /api/boards/{id}    → delete board (DB cascades → lists → tasks)
#
# SECURITY RULE: EVERY query must filter by current_user.id.
#   ✅  db.query(Board).filter(Board.user_id == current_user.id)
#   ❌  db.query(Board).filter(Board.id == board_id)   ← anyone could access any board
#
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
from app.models import User, Board, TaskList, Task, Label
from app.schemas.board import BoardCreate, BoardUpdate, BoardResponse

router = APIRouter(prefix="/api/boards", tags=["Boards"])


@router.get("/", response_model=list[BoardResponse])
def get_boards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all boards owned by the authenticated user.
    Frontend: call GET /api/boards/ on dashboard load using TanStack Query.
        const { data: boards } = useQuery({ queryKey: ['boards'], queryFn: fetchBoards })
    """
    # Sprint 2: return db.query(Board).filter(Board.user_id == current_user.id).all()
    return []


@router.post("/", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(
    payload: BoardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new board for the authenticated user.
    Frontend: call POST /api/boards/ from the "New Board" modal.
        After success: invalidateQueries({ queryKey: ['boards'] })
    """
    # Sprint 2:
    #   new_board = Board(**payload.model_dump(), user_id=current_user.id)
    #   db.add(new_board); db.commit(); db.refresh(new_board); return new_board
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.get("/{board_id}", response_model=BoardResponse)
def get_board(
    board_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns one board with its lists (sorted by position).
    Frontend: call GET /api/boards/{id} when user opens a board page.
        queryKey: ['boards', boardId]
    404 is returned if board doesn't exist or belongs to another user.
    """
    # Sprint 2:
    #   board = db.query(Board).filter(Board.id == board_id, Board.user_id == current_user.id).first()
    #   if not board: raise HTTPException(status_code=404, detail="Board not found")
    #   return board
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.patch("/{board_id}", response_model=BoardResponse)
def update_board(
    board_id: UUID,
    payload: BoardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates board name or description.
    Frontend: call PATCH /api/boards/{id} from the board settings/rename UI.
        After success: invalidateQueries({ queryKey: ['boards', boardId] })
    """
    # Sprint 2:
    #   board = get_board_or_404(db, board_id, current_user.id)
    #   for field, value in payload.model_dump(exclude_unset=True).items():
    #       setattr(board, field, value)
    #   db.commit(); db.refresh(board); return board
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a board. DB cascades: lists → tasks → task_labels are all deleted.
    Frontend: call DELETE /api/boards/{id} from the board delete confirmation dialog.
        After success: invalidateQueries({ queryKey: ['boards'] }) + navigate to dashboard
    """
    # Sprint 2:
    #   board = get_board_or_404(db, board_id, current_user.id)
    #   db.delete(board); db.commit()
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")
