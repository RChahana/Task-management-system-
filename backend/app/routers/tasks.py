"""
Tasks router - all CRUD endpoints for Task Management.

Endpoints:
  POST   /tasks/         → Create task
  GET    /tasks/         → List all tasks
  GET    /tasks/{id}     → Get single task
  PUT    /tasks/{id}     → Update task (with status transition validation)
  DELETE /tasks/{id}     → Delete task
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from .. import services

router = APIRouter()


@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    responses={
        201: {"description": "Task created successfully"},
        400: {"description": "Validation error (e.g., invalid initial status)"},
        422: {"description": "Request body validation failed"},
    },
)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    """
    Create a new task.

    - **title**: Required. Max 255 characters.
    - **description**: Optional.
    - **status**: Always starts as `pending` (enforced by server).
    """
    return services.create_task(db, task_in)


@router.get(
    "/",
    response_model=TaskListResponse,
    summary="Retrieve all tasks",
    responses={
        200: {"description": "List of tasks returned successfully"},
    },
)
def list_tasks(
    skip: int = Query(0, ge=0, description="Number of records to skip (pagination)"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status: pending | in-progress | completed",
        pattern="^(pending|in-progress|completed)$",
    ),
    db: Session = Depends(get_db),
):
    """
    Retrieve all tasks with optional filtering and pagination.

    - **status**: Filter by task status (`pending`, `in-progress`, `completed`).
    - **skip**: Pagination offset.
    - **limit**: Max records (1–500).
    """
    tasks, total = services.get_all_tasks(db, skip=skip, limit=limit, status_filter=status_filter)
    return TaskListResponse(total=total, tasks=tasks)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Retrieve a specific task",
    responses={
        200: {"description": "Task found"},
        404: {"description": "Task not found"},
    },
)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single task by its ID.
    Returns **404** if the task does not exist.
    """
    return services.get_task(db, task_id)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
    responses={
        200: {"description": "Task updated"},
        400: {"description": "No-op status change"},
        404: {"description": "Task not found"},
        422: {"description": "Invalid status transition (skip or downgrade)"},
    },
)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    """
    Update a task's title, description, and/or status.

    ## Status Transition Rules
    Status **must** advance exactly one step at a time:

    | From        | To          | Result  |
    |-------------|-------------|---------|
    | pending     | in-progress | ✅ OK   |
    | in-progress | completed   | ✅ OK   |
    | pending     | completed   | ❌ Skip |
    | completed   | in-progress | ❌ Downgrade |
    | pending     | pending     | ❌ No-op |
    """
    return services.update_task(db, task_id, task_in)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a task",
    responses={
        200: {"description": "Task deleted"},
        404: {"description": "Task not found"},
    },
)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """
    Delete a task by its ID.
    Returns **404** if the task does not exist.
    """
    return services.delete_task(db, task_id)
