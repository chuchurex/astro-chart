# Features Expansion Plan - Astro.cl

## 📋 Overview

Plan completo para expandir las funcionalidades del calculador de cartas natales con tres features principales:

1. **Tránsitos Planetarios** - Posiciones actuales vs carta natal
2. **Sinastría** - Comparación de dos cartas (compatibilidad)
3. **Calendario del Ciclo del Adepto** - Vista mensual del ciclo de 18 días

---

## 🪐 Feature 1: Tránsitos Planetarios

### Concepto

Los **tránsitos** son las posiciones actuales de los planetas comparadas con tu carta natal. Revelan ciclos energéticos presentes y oportunidades de crecimiento.

**Ejemplo:**
- Tu Sol natal: Piscis 23°
- Saturno hoy transita: Piscis 20°
- **Aspecto:** Conjunción (3° de orbe)
- **Interpretación:** "El maestro llega cuando el estudiante está listo" - Ra

### Tipos de Tránsitos

| Planeta | Velocidad | Importancia |
|---------|-----------|-------------|
| Luna | 2.5 días/signo | Emociones diarias |
| Mercurio | 3-4 semanas/signo | Comunicación semanal |
| Venus | 4-5 semanas/signo | Relaciones mensuales |
| Sol | 1 mes/signo | Identidad mensual |
| Marte | 6-7 semanas/signo | Acción bimensual |
| Júpiter | 1 año/signo | Expansión anual |
| Saturno | 2.5 años/signo | Lecciones (muy importante) |
| Urano | 7 años/signo | Revoluciones (muy importante) |
| Neptuno | 14 años/signo | Espiritualidad (muy importante) |
| Plutón | 12-30 años/signo | Transformación (muy importante) |

**Prioridad:** Mostrar primero tránsitos de planetas lentos (Saturno, Urano, Neptuno, Plutón).

---

### Implementación Backend

**Archivo:** `app.py`

