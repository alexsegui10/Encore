# Encore Docker Management Script
# Uso: .\docker-manager.ps1 [comando]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "`n🐳 Encore - Gestión de Docker`n" -ForegroundColor Cyan
    Write-Host "Comandos disponibles:" -ForegroundColor Yellow
    Write-Host "  up            - Levantar todos los servicios" -ForegroundColor Green
    Write-Host "  down          - Detener todos los servicios" -ForegroundColor Green
    Write-Host "  restart       - Reiniciar todos los servicios" -ForegroundColor Green
    Write-Host "  build         - Construir todas las imágenes" -ForegroundColor Green
    Write-Host "  rebuild       - Reconstruir todo desde cero" -ForegroundColor Green
    Write-Host "  logs          - Ver logs de todos los servicios" -ForegroundColor Green
    Write-Host "  ps            - Ver estado de contenedores" -ForegroundColor Green
    Write-Host "  clean         - Limpiar todo (⚠️ borra datos)" -ForegroundColor Green
    Write-Host "  dev           - Solo bases de datos (modo desarrollo)" -ForegroundColor Green
    Write-Host "  mongo         - Conectar a MongoDB shell" -ForegroundColor Green
    Write-Host "  mysql         - Conectar a MySQL shell" -ForegroundColor Green
    Write-Host "  help          - Mostrar esta ayuda`n" -ForegroundColor Green
}

function Start-Services {
    Write-Host "🚀 Levantando servicios..." -ForegroundColor Cyan
    docker-compose up -d
    Write-Host "✅ Servicios iniciados" -ForegroundColor Green
    Write-Host "Frontend: http://localhost" -ForegroundColor Yellow
    Write-Host "Admin API: http://localhost:3000" -ForegroundColor Yellow
    Write-Host "Booking API: http://localhost:4000" -ForegroundColor Yellow
}

function Stop-Services {
    Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Cyan
    docker-compose down
    Write-Host "✅ Servicios detenidos" -ForegroundColor Green
}

function Restart-Services {
    Write-Host "🔄 Reiniciando servicios..." -ForegroundColor Cyan
    docker-compose restart
    Write-Host "✅ Servicios reiniciados" -ForegroundColor Green
}

function Build-Services {
    Write-Host "🔨 Construyendo imágenes..." -ForegroundColor Cyan
    docker-compose build
    Write-Host "✅ Imágenes construidas" -ForegroundColor Green
}

function Rebuild-All {
    Write-Host "🔨 Reconstruyendo todo desde cero..." -ForegroundColor Cyan
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    Write-Host "✅ Reconstrucción completada" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "📋 Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Cyan
    docker-compose logs -f
}

function Show-Status {
    Write-Host "📊 Estado de contenedores:`n" -ForegroundColor Cyan
    docker-compose ps
}

function Clean-All {
    Write-Host "⚠️  ADVERTENCIA: Esto eliminará todos los datos" -ForegroundColor Red
    $confirm = Read-Host "¿Estás seguro? (s/N)"
    if ($confirm -eq "s" -or $confirm -eq "S") {
        Write-Host "🧹 Limpiando..." -ForegroundColor Cyan
        docker-compose down -v
        docker image prune -f
        docker container prune -f
        Write-Host "✅ Limpieza completada" -ForegroundColor Green
    } else {
        Write-Host "❌ Operación cancelada" -ForegroundColor Yellow
    }
}

function Start-Dev {
    Write-Host "🔧 Iniciando modo desarrollo (solo bases de datos)..." -ForegroundColor Cyan
    docker-compose up -d mongo mongo-init mysql
    Write-Host "✅ Bases de datos iniciadas" -ForegroundColor Green
    Write-Host "MongoDB: mongodb://admin:admin123@localhost:27017" -ForegroundColor Yellow
    Write-Host "MySQL: mysql://enterprise:enterprise123@localhost:3306/enterprise_db" -ForegroundColor Yellow
}

function Connect-Mongo {
    Write-Host "🍃 Conectando a MongoDB..." -ForegroundColor Cyan
    docker-compose exec mongo mongosh -u admin -p admin123 --authenticationDatabase admin
}

function Connect-MySQL {
    Write-Host "🐬 Conectando a MySQL..." -ForegroundColor Cyan
    docker-compose exec mysql mysql -u enterprise -penterprise123 enterprise_db
}

# Router de comandos
switch ($Command.ToLower()) {
    "up"      { Start-Services }
    "down"    { Stop-Services }
    "restart" { Restart-Services }
    "build"   { Build-Services }
    "rebuild" { Rebuild-All }
    "logs"    { Show-Logs }
    "ps"      { Show-Status }
    "clean"   { Clean-All }
    "dev"     { Start-Dev }
    "mongo"   { Connect-Mongo }
    "mysql"   { Connect-MySQL }
    "help"    { Show-Help }
    default   { 
        Write-Host "❌ Comando desconocido: $Command" -ForegroundColor Red
        Show-Help 
    }
}
