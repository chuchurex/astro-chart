# Roadmap Técnico: De MVP a Producción Robusta

*Creado: 30 Diciembre 2025*

## Estado Actual (MVP)

### Lo que funciona bien:
- ✅ Cálculos astronómicos precisos (Kerykeion/Swiss Ephemeris)
- ✅ API REST funcional (FastAPI)
- ✅ Frontend responsive con buen diseño
- ✅ Sistema i18n (EN/ES/PT)
- ✅ Biorritmos con enseñanzas de Ra
- ✅ Deploy automatizado (frontend FTP + backend Docker)
- ✅ SSL/HTTPS en ambos dominios

### Deuda técnica identificada:
- ❌ Sin tests automatizados
- ❌ Credenciales en texto plano (deploy.sh, .env)
- ❌ CORS permite cualquier origen (*)
- ❌ Sin logging estructurado
- ❌ Sin monitoreo/alertas
- ❌ Sin caché (recalcula todo cada request)
- ❌ JavaScript en un solo archivo (1,100+ líneas)
- ❌ Biblioteca astrochart importada pero no usada

---

## FASE 1: Seguridad y Estabilidad (Prioridad Alta)

### 1.1 Gestión de Secretos
```
Tareas:
- [ ] Mover credenciales FTP a variables de entorno del sistema
- [ ] Mover password VPS a SSH keys (eliminar sshpass)
- [ ] Crear archivo .env.example sin valores reales
- [ ] Agregar .env a .gitignore (verificar que no esté commiteado)
- [ ] Usar secrets de GitHub Actions para CI/CD futuro
```

### 1.2 Seguridad de API
```
Tareas:
- [ ] Configurar CORS con whitelist de orígenes permitidos
  - https://chuchurex.cl
  - https://www.chuchurex.cl
  - http://localhost:3000 (desarrollo)
- [ ] Agregar rate limiting (slowapi o similar)
  - 100 requests/minuto por IP
  - 10 requests/minuto para /chart
- [ ] Validar y sanitizar inputs más estrictamente
- [ ] Agregar headers de seguridad (X-Content-Type-Options, etc.)
```

### 1.3 Logging y Monitoreo
```
Tareas:
- [ ] Implementar logging estructurado (loguru o structlog)
  - Nivel INFO para requests exitosos
  - Nivel ERROR para excepciones
  - Incluir request_id para trazabilidad
- [ ] Agregar endpoint /metrics para Prometheus (opcional)
- [ ] Configurar alertas básicas (uptime check externo)
- [ ] Guardar logs en archivo rotativo
```

---

## FASE 2: Testing (Prioridad Alta)

### 2.1 Tests Unitarios Backend
```python
# tests/test_calculations.py
Tareas:
- [ ] Test cálculo de signo solar (12 casos)
- [ ] Test cálculo de signo lunar
- [ ] Test cálculo de ascendente
- [ ] Test biorritmos (días específicos conocidos)
- [ ] Test ciclo espiritual Ra (8 calidades)
- [ ] Test distribución elementos/modalidades

Herramientas: pytest, pytest-cov
Meta: 80% cobertura en cálculos
```

### 2.2 Tests de Integración API
```python
# tests/test_api.py
Tareas:
- [ ] Test GET /health
- [ ] Test GET /signs
- [ ] Test GET /planets
- [ ] Test POST /chart con datos válidos
- [ ] Test POST /chart con datos inválidos
- [ ] Test manejo de errores

Herramientas: pytest, httpx (TestClient)
```

### 2.3 Tests Frontend
```javascript
// tests/app.test.js
Tareas:
- [ ] Test geocodificación (mock Nominatim)
- [ ] Test generación de hash URL
- [ ] Test decodificación de hash URL
- [ ] Test renderizado de biorritmos
- [ ] Test sistema i18n

Herramientas: Jest o Vitest
```

---

## FASE 3: Performance y Caché (Prioridad Media)

### 3.1 Caché de Cálculos
```
Tareas:
- [ ] Implementar caché en memoria para cartas recientes
  - Key: hash de (fecha, hora, lat, lon)
  - TTL: 1 hora
  - Máximo: 1000 entradas
- [ ] Cachear biorritmos por fecha de nacimiento
  - Los biorritmos solo cambian 1 vez al día
- [ ] Considerar Redis para caché distribuido (futuro)
```

### 3.2 Optimización Frontend
```
Tareas:
- [ ] Remover astrochart.min.js si no se usa
- [ ] Minificar app.js y styles.css para producción
- [ ] Agregar lazy loading para secciones ocultas
- [ ] Optimizar animación de estrellas (reduce repaint)
- [ ] Comprimir assets con gzip en servidor
```

### 3.3 Optimización de Red
```
Tareas:
- [ ] Agregar headers de caché para assets estáticos
  - CSS/JS: max-age=31536000 (1 año) con versionado
  - HTML: no-cache
- [ ] Configurar CDN para assets (Cloudflare ya está)
- [ ] Preload de fuentes críticas
```

---

## FASE 4: Refactoring de Código (Prioridad Media)

