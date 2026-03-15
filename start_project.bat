REM Also close PowerShell windows with matching titles
taskkill /FI "WINDOWTITLE eq Laravel Backend" /FI "IMAGENAME eq powershell.exe" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend Dev" /FI "IMAGENAME eq powershell.exe" /F >nul 2>&1
REM ===============================
REM Usage Instructions:
REM 1. Open a terminal or file explorer in c:\vscode_project (project root).
REM 2. Double-click start_project.bat, or run .\start_project.bat in terminal.
REM 3. This will close any existing backend/frontend terminals and start both servers in new windows.
REM 4. Backend runs on http://localhost:8000, frontend runs on http://localhost:5173.
REM ===============================
@echo off
REM Close all cmd windows titled "Laravel Backend" and "Frontend Dev"
taskkill /FI "WINDOWTITLE eq Laravel Backend" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend Dev" /F >nul 2>&1

REM Start backend server
start "Laravel Backend" cmd /k "cd backend\laravel-real && php artisan serve"

REM Start frontend dev server
start "Frontend Dev" cmd /k "cd frontend && npm run dev"

echo Both servers are restarting in new windows.
pause
