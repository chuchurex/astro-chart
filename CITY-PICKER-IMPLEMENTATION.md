# City Picker Autocomplete - Plan de Implementación

## 📋 Resumen

Implementar un sistema de autocompletado intuitivo para el campo de ciudad que:
- Muestre sugerencias mientras el usuario escribe
- Evite errores por ciudades duplicadas o typos
- Funcione en 3 idiomas (ES/EN/PT)
- Sea accesible (navegación por teclado)

---

## 🎯 Objetivo

**Problema actual:**
- Input de texto simple sin validación
- Geocoding solo al salir del campo (blur)
- Toma el primer resultado sin confirmación del usuario
- Usuarios se confunden con ciudades homónimas (ej: Santiago de Chile vs Santiago de Compostela)

**Solución:**
- Autocomplete con dropdown de sugerencias
- 5 resultados máximo con país/región
- Selección explícita del usuario
- Navegación por teclado (flechas, Enter, Escape)
- Debouncing (300ms) para evitar muchos requests

---

## 🏗️ Arquitectura

### Componentes a Crear

1. **CityAutocomplete Class** (`app.js`)
   - Constructor con input element y callback
   - Event listeners (input, keydown, click)
   - Métodos: search(), showSuggestions(), selectItem()

2. **Estilos del Dropdown** (`styles.scss`)
   - Posición absoluta bajo el input
   - Tema celestial oscuro (consistente con diseño actual)
   - Estados: hover, active, empty

3. **Traducciones i18n** (`i18n/en.json`, `es.json`, `pt.json`)
   - "No cities found" / "No se encontraron ciudades" / "Nenhuma cidade encontrada"

---

## 📂 Archivos a Modificar

### 1. `/Users/chuchurex/Sites/vigentes/astro.cl/app.js`

**Ubicación:** Después de la función `geocodeCity()` (línea ~242)

**Código a agregar:**