**Nuevo endpoint:**
```python
@app.post("/chart/transits")
async def calculate_transits(
    natal_chart: ChartRequest,
    transit_date: Optional[str] = None  # Default: hoy
):
    """
    Calcula tránsitos planetarios para una fecha específica.

    Args:
        natal_chart: Datos de nacimiento del usuario
        transit_date: Fecha de tránsitos (YYYY-MM-DD), default: hoy

    Returns:
        - transit_date: Fecha de cálculo
        - aspects: Lista de aspectos transit→natal activos
        - slow_transits: Tránsitos de planetas lentos (prioridad)
        - interpretations: Textos de interpretación de Ra
    """

    from datetime import datetime

    # 1. Carta natal del usuario
    natal = AstrologicalSubjectFactory.from_birth_data(
        name=natal_chart.name,
        year=natal_chart.year,
        month=natal_chart.month,
        day=natal_chart.day,
        hour=natal_chart.hour,
        minute=natal_chart.minute,
        lat=natal_chart.latitude,
        lon=natal_chart.longitude
    )

    # 2. Posiciones planetarias actuales (tránsitos)
    if transit_date:
        t_date = datetime.strptime(transit_date, "%Y-%m-%d")
    else:
        t_date = datetime.now()

    transit = AstrologicalSubjectFactory.from_birth_data(
        name="Transits",
        year=t_date.year,
        month=t_date.month,
        day=t_date.day,
        hour=12,  # Mediodía UTC
        minute=0,
        lat=natal_chart.latitude,
        lon=natal_chart.longitude
    )

    # 3. Calcular aspectos entre tránsitos y natal
    aspects = []

    # Orbes máximos por aspecto
    MAX_ORBS = {
        'conjunction': 8,
        'opposition': 8,
        'trine': 6,
        'square': 6,
        'sextile': 4
    }

    # Planetas a considerar
    PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
               'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']

    for t_planet_name in PLANETS:
        t_planet = getattr(transit, t_planet_name.lower())
        t_lon = t_planet['position']

        for n_planet_name in PLANETS:
            n_planet = getattr(natal, n_planet_name.lower())
            n_lon = n_planet['position']

            # Calcular aspecto
            aspect_data = calculate_aspect_with_orb(t_lon, n_lon)

            if aspect_data and aspect_data['orb'] <= MAX_ORBS.get(aspect_data['type'], 5):
                aspects.append({
                    'transit_planet': t_planet_name,
                    'transit_sign': t_planet['sign'],
                    'transit_degree': round(t_lon % 30, 2),
                    'natal_planet': n_planet_name,
                    'natal_sign': n_planet['sign'],
                    'natal_degree': round(n_lon % 30, 2),
                    'aspect': aspect_data['type'],
                    'orb': round(aspect_data['orb'], 2),
                    'strength': calculate_transit_strength(aspect_data['orb'], t_planet_name),
                    'is_exact': aspect_data['orb'] < 1.0,
                    'interpretation': get_transit_interpretation(
                        t_planet_name, n_planet_name, aspect_data['type']
                    )
                })

    # 4. Filtrar y priorizar tránsitos lentos
    SLOW_PLANETS = ['Saturn', 'Uranus', 'Neptune', 'Pluto']
    slow_transits = [a for a in aspects if a['transit_planet'] in SLOW_PLANETS]

    # 5. Ordenar por fuerza (orbe menor = más fuerte)
    aspects.sort(key=lambda x: x['orb'])
    slow_transits.sort(key=lambda x: x['orb'])

    return {
        'transit_date': t_date.strftime('%Y-%m-%d'),
        'aspects': aspects[:20],  # Top 20 aspectos
        'slow_transits': slow_transits,
        'total_count': len(aspects),
        'ra_philosophy': {
            'transits': 'Los tránsitos son invitaciones, no obligaciones. El agua encuentra su propio nivel.'
        }
    }


def calculate_aspect_with_orb(lon1: float, lon2: float) -> dict:
    """Calcula aspecto y orbe entre dos longitudes."""

    diff = abs(lon1 - lon2)
    if diff > 180:
        diff = 360 - diff

    ASPECTS = {
        'conjunction': (0, 8),
        'sextile': (60, 4),
        'square': (90, 6),
        'trine': (120, 6),
        'opposition': (180, 8)
    }

    for aspect_name, (angle, max_orb) in ASPECTS.items():
        orb = abs(diff - angle)
        if orb <= max_orb:
            return {
                'type': aspect_name,
                'orb': orb,
                'angle': angle
            }

    return None


def calculate_transit_strength(orb: float, planet: str) -> int:
    """Calcula fuerza del tránsito (0-100%)."""

    # Planetas lentos tienen más peso
    PLANET_WEIGHTS = {
        'Pluto': 1.5,
        'Neptune': 1.4,
        'Uranus': 1.3,
        'Saturn': 1.2,
        'Jupiter': 1.0,
        'Mars': 0.8,
        'Sun': 0.7,
        'Venus': 0.6,
        'Mercury': 0.5,
        'Moon': 0.4
    }

    weight = PLANET_WEIGHTS.get(planet, 1.0)

    # Orbe 0° = 100%, orbe 8° = 0%
    base_strength = max(0, 100 - (orb * 12.5))  # 12.5 = 100/8

    return int(base_strength * weight)


def get_transit_interpretation(transit_planet: str, natal_planet: str, aspect: str) -> str:
    """
    Obtiene interpretación del tránsito.

    TODO: Crear archivo transit_interpretations.json con ~500 entradas:
    - 10 planetas transit × 10 planetas natal × 5 aspectos = 500 combinaciones

    Por ahora, retorna interpretación genérica.
    """

    # Interpretaciones genéricas por aspecto
    GENERIC = {
        'conjunction': f"{transit_planet} amplifica la energía de tu {natal_planet} natal. Momento de unificación.",
        'opposition': f"{transit_planet} desafía a tu {natal_planet} natal. Busca el balance entre opuestos.",
        'square': f"{transit_planet} fricciona con tu {natal_planet} natal. La tensión genera crecimiento.",
        'trine': f"{transit_planet} fluye con tu {natal_planet} natal. Armonía natural y oportunidades.",
        'sextile': f"{transit_planet} colabora con tu {natal_planet} natal. Esfuerzo consciente trae resultados."
    }

    return GENERIC.get(aspect, "Tránsito activo.")
```

---

### Implementación Frontend

**Archivo:** `app.js`

