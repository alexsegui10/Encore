# Script de instalación y configuración de microservicios
Write-Host "🚀 Instalando dependencias en todos los microservicios..." -ForegroundColor Cyan

# Gateway
Write-Host "`n📦 Instalando dependencias del Gateway..." -ForegroundColor Yellow
npm install

# Enterprise Service
Write-Host "`n📦 Instalando dependencias de Enterprise Service..." -ForegroundColor Yellow
Set-Location microservices/enterprise-service
npm install
Set-Location ../..

# Product Service
Write-Host "`n📦 Instalando dependencias de Product Service..." -ForegroundColor Yellow
Set-Location microservices/product-service
npm install
Set-Location ../..

# Category Service
Write-Host "`n📦 Instalando dependencias de Category Service..." -ForegroundColor Yellow
Set-Location microservices/category-service
npm install
Set-Location ../..

Write-Host "`n✅ Instalación completada!" -ForegroundColor Green
Write-Host "`n🔧 Generando Prisma Clients..." -ForegroundColor Cyan

# Generar Prisma Client en todos los servicios
npx prisma generate

Set-Location microservices/enterprise-service
npx prisma generate
Set-Location ../..

Set-Location microservices/product-service
npx prisma generate
Set-Location ../..

Set-Location microservices/category-service
npx prisma generate
Set-Location ../..

Write-Host "`n✅ Prisma Clients generados!" -ForegroundColor Green
Write-Host "`n🎉 Todo listo! Puedes iniciar los servicios con:" -ForegroundColor Cyan
Write-Host "   npm run start:all" -ForegroundColor White
