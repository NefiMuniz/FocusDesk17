# ============================================================
# Frontend — API contract:
#   GET /api/labels/ → array of LabelResponse
#   Fetch this once on app load and cache it.
#   Use it to populate the label picker inside the task detail modal.
#   LabelResponse.color → hex string e.g. '#FF5733'.
#     Render as CSS background-color on the badge chip.
#     If color is null, fall back to a default gray: '#9CA3AF'
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User, Label
from app.schemas.label import LabelCreate, LabelUpdate, LabelResponse

router = APIRouter(prefix="/api/labels", tags=["Labels"])


def get_label_or_404(db: Session, label_id: UUID, user_id: UUID) -> Label:
    """
    Fetches a label and verifies it belongs to current_user.
    """
    label = db.query(Label).filter(
        Label.id == label_id,
        Label.user_id == user_id
    ).first()
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    return label


@router.get("/", response_model=list[LabelResponse])
def get_labels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all labels created by the authenticated user.
    Member 2: fetch on app load and cache.
        queryKey: ['labels']
        Use to populate the label picker in the task detail modal.
    """
    return db.query(Label).filter(Label.user_id == current_user.id).all()


@router.post("/", response_model=LabelResponse, status_code=status.HTTP_201_CREATED)
def create_label(
    payload: LabelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new label for the authenticated user.
    Member 2: call from the "Create Label" form.
        After success: invalidateQueries({ queryKey: ['labels'] })
    Returns 409 if a label with the same name already exists for this user.
    """
    new_label = Label(**payload.model_dump(), user_id=current_user.id)
    db.add(new_label)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A label with this name already exists"
        )
    db.refresh(new_label)
    return new_label


@router.patch("/{label_id}", response_model=LabelResponse)
def update_label(
    label_id: UUID,
    payload: LabelUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Renames a label or changes its color.
    Member 2: call from the label manager edit form.
        After success: invalidateQueries({ queryKey: ['labels'] })
        Color change reflects immediately on all task cards using this label.
    """
    label = get_label_or_404(db, label_id, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(label, field, value)
    db.commit()
    db.refresh(label)
    return label


@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_label(
    label_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a label. DB cascades: all task_labels entries using it are removed.
    The tasks themselves are NOT deleted — only the label association is removed.
    Member 2: call from label manager delete button (with confirmation).
        After success: invalidateQueries({ queryKey: ['labels'] })
                    + invalidateQueries({ queryKey: ['tasks'] })
    """
    label = get_label_or_404(db, label_id, current_user.id)
    db.delete(label)
    db.commit()
