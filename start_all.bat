@echo off
echo ========================================
echo   Affluence - Start All Servers
echo ========================================
echo.

echo Starting Backend Server...
start "Affluence Backend" cmd /k "cd backend && run.bat"
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Affluence Frontend" cmd /k "python serve_frontend.py"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo   Backend API: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo   Frontend: http://localhost:5500
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
