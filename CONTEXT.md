# astro.cl - Context

> **Updated:** January 4, 2026
> **Status:** Functional (85%)
> **Phase:** Frontend CF Pages + Backend VPS

---

## Summary

Astrology chart calculator with frontend on Cloudflare Pages and Python/FastAPI backend on VPS.

---

## Current Status

- **Phase:** 2/3 - Frontend and backend working
- **Progress:** 85%
- **Last deploy:** January 3, 2026
- **Prod URL:** astro.chuchurex.cl
- **Local URL:** http://localhost:3000 (frontend) + http://localhost:8001 (backend)

---

## Architecture

```
┌─────────────────────┐     ┌─────────────────┐
│ CLOUDFLARE PAGES    │     │   VPS HOSTINGER │
│ astro.chuchurex.cl  │ ──▶ │  Backend FastAPI│
│  Frontend HTML      │     │  :8001          │
│  + _headers CSP     │     │                 │
└─────────────────────┘     └─────────────────┘
```

---

## Commands

```bash
# Frontend (development)
./dev.sh

# Backend (development)
python app.py

# Deploy frontend
wrangler pages deploy . --project-name=astro-chart

# Deploy backend
rsync -avz . user@vps:/path/to/astro/
```

---

## Key Files

| File | Description |
|---------|-------------|
| index.html | Main frontend |
| app.py | FastAPI backend |
| dev.sh | Frontend development script |
| _headers | CSP and security |
| .github/workflows/deploy.yml | CI/CD |

---

## Pending Migration

**IMPORTANT:** Migration planned from `chuchurex.cl` → `astro.chuchurex.cl`
- See: MIGRACION-ASTRO.md for complete details
- Reason: Free up chuchurex.cl for uman.ia project
- New URLs:
  - Frontend: astro.chuchurex.cl
  - Backend: api.astro.chuchurex.cl

---

## Changelog

### 2026-01-04 - feat: Architecture documented
- Created docs/ARQUITECTURA.md
- Updated _headers with complete CSP
- Created .env.example
- Migration plan documented in MIGRACION-ASTRO.md
- Files: docs/ARQUITECTURA.md, _headers, .env.example, MIGRACION-ASTRO.md

### 2026-01-03 - fix: CSP adjusted
- Security headers updated
- Files: _headers

---

## Next Steps

- [ ] Improve error handling in backend
- [ ] Add calculation cache
- [ ] Automated tests

---

*Active context protocol - See ~/Sites/vigentes/PROTOCOLO-CONTEXTO.md*
