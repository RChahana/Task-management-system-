@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   TaskFlow - Development Environment Setup
echo ============================================================
echo.

:: ── Check Python ─────────────────────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo         Download from https://www.python.org/downloads/
    pause & exit /b 1
)
echo [OK] Python found.

:: ── Check Node.js ────────────────────────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Download from https://nodejs.org/
    pause & exit /b 1
)
echo [OK] Node.js found.

:: ── Backend setup ────────────────────────────────────────────
echo.
echo [1/4] Setting up Python virtual environment...
cd backend
python -m venv env
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create virtual environment.
    pause & exit /b 1
)

echo [2/4] Installing Python dependencies...
call env\Scripts\activate
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo [ERROR] pip install failed. Check requirements.txt.
    pause & exit /b 1
)
echo [OK] Python dependencies installed.

echo [3/4] Running database migrations (Alembic)...
alembic upgrade head
if %errorlevel% neq 0 (
    echo [ERROR] Alembic migration failed.
    pause & exit /b 1
)
echo [OK] Database ready.

:: ── Frontend setup ───────────────────────────────────────────
cd ..\frontend
echo.
echo [4/4] Installing Node.js dependencies (this may take a moment)...
call npm install --silent
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause & exit /b 1
)
echo [OK] Frontend dependencies installed.

cd ..

:: ── OpenAPI Generator CLI ────────────────────────────────────
echo.
echo [INFO] Checking for OpenAPI Generator CLI...
call openapi-generator-cli version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing @openapitools/openapi-generator-cli globally...
    call npm install -g @openapitools/openapi-generator-cli --silent
    echo [OK]  openapi-generator-cli installed.
) else (
    echo [OK]  openapi-generator-cli already installed.
)

echo.
echo ============================================================
echo   Setup complete! Run runapplication.bat to start the app.
echo ============================================================
echo.
pause
