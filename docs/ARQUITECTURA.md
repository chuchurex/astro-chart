# Architecture - astro.cl (astro.chuchurex.cl)

> **Version:** 1.0
> **Date:** January 4, 2026
> **Based on:** lawofone.cl

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEPLOY FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  Developer        GitHub           GitHub Actions      Cloudflare Pages
     │                │                   │                    │
     │   git push     │                   │                    │
     ├───────────────►│   trigger         │                    │
     │                ├──────────────────►│                    │
     │                │                   │  wrangler deploy   │
     │                │                   ├───────────────────►│
     │                │                   │                    │
     │                │                   │              ┌─────┴─────┐
     │                │                   │              │  LIVE!    │
     │                │                   │              │ astro.    │
     │                │                   │              │ chuchurex │
     │                │                   │              │   .cl     │
     │                │                   │              └───────────┘

                                          ┌─────────────────────┐
                      Backend deploy      │   Vultr VPS Chile   │
                      (manual via SSH)    │ api.astro.chuchurex.│
                      ─────────────────►  │   Docker + FastAPI  │
                                          └─────────────────────┘
```

---

## 2. Hybrid Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE PAGES                                    │
│                      (astro.chuchurex.cl)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✓ Static HTML (index.html, about/)                                        │
│  ✓ CSS compiled from SCSS                                                   │
│  ✓ Vanilla JavaScript (app.js)                                              │
│  ✓ i18n JSON (EN/ES/PT)                                                     │
│  ✓ Interpretations JSON                                                     │
│                                                                             │
│  CDN: Automatic, global edge caching                                       │
│  SSL: Automatic                                                             │
│  Deploy: GitHub Actions with Wrangler                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ API calls (CORS)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VULTR VPS                                          │
│                  (api.astro.chuchurex.cl)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ✓ FastAPI + Kerykeion (astronomical calculations)                         │
│  ✓ Docker container                                                         │
│  ✓ nginx reverse proxy                                                      │
│  ✓ Rate limiting: 60 req/min per IP                                        │
│                                                                             │
│  IP: 64.176.12.233                                                          │
│  Port: 8001                                                                 │
│  Deploy: Manual SSH (./deploy.sh backend)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

### Frontend
| Technology | Use |
|------------|-----|
| HTML5 | Semantic structure (WCAG AAA) |
| SCSS/SASS | Modular styles |
| JavaScript | Vanilla ES6+ |
| Cinzel + Cormorant | Typography |

### Backend
| Technology | Use |
|------------|-----|
| Python 3.14 | Runtime |
| FastAPI | REST API |
| Kerykeion | Swiss Ephemeris |
| Docker | Containerization |
| nginx | Reverse proxy |

### Hosting
| Service | Use |
|----------|-----|
| Cloudflare Pages | Static frontend |
| Vultr VPS | API Backend |
| Cloudflare DNS | DNS + CDN |

---

## 4. Directory Structure

```
astro.cl/
├── .env                    # Variables (NOT in git)
├── .env.example            # Template
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD
├── .gitignore
├── _headers                # CF Pages headers
├── _redirects              # CF Pages redirects
│
├── index.html              # Main page
├── app.js                  # Frontend logic
├── styles.css              # Compiled CSS
├── interpretations.json    # Interpretations
│
├── about/
│   └── index.html
├── i18n/
│   ├── en.json
│   ├── es.json
│   └── pt.json
├── styles/
│   └── print.css
├── scss/                   # SASS sources
│
├── app.py                  # FastAPI API
├── requirements.txt
├── Dockerfile
├── deploy.sh               # Backend deploy script
│
└── docs/
    └── ARQUITECTURA.md     # This file
```

---

## 5. Security Headers

### `_headers`
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-XSS-Protection: 1; mode=block
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.astro.chuchurex.cl https://nominatim.openstreetmap.org; frame-ancestors 'none'
```

---

## 6. CI/CD

### Frontend (Automatic)
```bash
git push origin main
# → GitHub Actions → Wrangler → CF Pages (~30s)
```

### Backend (Manual)
```bash
./deploy.sh backend
# → SSH → Docker build → restart container
```

---

## 7. Commands

```bash
# Local development
source venv/bin/activate
uvicorn app:app --reload --port 8001   # Backend
python -m http.server 3000              # Frontend
sass styles.scss styles.css --watch     # SASS

# Deploy
git push origin main                    # Frontend (auto)
./deploy.sh backend                     # Backend (manual)
./deploy.sh status                      # Check status
```

---

## 8. APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status |
| GET | `/signs` | Sign list |
| GET | `/planets` | Planet list |
| POST | `/chart` | Calculate natal chart |
| GET | `/chart/example` | Example chart |

---

## 9. Security Checklist

| Item | Status |
|------|--------|
| HTTPS | ✅ Cloudflare |
| CSP Header | ✅ |
| X-Frame-Options | ✅ DENY |
| Restricted CORS | ✅ Only astro.chuchurex.cl |
| Rate limiting | ✅ 60 req/min |
| Secrets in .env | ✅ |

---

*Document generated: January 4, 2026*
