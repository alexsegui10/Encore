@echo off
REM Script para iniciar todos los servidores de Encore
echo.
echo ========================================
echo   ENCORE - Iniciando todos los servidores
echo ========================================
echo.

REM Iniciar Stripe CLI Webhook Listener
echo [1/5] Iniciando Stripe CLI Webhook Listener...
start "Stripe Webhook" cmd /k "cd /d %~dp0admin_server && stripe listen --forward-to localhost:3000/webhook"
timeout /t 3 /nobreak >nul

REM Iniciar Admin Server (Puerto 3000)
echo [2/5] Iniciando Admin Server en puerto 3000...
start "Admin Server (3000)" cmd /k "cd /d %~dp0admin_server && npm run dev"
timeout /t 2 /nobreak >nul

REM Iniciar Booking Client (Puerto 4000)
echo [3/5] Iniciando Booking Client en puerto 4000...
start "Booking Client (4000)" cmd /k "cd /d %~dp0booking_client && npm run dev"
timeout /t 2 /nobreak >nul

REM Iniciar Enterprise Server (Puerto 5000, 5001, 5002, 5003)
echo [4/5] Iniciando Enterprise Server (5000-5003)...
start "Enterprise Server (5000-5003)" cmd /k "cd /d %~dp0enterprise_server && npm run start:all"
timeout /t 5 /nobreak >nul

REM Iniciar Frontend Angular (Puerto 4200)
echo [5/5] Iniciando Frontend Angular en puerto 4200...
start "Frontend Angular (4200)" cmd /k "cd /d %~dp0frontend && ng serve"

echo.
echo ========================================
echo   SERVIDORES INICIADOS
echo ========================================
echo.
echo   Admin Server:       http://localhost:3000
echo   Booking Client:     http://localhost:4000
echo   Enterprise Gateway: http://localhost:5000
echo   Frontend Angular:   http://localhost:4200
echo.
echo   Presiona cualquier tecla para cerrar esta ventana...
pause >nul