**Nueva función:**
```javascript
// === TRANSITS ===

async function calculateTransits(birthData, transitDate = null) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/chart/transits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...birthData,
                transit_date: transitDate
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error calculating transits:', error);
        throw error;
    }
}

function renderTransits(transitsData) {
    const container = document.getElementById('transits-section');
    if (!container) return;

    let html = `
        <div class="transits">
            <div class="transits__header">
                <h2 class="transits__title">
                    ${i18n.translate('transits.title') || 'Tránsitos Planetarios'}
                </h2>
                <p class="transits__date">
                    ${i18n.translate('transits.date') || 'Fecha'}:
                    ${formatDate(transitsData.transit_date)}
                </p>
            </div>

            <div class="transits__philosophy">
                <blockquote class="ra-quote">
                    "${transitsData.ra_philosophy.transits}"
                    <cite>- Ra</cite>
                </blockquote>
            </div>
    `;

    // Tránsitos lentos (prioridad)
    if (transitsData.slow_transits.length > 0) {
        html += `
            <div class="transits__section">
                <h3 class="transits__subtitle">
                    ${i18n.translate('transits.slow_planets') || 'Tránsitos Importantes'}
                    <span class="badge badge--priority">Planetas Lentos</span>
                </h3>
                <div class="transits__list">
                    ${transitsData.slow_transits.map(t => renderTransitItem(t, true)).join('')}
                </div>
            </div>
        `;
    }

    // Todos los tránsitos activos
    html += `
        <div class="transits__section">
            <h3 class="transits__subtitle">
                ${i18n.translate('transits.all') || 'Todos los Tránsitos Activos'}
            </h3>
            <div class="transits__list">
                ${transitsData.aspects.map(t => renderTransitItem(t, false)).join('')}
            </div>
        </div>
    </div>
    `;

    container.innerHTML = html;
}

function renderTransitItem(transit, isPriority) {
    const aspectSymbols = {
        'conjunction': '☌',
        'sextile': '⚹',
        'square': '□',
        'trine': '△',
        'opposition': '☍'
    };

    const aspectColors = {
        'conjunction': '#FFD700',
        'sextile': '#10B981',
        'square': '#EF4444',
        'trine': '#3B82F6',
        'opposition': '#F59E0B'
    };

    const strengthBar = Math.round(transit.strength / 10);
    const strengthHTML = '█'.repeat(strengthBar) + '░'.repeat(10 - strengthBar);

    return `
        <div class="transit-card ${isPriority ? 'transit-card--priority' : ''} ${transit.is_exact ? 'transit-card--exact' : ''}">
            <div class="transit-card__header">
                <div class="transit-card__planets">
                    <span class="transit-card__transit-planet">
                        ${PLANET_SYMBOLS[transit.transit_planet] || transit.transit_planet}
                        ${transit.transit_sign} ${transit.transit_degree}°
                    </span>
                    <span class="transit-card__aspect" style="color: ${aspectColors[transit.aspect]}">
                        ${aspectSymbols[transit.aspect] || transit.aspect}
                    </span>
                    <span class="transit-card__natal-planet">
                        ${PLANET_SYMBOLS[transit.natal_planet] || transit.natal_planet}
                        ${transit.natal_sign} ${transit.natal_degree}°
                    </span>
                </div>
                ${transit.is_exact ? '<span class="badge badge--exact">EXACTO</span>' : ''}
            </div>

            <div class="transit-card__interpretation">
                ${transit.interpretation}
            </div>

            <div class="transit-card__footer">
                <div class="transit-card__strength">
                    <span class="transit-card__label">Intensidad:</span>
                    <span class="transit-card__bar">${strengthHTML}</span>
                    <span class="transit-card__value">${transit.strength}%</span>
                </div>
                <div class="transit-card__orb">
                    Orbe: ${transit.orb}°
                </div>
            </div>
        </div>
    `;
}
```

**Estilos (`styles.scss`):**
```scss
// === TRANSITS ===

.transits {
    margin: 60px 0;
}

.transits__header {
    text-align: center;
    margin-bottom: 40px;
}

.transits__title {
    font-size: 2.5rem;
    color: $gold;
    margin-bottom: 10px;
}

.transits__date {
    color: $text-secondary;
    font-size: 1.1rem;
}

.transits__philosophy {
    margin-bottom: 40px;
}

.transits__section {
    margin-bottom: 40px;
}

.transits__subtitle {
    font-size: 1.5rem;
    color: $gold;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.transit-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateX(4px);
        border-color: rgba(212, 175, 55, 0.5);
        background: rgba(255, 255, 255, 0.05);
    }

    &--priority {
        border-left: 4px solid $gold;
    }

    &--exact {
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        border-color: $gold;
    }
}

.transit-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.transit-card__planets {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.1rem;
}

.transit-card__aspect {
    font-size: 1.5rem;
}

.transit-card__interpretation {
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 12px;
}

.transit-card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
}

.transit-card__strength {
    display: flex;
    align-items: center;
    gap: 8px;
}

.transit-card__bar {
    font-family: monospace;
    color: $gold;
}

.badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;

    &--priority {
        background: rgba(212, 175, 55, 0.2);
        color: $gold;
    }

    &--exact {
        background: rgba(239, 68, 68, 0.2);
        color: #EF4444;
        animation: pulse 2s infinite;
    }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
```

---

## 💑 Feature 2: Sinastría (Comparación de Cartas)

### Concepto

Comparación de dos cartas natales para analizar la compatibilidad y dinámicas relacionales.

**Aplicaciones:**
- Parejas románticas
- Socios de negocio
- Amistades
- Familia (padre-hijo)

### Implementación Backend

