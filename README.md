# Astrology Chart - Natal Chart System

Natal chart calculation system with astrological interpretations and biorhythm cycles based on Ra's teachings.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (astro.chuchurex.cl)    Backend (api.astro.chuchurex.cl) │
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

## Project Structure

```
astro.cl/
├── Frontend
│   ├── index.html              # Main page
│   ├── styles.css              # Compiled styles
│   ├── styles.scss             # SASS source
│   └── app.js                  # JavaScript logic
│
├── Backend
│   ├── app.py                  # FastAPI API
│   ├── interpretations.json    # Interpretation database
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Docker image
│   └── start.sh                # Start script
│
├── Deploy
│   ├── deploy.sh               # Unified publish script
│   └── .env                    # Credentials (not in git)
│
└── Docs
    └── ra_astrology_complete_spec.md  # Ra cycles specification
```

## Production Credentials

### Frontend - Cloudflare Pages
- URL: https://astro.chuchurex.cl
- Preview URL: https://astro-chuchurex.pages.dev
- Deploy: Automatic on every push to `main`
- Dashboard: [Cloudflare Pages](https://dash.cloudflare.com/)

### Backend - Vultr VPS (SSH)
- IP: `64.176.12.233`
- User: `root`
- Location: Santiago, Chile
- URL: https://api.astro.chuchurex.cl

### DNS - Cloudflare
- astro.chuchurex.cl → Cloudflare Pages
- api.astro.chuchurex.cl → Vultr VPS (64.176.12.233)

## Deploy

### Frontend (Automatic)

Frontend deploys **automatically** with Cloudflare Pages on every push to `main`:

```bash
git add .
git commit -m "feat: new feature"
git push origin main
# ✅ Automatic deploy in ~30 seconds
```

Branch previews: Each branch generates an automatic preview URL.

### Backend (Manual)

```bash
./deploy.sh backend  # Use the script

# Or manually:
ssh root@64.176.12.233
cd /root/astro-chart
git pull
docker build -t astro-api .
docker stop astro-api && docker rm astro-api
docker run -d --name astro-api -p 8001:8001 astro-api
```

### Legacy: FTP Deploy (deprecated)

The `./deploy.sh frontend` script still works for FTP if needed.

## Local Development

### Backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

### Frontend
```bash
# Serve with Python
python -m http.server 3000

# Compile SASS (if modifying styles.scss)
sass styles.scss styles.css --watch
```

### Test URLs
- Local frontend: http://localhost:3000
- Local backend: http://localhost:8001
- Quick test: http://localhost:3000?Carlos&19800822&00:00&-33.4489&-70.6693

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Server status |
| GET | `/signs` | Sign list |
| GET | `/planets` | Planet list |
| POST | `/chart` | Calculate natal chart |
| GET | `/chart/example` | Example chart |

### POST /chart Example
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

## Features

- Natal chart with precise planetary positions (Swiss Ephemeris)
- SVG natal chart graphic with Unicode symbols
- Personalized interpretations by planet, sign and house
- Biorhythm cycles (Physical, Emotional, Intellectual, Adept/Spiritual)
- Ra teachings correlated with chart
- URL with parameters to pre-fill form

## Tech Stack

- **Frontend**: HTML5, CSS3 (SASS), Vanilla JavaScript
- **Backend**: Python 3.11, FastAPI, Kerykeion (Swiss Ephemeris)
- **Infrastructure**: Docker, nginx, Let's Encrypt, Cloudflare
