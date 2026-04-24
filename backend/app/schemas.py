"""
Pydantic schemas for request validation and response serialization.
"""
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    """Valid task statuses with enforced transition order."""
    PENDING = "pending"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"


# Ordered list used for transition validation
STATUS_ORDER = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    model_config = ConfigDict(use_enum_values=True)

    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Title of the task",
        json_schema_extra={"example": "Implement login feature"},
    )
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Optional detailed description of the task",
        json_schema_extra={"example": "Add JWT-based authentication to the API"},
    )
    status: TaskStatus = Field(
        default=TaskStatus.PENDING,
        description="Initial status (must be 'pending' for new tasks)",
    )

    @field_validator("status")
    @classmethod
    def new_task_must_be_pending(cls, v):
        if v != TaskStatus.PENDING:
            raise ValueError("New tasks must start with status 'pending'.")
        return v


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""

    model_config = ConfigDict(use_enum_values=True)

    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        json_schema_extra={"example": "Updated title"},
    )
    description: Optional[str] = Field(
        None,
        max_length=2000,
        json_schema_extra={"example": "Updated description"},
    )
    status: Optional[TaskStatus] = Field(
        None,
        description="New status (must follow transition rules)",
    )


class TaskResponse(BaseModel):
    """Schema for task responses."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Unique task identifier")
    title: str = Field(..., description="Title of the task")
    description: Optional[str] = Field(None, description="Task description")
    status: str = Field(..., description="Current task status")
    created_at: datetime = Field(..., description="Timestamp when task was created")
    updated_at: Optional[datetime] = Field(
        None, description="Timestamp when task was last updated"
    )


class TaskListResponse(BaseModel):
    """Schema for paginated task list responses."""

    total: int = Field(..., description="Total number of tasks")
    tasks: list[TaskResponse] = Field(..., description="List of tasks")


class ErrorDetail(BaseModel):
    """Schema for error responses."""

    detail: str = Field(..., description="Human-readable error message")
    error_code: Optional[str] = Field(
        None, description="Machine-readable error code"
    )
