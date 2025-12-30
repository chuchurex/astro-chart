# Carta Astral - Progreso del Proyecto

## Estado Actual: MVP en Producción

### URLs
- **Frontend**: https://chuchurex.cl
- **Backend (API)**: https://web-production-22c8f.up.railway.app
- **Repositorio**: https://github.com/chuchurex/astro-chart

---

## Funcionalidades Implementadas

### Backend (FastAPI + Kerykeion)
- [x] Cálculo de carta natal con Swiss Ephemeris
- [x] 10 planetas: Sol, Luna, Mercurio, Venus, Marte, Júpiter, Saturno, Urano, Neptuno, Plutón
- [x] 12 casas astrológicas
- [x] Ascendente calculado
- [x] Aspectos planetarios (conjunción, oposición, cuadratura, trígono, sextil)
- [x] Distribución de elementos (Fuego, Tierra, Aire, Agua)
- [x] Distribución de modalidades (Cardinal, Fijo, Mutable)
- [x] Resumen ejecutivo personalizado
- [x] Biorritmos (Físico 23d, Emocional 28d, Intelectual 33d)
- [x] Ciclo del Adepto de 18 días (enseñanzas de Ra)
- [x] Interpretaciones en español (290+ textos)

### Frontend
- [x] Formulario de datos de nacimiento
- [x] Geocodificación automática de ciudades (OpenStreetMap)
- [x] Visualización del Big Three (Sol, Luna, Ascendente)
- [x] Resumen ejecutivo
- [x] Gráfico de carta natal SVG
- [x] Tabla de posiciones planetarias
- [x] Balance energético (elementos y modalidades con barras)
- [x] Interpretaciones del Sol, Luna y Ascendente
- [x] Diseño responsive
- [x] Tema oscuro con estética celestial

### Infraestructura
- [x] Backend desplegado en Railway (Docker)
- [x] Frontend desplegado en hosting compartido (FTP)
- [x] CORS configurado
- [x] Archivos estáticos servidos por FastAPI

---

## Pendiente / Próximos Pasos

### Prioridad Alta
- [ ] **Arreglar biorritmos en producción**: El backend en Railway no está devolviendo los biorritmos. Verificar que el código desplegado tenga la función `calculate_biorhythms()` y que se esté llamando en el endpoint `/chart`.

### Prioridad Media
- [ ] **Interpretaciones de planetas en casas**: Mostrar cuando el backend las devuelva (120 combinaciones ya escritas)
- [ ] **Interpretaciones de aspectos**: Mostrar cuando el backend las devuelva (130+ ya escritas)
- [ ] **Carta de concepción** (estimada): ~266-280 días antes del nacimiento
- [ ] **Exportar a PDF**: Generar PDF descargable de la carta

### Prioridad Baja / Futuro
- [ ] Visualización SVG mejorada de la carta natal
- [ ] Tránsitos planetarios (posiciones actuales vs carta natal)
- [ ] Comparación de cartas (sinastría)
- [ ] Calendario mensual del Ciclo del Adepto
- [ ] Modo claro/oscuro toggle
- [ ] PWA (Progressive Web App)
- [ ] Dominio propio (alternativas: tuastral.cl, astrocarta.cl, tucielo.cl - disponibles)

---

## Estructura del Proyecto

```
astro.cl/
├── app.py              # Backend FastAPI
├── app.js              # Frontend JavaScript
├── index.html          # Página principal
├── styles.scss         # Estilos SCSS (fuente)
├── styles.css          # Estilos compilados
├── interpretations.json # 290+ interpretaciones en español
├── requirements.txt    # Dependencias Python
├── Dockerfile          # Para Railway
├── Procfile            # Para Railway
├── runtime.txt         # Versión Python
└── ra_astrology_complete_spec.md  # Especificación enseñanzas de Ra
```

---

## Comandos Útiles

### Desarrollo local
```bash
# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
uvicorn app:app --reload --port 8000

# Compilar SCSS
sass styles.scss styles.css
```

### Deploy
```bash
# Subir a GitHub (Railway detecta automáticamente)
git add -A && git commit -m "mensaje" && git push

# Subir frontend a FTP
lftp -u usuario,password servidor << 'EOF'
cd /chuchurex.cl
put index.html
put app.js
put styles.css
bye
EOF
```

---

## Créditos
- **Cálculos astronómicos**: Swiss Ephemeris (via Kerykeion)
- **Ciclo del Adepto**: Material Ra (L/L Research)
- **Geocodificación**: OpenStreetMap Nominatim

---

*Última actualización: 30 de diciembre de 2025*
