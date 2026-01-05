# Technical Roadmap: From MVP to Robust Production

*Created: December 30, 2025*

## Current State (MVP)

### What works well:
- ✅ Precise astronomical calculations (Kerykeion/Swiss Ephemeris)
- ✅ Functional REST API (FastAPI)
- ✅ Responsive frontend with good design
- ✅ i18n system (EN/ES/PT)
- ✅ Biorhythms with Ra teachings
- ✅ Automated deployment (frontend FTP + backend Docker)
- ✅ SSL/HTTPS on both domains

### Identified technical debt:
- ❌ No automated tests
- ❌ Credentials in plain text (deploy.sh, .env)
- ❌ CORS allows any origin (*)
- ❌ No structured logging
- ❌ No monitoring/alerts
- ❌ No caching (recalculates everything each request)
- ❌ JavaScript in single file (1,100+ lines)
- ❌ astrochart library imported but not used

---

## PHASE 1: Security and Stability (High Priority)

### 1.1 Secrets Management
```
Tasks:
- [ ] Move FTP credentials to system environment variables
- [ ] Move VPS password to SSH keys (remove sshpass)
- [ ] Create .env.example file without real values
- [ ] Add .env to .gitignore (verify it's not committed)
- [ ] Use GitHub Actions secrets for future CI/CD
```

### 1.2 API Security
```
Tasks:
- [ ] Configure CORS with whitelist of allowed origins
  - https://chuchurex.cl
  - https://www.chuchurex.cl
  - http://localhost:3000 (development)
- [ ] Add rate limiting (slowapi or similar)
  - 100 requests/minute per IP
  - 10 requests/minute for /chart
- [ ] Validate and sanitize inputs more strictly
- [ ] Add security headers (X-Content-Type-Options, etc.)
```

### 1.3 Logging and Monitoring
```
Tasks:
- [ ] Implement structured logging (loguru or structlog)
  - INFO level for successful requests
  - ERROR level for exceptions
  - Include request_id for traceability
- [ ] Add /metrics endpoint for Prometheus (optional)
- [ ] Configure basic alerts (external uptime check)
- [ ] Save logs to rotating file
```

---

## PHASE 2: Testing (High Priority)

### 2.1 Backend Unit Tests
```python
# tests/test_calculations.py
Tasks:
- [ ] Test solar sign calculation (12 cases)
- [ ] Test lunar sign calculation
- [ ] Test ascendant calculation
- [ ] Test biorhythms (known specific days)
- [ ] Test Ra spiritual cycle (8 qualities)
- [ ] Test elements/modalities distribution

Tools: pytest, pytest-cov
Goal: 80% coverage on calculations
```

### 2.2 API Integration Tests
```python
# tests/test_api.py
Tasks:
- [ ] Test GET /health
- [ ] Test GET /signs
- [ ] Test GET /planets
- [ ] Test POST /chart with valid data
- [ ] Test POST /chart with invalid data
- [ ] Test error handling

Tools: pytest, httpx (TestClient)
```

### 2.3 Frontend Tests
```javascript
// tests/app.test.js
Tasks:
- [ ] Test geocoding (mock Nominatim)
- [ ] Test URL hash generation
- [ ] Test URL hash decoding
- [ ] Test biorhythm rendering
- [ ] Test i18n system

Tools: Jest or Vitest
```

---

## PHASE 3: Performance and Caching (Medium Priority)

### 3.1 Calculation Caching
```
Tasks:
- [ ] Implement in-memory cache for recent charts
  - Key: hash of (date, time, lat, lon)
  - TTL: 1 hour
  - Maximum: 1000 entries
- [ ] Cache biorhythms by birth date
  - Biorhythms only change once per day
- [ ] Consider Redis for distributed cache (future)
```

### 3.2 Frontend Optimization
```
Tasks:
- [ ] Remove astrochart.min.js if not used
- [ ] Minify app.js and styles.css for production
- [ ] Add lazy loading for hidden sections
- [ ] Optimize star animation (reduce repaint)
- [ ] Compress assets with gzip on server
```

### 3.3 Network Optimization
```
Tasks:
- [ ] Add cache headers for static assets
  - CSS/JS: max-age=31536000 (1 year) with versioning
  - HTML: no-cache
- [ ] Configure CDN for assets (Cloudflare already in place)
- [ ] Preload critical fonts
```

---

## PHASE 4: Code Refactoring (Medium Priority)