```javascript
// === CITY AUTOCOMPLETE ===

class CityAutocomplete {
    constructor(inputElement, onSelect) {
        this.input = inputElement;
        this.onSelect = onSelect;
        this.suggestions = [];
        this.selectedIndex = -1;
        this.searchTimeout = null;

        this.createSuggestionList();
        this.attachEventListeners();
    }

    createSuggestionList() {
        // Crear contenedor relativo si no existe
        if (!this.input.parentNode.classList.contains('city-autocomplete-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'city-autocomplete-wrapper';
            this.input.parentNode.insertBefore(wrapper, this.input);
            wrapper.appendChild(this.input);
        }

        // Crear lista de sugerencias
        this.list = document.createElement('ul');
        this.list.className = 'city-suggestions';
        this.list.setAttribute('role', 'listbox');
        this.list.setAttribute('hidden', '');
        this.input.parentNode.appendChild(this.list);
    }

    attachEventListeners() {
        // Buscar mientras escribe (con debounce)
        this.input.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();

            if (query.length < 3) {
                this.hideSuggestions();
                return;
            }

            this.searchTimeout = setTimeout(() => this.search(query), 300);
        });

        // Navegación con teclado
        this.input.addEventListener('keydown', (e) => {
            const items = this.list.querySelectorAll('.city-suggestion:not(.city-suggestion--empty)');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.highlightItem(this.selectedIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.highlightItem(this.selectedIndex);
            } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
                e.preventDefault();
                this.selectItem(this.suggestions[this.selectedIndex]);
            } else if (e.key === 'Escape') {
                this.hideSuggestions();
            }
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!this.input.parentNode.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    async search(query) {
        try {
            console.log('🔍 Buscando ciudades:', query);

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': i18n.currentLang || 'es',
                        'User-Agent': 'AstroChart/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            this.suggestions = await response.json();
            console.log('📍 Resultados:', this.suggestions.length);
            this.showSuggestions();
        } catch (error) {
            console.error('❌ Error searching cities:', error);
            this.showError();
        }
    }

    showSuggestions() {
        this.list.innerHTML = '';
        this.selectedIndex = -1;

        if (this.suggestions.length === 0) {
            const noResults = document.createElement('li');
            noResults.className = 'city-suggestion city-suggestion--empty';
            noResults.textContent = i18n.translate('form.no_cities_found') || 'No se encontraron ciudades';
            this.list.appendChild(noResults);
        } else {
            this.suggestions.forEach((city, index) => {
                const li = this.createSuggestionItem(city, index);
                this.list.appendChild(li);
            });
        }

        this.list.removeAttribute('hidden');
    }

    createSuggestionItem(city, index) {
        const li = document.createElement('li');
        li.className = 'city-suggestion';
        li.setAttribute('role', 'option');
        li.setAttribute('data-index', index);

        // Extraer información relevante
        const displayParts = city.display_name.split(',').map(s => s.trim());
        const cityName = displayParts[0];
        const country = city.address?.country || displayParts[displayParts.length - 1] || '';
        const state = city.address?.state || displayParts[1] || '';

        // Determinar qué mostrar como ubicación
        let location = country;
        if (state && state !== cityName && state !== country) {
            location = `${state}, ${country}`;
        }

        li.innerHTML = `
            <span class="city-suggestion__icon">📍</span>
            <div class="city-suggestion__content">
                <strong class="city-suggestion__name">${cityName}</strong>
                <small class="city-suggestion__location">${location}</small>
            </div>
        `;

        li.addEventListener('click', () => this.selectItem(city));
        li.addEventListener('mouseenter', () => {
            this.selectedIndex = index;
            this.highlightItem(index);
        });

        return li;
    }

    showError() {
        this.list.innerHTML = '';
        const error = document.createElement('li');
        error.className = 'city-suggestion city-suggestion--empty city-suggestion--error';
        error.textContent = i18n.translate('form.city_search_error') || 'Error al buscar ciudades';
        this.list.appendChild(error);
        this.list.removeAttribute('hidden');
    }

    hideSuggestions() {
        this.list.setAttribute('hidden', '');
        this.selectedIndex = -1;
    }

    highlightItem(index) {
        const items = this.list.querySelectorAll('.city-suggestion:not(.city-suggestion--empty)');
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('city-suggestion--active');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('city-suggestion--active');
            }
        });
    }

    selectItem(city) {
        if (!city || !city.lat || !city.lon) return;

        const displayParts = city.display_name.split(',').map(s => s.trim());
        const cityName = displayParts[0];
        const country = city.address?.country || displayParts[displayParts.length - 1] || '';

        // Actualizar input con formato bonito
        this.input.value = `${cityName}, ${country}`;
        this.hideSuggestions();

        // Callback con datos seleccionados
        this.onSelect({
            name: cityName,
            country: country,
            state: city.address?.state || '',
            lat: parseFloat(city.lat),
            lon: parseFloat(city.lon),
            displayName: city.display_name
        });

        console.log('✅ Ciudad seleccionada:', cityName, country);
    }

    destroy() {
        clearTimeout(this.searchTimeout);
        if (this.list && this.list.parentNode) {
            this.list.parentNode.removeChild(this.list);
        }
    }
}
```

**Modificar función `init()` (línea ~1160):**

```javascript
// ANTES (línea ~1183):
if (DOM.cityInput) DOM.cityInput.addEventListener('blur', handleCityChange);

// DESPUÉS:
if (DOM.cityInput) {
    // Inicializar autocomplete
    window.cityAutocomplete = new CityAutocomplete(
        DOM.cityInput,
        (location) => {
            DOM.latitudeInput.value = location.lat.toFixed(4);
            DOM.longitudeInput.value = location.lon.toFixed(4);
            console.log('📍 Coordenadas actualizadas:', location.lat, location.lon);
        }
    );
}
```

**OPCIONAL - Remover evento blur antiguo:**
```javascript
// Comentar o eliminar la función handleCityChange() (líneas 1028-1035)
// Ya no es necesaria porque el autocomplete maneja la selección
```

---

### 2. `/Users/chuchurex/Sites/vigentes/astro.cl/styles.scss`

**Ubicación:** Al final del archivo (después de los estilos de biorhythms)

**Código a agregar:**

