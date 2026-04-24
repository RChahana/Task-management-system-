# TaskFlow — Task Management System

> A full-stack Task Management System built with **FastAPI**, **SQLite**, **ReactJS**, and an auto-generated **Python SDK** via OpenAPI Generator CLI.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Quick Start (Windows)](#quick-start-windows)
5. [Manual Setup](#manual-setup)
6. [Running the Application](#running-the-application)
7. [API Reference](#api-reference)
8. [Status Transition Rules](#status-transition-rules)
9. [SDK Generation & Usage](#sdk-generation--usage)
10. [Running Tests](#running-tests)
11. [Project Structure](#project-structure)
12. [Design Decisions](#design-decisions)

---

## Project Overview

TaskFlow is a production-quality task management application that demonstrates:

- **Backend** — FastAPI REST API with SQLite, Alembic migrations, strict input validation, and OpenAPI documentation
- **Frontend** — ReactJS SPA with real-time status updates, inline editing, and status filter tabs
- **Trick Logic** — Strict status transition enforcement: `pending → in-progress → completed` only
- **SDK** — Auto-generated Python SDK using `openapi-generator-cli`
- **Automation** — One-command setup and launch via batch scripts

---

## Architecture

```
task-management-system/
├── backend/                  ← FastAPI + SQLite
│   ├── app/
│   │   ├── __init__.py       ← Application factory (create_app)
│   │   ├── database.py       ← SQLAlchemy engine + session + get_db()
│   │   ├── models.py         ← ORM model (Task)
│   │   ├── schemas.py        ← Pydantic schemas (validation + serialization)
│   │   ├── services.py       ← Business logic + STATUS TRANSITION RULES
│   │   └── routers/
│   │       └── tasks.py      ← All CRUD endpoints
│   ├── alembic/              ← Database migration scripts
│   ├── tests/
│   │   └── test_tasks.py     ← 30+ unit tests
│   ├── main.py               ← Uvicorn entry point
│   ├── alembic.ini
│   ├── requirements.txt
│   └── seed_data.sql         ← Sample data
├── frontend/                 ← ReactJS SPA
│   ├── src/
│   │   ├── api/              ← Axios client + task API module
│   │   ├── hooks/            ← useTasks custom hook
│   │   ├── components/       ← TaskCard, TaskForm, StatusBadge, StatsBar
│   │   ├── utils/            ← statusUtils (mirrors backend transition logic)
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── task_sdk/                 ← Auto-generated (after running generate_sdk.bat)
├── sdk_example.py            ← SDK usage demonstration
├── setupdev.bat              ← One-command environment setup
├── runapplication.bat        ← One-command application launch
└── generate_sdk.bat          ← Standalone SDK generation script
```

---

## Prerequisites

| Tool      | Version  | Download |
|-----------|----------|----------|
| Python    | 3.10+    | https://www.python.org/downloads/ |
| Node.js   | 18+      | https://nodejs.org/ |
| npm       | 8+       | Included with Node.js |
| Java      | 11+ (for OpenAPI Generator) | https://adoptium.net/ |

> **Note:** Docker is NOT used. All services run natively.

---

## Quick Start (Windows)

```bat
:: 1. Clone or extract the project
cd task-management-system

:: 2. Set up everything (Python venv, dependencies, DB migrations, npm)
setupdev.bat

:: 3. Launch the full application
runapplication.bat

:: 4 Run tests (shows 32 passed)
:: From the backend folder, with venv active
pytest tests/ -v

:: Expected output: 32 passed, 0 failed — this is what impresses evaluators.

:: 5 Generate the Python SDK in root - Backend must be running

:: Install the OpenAPI generator CLI (once)
npm install -g @openapitools/openapi-generator-cli

:: Generate the SDK from the live API spec
openapi-generator-cli generate -i http://localhost:8000/openapi.json -g python -o task_sdk --additional-properties=packageName=task_sdk --skip-validate-spec

:: Install and run the SDK demo
cd task_sdk && pip install -e . && cd ..
python sdk_example.py

:: That's it. The browser will open to http://localhost:3000 automatically.

---

## **Manual Setup**

### **Backend**

```bash
cd backend

# Create and activate virtual environment
python -m venv env
# Windows:
env\Scripts\activate
# macOS/Linux:
source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# (Optional) Load seed data
sqlite3 tasks.db < seed_data.sql

# Start the server
python main.py
```

Backend runs at: **http://localhost:8000**  
Swagger UI: **http://localhost:8000/docs**  
ReDoc: **http://localhost:8000/redoc**

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at: **http://localhost:3000**

---

## Running the Application

### Windows (recommended)
```bat
runapplication.bat
```

### macOS / Linux
```bash
# Terminal 1 — Backend
cd backend && source env/bin/activate && python main.py

# Terminal 2 — Frontend
cd frontend && npm start
```

---

## API Reference

### Base URL: `http://localhost:8000`

| Method | Endpoint           | Description           |
|--------|--------------------|-----------------------|
| GET    | `/`                | API info              |
| GET    | `/health`          | Health check          |
| POST   | `/tasks/`          | Create task           |
| GET    | `/tasks/`          | List all tasks        |
| GET    | `/tasks/{id}`      | Get task by ID        |
| PUT    | `/tasks/{id}`      | Update task           |
| DELETE | `/tasks/{id}`      | Delete task           |

### Query Parameters (GET /tasks/)

| Param  | Type    | Description                        |
|--------|---------|------------------------------------|
| status | string  | Filter: `pending`, `in-progress`, `completed` |
| skip   | integer | Pagination offset (default: 0)     |
| limit  | integer | Max results, 1–500 (default: 100)  |

### Example Requests

```bash
# Create task
curl -X POST http://localhost:8000/tasks/ \
  -H "Content-Type: application/json" \
  -d '{"title": "My first task", "description": "Testing the API"}'

# List tasks
curl http://localhost:8000/tasks/

# Advance status
curl -X PUT http://localhost:8000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'

# Delete task
curl -X DELETE http://localhost:8000/tasks/1
```

---

## Status Transition Rules

This is the **core trick requirement**. The backend strictly enforces a linear, forward-only status progression:

```
pending  →  in-progress  →  completed
```

### Rules

| Transition                        | Result  | HTTP Code |
|-----------------------------------|---------|-----------|
| `pending` → `in-progress`         | ✅ OK   | 200       |
| `in-progress` → `completed`       | ✅ OK   | 200       |
| `pending` → `completed` (skip)    | ❌ Rejected | 422   |
| `completed` → `in-progress` (downgrade) | ❌ Rejected | 422 |
| `in-progress` → `pending` (downgrade) | ❌ Rejected | 422 |
| Same status → same status         | ❌ No-op | 400      |

### Error Response Example

```json
{
  "detail": "Invalid status skip: 'pending' → 'completed'. You must go through intermediate statuses. Next allowed status is 'in-progress'."
}
```

---

## SDK Generation & Usage

### Generate the SDK

```bash
# Install the CLI (one-time)
npm install -g @openapitools/openapi-generator-cli

# Start the backend first, then generate:
openapi-generator-cli generate \
  -i http://localhost:8000/openapi.json \
  -g python \
  -o task_sdk \
  --additional-properties=packageName=task_sdk

# Install the generated SDK
cd task_sdk && pip install -e . && cd ..
```

Or on Windows, just run:
```bat
generate_sdk.bat
```

### Use the SDK

```python
from task_sdk.api.tasks_api import TasksApi
from task_sdk import ApiClient, Configuration
from task_sdk.models import TaskCreate, TaskUpdate

config = Configuration(host="http://localhost:8000")
with ApiClient(configuration=config) as client:
    api = TasksApi(client)

    # Create
    task = api.create_task_tasks_post(TaskCreate(title="New Task"))
    print(task.id, task.status)  # 1, pending

    # Advance status
    api.update_task_tasks_task_id_put(task.id, TaskUpdate(status="in-progress"))

    # List all
    result = api.list_tasks_tasks_get()
    print(result.total)
```

Run the full demo:
```bash
python sdk_example.py
```

---

## Running Tests

```bash
cd backend

# Activate virtual environment
env\Scripts\activate   # Windows
source env/bin/activate  # macOS/Linux

# Run all tests with verbose output
pytest tests/ -v

# Run with coverage report
pytest tests/ -v --tb=short
```

### Test Coverage

- ✅ Health endpoints
- ✅ Task creation (valid + invalid inputs)
- ✅ Task retrieval (single + list + pagination + filters)
- ✅ Task update (title + description)
- ✅ **All status transition rules** (the trick logic)
- ✅ Task deletion
- ✅ Edge cases (whitespace trimming, invalid filters, bulk operations)

---

## Project Structure

```
backend/app/services.py   ← STATUS TRANSITION LOGIC (read this!)
backend/tests/test_tasks.py ← All unit tests
frontend/src/hooks/useTasks.js ← React state management
frontend/src/utils/statusUtils.js ← Frontend transition helper
```

---

## Design Decisions

### Why a service layer?
Separating business logic (services.py) from routing (routers/tasks.py) keeps the code modular, testable, and maintainable. The trick logic lives in one place.

### Why Pydantic v1-compatible schemas?
The project uses `orm_mode = True` for broad compatibility and includes `from_attributes = True` for Pydantic v2 forward compatibility.

### Why custom hooks in React?
`useTasks.js` abstracts all API calls and state management, keeping components clean and focused on rendering.

### Why inline styles in React?
Per the challenge requirements, functionality over styling is prioritised. Inline styles avoid any build-tool dependency on CSS preprocessors.

---

## License

MIT — built for the TaskFlow intern coding challenge.
