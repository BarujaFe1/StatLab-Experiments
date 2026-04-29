@echo off
echo Checking StatLab environment...

:: Check for backend virtual environment
if not exist "backend\venv" (
    echo Virtual environment not found. Creating it...
    python -m venv backend\venv
    echo Installing dependencies...
    call "backend\venv\Scripts\activate"
    pip install fastapi uvicorn scipy statsmodels pytest pydantic fastapi-cors
)

echo Starting StatLab Experiments...

start "Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload"
start "Frontend" cmd /k "cd frontend && npm run dev"

echo StatLab started. Opening browser...
timeout /t 5 >nul
start http://localhost:3000
