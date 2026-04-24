"""
Service layer for Task Management business logic.

This module contains the TRICK LOGIC:
  Status transitions must follow the strict order:
    pending → in-progress → completed

  Rules:
  - Skipping steps is REJECTED  (e.g., pending → completed)
  - Downgrading is REJECTED      (e.g., completed → in-progress)
  - Only one step forward at a time is ALLOWED
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, List

from .models import Task
from .schemas import TaskCreate, TaskUpdate, TaskStatus

# The enforced linear order of statuses
STATUS_ORDER: List[str] = ["pending", "in-progress", "completed"]


def _get_status_index(status_value: str) -> int:
    """Return the index of a status in the transition order."""
    try:
        return STATUS_ORDER.index(status_value)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_value}'. Must be one of: {STATUS_ORDER}",
        )


def validate_status_transition(current_status: str, new_status: str) -> None:
    """
    Enforce the trick status transition rule.

    Only allows moving EXACTLY one step forward:
      pending → in-progress  ✓
      in-progress → completed ✓
      pending → completed     ✗ (skip)
      completed → in-progress ✗ (downgrade)
      pending → pending       ✗ (no change treated as unnecessary)
    """
    if current_status == new_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Task is already in '{current_status}' status. "
                "No transition needed."
            ),
        )

    current_idx = _get_status_index(current_status)
    new_idx = _get_status_index(new_status)

    if new_idx < current_idx:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Invalid status downgrade: '{current_status}' → '{new_status}'. "
                f"Status can only move forward in the order: {' → '.join(STATUS_ORDER)}."
            ),
        )

    if new_idx - current_idx > 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Invalid status skip: '{current_status}' → '{new_status}'. "
                f"You must go through intermediate statuses. "
                f"Next allowed status is '{STATUS_ORDER[current_idx + 1]}'."
            ),
        )


# ─── CRUD Operations ────────────────────────────────────────────────────────

def create_task(db: Session, task_in: TaskCreate) -> Task:
    """Create a new task. Always starts as 'pending'."""
    task = Task(
        title=task_in.title.strip(),
        description=task_in.description.strip() if task_in.description else None,
        status="pending",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task(db: Session, task_id: int) -> Task:
    """Retrieve a single task by ID. Raises 404 if not found."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id={task_id} not found.",
        )
    return task


def get_all_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
) -> tuple[List[Task], int]:
    """Retrieve all tasks with optional status filter and pagination."""
    query = db.query(Task)
    if status_filter:
        query = query.filter(Task.status == status_filter)
    total = query.count()
    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    return tasks, total


def update_task(db: Session, task_id: int, task_in: TaskUpdate) -> Task:
    """
    Update a task's title, description, and/or status.
    Status changes are validated against the trick transition rules.
    """
    task = get_task(db, task_id)

    if task_in.status is not None:
        validate_status_transition(task.status, task_in.status)
        task.status = task_in.status

    if task_in.title is not None:
        task.title = task_in.title.strip()

    if task_in.description is not None:
        task.description = task_in.description.strip()

    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int) -> dict:
    """Delete a task by ID. Raises 404 if not found."""
    task = get_task(db, task_id)
    db.delete(task)
    db.commit()
    return {"message": f"Task id={task_id} deleted successfully."}