### 4.1 Modularización JavaScript
```
Estructura propuesta:
src/
├── js/
│   ├── main.js           # Punto de entrada
│   ├── config.js         # Configuración
│   ├── api.js            # Llamadas al backend
│   ├── geocoding.js      # Nominatim
│   ├── chart.js          # Renderizado SVG
│   ├── biorhythms.js     # Renderizado biorritmos
│   ├── i18n.js           # Internacionalización
│   ├── share.js          # Hash y compartir
│   └── dom.js            # Elementos DOM

Tareas:
- [ ] Separar en módulos ES6
- [ ] Usar import/export
- [ ] Configurar bundler (esbuild, rollup o vite)
- [ ] Generar app.bundle.js para producción
```

### 4.2 Mejoras Backend
```python
Estructura propuesta:
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
│   ├── biorhythms.py     # Cálculos Ra
│   └── interpretations.py
└── utils/
    ├── cache.py
    └── logging.py

Tareas:
- [ ] Separar en módulos
- [ ] Extraer lógica de cálculos a services/
- [ ] Usar pydantic-settings para configuración
- [ ] Agregar type hints completos
```

### 4.3 Limpieza General
```
Tareas:
- [ ] Eliminar código comentado
- [ ] Eliminar console.log de debug en producción
- [ ] Unificar estilos de código (prettier/black)
- [ ] Documentar funciones principales con docstrings
```

---

## FASE 5: Mejoras de UX/UI (Prioridad Media)

### 5.1 Carta SVG Mejorada
```
Tareas:
- [ ] Agregar líneas de aspectos (trígono, oposición, etc.)
- [ ] Evitar superposición de planetas (clustering)
- [ ] Mostrar grados junto a planetas
- [ ] Agregar tooltips interactivos (hover)
- [ ] Opción de zoom/pan en móvil
```

### 5.2 Accesibilidad
```
Tareas:
- [ ] Agregar aria-labels a elementos interactivos
- [ ] Mejorar navegación por teclado
- [ ] Agregar skip-to-content link
- [ ] Verificar contraste de colores (WCAG AA)
- [ ] Agregar alt text a elementos visuales
```

### 5.3 PWA (Progressive Web App)
```
Tareas:
- [ ] Crear manifest.json
- [ ] Agregar service worker básico
- [ ] Iconos para instalación
- [ ] Permitir uso offline (caché de última carta)
```

---

## FASE 6: DevOps y CI/CD (Prioridad Baja)

### 6.1 GitHub Actions
```yaml
# .github/workflows/ci.yml
Tareas:
- [ ] Lint en cada PR (flake8, eslint)
- [ ] Tests automatizados en cada PR
- [ ] Build de Docker en merge a main
- [ ] Deploy automático a staging (opcional)
```

### 6.2 Dockerfile Optimizado
```dockerfile
Tareas:
- [ ] Multi-stage build para reducir tamaño
- [ ] Health check en Dockerfile
- [ ] Non-root user
- [ ] Cachear dependencias de pip
```

### 6.3 Monitoreo en Producción
```
Tareas:
- [ ] Configurar UptimeRobot o similar
- [ ] Dashboard de métricas básicas
- [ ] Alertas por email/Telegram en errores
```

---

## Orden de Implementación Sugerido

### Sprint 1 (Semana 1-2): Seguridad
1. Mover secretos a variables de entorno
2. Configurar SSH keys para VPS
3. Implementar CORS con whitelist
4. Agregar rate limiting básico

### Sprint 2 (Semana 3-4): Testing
1. Setup pytest
2. Tests unitarios de cálculos
3. Tests de API
4. Configurar coverage report

### Sprint 3 (Semana 5-6): Performance
1. Implementar caché en memoria
2. Remover código no usado
3. Minificar assets
4. Optimizar headers de caché

### Sprint 4 (Semana 7-8): Refactoring
1. Modularizar JavaScript
2. Separar backend en módulos
3. Agregar logging estructurado
4. Documentación de código

### Sprint 5 (Semana 9-10): UX
1. Mejorar carta SVG
2. Agregar aspectos visuales
3. Mejoras de accesibilidad
4. PWA básico

---

## Métricas de Éxito

| Métrica | Actual | Meta |
|---------|--------|------|
| Test coverage | 0% | 80% |
| Tiempo de respuesta /chart | ~500ms | <300ms |
| Lighthouse Performance | ~70 | >90 |
| Lighthouse Accessibility | ~80 | >95 |
| Uptime mensual | ? | 99.5% |
| Errores 5xx/día | ? | <5 |

---

## Notas Técnicas

### Dependencias a Considerar
```
Backend:
- slowapi (rate limiting)
- loguru (logging)
- pytest + pytest-cov (testing)
- pydantic-settings (configuración)

Frontend:
- esbuild o vite (bundling)
- jest o vitest (testing)
```

### Compatibilidad
- Python: 3.12+
- Node: 18+ (para herramientas de build)
- Browsers: Chrome 90+, Firefox 90+, Safari 14+

### Documentación Relacionada
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)
- [Kerykeion Docs](https://github.com/g-battaglia/kerykeion)
- [Swiss Ephemeris](https://www.astro.com/swisseph/)
