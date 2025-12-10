# Encore - Makefile para Docker

.PHONY: help build up down restart logs clean

help: ## Mostrar esta ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Construir todas las imágenes
	docker-compose build

up: ## Levantar todos los servicios
	docker-compose up -d

down: ## Detener todos los servicios
	docker-compose down

restart: ## Reiniciar todos los servicios
	docker-compose restart

logs: ## Ver logs de todos los servicios
	docker-compose logs -f

logs-booking: ## Ver logs de booking_client
	docker-compose logs -f booking_client

logs-admin: ## Ver logs de admin_server
	docker-compose logs -f admin_server

logs-frontend: ## Ver logs de frontend
	docker-compose logs -f frontend

logs-mongo: ## Ver logs de MongoDB
	docker-compose logs -f mongo

ps: ## Ver estado de contenedores
	docker-compose ps

clean: ## Limpiar contenedores, volúmenes e imágenes
	docker-compose down -v
	docker image prune -f
	docker container prune -f

rebuild: ## Reconstruir y levantar todo
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

mongo-shell: ## Conectar a MongoDB shell
	docker-compose exec mongo mongosh -u admin -p admin123 --authenticationDatabase admin

mysql-shell: ## Conectar a MySQL shell
	docker-compose exec mysql mysql -u enterprise -penterprise123 enterprise_db

prisma-generate: ## Regenerar Prisma Client en admin_server
	docker-compose exec admin_server npx prisma generate
	docker-compose restart admin_server

dev: ## Modo desarrollo (solo bases de datos)
	docker-compose up -d mongo mongo-init mysql

stop-dev: ## Detener bases de datos
	docker-compose stop mongo mongo-init mysql
