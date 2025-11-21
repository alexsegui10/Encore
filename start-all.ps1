# Script para iniciar todos los servidores de Encore
Write-Host "🚀 Iniciando todos los servidores de Encore..." -ForegroundColor Cyan
Write-Host ""

# Función para iniciar un servidor en una nueva ventana de PowerShell
function Start-Server {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color
    )
    
    Write-Host "▶️  Iniciando $Name..." -ForegroundColor $Color
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; Write-Host '🟢 $Name' -ForegroundColor $Color; $Command"
    Start-Sleep -Seconds 2
}

# Iniciar Admin Server (Puerto 3000)
Start-Server -Name "Admin Server" -Path "$PSScriptRoot\admin_server" -Command "npm run dev" -Color "Magenta"

# Iniciar Booking Client (Puerto 4000)
Start-Server -Name "Booking Client" -Path "$PSScriptRoot\booking_client" -Command "npm run dev" -Color "Yellow"

# Iniciar Enterprise Server (Puerto 5000, 5001, 5002, 5003)
Start-Server -Name "Enterprise Server" -Path "$PSScriptRoot\enterprise_server" -Command "npm run start:all" -Color "Green"

# Esperar un poco para que los servidores backend inicien
Write-Host ""
Write-Host "⏳ Esperando a que los servidores backend inicien..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Iniciar Frontend Angular (Puerto 4200)
Start-Server -Name "Frontend Angular" -Path "$PSScriptRoot\frontend" -Command "ng serve" -Color "Blue"

Write-Host ""
Write-Host "✅ Todos los servidores están iniciando..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs de los servidores:" -ForegroundColor Cyan
Write-Host "   🔹 Admin Server:      http://localhost:3000" -ForegroundColor Magenta
Write-Host "   🔹 Booking Client:    http://localhost:4000" -ForegroundColor Yellow
Write-Host "   🔹 Enterprise Gateway: http://localhost:5000" -ForegroundColor Green
Write-Host "   🔹 Frontend Angular:   http://localhost:4200" -ForegroundColor Blue
Write-Host ""
Write-Host "💡 Presiona Ctrl+C en cada ventana para detener los servidores" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ ¡Listo! Todos los servidores están corriendo." -ForegroundColor Green
