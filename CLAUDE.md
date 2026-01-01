# Chuchurex Astral - Contexto del Proyecto

## Resumen

Aplicacion web de **cartas natales astrológicas** con interpretaciones personalizadas y ciclos de biorritmos basados en las enseñanzas de Ra (Law of One).

**URLs de Produccion:**
- Frontend: https://chuchurex.cl
- API Backend: https://api.chuchurex.cl
- Repositorio: https://github.com/chuchurex/astro-chart

---

## Arquitectura

```
Frontend (chuchurex.cl)              Backend (api.chuchurex.cl)
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

**Deploy Frontend:** Automatico en cada `git push origin main`

---

## Estructura de Archivos

```
astro.cl/
├── index.html              # Pagina principal (calculadora)
├── app.js                  # Logica frontend (~1400 lineas)
├── app.py                  # API FastAPI (~900 lineas)
├── styles.css              # CSS compilado
├── styles.scss             # Fuente SASS
├── interpretations.json    # 290+ interpretaciones en espanol
│
├── about/index.html        # Pagina "Acerca de"
├── i18n/                   # Traducciones
│   ├── en.json             # Ingles (base)
│   ├── es.json             # Espanol
│   └── pt.json             # Portugues
│
├── styles/                 # Estilos adicionales
│   └── print.css           # Estilos para impresion/PDF
│
├── deploy.sh               # Script de deploy unificado
├── requirements.txt        # Dependencias Python
├── Dockerfile              # Para deploy backend
└── .env                    # Credenciales (NO en git)
```

---

## Stack Tecnologico

### Frontend
- **HTML5** con semantica accesible (WCAG AAA en progreso)
- **CSS3** via SASS, tema oscuro celestial
- **JavaScript vanilla** (sin frameworks)
- **Fuentes**: Cinzel + Cormorant Garamond
- **i18n**: Sistema propio con JSON, 3 idiomas (EN/ES/PT)

### Backend
- **Python 3.14** (via venv)
- **FastAPI** con Pydantic
- **Kerykeion** (Swiss Ephemeris para calculos astronomicos)
- **Docker** para produccion
- Rate limiting: 60 req/min por IP
- Cache LRU para calculos astronomicos

---

## Funcionalidades Implementadas

### Carta Natal
- [x] 10 planetas: Sol, Luna, Mercurio, Venus, Marte, Jupiter, Saturno, Urano, Neptuno, Pluton
- [x] 12 casas astrologicas con cuspides
- [x] Ascendente calculado con precision
- [x] Aspectos planetarios (conjuncion, oposicion, cuadratura, trigono, sextil)
- [x] Grafico SVG interactivo de la carta
- [x] Distribucion de elementos (Fuego, Tierra, Aire, Agua)
- [x] Distribucion de modalidades (Cardinal, Fijo, Mutable)

### Interpretaciones
- [x] Sol, Luna y Ascendente por signo
- [x] Planetas en casas (120 combinaciones)
- [x] Aspectos planetarios (130+ combinaciones)
- [x] Resumen ejecutivo personalizado

### Biorritmos (Ensenanzas de Ra)
- [x] Fisico: 23 dias
- [x] Emocional: 28 dias
- [x] Intelectual: 33 dias
- [x] Espiritual/Adepto: 18 dias (con analisis especial)
- [x] Citas de Ra correlacionadas con el dia del ciclo

### UX/Accesibilidad
- [x] Geocodificacion automatica de ciudades (OpenStreetMap)
- [x] Parseo flexible de fechas (DD/MM/YYYY, "15 marzo 1985", etc.)
- [x] Mascaras automaticas en inputs de fecha/hora
- [x] URL compartible con parametros
- [x] Skip links, ARIA roles, contrast ratio 7:1
- [x] Estilos de impresion (print.css)

---

## Credenciales de Produccion

### Frontend - Cloudflare Pages
- URL: https://chuchurex.cl
- Preview: https://chuchurex.pages.dev
- Deploy: Automatico en cada push a `main`
- Dashboard: https://dash.cloudflare.com/

### Backend - Vultr VPS (SSH)
- IP: `64.176.12.233`
- Usuario: `root`
- Password: en `.env` y `deploy.sh` (hardcoded por ahora)
- Puerto Docker: 8001

---

## Comandos de Deploy

### Frontend (Automatico)
```bash
git add .
git commit -m "feat: cambio"
git push origin main
# Deploy automatico en ~30 segundos
```

### Backend (Manual)
```bash
./deploy.sh backend

# Verificar estado
./deploy.sh status
```

### Legacy FTP (deprecado)
```bash
./deploy.sh frontend  # Aun funciona si es necesario
```

---

## Desarrollo Local

```bash
# Activar entorno virtual
source venv/bin/activate

# Backend (puerto 8001)
uvicorn app:app --reload --port 8001

# Frontend (puerto 3000)
python -m http.server 3000

# Compilar SASS
sass styles.scss styles.css --watch
```

---

## API Endpoints

| Metodo | Endpoint        | Descripcion                    |
|--------|-----------------|--------------------------------|
| GET    | `/`             | Pagina principal (static file) |
| GET    | `/health`       | Estado del servidor + cache    |
| GET    | `/signs`        | Lista de signos zodiacales     |
| GET    | `/planets`      | Lista de planetas              |
| POST   | `/chart`        | Calcular carta natal           |
| GET    | `/chart/example`| Carta de ejemplo               |

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

---

## Tareas Pendientes (Backlog)

### Prioridad Alta
- [ ] Verificar que biorritmos funcionen correctamente en produccion

### Prioridad Media
- [ ] Exportar carta a PDF nativo (actualmente usa window.print())
- [ ] Mejorar responsive en tablets

### Prioridad Baja / Futuro
- [ ] Transitos planetarios (posiciones actuales vs carta natal)
- [ ] Comparacion de cartas (sinastria)
- [ ] Calendario mensual del Ciclo del Adepto
- [ ] PWA (Progressive Web App)
- [ ] Modo claro/oscuro toggle

---

## Notas Importantes

1. **El archivo `.env` contiene las credenciales FTP** - nunca commitear
2. **El password del VPS esta hardcoded en `deploy.sh`** - considerar usar ssh keys
3. **Las interpretaciones estan en espanol** - el backend no tiene i18n todavia
4. **El frontend detecta el idioma automaticamente** (URL param > localStorage > navigator.language > 'en')

---

## Filosofia del Proyecto

> "Tu carta natal es un mapa, no un destino. El mapa no camina el camino por ti."
> - Ensenanzas de Ra

Este proyecto combina la precision astronomica de Swiss Ephemeris con las ensenanzas espirituales del Material Ra. Cada ciclo y aspecto es una invitacion a elegir, no una prediccion fija.

---

*Documentacion generada el 31 de diciembre de 2025*
