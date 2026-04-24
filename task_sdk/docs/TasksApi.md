# task_sdk.TasksApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_task_tasks_post**](TasksApi.md#create_task_tasks_post) | **POST** /tasks/ | Create a new task
[**delete_task_tasks_task_id_delete**](TasksApi.md#delete_task_tasks_task_id_delete) | **DELETE** /tasks/{task_id} | Delete a task
[**get_task_tasks_task_id_get**](TasksApi.md#get_task_tasks_task_id_get) | **GET** /tasks/{task_id} | Retrieve a specific task
[**list_tasks_tasks_get**](TasksApi.md#list_tasks_tasks_get) | **GET** /tasks/ | Retrieve all tasks
[**update_task_tasks_task_id_put**](TasksApi.md#update_task_tasks_task_id_put) | **PUT** /tasks/{task_id} | Update a task


# **create_task_tasks_post**
> TaskResponse create_task_tasks_post(task_create)

Create a new task

Create a new task.

- **title**: Required. Max 255 characters.
- **description**: Optional.
- **status**: Always starts as `pending` (enforced by server).

### Example


```python
import task_sdk
from task_sdk.models.task_create import TaskCreate
from task_sdk.models.task_response import TaskResponse
from task_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = task_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with task_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = task_sdk.TasksApi(api_client)
    task_create = task_sdk.TaskCreate() # TaskCreate | 

    try:
        # Create a new task
        api_response = api_instance.create_task_tasks_post(task_create)
        print("The response of TasksApi->create_task_tasks_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TasksApi->create_task_tasks_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **task_create** | [**TaskCreate**](TaskCreate.md)|  | 

### Return type

[**TaskResponse**](TaskResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Task created successfully |  -  |
**400** | Validation error (e.g., invalid initial status) |  -  |
**422** | Request body validation failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_task_tasks_task_id_delete**
> object delete_task_tasks_task_id_delete(task_id)

Delete a task

Delete a task by its ID.
Returns **404** if the task does not exist.

### Example


```python
import task_sdk
from task_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = task_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with task_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = task_sdk.TasksApi(api_client)
    task_id = 56 # int | 

    try:
        # Delete a task
        api_response = api_instance.delete_task_tasks_task_id_delete(task_id)
        print("The response of TasksApi->delete_task_tasks_task_id_delete:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TasksApi->delete_task_tasks_task_id_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **task_id** | **int**|  | 

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Task deleted |  -  |
**404** | Task not found |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_task_tasks_task_id_get**
> TaskResponse get_task_tasks_task_id_get(task_id)

Retrieve a specific task

Retrieve a single task by its ID.
Returns **404** if the task does not exist.

### Example


```python
import task_sdk
from task_sdk.models.task_response import TaskResponse
from task_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = task_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with task_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = task_sdk.TasksApi(api_client)
    task_id = 56 # int | 

    try:
        # Retrieve a specific task
        api_response = api_instance.get_task_tasks_task_id_get(task_id)
        print("The response of TasksApi->get_task_tasks_task_id_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TasksApi->get_task_tasks_task_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **task_id** | **int**|  | 

### Return type

[**TaskResponse**](TaskResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Task found |  -  |
**404** | Task not found |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **list_tasks_tasks_get**
> TaskListResponse list_tasks_tasks_get(skip=skip, limit=limit, status=status)

Retrieve all tasks

Retrieve all tasks with optional filtering and pagination.

- **status**: Filter by task status (`pending`, `in-progress`, `completed`).
- **skip**: Pagination offset.
- **limit**: Max records (1–500).

### Example


```python
import task_sdk
from task_sdk.models.task_list_response import TaskListResponse
from task_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = task_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with task_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = task_sdk.TasksApi(api_client)
    skip = 0 # int | Number of records to skip (pagination) (optional) (default to 0)
    limit = 100 # int | Max records to return (optional) (default to 100)
    status = 'status_example' # str | Filter by status: pending | in-progress | completed (optional)

    try:
        # Retrieve all tasks
        api_response = api_instance.list_tasks_tasks_get(skip=skip, limit=limit, status=status)
        print("The response of TasksApi->list_tasks_tasks_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TasksApi->list_tasks_tasks_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **skip** | **int**| Number of records to skip (pagination) | [optional] [default to 0]
 **limit** | **int**| Max records to return | [optional] [default to 100]
 **status** | **str**| Filter by status: pending | in-progress | completed | [optional] 

### Return type

[**TaskListResponse**](TaskListResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | List of tasks returned successfully |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update_task_tasks_task_id_put**
> TaskResponse update_task_tasks_task_id_put(task_id, task_update)

Update a task

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

### Example


```python
import task_sdk
from task_sdk.models.task_response import TaskResponse
from task_sdk.models.task_update import TaskUpdate
from task_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = task_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with task_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = task_sdk.TasksApi(api_client)
    task_id = 56 # int | 
    task_update = task_sdk.TaskUpdate() # TaskUpdate | 

    try:
        # Update a task
        api_response = api_instance.update_task_tasks_task_id_put(task_id, task_update)
        print("The response of TasksApi->update_task_tasks_task_id_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TasksApi->update_task_tasks_task_id_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **task_id** | **int**|  | 
 **task_update** | [**TaskUpdate**](TaskUpdate.md)|  | 

### Return type

[**TaskResponse**](TaskResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Task updated |  -  |
**400** | No-op status change |  -  |
**404** | Task not found |  -  |
**422** | Invalid status transition (skip or downgrade) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

