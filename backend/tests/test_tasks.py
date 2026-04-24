"""
Comprehensive unit tests for the Task Management System backend.
Tests cover: CRUD operations, status transition rules (trick logic), 
edge cases, and error handling.

Run with: pytest tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app
from app.database import Base, get_db

# ─── Test Database Setup ─────────────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite:///./test_tasks.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app = create_app()
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test and drop after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_task(client):
    """Create and return a sample task for reuse."""
    resp = client.post("/tasks/", json={"title": "Sample Task", "description": "A test task"})
    assert resp.status_code == 201
    return resp.json()


# ─── Health / Root Tests ─────────────────────────────────────────────────────

class TestHealthEndpoints:
    def test_root(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert "Task Management System API" in resp.json()["message"]

    def test_health(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"


# ─── Create Task Tests ────────────────────────────────────────────────────────

class TestCreateTask:
    def test_create_task_minimal(self, client):
        resp = client.post("/tasks/", json={"title": "My Task"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "My Task"
        assert data["status"] == "pending"
        assert data["description"] is None
        assert "id" in data
        assert "created_at" in data

    def test_create_task_full(self, client):
        payload = {"title": "Full Task", "description": "Full description", "status": "pending"}
        resp = client.post("/tasks/", json=payload)
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Full Task"
        assert data["description"] == "Full description"

    def test_create_task_empty_title_fails(self, client):
        resp = client.post("/tasks/", json={"title": ""})
        assert resp.status_code == 422

    def test_create_task_missing_title_fails(self, client):
        resp = client.post("/tasks/", json={"description": "No title"})
        assert resp.status_code == 422

    def test_create_task_non_pending_status_rejected(self, client):
        """New tasks MUST start as pending – the trick requirement."""
        resp = client.post("/tasks/", json={"title": "Test", "status": "in-progress"})
        assert resp.status_code in (400, 422)

    def test_create_task_completed_status_rejected(self, client):
        resp = client.post("/tasks/", json={"title": "Test", "status": "completed"})
        assert resp.status_code in (400, 422)


# ─── Read Task Tests ──────────────────────────────────────────────────────────

class TestGetTask:
    def test_get_all_tasks_empty(self, client):
        resp = client.get("/tasks/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert data["tasks"] == []

    def test_get_all_tasks(self, client, sample_task):
        resp = client.get("/tasks/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert len(data["tasks"]) == 1

    def test_get_task_by_id(self, client, sample_task):
        task_id = sample_task["id"]
        resp = client.get(f"/tasks/{task_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == task_id

    def test_get_task_not_found(self, client):
        resp = client.get("/tasks/99999")
        assert resp.status_code == 404
        assert "not found" in resp.json()["detail"].lower()

    def test_filter_tasks_by_status(self, client):
        client.post("/tasks/", json={"title": "Task 1"})
        client.post("/tasks/", json={"title": "Task 2"})
        resp = client.get("/tasks/?status=pending")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 2
        assert all(t["status"] == "pending" for t in data["tasks"])

    def test_pagination_skip_limit(self, client):
        for i in range(5):
            client.post("/tasks/", json={"title": f"Task {i}"})
        resp = client.get("/tasks/?skip=2&limit=2")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 5
        assert len(data["tasks"]) == 2


# ─── Update Task Tests ────────────────────────────────────────────────────────

class TestUpdateTask:
    def test_update_title(self, client, sample_task):
        task_id = sample_task["id"]
        resp = client.put(f"/tasks/{task_id}", json={"title": "Updated Title"})
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated Title"

    def test_update_description(self, client, sample_task):
        task_id = sample_task["id"]
        resp = client.put(f"/tasks/{task_id}", json={"description": "New desc"})
        assert resp.status_code == 200
        assert resp.json()["description"] == "New desc"

    def test_update_task_not_found(self, client):
        resp = client.put("/tasks/99999", json={"title": "X"})
        assert resp.status_code == 404


# ─── Status Transition Tests (THE TRICK LOGIC) ───────────────────────────────

class TestStatusTransitions:
    """
    These tests verify the core trick requirement:
    pending → in-progress → completed (ONLY forward, ONE step at a time)
    """

    def test_valid_pending_to_in_progress(self, client, sample_task):
        task_id = sample_task["id"]
        resp = client.put(f"/tasks/{task_id}", json={"status": "in-progress"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "in-progress"

    def test_valid_in_progress_to_completed(self, client, sample_task):
        task_id = sample_task["id"]
        # Move to in-progress first
        client.put(f"/tasks/{task_id}", json={"status": "in-progress"})
        # Then to completed
        resp = client.put(f"/tasks/{task_id}", json={"status": "completed"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "completed"

    def test_invalid_skip_pending_to_completed(self, client, sample_task):
        """TRICK: Skipping in-progress must be rejected."""
        task_id = sample_task["id"]
        resp = client.put(f"/tasks/{task_id}", json={"status": "completed"})
        assert resp.status_code == 422
        assert "skip" in resp.json()["detail"].lower() or "next allowed" in resp.json()["detail"].lower()

    def test_invalid_downgrade_completed_to_in_progress(self, client, sample_task):
        """TRICK: Downgrading must be rejected."""
        task_id = sample_task["id"]
        client.put(f"/tasks/{task_id}", json={"status": "in-progress"})
        client.put(f"/tasks/{task_id}", json={"status": "completed"})
        resp = client.put(f"/tasks/{task_id}", json={"status": "in-progress"})
        assert resp.status_code == 422
        assert "downgrade" in resp.json()["detail"].lower()

    def test_invalid_downgrade_completed_to_pending(self, client, sample_task):
        """TRICK: Downgrading to start must be rejected."""
        task_id = sample_task["id"]
        client.put(f"/tasks/{task_id}", json={"status": "in-progress"})
        client.put(f"/tasks/{task_id}", json={"status": "completed"})
        resp = client.put(f"/tasks/{task_id}", json={"status": "pending"})
        assert resp.status_code == 422

    def test_invalid_downgrade_in_progress_to_pending(self, client, sample_task):
        """TRICK: Going backward from in-progress must be rejected."""
        task_id = sample_task["id"]
        client.put(f"/tasks/{task_id}", json={"status": "in-progress"})
        resp = client.put(f"/tasks/{task_id}", json={"status": "pending"})
        assert resp.status_code == 422

    def test_invalid_same_status_transition(self, client, sample_task):
        """Setting the same status is a no-op and should be rejected."""
        task_id = sample_task["id"]
        resp = client.put(f"/tasks/{task_id}", json={"status": "pending"})
        assert resp.status_code == 400

    def test_full_valid_lifecycle(self, client):
        """Happy path: pending → in-progress → completed."""
        resp = client.post("/tasks/", json={"title": "Lifecycle Task"})
        task_id = resp.json()["id"]

        r1 = client.put(f"/tasks/{task_id}", json={"status": "in-progress"})
        assert r1.status_code == 200

        r2 = client.put(f"/tasks/{task_id}", json={"status": "completed"})
        assert r2.status_code == 200
        assert r2.json()["status"] == "completed"

    def test_cannot_update_completed_task_status(self, client, sample_task):
        """A completed task cannot move to any other status."""
        task_id = sample_task["id"]
        client.put(f"/tasks/{task_id}", json={"status": "in-progress"})
        client.put(f"/tasks/{task_id}", json={"status": "completed"})

        # Try all invalid transitions from completed
        for bad_status in ["pending", "in-progress"]:
            resp = client.put(f"/tasks/{task_id}", json={"status": bad_status})
            assert resp.status_code == 422, f"Expected 422 for completed → {bad_status}"


# ─── Delete Task Tests ────────────────────────────────────────────────────────

class TestDeleteTask:
    def test_delete_task(self, client, sample_task):
        task_id = sample_task["id"]
        resp = client.delete(f"/tasks/{task_id}")
        assert resp.status_code == 200
        assert "deleted" in resp.json()["message"].lower()

        # Verify gone
        get_resp = client.get(f"/tasks/{task_id}")
        assert get_resp.status_code == 404

    def test_delete_task_not_found(self, client):
        resp = client.delete("/tasks/99999")
        assert resp.status_code == 404

    def test_delete_multiple_tasks(self, client):
        ids = []
        for i in range(3):
            r = client.post("/tasks/", json={"title": f"Task {i}"})
            ids.append(r.json()["id"])

        client.delete(f"/tasks/{ids[0]}")
        resp = client.get("/tasks/")
        assert resp.json()["total"] == 2


# ─── Edge Cases ───────────────────────────────────────────────────────────────

class TestEdgeCases:
    def test_title_whitespace_trimmed(self, client):
        resp = client.post("/tasks/", json={"title": "  Trimmed Title  "})
        assert resp.status_code == 201
        assert resp.json()["title"] == "Trimmed Title"

    def test_invalid_status_filter(self, client):
        resp = client.get("/tasks/?status=invalid_status")
        assert resp.status_code == 422

    def test_create_many_tasks(self, client):
        for i in range(20):
            client.post("/tasks/", json={"title": f"Bulk Task {i}"})
        resp = client.get("/tasks/")
        assert resp.json()["total"] == 20
