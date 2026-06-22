#!/bin/bash

# Development script - watches SASS and serves locally
# Usage: ./dev.sh

set -e

echo "🚀 Iniciando entorno de desarrollo..."

# Check if sass is installed
if ! command -v sass &> /dev/null; then
    echo "❌ SASS no está instalado. Instala con: npm install -g sass"
    exit 1
fi

# Kill any existing processes on common ports (|| true: no fallar si no hay match con set -e)
pkill -f "python3 -m http.server" 2>/dev/null || true
pkill -f "sass --watch" 2>/dev/null || true

# Start SASS watcher in background
echo "👀 Iniciando SASS watcher..."
sass --watch scss/main.scss:styles.css --style compressed &
SASS_PID=$!

# Start local server
echo "🌐 Iniciando servidor local en http://localhost:3000"
python3 -m http.server 3000 &
SERVER_PID=$!

# Abrir navegador después de un breve delay
sleep 1 && open "http://localhost:3000" &

echo ""
echo "✅ Entorno de desarrollo listo!"
echo "   - Servidor: http://localhost:3000"
echo "   - SASS: watching scss/main.scss"
echo ""
echo "   Presiona Ctrl+C para detener"

# Handle Ctrl+C (función cleanup: evita expansión temprana de PIDs en el trap)
cleanup() {
    echo ''
    echo '🛑 Deteniendo...'
    kill "$SASS_PID" "$SERVER_PID" 2>/dev/null || true
    exit 0
}
trap cleanup INT

# Wait
wait
