# ✅ Checklist de Producción - Encore Docker

## 🎯 Antes de Desplegar a Producción

### 🔐 Seguridad

- [ ] **Variables de Entorno**
  - [ ] Cambiado `MONGO_INITDB_ROOT_PASSWORD` a valor fuerte
  - [ ] Cambiado `MYSQL_ROOT_PASSWORD` a valor fuerte
  - [ ] Generado nuevo `JWT_SECRET` (32+ caracteres)
  - [ ] Generado nuevo `JWT_REFRESH_SECRET` (32+ caracteres)
  - [ ] Configurado `STRIPE_SECRET_KEY` de producción
  - [ ] Todas las contraseñas son únicas y complejas

- [ ] **Archivo .env**
  - [ ] `.env` está en `.gitignore`
  - [ ] No hay credenciales en código fuente
  - [ ] Usa secretos de variables de entorno del servidor

- [ ] **CORS y API**
  - [ ] CORS configurado solo para dominios específicos
  - [ ] Rate limiting habilitado en APIs
  - [ ] Helmet o headers de seguridad configurados
  - [ ] Validación de entrada en todos los endpoints

- [ ] **Base de Datos**
  - [ ] Conexiones usan TLS/SSL
  - [ ] Usuario de aplicación tiene permisos mínimos (no root)
  - [ ] Backup automático configurado
  - [ ] Logs de auditoría habilitados

- [ ] **Docker**
  - [ ] Imágenes desde registries oficiales
  - [ ] No ejecutar contenedores como root
  - [ ] Escaneo de vulnerabilidades: `docker scan`
  - [ ] Secrets usando Docker Secrets o variables cifradas

---

### 🚀 Performance

- [ ] **Optimización de Imágenes**
  - [ ] Uso de imágenes alpine cuando sea posible
  - [ ] Multi-stage builds implementados
  - [ ] Layers del Dockerfile optimizadas
  - [ ] `.dockerignore` configurado correctamente

- [ ] **Recursos**
  - [ ] Límites de CPU configurados
  - [ ] Límites de memoria configurados
  - [ ] Health checks implementados
  - [ ] Restart policies adecuadas

```yaml
# Ejemplo de límites de recursos
services:
  booking_client:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

- [ ] **Caché y CDN**
  - [ ] Assets estáticos servidos desde CDN
  - [ ] Cache-Control headers configurados
  - [ ] Gzip/Brotli compression habilitado

- [ ] **Base de Datos**
  - [ ] Índices creados en campos de búsqueda
  - [ ] Query optimization realizada
  - [ ] Connection pooling configurado
  - [ ] Slow query log habilitado

---

### 📊 Monitoreo y Logging

- [ ] **Logs**
  - [ ] Logs centralizados (ELK, Loki, CloudWatch)
  - [ ] Rotación de logs configurada
  - [ ] Niveles de log apropiados (no debug en prod)
  - [ ] Structured logging implementado

```yaml
# Ejemplo de límites de logs
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "5"
    labels: "production"
```

- [ ] **Métricas**
  - [ ] Prometheus exporters instalados
  - [ ] Grafana dashboards creados
  - [ ] Alertas configuradas
  - [ ] APM/Tracing implementado (opcional)

- [ ] **Health Checks**
  - [ ] Health check endpoints en todas las APIs
  - [ ] Liveness probes configurados
  - [ ] Readiness probes configurados
  - [ ] Startup probes para servicios lentos

---

### 🔄 CI/CD y Deployment

- [ ] **Pipeline**
  - [ ] Tests automáticos en CI
  - [ ] Build de imágenes en CI
  - [ ] Push a registry privado
  - [ ] Escaneo de seguridad automatizado

- [ ] **Registry**
  - [ ] Uso de registry privado (Docker Hub, AWS ECR, GitHub Container Registry)
  - [ ] Imágenes taggeadas correctamente (no latest en prod)
  - [ ] Cleanup de imágenes antiguas

- [ ] **Deployment**
  - [ ] Zero-downtime deployment strategy
  - [ ] Rollback plan documentado
  - [ ] Blue-green o canary deployment
  - [ ] Database migrations manejadas correctamente

---

### 🌐 Networking

- [ ] **SSL/TLS**
  - [ ] Certificados SSL válidos
  - [ ] HTTPS forzado
  - [ ] HTTP/2 habilitado
  - [ ] Certificados auto-renovables (Let's Encrypt)

- [ ] **Firewall y Seguridad**
  - [ ] Solo puertos necesarios expuestos
  - [ ] Firewall configurado
  - [ ] DDoS protection habilitado
  - [ ] WAF configurado (opcional)

- [ ] **DNS**
  - [ ] Dominio apuntando correctamente
  - [ ] TTL apropiado
  - [ ] Failover DNS configurado

---

### 💾 Backup y Recuperación

- [ ] **Backups**
  - [ ] Backup automático de MongoDB diario
  - [ ] Backup automático de MySQL diario
  - [ ] Backups almacenados fuera del servidor
  - [ ] Retention policy definida

```bash
# Ejemplo de script de backup
#!/bin/bash
# backup-mongo.sh
docker-compose exec -T mongo mongodump \
  --uri="mongodb://admin:admin123@localhost:27017" \
  --authenticationDatabase=admin \
  --out=/backup/$(date +%Y%m%d)

