from __future__ import annotations
import uuid
from datetime import datetime, date, timezone
from sqlalchemy import (
    String, Integer, Date, DateTime, ForeignKey,
    Table, Column, UniqueConstraint, text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base


# ─────────────────────────────────────────────
# ASSOCIATION TABLE — Task ↔ Label (many-to-many)
# ─────────────────────────────────────────────
# A task can have multiple labels; a label can be used on many tasks.
# This maps directly to public.task_labels in the DB — no extra columns.
# Kept here so Task and Label can both reference it without any import issues.
task_labels_table = Table(
    "task_labels",
    Base.metadata,
    Column(
        "task_id",
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "label_id",
        UUID(as_uuid=True),
        ForeignKey("labels.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


# ─────────────────────────────────────────────
# USER
# ─────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)

    # oAuth (Auth): NEVER store plain text here.
    # Always hash before saving:  from passlib.hash import bcrypt; bcrypt.hash(plain)
    # Always verify with:         bcrypt.verify(plain, user.password_hash)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)

    name: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Deleting a user cascades to all their boards and labels
    boards: Mapped[list[Board]] = relationship(
        "Board", back_populates="owner", cascade="all, delete-orphan"
    )
    labels: Mapped[list[Label]] = relationship(
        "Label", back_populates="owner", cascade="all, delete-orphan"
    )


# ─────────────────────────────────────────────
# BOARD
# ─────────────────────────────────────────────
class Board(Base):
    __tablename__ = "boards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # CRUD member: every board query MUST filter by user_id == current_user.id
    # Never return or modify a board without this check — security boundary
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    # DB enforces 1–100 chars via CHECK constraint
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    owner: Mapped[User] = relationship("User", back_populates="boards")
    # Cascade: deleting a board removes all its lists → the DB then cascades to tasks
    lists: Mapped[list[TaskList]] = relationship(
        "TaskList", back_populates="board", cascade="all, delete-orphan"
    )


# ─────────────────────────────────────────────
# TASK LIST (Kanban Column)
# ─────────────────────────────────────────────
class TaskList(Base):
    """
    Represents a Kanban column inside a board.
    Named TaskList to avoid shadowing Python's built-in list keyword.
    The DB table name remains 'lists' to match the existing schema exactly.

    Users can name columns freely — 'Backlog', 'QA', 'Reviewing', 'Blocked', etc.
    There is NO restriction on column names or count beyond the unique(board_id, name) constraint.
    """
    __tablename__ = "lists"
    __table_args__ = (
        # Same board cannot have two columns with the same name
        UniqueConstraint("board_id", "name", name="lists_board_id_name_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    board_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("boards.id", ondelete="CASCADE"),
        nullable=False,
    )
    # DB enforces 1–50 chars via CHECK constraint
    name: Mapped[str] = mapped_column(String, nullable=False)

    # Controls left-to-right column order on the board (0-based)
    # Frontend: always sort columns by position ascending before rendering
    # CRUD member: when reordering, shift affected columns ±1 then set new position
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    board: Mapped[Board] = relationship("Board", back_populates="lists")
    # Cascade: deleting a column removes all its task cards
    tasks: Mapped[list[Task]] = relationship(
        "Task", back_populates="task_list", cascade="all, delete-orphan"
    )


# ─────────────────────────────────────────────
# TASK (Kanban Card)
# ─────────────────────────────────────────────
class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    list_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("lists.id", ondelete="CASCADE"),
        nullable=False,
    )
    # DB enforces 1–200 chars via CHECK constraint
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(String, nullable=True)

    # ISO date only (no time) — e.g. 2026-03-20
    # Frontend: compare against today's date to highlight overdue cards in red
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Controls top-to-bottom card order within a column (0-based)
    # Frontend (dnd-kit): sort cards by position ascending before rendering
    # CRUD member: reorder endpoint must shift sibling positions when a card moves
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Optional semantic tag on the card — completely independent of which column it's in
    # DB CHECK constraint enforces only: 'todo' | 'in_progress' | 'done'
    # Frontend: optionally auto-set status when card is dragged to a specific column name
    #   e.g. if destination list.name == 'Done' → send status: 'done' in the reorder call
    status: Mapped[str] = mapped_column(String, nullable=True, default="todo")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    task_list: Mapped[TaskList] = relationship("TaskList", back_populates="tasks")
    # Many-to-many: a task can carry multiple labels (e.g. 'High Priority' + 'Academic')
    labels: Mapped[list[Label]] = relationship(
        "Label", secondary=task_labels_table, back_populates="tasks"
    )


# ─────────────────────────────────────────────
# LABEL
# ─────────────────────────────────────────────
class Label(Base):
    """
    User-defined colored tags applied to task cards.
    Examples: 'High Priority', 'Academic', 'Work', 'Blocked'.
    user_id is nullable per DB schema — reserved for future system-wide labels.
    DB enforces unique(user_id, name) — a user can't have two labels with the same name.
    """
    __tablename__ = "labels"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="labels_user_id_name_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
    )
    # DB enforces 1–50 chars via CHECK constraint
    name: Mapped[str] = mapped_column(String, nullable=False)

    # Hex color string — e.g. '#FF5733', '#22C55E'
    # Frontend: use directly as CSS background-color on the badge chip
    #   <span style={{ backgroundColor: label.color ?? '#9CA3AF' }}>
    color: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    owner: Mapped[User | None] = relationship("User", back_populates="labels")
    tasks: Mapped[list[Task]] = relationship(
        "Task", secondary=task_labels_table, back_populates="labels"
    )
