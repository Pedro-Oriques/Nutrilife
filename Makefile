.PHONY: help up down build recreate restart ps logs logs-backend logs-frontend logs-mongo

DC := docker compose

help:
	@echo "Targets:"
	@echo "  make up            - Sobe containers (docker compose up -d)"
	@echo "  make build         - Builda imagens (docker compose build)"
	@echo "  make down          - Derruba stack (docker compose down)"
	@echo "  make recreate      - Apaga containers e sobe novamente (down --volumes + up -d --build)"
	@echo "  make restart       - Reinicia containers (docker compose restart)"
	@echo "  make ps            - Lista containers (docker compose ps)"
	@echo "  make logs          - Logs de todos (docker compose logs -f --tail=200)"
	@echo "  make logs-backend  - Logs do backend"
	@echo "  make logs-frontend - Logs do frontend"
	@echo "  make logs-mongo    - Logs do mongo-bridgeton"

up:
	$(DC) up -d

build:
	$(DC) build

down:
	$(DC) down --remove-orphans

recreate:
	$(DC) down --remove-orphans --volumes
	$(DC) up -d --build

restart:
	$(DC) restart

ps:
	$(DC) ps

logs:
	$(DC) logs -f --tail=200

logs-backend:
	$(DC) logs -f --tail=200 backend

logs-frontend:
	$(DC) logs -f --tail=200 frontend

logs-mongo:
	$(DC) logs -f --tail=200 mongo-bridgeton

