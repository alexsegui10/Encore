# Script para iniciar la aplicación Encore con Docker Compose
Write-Host "🐳 Iniciando Encore con Docker..." -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker está corriendo
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker no está corriendo. Por favor inicia Docker Desktop." -ForegroundColor Red
    Write-Host "   Presiona cualquier tecla para salir..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
Write-Host "✅ Docker está corriendo" -ForegroundColor Green
Write-Host ""

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No se encontró el archivo .env" -ForegroundColor Yellow
    Write-Host "   Creando .env desde .env.example..." -ForegroundColor Gray
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado. Por favor revisa las configuraciones." -ForegroundColor Green
    Write-Host ""
}

# Detener contenedores existentes
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down 2>$null
Write-Host ""

# Construir e iniciar los contenedores
Write-Host "🏗️  Construyendo e iniciando contenedores..." -ForegroundColor Cyan
Write-Host "   Esto puede tomar varios minutos la primera vez..." -ForegroundColor Gray
Write-Host ""

docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Todos los servicios están iniciando..." -ForegroundColor Green
    Write-Host ""
    Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    Write-Host ""
    Write-Host "📍 URLs de los servicios:" -ForegroundColor Cyan
    Write-Host "   🔹 Frontend:           http://localhost:4200" -ForegroundColor Blue
    Write-Host "   🔹 Admin Server:       http://localhost:3003" -ForegroundColor Magenta
    Write-Host "   🔹 Booking Client:     http://localhost:4000" -ForegroundColor Yellow
    Write-Host "   🔹 Enterprise Server:  http://localhost:3001" -ForegroundColor Green
    Write-Host "   🔹 MongoDB:            mongodb://localhost:27017" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Ver logs en tiempo real:" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🛑 Detener servicios:" -ForegroundColor Cyan
    Write-Host "   docker-compose down" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✨ ¡Todo listo! La aplicación está corriendo." -ForegroundColor Green
    Write-Host ""
    
    # Preguntar si quiere ver los logs
    $response = Read-Host "¿Deseas ver los logs en tiempo real? (s/n)"
    if ($response -eq 's' -or $response -eq 'S') {
        docker-compose logs -f
    }
} else {
    Write-Host ""
    Write-Host "❌ Error al iniciar los contenedores" -ForegroundColor Red
    Write-Host "   Revisa los logs con: docker-compose logs" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

