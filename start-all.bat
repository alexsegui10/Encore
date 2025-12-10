@echo off
REM Script para iniciar la aplicación Encore con Docker
echo.
echo ========================================
echo   ENCORE - Docker Compose
echo ========================================
echo.

REM Verificar que Docker está corriendo
echo [1/4] Verificando Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta corriendo.
    echo Por favor inicia Docker Desktop.
    echo.
    pause
    exit /b 1
)
echo OK: Docker esta corriendo
echo.

REM Verificar que existe el archivo .env
if not exist ".env" (
    echo [2/4] Creando archivo .env desde .env.example...
    copy .env.example .env
    echo OK: Archivo .env creado
    echo.
) else (
    echo [2/4] Archivo .env encontrado
    echo.
)

REM Detener contenedores existentes
echo [3/4] Deteniendo contenedores existentes...
docker-compose down >nul 2>&1
echo.

REM Construir e iniciar los contenedores
echo [4/4] Construyendo e iniciando contenedores...
echo Esto puede tomar varios minutos la primera vez...
echo.
docker-compose up --build -d

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SERVICIOS INICIADOS
    echo ========================================
    echo.
    echo   Frontend:           http://localhost:4200
    echo   Admin Server:       http://localhost:3003
    echo   Booking Client:     http://localhost:4000
    echo   Enterprise Server:  http://localhost:3001
    echo   MongoDB:            mongodb://localhost:27017
    echo.
    echo   Ver logs:           docker-compose logs -f
    echo   Detener:            docker-compose down
    echo.
    echo   Presiona cualquier tecla para salir...
    pause >nul
) else (
    echo.
    echo ERROR: No se pudieron iniciar los contenedores
    echo Revisa los logs con: docker-compose logs
    echo.
    pause
    exit /b 1
)

