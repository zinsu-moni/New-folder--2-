@echo off
echo.
echo ===== Affluence API Backend Health Check =====
echo.

REM Check if Python virtual environment is activated
if NOT "%VIRTUAL_ENV%" == "" (
    echo Using Python virtual environment: %VIRTUAL_ENV%
) else (
    echo Virtual environment not activated, attempting to activate...
    if exist venv\Scripts\activate.bat (
        call venv\Scripts\activate.bat
        echo Virtual environment activated
    ) else (
        echo Warning: Virtual environment not found. Using system Python.
    )
)

REM Ensure dependencies are installed
echo Checking required packages...
pip install fastapi uvicorn httpx colorama

REM Start backend server
echo.
echo Starting backend server...
start cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak

REM Test connection
echo.
echo Testing API connection...
python check_backend_api.py

echo.
echo ===== Backend started successfully =====
echo.
echo You can now open login.html or any other page in your browser.
echo.
echo Press any key to exit this script...
pause > nul