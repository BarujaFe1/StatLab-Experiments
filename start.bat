@echo off
echo Checking StatLab environment...

:: Frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

:: Backend dependencies (api-server)
if exist "api-server\requirements.txt" (
    echo Ensuring backend dependencies...
    pip install -r api-server\requirements.txt -q
)

echo Starting StatLab Experiments (Flask API + Next.js)...

start "Backend (Flask API)" cmd /k "cd api-server && python api/index.py"
start "Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo StatLab started. Opening browser...
timeout /t 6 >nul
start http://localhost:3000
