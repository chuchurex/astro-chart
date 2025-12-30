# 🌟 Astro Chart - Sistema de Cartas Natales

Sistema híbrido para calcular cartas natales y generar interpretaciones astrológicas personalizadas.

## 📋 Características

- ✨ Cálculo preciso de posiciones planetarias (Swiss Ephemeris)
- 🎨 Visualización de carta natal en SVG
- 📖 Interpretaciones personalizadas basadas en textos de astrología moderna
- 🌐 API REST para integración con otras aplicaciones
- 📱 Frontend responsive con diseño cósmico

## 🏗️ Estructura del Proyecto

```
astro.cl/
├── app.py                  # API FastAPI (backend)
├── app.js                  # Lógica JavaScript (frontend)
├── index.html              # Página principal
├── styles.css              # Estilos compilados
├── styles.scss             # Fuente SASS
├── interpretations.json    # Base de interpretaciones
└── requirements.txt        # Dependencias Python
```

## 🚀 Instalación

### Requisitos previos
- Python 3.10+
- Node.js (opcional, solo para compilar SASS)
- Navegador web moderno

### Backend

```bash
# 1. Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o: venv\Scripts\activate  # Windows

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Ejecutar servidor
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en `http://localhost:8000`

### Frontend

```bash
# Opción 1: Servir con Python
python -m http.server 3000

# Opción 2: Servir con Node
npx serve . -p 3000

# Opción 3: Abrir directamente en el navegador
# Simplemente abre index.html
```

El frontend estará disponible en `http://localhost:3000`

## 📡 API Endpoints

### `GET /`
Información de la API

### `GET /health`
Estado del servidor

### `GET /signs`
Lista de signos zodiacales

### `GET /planets`
Lista de planetas

### `POST /chart`
Calcula una carta natal

**Request Body:**
```json
{
    "name": "Juan",
    "year": 1990,
    "month": 6,
    "day": 15,
    "hour": 14,
    "minute": 30,
    "latitude": -33.4489,
    "longitude": -70.6693,
    "timezone": "America/Santiago"
}
```

**Response:**
```json
{
    "name": "Juan",
    "sun_sign": "Géminis",
    "moon_sign": "Escorpio",
    "ascendant": "Virgo",
    "planets": [...],
    "houses": [...],
    "aspects": [...],
    "interpretations": {
        "sun": "El Sol en Géminis...",
        "moon": "La Luna en Escorpio...",
        "ascendant": "El Ascendente en Virgo..."
    }
}
```

## 🔧 Configuración

### Cambiar el timezone por defecto

En `app.js`:
```javascript
const CONFIG = {
    API_URL: 'http://localhost:8000',
    DEFAULT_TIMEZONE: 'America/Santiago'  // Cambiar aquí
};
```

### Agregar nuevas interpretaciones

Editar `interpretations.json`:
```json
{
    "sun_in_signs": {
        "sun_aries": "Tu nueva interpretación...",
        ...
    }
}
```

## 📚 Fuentes de Conocimiento

### Cálculos astronómicos
- **Swiss Ephemeris** - El estándar mundial para cálculos astrológicos
- **Kerykeion** - Wrapper Python moderno para Swiss Ephemeris

### Interpretaciones basadas en
- Liz Greene - Astrología psicológica
- Stephen Arroyo - Psicología y los 4 elementos
- Robert Hand - Símbolos del horóscopo
- Howard Sasportas - Las doce casas

## 🛠️ Desarrollo

### Compilar SASS (opcional)
```bash
# Instalar sass
npm install -g sass

# Compilar
sass styles.scss styles.css --watch
```

### Testing de la API
```bash
# Obtener carta de ejemplo
curl http://localhost:8000/chart/example

# Calcular carta personalizada
curl -X POST http://localhost:8000/chart \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","year":1990,"month":6,"day":15,"hour":14,"minute":30,"latitude":-33.45,"longitude":-70.67}'
```

## 📈 Próximas mejoras

- [ ] Fase 2: Scraper para indexar más interpretaciones
- [ ] Fase 3: Cálculo de tránsitos
- [ ] Fase 4: Sinastría (compatibilidad entre cartas)
- [ ] Fase 5: Progresiones secundarias
- [ ] Soporte para múltiples sistemas de casas

## ⚠️ Nota importante

Los cálculos de esta aplicación son aproximados cuando se usa sin Kerykeion instalado. Para máxima precisión astronómica, asegúrate de instalar todas las dependencias del backend.

## 📄 Licencia

MIT License - Uso libre con atribución.

---

Desarrollado con ☉ y ☽ para exploradores del cosmos.
