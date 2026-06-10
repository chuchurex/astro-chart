#!/bin/bash

# Deploy script para Carta Astral
# Uso: ./deploy.sh [frontend|backend|all]

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Cargar credenciales
source .env

# Credenciales del servidor VPS
VPS_IP="64.176.12.233"
VPS_USER="root"
VPS_PASS="${VPS_PASS:?Falta VPS_PASS en .env}"

# Directorio del proyecto
PROJECT_DIR=$(dirname "$(realpath "$0")")
cd "$PROJECT_DIR"

# Cache buster con timestamp
CACHE_VERSION=$(date +%s)

deploy_frontend() {
    echo -e "${YELLOW}Desplegando Frontend a BananaHosting...${NC}"

    # Actualizar versión de cache en index.html
    echo "  Actualizando cache version a ${CACHE_VERSION}..."
    sed -i.bak "s/styles.css?v=[0-9]*/styles.css?v=${CACHE_VERSION}/" index.html
    sed -i.bak "s/app.js?v=[0-9]*/app.js?v=${CACHE_VERSION}/" index.html

    # Si no tiene query string, agregarlo
    sed -i.bak 's/href="styles.css"/href="styles.css?v='"${CACHE_VERSION}"'"/' index.html
    sed -i.bak 's/src="app.js"/src="app.js?v='"${CACHE_VERSION}"'"/' index.html

    rm -f index.html.bak

    # Subir archivos via FTP
    echo "  Subiendo index.html..."
    curl -s -T index.html "ftp://${FTP_SERVER}${FTP_SERVER_DIR}/" --user "${FTP_USERNAME}:${FTP_PASSWORD}"

    echo "  Subiendo styles.css..."
    curl -s -T styles.css "ftp://${FTP_SERVER}${FTP_SERVER_DIR}/" --user "${FTP_USERNAME}:${FTP_PASSWORD}"

    echo "  Subiendo app.js..."
    curl -s -T app.js "ftp://${FTP_SERVER}${FTP_SERVER_DIR}/" --user "${FTP_USERNAME}:${FTP_PASSWORD}"

    # Subir about.html si existe
    if [ -f about.html ]; then
        echo "  Subiendo about.html..."
        curl -s -T about.html "ftp://${FTP_SERVER}${FTP_SERVER_DIR}/" --user "${FTP_USERNAME}:${FTP_PASSWORD}"
    fi

    # Crear directorio i18n y subir traducciones
    echo "  Subiendo archivos i18n..."
    curl -s --ftp-create-dirs -T i18n/en.json "ftp://${FTP_SERVER}${FTP_SERVER_DIR}/i18n/" --user "${FTP_USERNAME}:${FTP_PASSWORD}"
    curl -s --ftp-create-dirs -T i18n/es.json "ftp://${FTP_SERVER}${FTP_SERVER_DIR}/i18n/" --user "${FTP_USERNAME}:${FTP_PASSWORD}"
    curl -s --ftp-create-dirs -T i18n/pt.json "ftp://${FTP_SERVER}${FTP_SERVER_DIR}/i18n/" --user "${FTP_USERNAME}:${FTP_PASSWORD}"

    # Subir CSS de impresión
    if [ -f styles/print.css ]; then
        echo "  Subiendo print.css..."
        curl -s --ftp-create-dirs -T styles/print.css "ftp://${FTP_SERVER}${FTP_SERVER_DIR}/styles/" --user "${FTP_USERNAME}:${FTP_PASSWORD}"
    fi

    echo -e "${GREEN}Frontend desplegado en https://chuchurex.cl (v=${CACHE_VERSION})${NC}"
}

deploy_backend() {
    echo -e "${YELLOW}Desplegando Backend a Vultr VPS...${NC}"

    # Sincronizar archivos del backend
    echo "  Subiendo archivos..."
    sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no \
        app.py requirements.txt Dockerfile start.sh interpretations.json \
        "${VPS_USER}@${VPS_IP}:/root/astro-chart/"

    # Reconstruir y reiniciar Docker
    echo "  Reconstruyendo contenedor Docker..."
    sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no "${VPS_USER}@${VPS_IP}" << 'EOF'
        cd /root/astro-chart
        docker build -t astro-api . 2>/dev/null
        docker stop astro-api 2>/dev/null || true
        docker rm astro-api 2>/dev/null || true
        docker run -d --name astro-api -p 8001:8001 -e PORT=8001 --restart unless-stopped astro-api
        echo "Container status:"
        docker ps | grep astro-api
EOF

    echo -e "${GREEN}Backend desplegado en https://api.chuchurex.cl${NC}"
}

check_health() {
    echo -e "${YELLOW}Verificando servicios...${NC}"

    # Check frontend
    if curl -s -o /dev/null -w "%{http_code}" https://chuchurex.cl | grep -q "200"; then
        echo -e "  Frontend: ${GREEN}OK${NC}"
    else
        echo -e "  Frontend: ${RED}ERROR${NC}"
    fi

    # Check backend
    if curl -s https://api.chuchurex.cl/health | grep -q "ok"; then
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
        echo "  frontend  - Despliega solo el frontend (HTML, CSS, JS)"
        echo "  backend   - Despliega solo el backend (API Python)"
        echo "  all       - Despliega frontend y backend (default)"
        echo "  status    - Verifica el estado de los servicios"
        exit 1
        ;;
esac
