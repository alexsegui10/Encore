# Script de Verificación Pre-Docker
# Verifica que todo esté listo antes de ejecutar Docker

Write-Host "`n🔍 Verificando configuración de Docker para Encore...`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# 1. Verificar Docker
Write-Host "Verificando Docker..." -NoNewline
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "  $dockerVersion" -ForegroundColor Gray
    } else {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "  Docker no está instalado o no está en PATH" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "  Error al verificar Docker" -ForegroundColor Red
    $errors++
}

# 2. Verificar Docker Compose
Write-Host "Verificando Docker Compose..." -NoNewline
try {
    $composeVersion = docker-compose --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "  $composeVersion" -ForegroundColor Gray
    } else {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "  Docker Compose no está instalado" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "  Error al verificar Docker Compose" -ForegroundColor Red
    $errors++
}

# 3. Verificar archivo .env
Write-Host "Verificando archivo .env..." -NoNewline
if (Test-Path ".env") {
    Write-Host " ✅" -ForegroundColor Green
    
    # Verificar variables críticas
    $envContent = Get-Content ".env" -Raw
    $criticalVars = @(
        "MONGO_INITDB_ROOT_USERNAME",
        "MONGO_INITDB_ROOT_PASSWORD",
        "MONGO_URI",
        "DATABASE_URL",
        "JWT_SECRET"
    )
    
    foreach ($var in $criticalVars) {
        if ($envContent -notmatch "$var=") {
            Write-Host "  ⚠️  Falta variable: $var" -ForegroundColor Yellow
            $warnings++
        }
    }
} else {
    Write-Host " ⚠️" -ForegroundColor Yellow
    Write-Host "  Archivo .env no encontrado. Ejecuta: cp .env.example .env" -ForegroundColor Yellow
    $warnings++
}

# 4. Verificar estructura de directorios
Write-Host "Verificando estructura de directorios..." -NoNewline
$requiredDirs = @(
    "booking_client",
    "admin_server",
    "enterprise_server",
    "frontend"
)

$missingDirs = @()
foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        $missingDirs += $dir
    }
}

if ($missingDirs.Count -eq 0) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "  Directorios faltantes: $($missingDirs -join ', ')" -ForegroundColor Red
    $errors++
}

# 5. Verificar Dockerfiles
Write-Host "Verificando Dockerfiles..." -NoNewline
$dockerfiles = @(
    "booking_client/Dockerfile",
    "admin_server/Dockerfile",
    "frontend/Dockerfile",
    "enterprise_server/Dockerfile.gateway"
)

$missingDockerfiles = @()
foreach ($file in $dockerfiles) {
    if (-not (Test-Path $file)) {
        $missingDockerfiles += $file
    }
}

if ($missingDockerfiles.Count -eq 0) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "  Dockerfiles faltantes: $($missingDockerfiles -join ', ')" -ForegroundColor Red
    $errors++
}

# 6. Verificar puertos disponibles
Write-Host "Verificando puertos disponibles..." -NoNewline
$requiredPorts = @(80, 3000, 4000, 5000, 27017, 3306)
$busyPorts = @()

foreach ($port in $requiredPorts) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $busyPorts += $port
    }
}

if ($busyPorts.Count -eq 0) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ⚠️" -ForegroundColor Yellow
    Write-Host "  Puertos en uso: $($busyPorts -join ', ')" -ForegroundColor Yellow
    Write-Host "  Esto puede causar conflictos al iniciar los servicios" -ForegroundColor Yellow
    $warnings++
}

# 7. Verificar Docker está corriendo
Write-Host "Verificando Docker daemon..." -NoNewline
try {
    docker ps > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "  Docker daemon no está corriendo. Inicia Docker Desktop" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "  No se puede conectar a Docker" -ForegroundColor Red
    $errors++
}

# Resumen
Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "Resumen de Verificación" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ Todo está listo para ejecutar Docker!" -ForegroundColor Green
    Write-Host "`nEjecuta: docker-compose up -d" -ForegroundColor Yellow
    Write-Host "O usa: .\docker-manager.ps1 up" -ForegroundColor Yellow
} elseif ($errors -eq 0) {
    Write-Host "⚠️  Hay $warnings advertencia(s), pero puedes continuar" -ForegroundColor Yellow
    Write-Host "`nEjecuta: docker-compose up -d" -ForegroundColor Yellow
} else {
    Write-Host "❌ Encontrados $errors error(es) y $warnings advertencia(s)" -ForegroundColor Red
    Write-Host "`nPor favor corrige los errores antes de continuar" -ForegroundColor Red
}

Write-Host ""
