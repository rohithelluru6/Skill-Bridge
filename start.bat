@echo off
echo ========================================================
echo Starting Skill Bridge Full-Stack Application
echo ========================================================
echo.
echo Launching unified server on http://localhost:8000 ...
echo (Serves both the FastAPI REST API and React SPA frontend)
echo.
echo Interactive Swagger Docs: http://localhost:8000/docs
echo Demo Student: student@skillbridge.edu / password123
echo Demo Admin: admin@skillbridge.edu / admin123
echo.
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
