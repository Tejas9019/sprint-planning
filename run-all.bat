@echo off
title Sprint Planning Project Services

echo =========================================
echo Starting Sprint Planning Project Services
echo =========================================

:: 1. Start Java Spring Boot Backend in a new window
echo Starting Spring Boot backend on http://localhost:8080...
cd backend
start "Spring Boot Backend" cmd /k "mvnw.cmd spring-boot:run"
cd ..

:: 2. Start Python AI Service in a new window
echo Starting Python AI service on http://localhost:8000...
cd ai-service
if exist .venv (
    start "Python AI Service" cmd /k "call .venv\Scripts\activate.bat && python run.py"
) else (
    start "Python AI Service" cmd /k "python run.py"
)
cd ..

:: 3. Start Frontend Dev Server in a new window
echo Starting Frontend dev server on http://localhost:5173...
cd frontend
start "Frontend Dev Server" cmd /k "npm run dev"
cd ..

echo =========================================
echo All services have been launched in separate windows.
echo You can close those windows to stop the services.
echo =========================================
pause
