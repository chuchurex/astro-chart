# Migration: chuchurex.cl → astro.chuchurex.cl

> **Date:** January 4, 2026
> **Goal:** Free up chuchurex.cl for uman.ia

---

## Prompt for Claude Code

```
I need to migrate the natal charts project from chuchurex.cl to astro.chuchurex.cl.

## Context
- I'm in /Sites/vigentes/astro.cl
- Current frontend points to chuchurex.cl and api.chuchurex.cl
- Backend is on Vultr VPS (64.176.12.233)
- I must change all domains to astro.chuchurex.cl and api.astro.chuchurex.cl

## Tasks
1. Find all references to "chuchurex.cl" in the code (without "astro.")
2. Replace with "astro.chuchurex.cl" where appropriate
3. Update CORS in backend to accept astro.chuchurex.cl
4. Update wrangler.toml if it exists
5. Update _headers if it exists
6. Update .env.example with new URLs
7. Update CONTEXT.md with changes

## Key files to review
- Frontend: *.html, *.js, *.css
- Backend: app.py, main.py (CORS)
- Config: wrangler.toml, _headers, .env*

## Final URLs
- Frontend: astro.chuchurex.cl (Cloudflare Pages)
- Backend: api.astro.chuchurex.cl (Vultr VPS)
- Local frontend: localhost:3008
- Local backend: localhost:8001

## DO NOT
- Don't change code logic
- Don't refactor anything
- Only change URLs/domains

Read CONTEXT.md for more project context.
```

---

## Migration Checklist

### Frontend ✅ COMPLETED
- [x] Search for chuchurex.cl references in JS
- [x] Search for references in HTML
- [x] Update fetch/API calls (app.js line 12)
- [x] Update _headers (CSP line 6)
- [x] Update GitHub workflow (.github/workflows/deploy.yml line 30)
- [x] Update meta tags in index.html (lines 19, 23, 26, 33, 36)
- [x] Update meta tags in about/index.html (lines 18, 22, 25)

### Backend ✅ COMPLETED
- [x] Update CORS origins (app.py lines 53-60 - includes backward compatibility)
- [x] Update .env.example (lines 4-5)

### Cloudflare ⏳ MANUAL STEPS REQUIRED
- [ ] Create astro-chuchurex project in CF Pages
- [ ] Configure custom domain astro.chuchurex.cl
- [ ] Configure DNS A/CNAME records in Cloudflare

### VPS ⏳ MANUAL STEPS REQUIRED
- [ ] Update nginx config for api.astro.chuchurex.cl
- [ ] Get SSL certificate (certbot) for new subdomain
- [ ] Restart Docker container with: ./deploy.sh backend

### Documentation ✅ COMPLETED
- [x] Update CONTEXT.md
- [x] Update docs/ARQUITECTURA.md
- [x] Update CLAUDE.md
- [x] Update README.md
- [x] Update RESUMEN_PROYECTO.md

---

## Notes

The backend can serve both api.chuchurex.cl and api.astro.chuchurex.cl temporarily to avoid downtime. After verifying everything works on astro.*, the old domain can be removed.

---

## Code Changes Summary

### Files Modified (8 files):

1. **app.js** (line 12)
   - Changed: `https://api.chuchurex.cl` → `https://api.astro.chuchurex.cl`

2. **app.py** (lines 53-60)
   - Added: `https://astro.chuchurex.cl` and `https://www.astro.chuchurex.cl`
   - Kept old domains for backward compatibility
   - Added localhost:3000 for local development

3. **_headers** (line 6)
   - Updated CSP: `https://api.chuchurex.cl` → `https://api.astro.chuchurex.cl`

4. **.env.example** (lines 4-5)
   - Added: `FRONTEND_URL` and `API_URL` variables

5. **index.html** (lines 19, 23, 26, 33, 36)
   - Updated canonical, og:url, og:image, twitter:url, twitter:image

6. **about/index.html** (lines 18, 22, 25)
   - Updated canonical, og:url, og:image

7. **.github/workflows/deploy.yml** (line 30)
   - Changed: `--project-name=chuchurex` → `--project-name=astro-chuchurex`

8. **Documentation files** (5 files)
   - CLAUDE.md, CONTEXT.md, README.md, RESUMEN_PROYECTO.md, docs/ARQUITECTURA.md

### Next Manual Steps:

1. **Cloudflare Pages**: Create new project "astro-chuchurex" and configure domain
2. **Cloudflare DNS**: Add A/CNAME records for astro.chuchurex.cl
3. **VPS nginx**: Add server block for api.astro.chuchurex.cl
4. **SSL Certificate**: Run certbot for api.astro.chuchurex.cl
5. **Deploy**: Run `./deploy.sh backend` to restart with new config

---

*Migration document - January 4, 2026*
*Code changes completed - Ready for infrastructure setup*
