"""
Application factory for the Task Management System.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import tasks


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    app = FastAPI(
        title="Task Management System",
        description=(
            "A robust Task Management API with strict status transition enforcement.\n\n"
            "## Status Transition Rules\n"
            "Tasks must follow this exact order:\n"
            "- `pending` → `in-progress` → `completed`\n\n"
            "Skipping steps (e.g., `pending` → `completed`) is **not allowed**.\n"
            "Downgrading status (e.g., `completed` → `in-progress`) is **not allowed**."
        ),
        version="1.0.0",
        contact={
            "name": "Task Management API",
        },
        license_info={
            "name": "MIT",
        },
    )

    # CORS middleware - allow React frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Create database tables (Alembic handles migrations; this is a safety net)
    Base.metadata.create_all(bind=engine)

    # Register routers
    app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])

    @app.get("/", tags=["Health"])
    def root():
        return {
            "message": "Task Management System API",
            "version": "1.0.0",
            "docs": "/docs",
            "redoc": "/redoc",
        }

    @app.get("/health", tags=["Health"])
    def health_check():
        return {"status": "healthy"}

    return app
