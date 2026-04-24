"""
SDK Usage Example — Task Management System
==========================================
This script demonstrates how to use the auto-generated Python SDK
(generated via OpenAPI Generator CLI) to interact with the Task API.

HOW TO GENERATE THE SDK
-----------------------
Make sure the backend is running (python main.py), then run:

    npm install -g @openapitools/openapi-generator-cli
    openapi-generator-cli generate \
        -i http://localhost:8000/openapi.json \
        -g python \
        -o task_sdk \
        --additional-properties=packageName=task_sdk

Then install the generated SDK:
    cd task_sdk && pip install -e . && cd ..

USAGE
-----
    python sdk_example.py
"""

import time

try:
    from task_sdk.api.tasks_api import TasksApi
    from task_sdk.api_client import ApiClient
    from task_sdk.configuration import Configuration
    from task_sdk.models import TaskCreate, TaskUpdate
except ImportError:
    print("SDK not yet generated. Run the generation command above first.")
    print("Falling back to raw HTTP requests for demonstration...\n")
    import requests

    BASE_URL = "http://localhost:8000"

    def demo_with_requests():
        print("=== Task Management SDK Demo (raw requests fallback) ===\n")

        # 1. Create task
        resp = requests.post(f"{BASE_URL}/tasks/", json={"title": "SDK Demo Task", "description": "Created via HTTP"})
        task = resp.json()
        print(f"[CREATE] Task #{task['id']}: '{task['title']}' — status: {task['status']}")

        # 2. List all tasks
        resp = requests.get(f"{BASE_URL}/tasks/")
        data = resp.json()
        print(f"[LIST]   Total tasks: {data['total']}")

        # 3. Advance status: pending → in-progress
        task_id = task["id"]
        resp = requests.put(f"{BASE_URL}/tasks/{task_id}", json={"status": "in-progress"})
        updated = resp.json()
        print(f"[UPDATE] Task #{task_id} status: {updated['status']}")

        # 4. Try an INVALID transition (should fail gracefully)
        resp = requests.put(f"{BASE_URL}/tasks/{task_id}", json={"status": "pending"})
        if resp.status_code != 200:
            print(f"[REJECT] Invalid transition caught: {resp.json()['detail']}")

        # 5. Advance to completed
        resp = requests.put(f"{BASE_URL}/tasks/{task_id}", json={"status": "completed"})
        print(f"[UPDATE] Task #{task_id} status: {resp.json()['status']}")

        # 6. Delete
        resp = requests.delete(f"{BASE_URL}/tasks/{task_id}")
        print(f"[DELETE] {resp.json()['message']}")
        print("\n=== Demo complete ===")

    demo_with_requests()
    exit()


def demo_with_sdk():
    """Full SDK demonstration using the generated OpenAPI client."""
    print("=== Task Management SDK Demo ===\n")

    config = Configuration(host="http://localhost:8000")
    with ApiClient(configuration=config) as client:
        api = TasksApi(client)

        # 1. Create a task
        new_task = api.create_task_tasks_post(
            TaskCreate(title="SDK Generated Task", description="Created via OpenAPI SDK")
        )
        print(f"[CREATE] Task #{new_task.id}: '{new_task.title}' — status: {new_task.status}")
        task_id = new_task.id

        # 2. Get all tasks
        all_tasks = api.list_tasks_tasks_get()
        print(f"[LIST]   Total tasks: {all_tasks.total}")

        # 3. Get by ID
        single = api.get_task_tasks_task_id_get(task_id)
        print(f"[GET]    Task #{single.id}: {single.title}")

        # 4. Advance: pending → in-progress
        updated = api.update_task_tasks_task_id_put(
            task_id, TaskUpdate(status="in-progress")
        )
        print(f"[UPDATE] Task #{task_id} advanced to: {updated.status}")

        # 5. Advance: in-progress → completed
        updated = api.update_task_tasks_task_id_put(
            task_id, TaskUpdate(status="completed")
        )
        print(f"[UPDATE] Task #{task_id} advanced to: {updated.status}")

        # 6. Try invalid transition (should raise ApiException)
        try:
            api.update_task_tasks_task_id_put(task_id, TaskUpdate(status="pending"))
        except Exception as e:
            print(f"[REJECT] Invalid transition correctly rejected: {e}")

        # 7. Delete
        result = api.delete_task_tasks_task_id_delete(task_id)
        print(f"[DELETE] {result}")

    print("\n=== Demo complete ===")


if __name__ == "__main__":
    demo_with_sdk()
