#!/bin/bash

# Deploy script para Mapa Natal
# Uso: ./deploy.sh [frontend|backend|all|status]
#
# Infraestructura real:
#   - Frontend: Cloudflare Pages (auto-deploy al hacer push a main).
#               Este script bumpea el cache-buster ?v=, commitea, pushea
#               y purga el cache de Cloudflare.
#   - Backend:  Fly.io, app `mapanatal-api` (ver fly.toml). Deploy con flyctl.

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Directorio del proyecto
PROJECT_DIR=$(dirname "$(realpath "$0")")
cd "$PROJECT_DIR"

FRONTEND_URL="https://mapanatal.org"
API_URL="https://api.mapanatal.org"

deploy_frontend() {
    echo -e "${YELLOW}Desplegando Frontend (Cloudflare Pages)...${NC}"

    # Cache buster con timestamp para JS/CSS versionados
    local cache_version
    cache_version=$(date +%s)
    echo "  Actualizando cache version a ${cache_version}..."

    for html in index.html about/index.html; do
        [ -f "$html" ] || continue
        sed -i.bak -E "s#(styles\.css\?v=)[0-9]+#\1${cache_version}#g; s#(app\.js\?v=)[0-9]+#\1${cache_version}#g" "$html"
        rm -f "${html}.bak"
    done

    # Commit + push: Pages despliega automáticamente al recibir el push
    if [ -n "$(git status --porcelain index.html about/index.html)" ]; then
        git add index.html about/index.html
        git commit -m "chore: bump cache version a ${cache_version}"
    else
        echo "  Sin cambios de versión que commitear."
    fi

    echo "  Pusheando a main (dispara deploy de Pages)..."
    git push origin main

    # Purgar cache de Cloudflare (el script carga .env solo)
    if [ -x ./purge-cache.sh ]; then
        ./purge-cache.sh || echo -e "${YELLOW}  Aviso: no se pudo purgar el cache automáticamente.${NC}"
    fi

    echo -e "${GREEN}Frontend desplegado en ${FRONTEND_URL} (v=${cache_version})${NC}"
}

deploy_backend() {
    echo -e "${YELLOW}Desplegando Backend (Fly.io: mapanatal-api)...${NC}"

    if ! command -v flyctl >/dev/null 2>&1; then
        echo -e "${RED}flyctl no está instalado. Instala con: brew install flyctl${NC}"
        return 1
    fi

    flyctl deploy --now

    echo -e "${GREEN}Backend desplegado en ${API_URL}${NC}"
}

check_health() {
    echo -e "${YELLOW}Verificando servicios...${NC}"

    if [ "$(curl -s -o /dev/null -w '%{http_code}' "$FRONTEND_URL")" = "200" ]; then
        echo -e "  Frontend: ${GREEN}OK${NC}"
    else
        echo -e "  Frontend: ${RED}ERROR${NC}"
    fi

    if curl -s "${API_URL}/health" | grep -q '"status":"healthy"'; then
        echo -e "  Backend:  ${GREEN}OK${NC}"
    else
        echo -e "  Backend:  ${RED}ERROR${NC}"
    fi
}

# Main
case "${1:-all}" in
    frontend)
        deploy_frontend
        ;;
    backend)
        deploy_backend
        ;;
    all)
        deploy_frontend
        echo ""
        deploy_backend
        echo ""
        check_health
        ;;
    status)
        check_health
        ;;
    *)
        echo "Uso: $0 [frontend|backend|all|status]"
        echo ""
        echo "  frontend  - Bumpea ?v=, pushea (Pages auto-deploy) y purga cache CF"
        echo "  backend   - Despliega la API a Fly.io (flyctl deploy)"
        echo "  all       - Despliega frontend y backend (default)"
        echo "  status    - Verifica el estado de los servicios"
        exit 1
        ;;
esac
