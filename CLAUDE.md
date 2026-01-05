# Chuchurex Astral - Project Context

## Summary

Web application for **astrological natal charts** with personalized interpretations and biorhythm cycles based on Ra's teachings (Law of One).

**Production URLs:**
- Frontend: https://astro.chuchurex.cl
- API Backend: https://api.astro.chuchurex.cl
- Repository: https://github.com/chuchurex/astro-chart

---

## Architecture

```
Frontend (astro.chuchurex.cl)        Backend (api.astro.chuchurex.cl)
┌──────────────────────┐             ┌──────────────────────┐
│   Cloudflare Pages   │   HTTPS     │   Vultr VPS Chile    │
│   (Auto-deploy)      │ ─────────── │   64.176.12.233      │
│                      │             │                      │
│   HTML + CSS + JS    │             │   Docker + nginx     │
│   (static files)     │             │   FastAPI + Kerykeion│
└──────────────────────┘             └──────────────────────┘
         │                                     │
         └───────── Cloudflare CDN + DNS ──────┘
```

**Frontend Deploy:** Automatic on every `git push origin main`

---

## File Structure

```
astro.cl/
├── index.html              # Main page (calculator)
├── app.js                  # Frontend logic (~1400 lines)
├── app.py                  # FastAPI API (~900 lines)
├── styles.css              # Compiled CSS
├── styles.scss             # SASS source
├── interpretations.json    # 290+ interpretations in Spanish
│
├── about/index.html        # "About" page
├── i18n/                   # Translations
│   ├── en.json             # English (base)
│   ├── es.json             # Spanish
│   └── pt.json             # Portuguese
│
├── styles/                 # Additional styles
│   └── print.css           # Print/PDF styles
│
├── deploy.sh               # Unified deploy script
├── requirements.txt        # Python dependencies
├── Dockerfile              # For backend deploy
└── .env                    # Credentials (NOT in git)
```

---

## Tech Stack

### Frontend
- **HTML5** with accessible semantics (WCAG AAA in progress)
- **CSS3** via SASS, celestial dark theme
- **Vanilla JavaScript** (no frameworks)
- **Fonts**: Cinzel + Cormorant Garamond
- **i18n**: Custom JSON system, 3 languages (EN/ES/PT)

### Backend
- **Python 3.14** (via venv)
- **FastAPI** with Pydantic
- **Kerykeion** (Swiss Ephemeris for astronomical calculations)
- **Docker** for production
- Rate limiting: 60 req/min per IP
- LRU cache for astronomical calculations

---

## Implemented Features

### Natal Chart
- [x] 10 planets: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- [x] 12 astrological houses with cusps
- [x] Ascendant calculated with precision
- [x] Planetary aspects (conjunction, opposition, square, trine, sextile)
- [x] Interactive SVG chart graphic
- [x] Element distribution (Fire, Earth, Air, Water)
- [x] Modality distribution (Cardinal, Fixed, Mutable)

### Interpretations
- [x] Sun, Moon and Ascendant by sign
- [x] Planets in houses (120 combinations)
- [x] Planetary aspects (130+ combinations)
- [x] Personalized executive summary

### Biorhythms (Ra's Teachings)
- [x] Physical: 23 days
- [x] Emotional: 28 days
- [x] Intellectual: 33 days
- [x] Spiritual/Adept: 18 days (with special analysis)
- [x] Ra quotes correlated with cycle day

### UX/Accessibility
- [x] Automatic city geocoding (OpenStreetMap)
- [x] Flexible date parsing (DD/MM/YYYY, "March 15, 1985", etc.)
- [x] Automatic masks on date/time inputs
- [x] Shareable URL with parameters
- [x] Skip links, ARIA roles, contrast ratio 7:1
- [x] Print styles (print.css)

---

## Production Credentials

### Frontend - Cloudflare Pages
- URL: https://astro.chuchurex.cl
- Preview: https://astro-chuchurex.pages.dev
- Deploy: Automatic on every push to `main`
- Dashboard: https://dash.cloudflare.com/

### Backend - Vultr VPS (SSH)
- IP: `64.176.12.233`
- User: `root`
- Password: in `.env` and `deploy.sh` (hardcoded for now)
- Docker Port: 8001
- SSL: Let's Encrypt certificate (auto-renews)
- Cloudflare SSL Mode: Full (HTTPS end-to-end)
- Cloudflare Proxy: Disabled (DNS only, gray cloud)

---

## Deploy Commands

### Frontend (Automatic)
```bash
git add .
git commit -m "feat: change"
git push origin main
# Automatic deploy in ~30 seconds
```

### Backend (Manual)
```bash
./deploy.sh backend

# Check status
./deploy.sh status
```

### Legacy FTP (deprecated)
```bash
./deploy.sh frontend  # Still works if necessary
```

---

## Local Development

```bash
# Activate virtual environment
source venv/bin/activate

# Backend (port 8001)
uvicorn app:app --reload --port 8001

# Frontend (port 3000)
python -m http.server 3000

# Compile SASS
sass styles.scss styles.css --watch
```

---

## API Endpoints

| Method | Endpoint        | Description                    |
|--------|-----------------|--------------------------------|
| GET    | `/`             | Main page (static file)        |
| GET    | `/health`       | Server status + cache          |
| GET    | `/signs`        | List of zodiac signs           |
| GET    | `/planets`      | List of planets                |
| POST   | `/chart`        | Calculate natal chart          |
| GET    | `/chart/example`| Example chart                  |

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

---

## Recent Changes (2026-01-05)

### ✅ Completed
- [x] Configured SSL/HTTPS for api.astro.chuchurex.cl with Let's Encrypt
- [x] Fixed Mixed Content errors (HTTP API calls from HTTPS frontend)
- [x] Updated footer to link to chuchurex.cl
- [x] Fixed URL parameter parsing timing issues
- [x] Added extensive debugging logs for troubleshooting
- [x] Configured Cloudflare SSL mode: Full (end-to-end HTTPS)

## Pending Tasks (Backlog)

### High Priority
- [ ] Re-enable Cloudflare Proxy for api.astro subdomain (currently DNS-only for testing)
- [ ] Configure GitHub Actions secrets (CF_API_TOKEN, CF_ACCOUNT_ID) for auto-deploy
- [ ] Verify biorhythms work correctly in production

### Medium Priority
- [ ] Export chart to native PDF (currently uses window.print())
- [ ] Improve responsive on tablets
- [ ] Migrate VPS authentication to SSH keys (remove hardcoded password)

### Low Priority / Future
- [ ] Planetary transits (current positions vs natal chart)
- [ ] Chart comparison (synastry)
- [ ] Monthly calendar of Adept Cycle
- [ ] PWA (Progressive Web App)
- [ ] Light/dark mode toggle

---

## Important Notes

1. **The `.env` file contains FTP credentials** - never commit
2. **VPS password is hardcoded in `deploy.sh`** - consider using ssh keys
3. **Interpretations are in Spanish** - backend doesn't have i18n yet
4. **Frontend detects language automatically** (URL param > localStorage > navigator.language > 'en')

---

## Project Philosophy

> "Your natal chart is a map, not a destination. The map doesn't walk the path for you."
> - Ra's Teachings

This project combines the astronomical precision of Swiss Ephemeris with the spiritual teachings of the Ra Material. Each cycle and aspect is an invitation to choose, not a fixed prediction.

---

*Last updated: January 5, 2026*
