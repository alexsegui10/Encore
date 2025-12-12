@echo off
REM Script para iniciar la aplicación Encore sin Docker
echo.
echo ========================================
echo   ENCORE - Inicio Local
echo ========================================
echo.

REM Verificar que existe el archivo .env
if not exist ".env" (
    echo [1/2] Creando archivo .env desde .env.example...
    copy .env.example .env >nul
    echo OK: Archivo .env creado
    echo.
) else (
    echo [1/2] Archivo .env encontrado
    echo.
)

REM Iniciar servicios en ventanas separadas
echo [2/2] Iniciando servicios...
echo.

echo Iniciando Booking Client en el puerto 4000...
start "Booking Client" powershell -NoExit -Command "cd '%CD%\booking_client'; npm run dev"
timeout /t 2 /nobreak >nul

echo Iniciando Admin Server en el puerto 3003...
start "Admin Server" powershell -NoExit -Command "cd '%CD%\admin_server'; npm run dev"
timeout /t 2 /nobreak >nul

echo Iniciando Enterprise Server en el puerto 3001...
start "Enterprise Server" powershell -NoExit -Command "cd '%CD%\enterprise_server'; npm run start:all"
timeout /t 2 /nobreak >nul

echo Iniciando Frontend en el puerto 4200...
start "Frontend Angular" powershell -NoExit -Command "cd '%CD%\frontend'; npm start"

echo.
echo ========================================
echo   SERVICIOS INICIADOS
echo ========================================
echo.
echo Se han abierto 4 ventanas de terminal:
echo.
echo   1. Booking Client   - http://localhost:4000
echo   2. Admin Server     - http://localhost:3003
echo   3. Enterprise Server- http://localhost:3001
echo   4. Frontend Angular - http://localhost:4200
echo.
echo IMPORTANTE:
echo   - MongoDB debe estar corriendo en mongodb://localhost:27017
echo   - Espera 1-2 minutos para que todos los servicios inicien
echo   - Para detener, cierra cada ventana de terminal
echo.
echo   Presiona cualquier tecla para salir...
pause >nul
