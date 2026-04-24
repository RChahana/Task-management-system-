@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   TaskFlow - Starting Application
echo ============================================================
echo.
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo   Frontend : http://localhost:3000
echo.
echo   Press Ctrl+C in each window to stop.
echo ============================================================
echo.

:: ── Start Backend ─────────────────────────────────────────────
echo [1/3] Starting FastAPI backend...
cd backend
if not exist env\Scripts\activate (
    echo [ERROR] Virtual environment not found. Run setupdev.bat first.
    pause & exit /b 1
)
start "TaskFlow Backend" cmd /k "call env\Scripts\activate && python main.py"
cd ..

:: ── Wait for backend to start ─────────────────────────────────
echo [2/3] Waiting for backend to be ready...
timeout /t 4 /nobreak >nul

:: ── Generate SDK (if backend is ready) ────────────────────────
echo [3/3] Generating Python SDK from live OpenAPI schema...
call openapi-generator-cli version >nul 2>&1
if %errorlevel% equ 0 (
    call openapi-generator-cli generate ^
        -i http://localhost:8000/openapi.json ^
        -g python ^
        -o task_sdk ^
        --additional-properties=packageName=task_sdk ^
        --log-to-stderr 2>nul
    echo [OK]  SDK generated in .\task_sdk\
    echo [INFO] Install it with: cd task_sdk ^&^& pip install -e .
) else (
    echo [WARN] openapi-generator-cli not found. Run setupdev.bat to install it.
)

:: ── Start Frontend ────────────────────────────────────────────
echo [INFO] Starting React frontend...
cd frontend
start "TaskFlow Frontend" cmd /k "npm start"
cd ..

echo.
echo ============================================================
echo   Both servers are starting. Opening browser shortly...
echo ============================================================
timeout /t 8 /nobreak >nul
start http://localhost:3000

echo.
echo Press any key to exit this launcher (servers continue running).
pause >nul