```scss
// === CITY AUTOCOMPLETE ===

.city-autocomplete-wrapper {
    position: relative;
    width: 100%;
}

.city-suggestions {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 8px;
    margin: 0;
    padding: 4px 0;
    max-height: 280px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(212, 175, 55, 0.1);
    list-style: none;

    // Scrollbar personalizado
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(212, 175, 55, 0.3);
        border-radius: 4px;

        &:hover {
            background: rgba(212, 175, 55, 0.5);
        }
    }

    // Ocultar cuando tiene atributo hidden
    &[hidden] {
        display: none;
    }
}

.city-suggestion {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.1s ease;
    border-left: 3px solid transparent;

    &:not(:last-child) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    &:hover,
    &--active {
        background: rgba(212, 175, 55, 0.1);
        border-left-color: rgba(212, 175, 55, 0.6);
        transform: translateX(2px);
    }

    &--empty {
        color: #94a3b8;
        font-style: italic;
        padding: 16px;
        text-align: center;
        cursor: default;
        border-left: none;

        &:hover {
            background: transparent;
            transform: none;
        }
    }

    &--error {
        color: #ef4444;
    }
}

.city-suggestion__icon {
    font-size: 20px;
    margin-right: 12px;
    flex-shrink: 0;
    filter: grayscale(0.3);
}

.city-suggestion__content {
    flex: 1;
    min-width: 0; // Para que el texto se corte con ellipsis
}

.city-suggestion__name {
    display: block;
    color: #e8e8f0;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.city-suggestion__location {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

// Responsive
@media (max-width: 768px) {
    .city-suggestions {
        max-height: 200px;
        font-size: 14px;
    }

    .city-suggestion {
        padding: 10px 12px;
    }

    .city-suggestion__icon {
        font-size: 18px;
        margin-right: 10px;
    }
}

// Accesibilidad: Focus visible
.city-suggestion:focus-visible {
    outline: 2px solid rgba(212, 175, 55, 0.8);
    outline-offset: -2px;
}
```

**Compilar SASS:**
```bash
sass styles.scss styles.css
```

---

### 3. `/Users/chuchurex/Sites/vigentes/astro.cl/i18n/es.json`

**Ubicación:** Dentro del objeto `"form"` (línea ~10)

**Agregar:**
```json
{
  "form": {
    "name": "Nombre",
    "date": "Fecha de nacimiento",
    "time": "Hora",
    "city": "Ciudad de nacimiento",
    "city_placeholder": "ej. Santiago, Chile",
    "no_cities_found": "No se encontraron ciudades",
    "city_search_error": "Error al buscar ciudades. Intenta de nuevo.",
    "calculate": "Calcular Carta"
  }
}
```

---

### 4. `/Users/chuchurex/Sites/vigentes/astro.cl/i18n/en.json`

**Ubicación:** Dentro del objeto `"form"`

**Agregar:**
```json
{
  "form": {
    "name": "Name",
    "date": "Birth date",
    "time": "Time",
    "city": "Birth city",
    "city_placeholder": "e.g. New York, USA",
    "no_cities_found": "No cities found",
    "city_search_error": "Error searching cities. Try again.",
    "calculate": "Calculate Chart"
  }
}
```

---

### 5. `/Users/chuchurex/Sites/vigentes/astro.cl/i18n/pt.json`

**Ubicación:** Dentro del objeto `"form"`

**Agregar:**
```json
{
  "form": {
    "name": "Nome",
    "date": "Data de nascimento",
    "time": "Hora",
    "city": "Cidade de nascimento",
    "city_placeholder": "ex. São Paulo, Brasil",
    "no_cities_found": "Nenhuma cidade encontrada",
    "city_search_error": "Erro ao buscar cidades. Tente novamente.",
    "calculate": "Calcular Mapa"
  }
}
```

---

### 6. `/Users/chuchurex/Sites/vigentes/astro.cl/index.html`

**Ubicación:** Línea 103-107 (campo de ciudad)

**OPCIONAL - Mejorar el placeholder:**

```html
<!-- ANTES -->
<input type="text" id="city" name="city" class="form-input"
       data-i18n-placeholder="form.city_placeholder" placeholder="e.g. New York, USA" required>

<!-- DESPUÉS (agregar autocomplete="off" para evitar conflicto con browser autocomplete) -->
<input type="text" id="city" name="city" class="form-input"
       data-i18n-placeholder="form.city_placeholder"
       placeholder="e.g. New York, USA"
       autocomplete="off"
       required>
```

---

## 🧪 Testing

### Casos de Prueba

1. **Búsqueda básica:**
   - Escribir "Sant" → debe mostrar Santiago (Chile), Santiago de Compostela (España), etc.
   - Escribir "New Y" → debe mostrar New York
   - Escribir "Buenos" → debe mostrar Buenos Aires

