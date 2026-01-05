# Chuchurex Astral - Astrological Natal Charts

## Final Description

Web application for **astrological natal charts** with personalized interpretations and biorhythm cycles based on Ra's teachings (Law of One). Combines the astronomical precision of Swiss Ephemeris with spiritual philosophy to offer a unique self-knowledge experience.

**Project Philosophy:** "Your natal chart is a map, not a destination. The map doesn't walk the path for you."

---

## Timeline / Evolution

### Phase 1: Initial MVP with Ra Biorhythms
- **Date:** December 30, 2025
- **What it was at this point:** Complete natal chart application with biorhythms based on Ra's teachings. Initial deploy attempted on Railway.
- **Stack used:** HTML/CSS/JS (frontend), Python/FastAPI/Kerykeion (backend), Railway (initial hosting)
- **Features:**
  - Natal chart calculation (10 planets, 12 houses)
  - SVG chart graphic
  - 4-cycle biorhythms (Physical, Emotional, Intellectual, Spiritual/Adept)
  - Correlated Ra quotes
- **Estimated hours in this phase:** 40-50 hours
- **Why it evolved:** Problems with Railway (PORT environment variables, platform limitations)

### Phase 2: Internationalization and Stabilization
- **Date:** December 30, 2025 (same day, intensive development)
- **What changed:** Migration to complete i18n system, biorhythm calculation fixes, UX improvements
- **Stack used:** Same stack + custom i18n system with JSON
- **New features:**
  - i18n system with 3 languages (EN/ES/PT)
  - Ra quote translations
  - Biorhythm trend indicators
  - Share button with URL hash
  - Calculation fixes to match Bring4th
- **Estimated hours in this phase:** 15-20 hours
- **Why it evolved:** Need for international reach and precision in spiritual calculations

### Phase 3: Production Optimization
- **Date:** December 31, 2025
- **What changed:** Production optimizations, SEO, caching, rate limiting
- **Stack used:** Same stack + Docker on Vultr Chile VPS
- **New features:**
  - Gzip, CORS, rate limiting (60 req/min)
  - Cache headers and LRU for astronomical calculations
  - Print styles (print.css)
  - Improved professional SVG graphic
  - Inclusive/neutral language in interpretations
- **Estimated hours in this phase:** 10-15 hours
- **Why it evolved:** Preparation for real production use

### Phase 4: WCAG AAA Accessibility
- **Date:** December 31, 2025
- **What changed:** Complete advanced accessibility implementation
- **Stack used:** Same stack, CSS improvements
- **New features:**
  - Skip links and keyboard navigation
  - ARIA roles and landmarks
  - 7:1 contrast ratio (WCAG AAA)
  - Visible focus indicators
  - Input icon improvements
- **Estimated hours in this phase:** 8-10 hours
- **Why it evolved:** Commitment to universal accessibility

### Phase 5: Advanced UX and Cloudflare Migration
- **Date:** December 31, 2025 - January 1, 2026
- **What changed:** Data input improvements per Nielsen Norman Group, hosting migration
- **Stack used:** Cloudflare Pages (frontend), Vultr VPS (backend)
- **New features:**
  - Flexible date parsing (DD/MM/YYYY, "March 15, 1985", etc.)
  - Automatic masks on date/time inputs
  - Automatic deploy on every git push
- **Estimated hours in this phase:** 5-8 hours
- **Why it evolved:** UX optimization and deploy simplification

### Current Version
- **Date:** January 1, 2026
- **Status:** Production (MVP+)
- **Progress percentage:** 85%

---

## Current Tech Stack

### Frontend
- **HTML5** with accessible semantics
- **CSS3** via SASS, celestial dark theme
- **Vanilla JavaScript** (~1400 lines, no frameworks)
- **Fonts:** Cinzel + Cormorant Garamond
- **i18n:** Custom JSON system (EN/ES/PT)
- **Hosting:** Cloudflare Pages (automatic deploy)

### Backend
- **Python 3.14** with FastAPI
- **Kerykeion** (Swiss Ephemeris for astronomical calculations)
- **Docker** for production
- **nginx** as reverse proxy
- **Rate limiting:** 60 req/min per IP
- **Cache:** LRU for astronomical calculations
- **Hosting:** Vultr VPS Chile (64.176.12.233)

### External APIs/Services
- **OpenStreetMap/Nominatim:** City geocoding
- **Cloudflare:** CDN + DNS + Pages

---

## Current Features

### Natal Chart
- 10 planets: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- 12 astrological houses with cusps
- Ascendant calculated with precision
- Planetary aspects (conjunction, opposition, square, trine, sextile)
- Interactive SVG graphic
- Element distribution (Fire, Earth, Air, Water)
- Modality distribution (Cardinal, Fixed, Mutable)

### Interpretations
- Sun, Moon and Ascendant by sign
- Planets in houses (120 combinations)
- Planetary aspects (130+ combinations)
- Personalized executive summary
- 290+ interpretations in Spanish

