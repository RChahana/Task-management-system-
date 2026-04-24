# TaskResponse

Schema for task responses.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **int** | Unique task identifier | 
**title** | **str** | Title of the task | 
**description** | **str** |  | [optional] 
**status** | **str** | Current task status | 
**created_at** | **datetime** | Timestamp when task was created | 
**updated_at** | **datetime** |  | [optional] 

## Example

```python
from task_sdk.models.task_response import TaskResponse

# TODO update the JSON string below
json = "{}"
# create an instance of TaskResponse from a JSON string
task_response_instance = TaskResponse.from_json(json)
# print the JSON string representation of the object
print(TaskResponse.to_json())

# convert the object into a dict
task_response_dict = task_response_instance.to_dict()
# create an instance of TaskResponse from a dict
task_response_from_dict = TaskResponse.from_dict(task_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


