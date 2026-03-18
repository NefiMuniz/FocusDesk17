# ============================================================
# (CRUD) — SPRINT 2: Implement all endpoints here
# ============================================================
# ENDPOINTS TO BUILD:
#   GET    /api/labels/        → all labels belonging to current user
#   POST   /api/labels/        → create a new label
#   PATCH  /api/labels/{id}    → rename or recolor a label
#   DELETE /api/labels/{id}    → delete label (DB cascades task_labels entries)
#
# Frontend — API contract:
#   GET /api/labels/ → array of LabelResponse
#   Fetch this once on app load and cache it.
#   Use it to populate the label picker inside the task detail modal.
#   LabelResponse.color → hex string e.g. '#FF5733'.
#     Render as CSS background-color on the badge chip.
#     If color is null, fall back to a default gray: '#9CA3AF'
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User, Board, TaskList, Task, Label
from app.schemas.label import LabelCreate, LabelUpdate, LabelResponse

router = APIRouter(prefix="/api/labels", tags=["Labels"])


@router.get("/", response_model=list[LabelResponse])
def get_labels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all labels created by the authenticated user.
    Frontend: fetch on app load and cache with TanStack Query.
        queryKey: ['labels']
        Use this list to populate the label picker in the task detail modal.
    """
    # Sprint 2:
    #   return db.query(Label).filter(Label.user_id == current_user.id).all()
    return []


@router.post("/", response_model=LabelResponse, status_code=status.HTTP_201_CREATED)
def create_label(
    payload: LabelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new label for the authenticated user.
    Frontend: call from the "Create Label" form in the label manager.
        After success: invalidateQueries({ queryKey: ['labels'] })
    color should be a hex string like '#FF5733'.
    DB enforces unique (user_id, name) — return 409 Conflict if name already exists.
    """
    # Sprint 2:
    #   new_label = Label(**payload.model_dump(), user_id=current_user.id)
    #   db.add(new_label)
    #   try:
    #       db.commit()
    #   except IntegrityError:
    #       db.rollback()
    #       raise HTTPException(409, "A label with this name already exists")
    #   db.refresh(new_label); return new_label
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.patch("/{label_id}", response_model=LabelResponse)
def update_label(
    label_id: UUID,
    payload: LabelUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Renames a label or changes its color.
    Frontend: call from the label manager edit form.
        After success: invalidateQueries({ queryKey: ['labels'] })
        Color change reflects immediately on all task cards that use this label.
    """
    # Sprint 2:
    #   label = get_label_or_404(db, label_id, current_user.id)
    #   for field, value in payload.model_dump(exclude_unset=True).items():
    #       setattr(label, field, value)
    #   db.commit(); db.refresh(label); return label
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")


@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_label(
    label_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a label. DB cascades: all task_labels entries using it are removed.
    The tasks themselves are NOT deleted — only the label association is removed.
    Frontend: call from the label manager delete button (with confirmation).
        After success: invalidateQueries({ queryKey: ['labels'] })
                    + invalidateQueries({ queryKey: ['tasks'] }) to refresh badge display
    """
    # Sprint 2:
    #   label = get_label_or_404(db, label_id, current_user.id)
    #   db.delete(label); db.commit()
    raise HTTPException(status_code=501, detail="Sprint 2: not yet implemented")