### 4.1 JavaScript Modularization
```
Proposed structure:
src/
├── js/
│   ├── main.js           # Entry point
│   ├── config.js         # Configuration
│   ├── api.js            # Backend calls
│   ├── geocoding.js      # Nominatim
│   ├── chart.js          # SVG rendering
│   ├── biorhythms.js     # Biorhythm rendering
│   ├── i18n.js           # Internationalization
│   ├── share.js          # Hash and sharing
│   └── dom.js            # DOM elements

Tasks:
- [ ] Separate into ES6 modules
- [ ] Use import/export
- [ ] Configure bundler (esbuild, rollup, or vite)
- [ ] Generate app.bundle.js for production
```

### 4.2 Backend Improvements
```python
Proposed structure:
app/
├── __init__.py
├── main.py               # FastAPI app
├── config.py             # Settings (pydantic-settings)
├── models.py             # Pydantic models
├── routes/
│   ├── chart.py          # /chart endpoints
│   ├── reference.py      # /signs, /planets
│   └── health.py         # /health
├── services/
│   ├── astrology.py      # Kerykeion wrapper
│   ├── biorhythms.py     # Ra calculations
│   └── interpretations.py
└── utils/
    ├── cache.py
    └── logging.py

Tasks:
- [ ] Separate into modules
- [ ] Extract calculation logic to services/
- [ ] Use pydantic-settings for configuration
- [ ] Add complete type hints
```

### 4.3 General Cleanup
```
Tasks:
- [ ] Remove commented code
- [ ] Remove debug console.log from production
- [ ] Unify code style (prettier/black)
- [ ] Document main functions with docstrings
```

---

## PHASE 5: UX/UI Improvements (Medium Priority)

### 5.1 Improved SVG Chart
```
Tasks:
- [ ] Add aspect lines (trine, opposition, etc.)
- [ ] Prevent planet overlap (clustering)
- [ ] Show degrees next to planets
- [ ] Add interactive tooltips (hover)
- [ ] Zoom/pan option on mobile
```

### 5.2 Accessibility
```
Tasks:
- [ ] Add aria-labels to interactive elements
- [ ] Improve keyboard navigation
- [ ] Add skip-to-content link
- [ ] Verify color contrast (WCAG AA)
- [ ] Add alt text to visual elements
```

### 5.3 PWA (Progressive Web App)
```
Tasks:
- [ ] Create manifest.json
- [ ] Add basic service worker
- [ ] Icons for installation
- [ ] Allow offline usage (cache last chart)
```

---

## PHASE 6: DevOps and CI/CD (Low Priority)

### 6.1 GitHub Actions
```yaml
# .github/workflows/ci.yml
Tasks:
- [ ] Lint on each PR (flake8, eslint)
- [ ] Automated tests on each PR
- [ ] Docker build on merge to main
- [ ] Automatic deploy to staging (optional)
```

### 6.2 Optimized Dockerfile
```dockerfile
Tasks:
- [ ] Multi-stage build to reduce size
- [ ] Health check in Dockerfile
- [ ] Non-root user
- [ ] Cache pip dependencies
```

### 6.3 Production Monitoring
```
Tasks:
- [ ] Configure UptimeRobot or similar
- [ ] Basic metrics dashboard
- [ ] Alerts via email/Telegram on errors
```

---

## Suggested Implementation Order

### Sprint 1 (Week 1-2): Security
1. Move secrets to environment variables
2. Configure SSH keys for VPS
3. Implement CORS with whitelist
4. Add basic rate limiting

### Sprint 2 (Week 3-4): Testing
1. Setup pytest
2. Unit tests for calculations
3. API tests
4. Configure coverage report

### Sprint 3 (Week 5-6): Performance
1. Implement in-memory cache
2. Remove unused code
3. Minify assets
4. Optimize cache headers

### Sprint 4 (Week 7-8): Refactoring
1. Modularize JavaScript
2. Separate backend into modules
3. Add structured logging
4. Code documentation

### Sprint 5 (Week 9-10): UX
1. Improve SVG chart
2. Add visual aspects
3. Accessibility improvements
4. Basic PWA

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Test coverage | 0% | 80% |
| /chart response time | ~500ms | <300ms |
| Lighthouse Performance | ~70 | >90 |
| Lighthouse Accessibility | ~80 | >95 |
| Monthly uptime | ? | 99.5% |
| 5xx errors/day | ? | <5 |

---

## Technical Notes

### Dependencies to Consider
```
Backend:
- slowapi (rate limiting)
- loguru (logging)
- pytest + pytest-cov (testing)
- pydantic-settings (configuration)

Frontend:
- esbuild or vite (bundling)
- jest or vitest (testing)
```

### Compatibility
- Python: 3.12+
- Node: 18+ (for build tools)
- Browsers: Chrome 90+, Firefox 90+, Safari 14+

### Related Documentation
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)
- [Kerykeion Docs](https://github.com/g-battaglia/kerykeion)
- [Swiss Ephemeris](https://www.astro.com/swisseph/)
