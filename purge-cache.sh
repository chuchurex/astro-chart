#!/bin/bash

# Cloudflare Cache Purge Script
# ==============================
# Purga el caché de Cloudflare después de un deploy

set -e

echo "🔄 Purging Cloudflare cache for mapanatal.org..."

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que existan las credenciales
if [ -z "$CF_ZONE_ID" ] || [ -z "$CF_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  CF_ZONE_ID o CF_API_TOKEN no están configurados${NC}"
    echo ""
    echo "Para configurar las credenciales de Cloudflare:"
    echo "1. Ve a https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Crea un token con permisos de 'Cache Purge'"
    echo "3. Agrega las siguientes líneas a tu .env:"
    echo ""
    echo "   export CF_ZONE_ID='tu_zone_id'"
    echo "   export CF_API_TOKEN='tu_api_token'"
    echo ""
    echo "4. Recarga el .env: source .env"
    echo ""
    echo -e "${YELLOW}Mientras tanto, purga manualmente en:${NC}"
    echo "https://dash.cloudflare.com/ → mapanatal.org → Caching → Purge Everything"
    exit 1
fi

# Purgar todo el caché
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}')

# Verificar resultado
SUCCESS=$(echo "$RESPONSE" | grep -o '"success":true' || true)

if [ -n "$SUCCESS" ]; then
    echo -e "${GREEN}✅ Cache purged successfully!${NC}"
    echo ""
    echo "Los usuarios ahora verán la versión más reciente de:"
    echo "  - app.js"
    echo "  - styles.css"
    echo "  - index.html"
    echo ""
    echo "Puede tomar 1-2 minutos propagar globalmente."
else
    echo -e "${RED}❌ Error purging cache${NC}"
    echo "$RESPONSE"
    exit 1
fi
