@echo off
echo ===================================================
echo             Starting QuoteCraft SaaS
echo ===================================================

:: Start exploring the backend in a new terminal window
echo Starting Django Backend Server...
start "QuoteCraft Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && python manage.py runserver"

:: Start the frontend in a new terminal window
echo Starting React/Vite Frontend Server...
start "QuoteCraft Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are booting up in separate windows!
echo The backend runs on http://localhost:8000
echo The frontend runs on http://localhost:5173
echo.
echo This window will close in 5 seconds.
timeout /t 5 /nobreak >nul
exit
