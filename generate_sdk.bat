@echo off
echo Generating Python SDK from live OpenAPI schema...
echo Make sure the backend is running at http://localhost:8000
echo.
call openapi-generator-cli generate ^
    -i http://localhost:8000/openapi.json ^
    -g python ^
    -o task_sdk ^
    --additional-properties=packageName=task_sdk
echo.
echo SDK generated in .\task_sdk\
echo To install: cd task_sdk ^&^& pip install -e .
echo To run demo: cd .. ^&^& python sdk_example.py
pause
