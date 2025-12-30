# Tarea: Internacionalización (i18n) del sitio

## Resumen
Agregar soporte multiidioma al sitio con detección automática del idioma del usuario.

## Idiomas soportados
- **EN** - Inglés (base/default)
- **ES** - Español
- **PT** - Portugués

## Componentes de la tarea

### 1. UI del selector de idioma
- Ubicación: a la derecha del menú de navegación, ligeramente más arriba
- Color: amarillo (#d4af37)
- Formato: EN | ES | PT (links/botones compactos)
- El idioma activo debe estar destacado

### 2. Archivos de traducción
Crear estructura de traducciones en JSON:
```
/i18n/
  en.json  (base)
  es.json
  pt.json
```

Contenido a traducir:
- **index.html**:
  - Header: título, subtítulo, labels del formulario, botón
  - Loader: "Consulting the stars..."
  - Results: títulos de secciones, labels
  - Footer: créditos, textos informativos
- **about.html**:
  - Nombre, bio, títulos de secciones
- **app.js**:
  - Mensajes de error
  - Textos dinámicos (interpretaciones vienen del backend)

### 3. Sistema de detección automática
```javascript
function detectUserLanguage() {
    // 1. Verificar parámetro URL (?lang=es)
    // 2. Verificar localStorage (preferencia guardada)
    // 3. Verificar navigator.language
    // 4. Default: 'en'
}
```

### 4. Sistema de traducción en JS
```javascript
const i18n = {
    currentLang: 'en',
    translations: {},

    async load(lang) { ... },
    t(key) { ... },  // traducir una key
    applyToDOM() { ... }  // aplicar traducciones al DOM
};
```

### 5. Marcado del HTML
Usar atributos data-i18n para elementos traducibles:
```html
<h1 data-i18n="header.title">Natal Chart</h1>
<p data-i18n="header.subtitle">Enter your birth data</p>
```

### 6. Persistencia
- Guardar preferencia en localStorage
- URL param `?lang=xx` tiene prioridad máxima

## Orden de implementación

1. **Convertir sitio a inglés** (base)
   - Traducir todo el HTML estático a inglés
   - Mantener backup del español actual

2. **Crear estructura i18n**
   - Crear carpeta /i18n/
   - Crear en.json con todas las keys
   - Crear es.json (traducción del original)
   - Crear pt.json (nueva traducción)

3. **Implementar sistema JS**
   - Función de detección de idioma
   - Carga de archivos de traducción
   - Aplicación al DOM

4. **Agregar selector UI**
   - HTML del selector
   - CSS para posicionamiento y estilo
   - Event handlers

5. **Testing**
   - Probar detección automática
   - Probar cambio manual
   - Probar persistencia
   - Probar parámetro URL

## Estructura de traducción (ejemplo en.json)

```json
{
  "header": {
    "title": "Natal Chart",
    "subtitle": "Enter your birth data"
  },
  "form": {
    "name": "Name",
    "date": "Date",
    "time": "Time",
    "city": "City",
    "calculate": "Calculate"
  },
  "loader": {
    "text": "Consulting the stars..."
  },
  "results": {
    "title": "Your Natal Chart",
    "sun": "Sun",
    "moon": "Moon",
    "ascendant": "Ascendant",
    "summary": "Chart Summary",
    "positions": "Planetary Positions",
    "balance": "Energy Balance",
    "essence": "Your Essence: Sun, Moon and Ascendant",
    "houses": "Planets in Houses",
    "aspects": "Planetary Aspects",
    "cycles": "Personal Cycles"
  },
  "footer": {
    "calculations": "Astronomical calculations: Swiss Ephemeris",
    "cycles": "Adept Cycles: Ra Material (L/L Research)",
    "developed_by": "Developed by",
    "and": "and"
  },
  "about": {
    "name": "Carlos Martínez",
    "aka": "aka Chuchu",
    "bio1": "Developer and explorer of the digital cosmos from Santiago, Chile.",
    "bio2": "This project combines my interest in programming with the fascination for cosmic cycles and the teachings of Ra.",
    "github": "github",
    "twitter": "x / twitter",
    "repo": "project repo",
    "collab_title": "developed with claude",
    "collab_text": "this project was created in collaboration with"
  },
  "errors": {
    "city_not_found": "City not found. Using default coordinates.",
    "api_error": "Error calculating chart. Please try again."
  }
}
```

## Consideraciones

- **SEO**: Considerar usar subdominios (en.chuchurex.cl) o paths (/en/, /es/) en el futuro
- **Backend**: Las interpretaciones astrológicas vienen del backend, habría que i18n también
- **Performance**: Cargar solo el idioma necesario, no todos
- **RTL**: No aplica para EN/ES/PT

## Estimación de archivos a modificar

- `index.html` - agregar data-i18n, selector UI
- `about.html` - agregar data-i18n
- `styles.css` - estilos del selector
- `app.js` - sistema i18n completo
- `/i18n/en.json` - nuevo
- `/i18n/es.json` - nuevo
- `/i18n/pt.json` - nuevo

## Flujo de trabajo post-implementación

1. Hacer cambios en inglés (base)
2. Ejecutar `./deploy.sh frontend`
3. Actualizar traducciones en es.json y pt.json
4. Re-deploy

---

**Estado**: Pendiente de aprobación
**Prioridad**: Media
**Complejidad**: Media-Alta
