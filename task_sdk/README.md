# Task SDK

A Python SDK for the Task Management API, auto-generated from OpenAPI spec.

## Prerequisites

- Python 3.9+
- OpenAPI Generator CLI (install via npm: `npm install -g @openapitools/openapi-generator-cli`)
- Running Task Management backend at `http://localhost:8000`

## Generation

Generate the SDK using the OpenAPI spec from the running backend:

```bash
openapi-generator-cli generate -i http://localhost:8000/openapi.json -g python -o task_sdk --additional-properties=packageName=task_sdk --skip-validate-spec
```

This creates the `task_sdk` directory with the generated code.

## Installation

Install the generated SDK:

```bash
cd task_sdk
pip install -e .
```

## Usage

Import and use the SDK to interact with the API:

```python
from task_sdk import ApiClient
from task_sdk.api.tasks_api import TasksApi

client = ApiClient()
api = TasksApi(client)

# Example: List all tasks
result = api.list_tasks_tasks_get()
print(result)
```

For a complete example, see `sdk_example.py` in the project root.

## API Endpoints

- **Health**: `/health` - Health check
- **Tasks**: `/tasks/` - CRUD operations for tasks

Refer to the generated docs in `docs/` for full details.


## Documentation For Models

 - [HTTPValidationError](docs/HTTPValidationError.md)
 - [LocationInner](docs/LocationInner.md)
 - [TaskCreate](docs/TaskCreate.md)
 - [TaskListResponse](docs/TaskListResponse.md)
 - [TaskResponse](docs/TaskResponse.md)
 - [TaskStatus](docs/TaskStatus.md)
 - [TaskUpdate](docs/TaskUpdate.md)
 - [ValidationError](docs/ValidationError.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization

Endpoints do not require authorization.


## Author




