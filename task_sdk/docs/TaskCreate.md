# TaskCreate

Schema for creating a new task.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **str** | Title of the task | 
**description** | **str** |  | [optional] 
**status** | [**TaskStatus**](TaskStatus.md) | Initial status (must be &#39;pending&#39; for new tasks) | [optional] 

## Example

```python
from task_sdk.models.task_create import TaskCreate

# TODO update the JSON string below
json = "{}"
# create an instance of TaskCreate from a JSON string
task_create_instance = TaskCreate.from_json(json)
# print the JSON string representation of the object
print(TaskCreate.to_json())

# convert the object into a dict
task_create_dict = task_create_instance.to_dict()
# create an instance of TaskCreate from a dict
task_create_from_dict = TaskCreate.from_dict(task_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