**Archivo:** `app.py`

```python
@app.post("/chart/synastry")
async def calculate_synastry(
    person1: ChartRequest,
    person2: ChartRequest
):
    """
    Calcula sinastría entre dos cartas natales.

    Returns:
        - compatibility_score: 0-100%
        - cross_aspects: Aspectos entre ambas cartas
        - element_balance: Comparación de elementos
        - summary: Resumen de compatibilidad
    """

    # 1. Calcular ambas cartas
    chart1 = await calculate_chart(person1)
    chart2 = await calculate_chart(person2)

    # 2. Aspectos cruzados (planetas de A con planetas de B)
    cross_aspects = []

    # ... (similar a tránsitos, pero comparando chart1 vs chart2)

    # 3. Compatibilidad elemental
    elements1 = chart1['element_distribution']
    elements2 = chart2['element_distribution']

    element_compat = calculate_element_compatibility(elements1, elements2)

    # 4. Score de compatibilidad
    score = calculate_synastry_score(cross_aspects, element_compat)

    return {
        'person1': person1.name,
        'person2': person2.name,
        'compatibility_score': score,
        'cross_aspects': cross_aspects,
        'element_balance': element_compat,
        'summary': generate_synastry_summary(score, cross_aspects)
    }
```

---

## 📅 Feature 3: Calendario del Ciclo del Adepto

### Concepto

Vista mensual del ciclo de 18 días con:
- Días óptimos (4-6): mejor para trabajos espirituales
- Días críticos (9-10, 18-1): dificultad transitoria
- Días nadir (13-14): bajo poder pero sin dificultades

### Implementación Backend

**Archivo:** `app.py`

```python
@app.get("/biorhythms/calendar")
async def get_adept_calendar(
    birth_date: str,  # YYYY-MM-DD
    year: int,
    month: int
):
    """
    Genera calendario mensual del Ciclo del Adepto.

    Returns:
        - month: Mes
        - year: Año
        - days: Lista de días con información del ciclo
    """

    from calendar import monthrange
    from datetime import datetime

    calendar_data = []
    days_in_month = monthrange(year, month)[1]

    for day in range(1, days_in_month + 1):
        date = datetime(year, month, day)

        # Calcular biorhythms para ese día
        bio = calculate_biorhythms(birth_date, date.strftime('%Y-%m-%d'))
        adept = bio['cycles']['spiritual']

        calendar_data.append({
            'date': date.isoformat(),
            'day_number': day,
            'day_of_week': date.strftime('%A'),
            'day_of_cycle': adept['current_day'],
            'quality': adept['quality'],
            'symbol': adept['symbol'],
            'is_optimal': adept['is_optimal'],
            'is_critical': adept['is_critical'],
            'is_nadir': adept['is_nadir'],
            'ra_quote': adept['ra_quote'],
            'color': get_adept_day_color(adept)
        })

    return {
        'month': month,
        'year': year,
        'month_name': datetime(year, month, 1).strftime('%B'),
        'days': calendar_data
    }


def get_adept_day_color(adept_data):
    """Retorna color según calidad del día."""
    if adept_data['is_optimal']:
        return '#FFD700'  # Gold
    elif adept_data['is_critical']:
        return '#EF4444'  # Red
    elif adept_data['is_nadir']:
        return '#6B7280'  # Gray
    else:
        return '#10B981'  # Green
```

### Implementación Frontend

**Archivo:** `app.js`

```javascript
async function renderAdeptCalendar(birthDate, year, month) {
    const data = await fetch(
        `${CONFIG.API_URL}/biorhythms/calendar?birth_date=${birthDate}&year=${year}&month=${month}`
    ).then(r => r.json());

    // Usar librería FullCalendar.js o crear calendario custom
    // ...
}
```

---

## 📊 Prioridad de Implementación

### Fase 1: Quick Win (1-2 horas)
1. ✅ **Calendario del Adepto** - Backend ya existe, solo falta endpoint + UI

### Fase 2: Medium Effort (1-2 días)
2. 🟡 **Tránsitos Planetarios** - Kerykeion listo, falta lógica de aspectos + interpretaciones

### Fase 3: Complex (3-4 días)
3. 🔴 **Sinastría** - UI compleja (dos formularios) + algoritmo de scoring

---

## ⏱️ Estimaciones

| Feature | Backend | Frontend | Testing | Total |
|---------|---------|----------|---------|-------|
| Calendario Adepto | 1h | 2h | 30min | 3.5h |
| Tránsitos | 4h | 3h | 1h | 8h |
| Sinastría | 6h | 5h | 2h | 13h |

---

*Documento creado: 5 de enero de 2026*
*Proyecto: Astro.cl - Expansion Features*