2. **Navegación por teclado:**
   - Flechas arriba/abajo → resalta opciones
   - Enter → selecciona ciudad resaltada
   - Escape → cierra dropdown

3. **Selección con mouse:**
   - Hover → resalta opción
   - Click → selecciona y cierra dropdown
   - Actualiza coordenadas en inputs hidden

4. **Edge cases:**
   - Escribir menos de 3 caracteres → no busca
   - No hay resultados → muestra mensaje "No se encontraron ciudades"
   - Error de red → muestra mensaje de error
   - Click fuera del dropdown → cierra dropdown

5. **i18n:**
   - Cambiar idioma a EN → mensajes en inglés
   - Cambiar idioma a PT → mensajes en portugués
   - Nominatim API respeta Accept-Language header

6. **Responsive:**
   - Móvil: dropdown ocupa ancho completo
   - Tablet: dropdown se adapta
   - Desktop: dropdown con max-height y scroll

### Ciudades de Prueba

```
Santiago, Chile → -33.4489, -70.6693
Buenos Aires, Argentina → -34.6037, -58.3816
Lima, Perú → -12.0464, -77.0428
Madrid, España → 40.4168, -3.7038
New York, USA → 40.7128, -74.0060
São Paulo, Brasil → -23.5505, -46.6333
London, UK → 51.5074, -0.1278
Paris, France → 48.8566, 2.3522
```

---

## 🚀 Deployment

### Pasos de Deploy

1. **Commit changes:**
```bash
git add app.js styles.scss styles.css i18n/*.json index.html
git commit -m "feat: add city autocomplete picker with keyboard navigation

- Implement CityAutocomplete class with Nominatim API
- Add dropdown suggestions with country/state info
- Support keyboard navigation (arrows, Enter, Escape)
- Add debouncing (300ms) to minimize API requests
- Translate UI messages to ES/EN/PT
- Style dropdown with celestial dark theme
- Improve UX for city selection (avoid typos and duplicates)

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin main
```

2. **Cloudflare Pages auto-deploy:** ~30 segundos

3. **Test en producción:**
   - https://astro.chuchurex.cl
   - Probar autocomplete
   - Verificar i18n
   - Testear en móvil

---

## 📊 Métricas de Éxito

- ✅ Reducción de errores de geocoding (ciudades incorrectas)
- ✅ Menos soporte/quejas sobre "ciudad no encontrada"
- ✅ Mejor UX: usuarios ven opciones antes de seleccionar
- ✅ Accesibilidad: navegación por teclado funcional
- ✅ Performance: debouncing reduce requests innecesarios

---

## 🔧 Troubleshooting

### Problema: Dropdown no aparece
**Solución:** Verificar que el elemento tenga `position: relative` en el wrapper

### Problema: Nominatim devuelve 429 (Too Many Requests)
**Solución:** Aumentar debounce a 500ms o usar cache local

### Problema: Estilos no se aplican
**Solución:** Recompilar SASS (`sass styles.scss styles.css`)

### Problema: Traducciones no aparecen
**Solución:** Verificar que i18n.translate() funcione correctamente, agregar fallback

---

## 📚 Referencias

- **Nominatim API:** https://nominatim.org/release-docs/develop/api/Search/
- **Geocoding Best Practices:** https://wiki.openstreetmap.org/wiki/Nominatim/Usage_Policy
- **Keyboard Navigation Patterns:** https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

---

## ⏱️ Estimación de Tiempo

| Tarea | Tiempo Estimado |
|-------|-----------------|
| Implementar CityAutocomplete class | 20 min |
| Agregar estilos SCSS | 10 min |
| Actualizar traducciones i18n | 5 min |
| Modificar HTML (opcional) | 2 min |
| Testing manual | 10 min |
| Deploy y verificación | 5 min |
| **TOTAL** | **~50 min** |

---

## 🎯 Próximos Pasos (Post-implementación)

1. **Caché local de ciudades frecuentes** (reduce API calls)
2. **Geolocation API** (autodetectar ciudad del usuario)
3. **Historial de búsquedas** (localStorage)
4. **Timezone detection** (automático según ciudad seleccionada)

---

*Documento creado: 5 de enero de 2026*
*Proyecto: Astro.cl - Carta Natal*
*Autor: Claude + Chuchurex*