# Subir a S3
aws s3 sync /backup/ s3://my-bucket/encore-backups/
```

- [ ] **Disaster Recovery**
  - [ ] Plan de recuperación documentado
  - [ ] Procedimiento de restore probado
  - [ ] RTO/RPO definidos
  - [ ] Contact list de emergencia

---

### 📝 Documentación

- [ ] **Técnica**
  - [ ] README actualizado
  - [ ] Arquitectura documentada
  - [ ] APIs documentadas (Swagger/OpenAPI)
  - [ ] Runbook de operaciones

- [ ] **Operacional**
  - [ ] Procedimientos de deployment
  - [ ] Troubleshooting guide
  - [ ] Escalation procedures
  - [ ] Contact information

---

### 🧪 Testing

- [ ] **Tests**
  - [ ] Unit tests pasando
  - [ ] Integration tests pasando
  - [ ] E2E tests pasando
  - [ ] Load testing realizado

- [ ] **Environments**
  - [ ] Staging environment setup
  - [ ] Smoke tests en staging
  - [ ] Performance tests en staging
  - [ ] Security tests realizados

---

### 🔧 Configuración Específica de Producción

#### docker-compose.prod.yml

```yaml
version: "3.9"

services:
  mongo:
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"

  booking_client:
    restart: always
    environment:
      NODE_ENV: production
    deploy:
      replicas: 2  # Scale horizontally
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    restart: always
    environment:
      NODE_ENV: production
    labels:
      - "traefik.enable=true"  # Si usas Traefik
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.tls=true"
```

#### Nginx Production Config

```nginx
# frontend/nginx.prod.conf
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

### 🎯 Comandos de Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Build images
docker-compose -f docker-compose.prod.yml build

# 3. Test en staging
docker-compose -f docker-compose.staging.yml up -d
# Ejecutar smoke tests

# 4. Deploy a producción
docker-compose -f docker-compose.prod.yml up -d

# 5. Verificar salud
docker-compose ps
docker-compose logs -f --tail=100

# 6. Monitorear
watch -n 5 'docker stats --no-stream'
```

---

### 📞 Post-Deployment

- [ ] **Verificación**
  - [ ] Todos los servicios corriendo
  - [ ] Health checks pasando
  - [ ] Frontend cargando correctamente
  - [ ] APIs respondiendo

- [ ] **Monitoreo**
  - [ ] Verificar dashboards
  - [ ] Revisar logs por errores
  - [ ] Verificar métricas de performance
  - [ ] Alertas funcionando

- [ ] **Comunicación**
  - [ ] Notificar a stakeholders
  - [ ] Actualizar status page
  - [ ] Documentar cambios
  - [ ] Retrospectiva programada

---

## 🚨 Rollback Plan

Si algo sale mal:

```bash
# 1. Detener servicios problemáticos
docker-compose stop [service_name]

# 2. Revertir a imagen anterior
docker tag encore_booking_client:previous encore_booking_client:latest

# 3. Reiniciar servicio
docker-compose up -d booking_client

# 4. Verificar
docker-compose logs -f booking_client

# 5. Notificar y analizar
```

---

## 📊 KPIs a Monitorear

- Response time (p50, p95, p99)
- Error rate (< 0.1%)
- Uptime (> 99.9%)
- CPU usage (< 70%)
- Memory usage (< 80%)
- Database connections
- Request rate
- Active users

---

✅ **Una vez completado este checklist, tu aplicación está lista para producción!**

🎉 **¡Buena suerte con el deployment!**
