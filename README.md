# Carta Astral - Sistema de Cartas Natales

Sistema para calcular cartas natales con interpretaciones astrológicas y ciclos de biorritmos basados en las enseñanzas de Ra.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCCIÓN                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (chuchurex.cl)          Backend (api.chuchurex.cl) │
│  ┌──────────────────────┐        ┌──────────────────────┐   │
│  │   Cloudflare Pages   │        │   Vultr VPS          │   │
│  │   (Auto-deploy)      │  API   │   64.176.12.233      │   │
│  │                      │ ────── │                      │   │
│  │   index.html         │        │   Docker + nginx     │   │
│  │   styles.css         │        │   FastAPI + Kerykeion│   │
│  │   app.js             │        │   Let's Encrypt SSL  │   │
│  └──────────────────────┘        └──────────────────────┘   │
│                                                              │
│  CDN + DNS: Cloudflare                                       │
└─────────────────────────────────────────────────────────────┘
```

## Estructura del Proyecto

```
astro.cl/
├── Frontend
│   ├── index.html              # Página principal
│   ├── styles.css              # Estilos compilados
│   ├── styles.scss             # Fuente SASS
│   └── app.js                  # Lógica JavaScript
│
├── Backend
│   ├── app.py                  # API FastAPI
│   ├── interpretations.json    # Base de interpretaciones
│   ├── requirements.txt        # Dependencias Python
│   ├── Dockerfile              # Imagen Docker
│   └── start.sh                # Script de inicio
│
├── Deploy
│   ├── deploy.sh               # Script de publicación unificado
│   └── .env                    # Credenciales (no en git)
│
└── Docs
    └── ra_astrology_complete_spec.md  # Especificación ciclos Ra
```

## Credenciales de Producción

### Frontend - Cloudflare Pages
- URL: https://chuchurex.cl
- URL Preview: https://chuchurex.pages.dev
- Deploy: Automático en cada push a `main`
- Dashboard: [Cloudflare Pages](https://dash.cloudflare.com/)

### Backend - Vultr VPS (SSH)
- IP: `64.176.12.233`
- Usuario: `root`
- Ubicación: Santiago, Chile
- URL: https://api.chuchurex.cl

### DNS - Cloudflare
- chuchurex.cl → Cloudflare Pages
- api.chuchurex.cl → Vultr VPS (64.176.12.233)

## Deploy

### Frontend (Automático)

El frontend se despliega **automáticamente** con Cloudflare Pages en cada push a `main`:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# ✅ Deploy automático en ~30 segundos
```

Preview de branches: Cada branch genera una URL de preview automática.

### Backend (Manual)

```bash
./deploy.sh backend  # Usa el script

# O manualmente:
ssh root@64.176.12.233
cd /root/astro-chart
git pull
docker build -t astro-api .
docker stop astro-api && docker rm astro-api
docker run -d --name astro-api -p 8001:8001 astro-api
```

### Legacy: Deploy FTP (deprecado)

El script `./deploy.sh frontend` aún funciona para FTP si es necesario.

## Desarrollo Local

### Backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

### Frontend
```bash
# Servir con Python
python -m http.server 3000

# Compilar SASS (si modificas styles.scss)
sass styles.scss styles.css --watch
```

### URLs de prueba
- Frontend local: http://localhost:3000
- Backend local: http://localhost:8001
- Test rápido: http://localhost:3000?Carlos&19800822&00:00&-33.4489&-70.6693

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Info de la API |
| GET | `/health` | Estado del servidor |
| GET | `/signs` | Lista de signos |
| GET | `/planets` | Lista de planetas |
| POST | `/chart` | Calcular carta natal |
| GET | `/chart/example` | Carta de ejemplo |

### Ejemplo POST /chart
```json
{
    "name": "Carlos",
    "year": 1980,
    "month": 8,
    "day": 22,
    "hour": 0,
    "minute": 0,
    "latitude": -33.4489,
    "longitude": -70.6693,
    "timezone": "America/Santiago"
}
```

## Funcionalidades

- Carta natal con posiciones planetarias precisas (Swiss Ephemeris)
- Gráfico SVG de la carta natal con símbolos Unicode
- Interpretaciones personalizadas por planeta, signo y casa
- Ciclos de biorritmos (Físico, Emocional, Intelectual, Adepto/Espiritual)
- Enseñanzas de Ra correlacionadas con la carta
- URL con parámetros para pre-llenar formulario

## Stack Tecnológico

- **Frontend**: HTML5, CSS3 (SASS), JavaScript vanilla
- **Backend**: Python 3.11, FastAPI, Kerykeion (Swiss Ephemeris)
- **Infraestructura**: Docker, nginx, Let's Encrypt, Cloudflare
