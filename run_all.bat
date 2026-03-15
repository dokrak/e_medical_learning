@echo off
start "Laravel Backend" cmd /k "cd /d %~dp0backend\laravel-real && php artisan serve"
start "Frontend Dev" cmd /k "cd /d %~dp0frontend && npm run dev"
echo Both servers are starting in new windows.
pause
