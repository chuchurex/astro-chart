#!/bin/bash

# ============================================
# DEV-LOCAL.SH - Desarrollo local con Live Reload
# ============================================
# Resuelve el problema de no ver cambios en HTML/CSS/JS
# usando browser-sync para auto-refrescar el navegador
#
# Uso: ./dev-local.sh
# ============================================

set -e

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   Chuchurex Astral - Dev Environment       ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# ============================================
# Verificar dependencias
# ============================================

echo -e "${CYAN}Verificando dependencias...${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "   Instala Node.js desde https://nodejs.org/"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Node.js $(node --version)"

# Verificar/instalar browser-sync
if ! command -v browser-sync &> /dev/null; then
    echo -e "${YELLOW}⚠ browser-sync no encontrado, instalando...${NC}"
    npm install -g browser-sync
fi
echo -e "  ${GREEN}✓${NC} browser-sync instalado"

# Verificar SASS (opcional)
if command -v sass &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} SASS disponible"
    HAS_SASS=true
else
    echo -e "  ${YELLOW}⚠${NC} SASS no instalado (CSS no se compilará automáticamente)"
    HAS_SASS=false
fi

# ============================================
# Limpiar procesos anteriores
# ============================================

echo ""
echo -e "${CYAN}Limpiando procesos anteriores...${NC}"
pkill -f "browser-sync" 2>/dev/null || true
pkill -f "sass --watch" 2>/dev/null || true
sleep 1

# ============================================
# Configuración
# ============================================

# Puerto para el servidor local
PORT=3000

# API backend (producción o local)
# Cambiar a http://localhost:8001 si ejecutas el backend localmente
API_URL="https://api.astro.chuchurex.cl"

# Archivos a observar para live-reload
WATCH_FILES="*.html,*.css,*.js,about/*.html,i18n/*.json"

# ============================================
# Iniciar SASS watcher (si está disponible)
# ============================================

if [ "$HAS_SASS" = true ]; then
    echo ""
    echo -e "${CYAN}Iniciando SASS watcher...${NC}"
    sass --watch scss/main.scss:styles.css --style compressed 2>/dev/null &
    SASS_PID=$!
    echo -e "  ${GREEN}✓${NC} SASS watching scss/main.scss"
fi

# ============================================
# Iniciar browser-sync
# ============================================

echo ""
echo -e "${CYAN}Iniciando servidor con live-reload...${NC}"
echo ""

# browser-sync con configuración optimizada
browser-sync start \
    --server \
    --port $PORT \
    --files "$WATCH_FILES" \
    --no-notify \
    --no-open \
    --ignore "node_modules" \
    --ignore ".git" \
    --ignore "venv" \
    --ignore "*.py" \
    --ignore "*.pyc" \
    --reload-delay 100 \
    --reload-debounce 200 &

BS_PID=$!

# Esperar a que browser-sync inicie
sleep 2

# ============================================
# Información de uso
# ============================================

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Entorno de desarrollo listo!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Frontend:${NC}  http://localhost:$PORT"
echo -e "  ${CYAN}API:${NC}       $API_URL"
echo ""
echo -e "  ${YELLOW}Live Reload activo para:${NC}"
echo "    • HTML (*.html)"
echo "    • CSS  (*.css)"
echo "    • JS   (*.js)"
echo "    • i18n (i18n/*.json)"
echo ""
if [ "$HAS_SASS" = true ]; then
echo -e "  ${YELLOW}SASS:${NC} scss/main.scss → styles.css"
echo ""
fi
echo -e "  Presiona ${RED}Ctrl+C${NC} para detener"
echo ""

# Abrir navegador
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:$PORT"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:$PORT"
fi

# ============================================
# Manejar Ctrl+C
# ============================================

cleanup() {
    echo ""
    echo -e "${YELLOW}Deteniendo servicios...${NC}"
    kill $BS_PID 2>/dev/null || true
    [ "$HAS_SASS" = true ] && kill $SASS_PID 2>/dev/null || true
    echo -e "${GREEN}✓ Limpieza completada${NC}"
    exit 0
}

trap cleanup INT TERM

# Esperar
wait $BS_PID