### Biorhythms (Ra's Teachings)
- Physical: 23 days
- Emotional: 28 days
- Intellectual: 33 days
- Spiritual/Adept: 18 days (unique feature)
- Ra quotes correlated with cycle day
- Trend indicators

### UX/Accessibility
- Automatic city geocoding
- Flexible date parsing multiple formats
- Automatic input masks
- Shareable URL with hash parameters
- Skip links, ARIA roles
- 7:1 contrast ratio (WCAG AAA)
- Optimized print styles
- Multilanguage support (EN/ES/PT)

---

## Total Time Invested

| Metric | Value |
|---------|-------|
| Start date | ~December 28-29, 2025 |
| Last update | January 1, 2026 |
| Total estimated hours | 80-100 hours |
| Work sessions | ~25-30 intensive sessions |
| Total commits | 34 commits |
| Lines of code | ~3,600+ (excluding JSON) |

---

## Complexity

**Level:** High

**Justification:**
1. **Computational astronomy:** Integration with Swiss Ephemeris for precise planetary position calculations
2. **Time zones:** Correct timezone handling for natal calculations
3. **Distributed architecture:** Static frontend + backend API in Docker
4. **Internationalization:** Custom i18n system with 3 languages
5. **Advanced accessibility:** WCAG AAA compliance (not just AA)
6. **Specialized content:** 290+ astrological interpretations + Ra quotes
7. **Multiple hosting pivots:** Railway -> FTP -> Cloudflare Pages + VPS

---

## Learnings / Pivots

### Hosting
- **Railway:** Limitations with PORT variables, not ideal for this use case
- **Traditional FTP:** Works but not optimal for CI/CD
- **Cloudflare Pages:** Excellent for static frontend with automatic deploy
- **Own VPS:** Necessary for backend with complex dependencies (Kerykeion)

### UX
- Date/time inputs need flexibility (multiple formats) AND structure (masks)
- Nielsen Norman Group guidelines are more practical than reinventing the wheel

### Accessibility
- WCAG AAA is achievable but requires attention to detail
- 7:1 contrast can affect aesthetics but is worth it

### Calculations
- Biorhythms must match established sources (Bring4th)
- Astronomical precision requires specialized libraries (Swiss Ephemeris)

---

## Technical Challenges

### Resolved
- Swiss Ephemeris integration via Kerykeion
- 290+ interpretation system
- Flexible date parsing in multiple formats
- Automated deploy to Cloudflare Pages
- Rate limiting and LRU cache
- WCAG AAA contrast (7:1)
- Migration between multiple hosting platforms

### Pending
- Verify biorhythms work correctly in production
- Native PDF export (currently uses window.print())
- Responsive improvements on tablets
- Migrate VPS password to SSH keys

---

## Next Steps

### High Priority
- [ ] Verify biorhythms in production

### Medium Priority
- [ ] Export chart to native PDF
- [ ] Improve responsive on tablets
- [ ] Migrate to SSH keys for VPS

### Low Priority / Future
- [ ] Planetary transits (current positions vs natal chart)
- [ ] Synastry (chart comparison)
- [ ] Monthly calendar of Adept Cycle
- [ ] PWA (Progressive Web App)
- [ ] Light/dark mode toggle
- [ ] Backend i18n (interpretations in other languages)

---

## URLs

| Resource | URL |
|---------|-----|
| Production | https://astro.chuchurex.cl |
| API Backend | https://api.astro.chuchurex.cl |
| Cloudflare Preview | https://astro-chuchurex.pages.dev |
| Repository | https://github.com/chuchurex/astro-chart |

---

## Additional Notes

### Unique Features
- **Adept Cycle (18 days):** Doesn't exist in other astrology apps, based on Ra Material
- **Correlated Ra quotes:** Each cycle day has a specific quote
- **Integrated spiritual philosophy:** Not just astrology, it's a self-knowledge tool

### Technical Considerations
- The `.env` file contains FTP credentials (not in git)
- VPS password is hardcoded in `deploy.sh` (pending improvement)
- Interpretations are only in Spanish (backend without i18n)
- Frontend detects language automatically: URL param > localStorage > navigator.language > 'en'

### Infrastructure
```
Frontend (astro.chuchurex.cl)        Backend (api.astro.chuchurex.cl)
+----------------------+             +----------------------+
|   Cloudflare Pages   |   HTTPS     |   Vultr VPS Chile    |
|   (Auto-deploy)      | ----------- |   64.176.12.233      |
|                      |             |                      |
|   HTML + CSS + JS    |             |   Docker + nginx     |
|   (static files)     |             |   FastAPI + Kerykeion|
+----------------------+             +----------------------+
         |                                     |
         +------- Cloudflare CDN + DNS --------+
```

---

*Documentation updated: January 1, 2026*
