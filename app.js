/**
 * Astro Chart - Frontend Application
 * ===================================
 * Aplicación para calcular y visualizar cartas natales
 */

// === CONFIGURACIÓN ===
const CONFIG = {
    // En producción usa Vultr (Chile) con HTTPS, en desarrollo usa localhost
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8001'
        : 'https://api.chuchurex.cl',
    DEFAULT_TIMEZONE: 'America/Santiago'
};

// === SÍMBOLOS PLANETARIOS ===
const PLANET_SYMBOLS = {
    'Sol': '☉',
    'Luna': '☽',
    'Mercurio': '☿',
    'Venus': '♀',
    'Marte': '♂',
    'Júpiter': '♃',
    'Saturno': '♄',
    'Urano': '♅',
    'Neptuno': '♆',
    'Plutón': '♇',
    'Sun': '☉',
    'Moon': '☽',
    'Mercury': '☿',
    'Mars': '♂',
    'Jupiter': '♃',
    'Saturn': '♄',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇'
};

// === ELEMENTOS DEL DOM ===
const DOM = {
    form: null,
    loader: null,
    results: null,
    calculateBtn: null,
    nameInput: null,
    birthDate: null,
    birthTime: null,
    cityInput: null,
    latitudeInput: null,
    longitudeInput: null,
    resultName: null,
    sunSign: null,
    moonSign: null,
    ascendant: null,
    planetsGrid: null,
    chart: null,
    sunInterpretation: null,
    moonInterpretation: null,
    ascInterpretation: null
};

// === UTILIDADES ===

function showLoader() {
    if (DOM.loader) DOM.loader.classList.remove('hidden');
}

function hideLoader() {
    if (DOM.loader) DOM.loader.classList.add('hidden');
}

function showResults() {
    if (DOM.results) {
        DOM.results.classList.remove('hidden');
        DOM.results.scrollIntoView({ behavior: 'smooth' });
    }
}

function hideResults() {
    if (DOM.results) DOM.results.classList.add('hidden');
}

// === GEOCODIFICACIÓN ===

async function geocodeCity(city) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`,
            { headers: { 'Accept-Language': 'es' } }
        );
        
        const data = await response.json();
        
        if (data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }
        
        throw new Error('Ciudad no encontrada');
    } catch (error) {
        console.error('Error en geocodificación:', error);
        return { lat: -33.4489, lon: -70.6693 };
    }
}

// === API ===

async function calculateChart(birthData) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/chart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(birthData)
        });
        
        if (!response.ok) throw new Error('Error en el servidor');
        return await response.json();
    } catch (error) {
        console.error('Error al calcular carta:', error);
        return calculateChartLocally(birthData);
    }
}

// === CÁLCULOS LOCALES ===

function calculateSunSign(month, day) {
    const dates = [
        [1, 20, 'Capricornio'], [2, 19, 'Acuario'], [3, 21, 'Piscis'],
        [4, 20, 'Aries'], [5, 21, 'Tauro'], [6, 21, 'Géminis'],
        [7, 23, 'Cáncer'], [8, 23, 'Leo'], [9, 23, 'Virgo'],
        [10, 23, 'Libra'], [11, 22, 'Escorpio'], [12, 22, 'Sagitario']
    ];
    
    for (let i = 0; i < dates.length; i++) {
        const [m, d, sign] = dates[i];
        if (month === m && day < d) {
            return i > 0 ? dates[i - 1][2] : 'Sagitario';
        } else if (month === m) {
            return sign;
        }
    }
    return 'Sagitario';
}

function calculateMoonSign(year, month, day) {
    const signs = [
        'Aries', 'Tauro', 'Géminis', 'Cáncer',
        'Leo', 'Virgo', 'Libra', 'Escorpio',
        'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
    ];
    
    const baseDate = new Date(2000, 0, 1);
    const birthDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((birthDate - baseDate) / (1000 * 60 * 60 * 24));
    
    const moonCycle = 27.3;
    const position = (daysDiff % moonCycle) / moonCycle * 12;
    const signIndex = Math.floor(Math.abs(position)) % 12;
    
    return signs[signIndex];
}

function calculateAscendant(hour, month) {
    const signs = [
        'Aries', 'Tauro', 'Géminis', 'Cáncer',
        'Leo', 'Virgo', 'Libra', 'Escorpio',
        'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
    ];
    
    const sunSignIndex = (month - 1) % 12;
    const hourOffset = Math.floor((hour - 6) / 2);
    const ascIndex = (sunSignIndex + hourOffset + 12) % 12;
    
    return signs[ascIndex];
}

function calculateChartLocally(data) {
    const sunSign = calculateSunSign(data.month, data.day);
    const moonSign = calculateMoonSign(data.year, data.month, data.day);
    const ascendant = calculateAscendant(data.hour, data.month);
    
    const signs = [
        'Aries', 'Tauro', 'Géminis', 'Cáncer',
        'Leo', 'Virgo', 'Libra', 'Escorpio',
        'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
    ];
    
    const sunIndex = signs.indexOf(sunSign);
    
    const planets = [
        { name: 'Sol', sign: sunSign, degree: 15, house: 1 },
        { name: 'Luna', sign: moonSign, degree: 20, house: 4 },
        { name: 'Mercurio', sign: sunSign, degree: 10, house: 1 },
        { name: 'Venus', sign: signs[(sunIndex + 1) % 12], degree: 25, house: 2 },
        { name: 'Marte', sign: signs[(sunIndex + 2) % 12], degree: 8, house: 3 },
        { name: 'Júpiter', sign: signs[(sunIndex + 4) % 12], degree: 12, house: 5 },
        { name: 'Saturno', sign: signs[(sunIndex + 6) % 12], degree: 18, house: 7 },
        { name: 'Urano', sign: signs[(sunIndex + 8) % 12], degree: 5, house: 9 },
        { name: 'Neptuno', sign: signs[(sunIndex + 9) % 12], degree: 22, house: 10 },
        { name: 'Plutón', sign: signs[(sunIndex + 10) % 12], degree: 28, house: 11 }
    ];
    
    return {
        name: data.name,
        sun_sign: sunSign,
        moon_sign: moonSign,
        ascendant: ascendant,
        planets: planets,
        interpretations: {
            sun: `El Sol en ${sunSign} representa tu esencia vital y propósito de vida. Esta posición define cómo te expresas y qué te da energía.`,
            moon: `La Luna en ${moonSign} refleja tu mundo emocional interno, tus necesidades y cómo te nutres emocionalmente.`,
            ascendant: `El Ascendente en ${ascendant} define cómo te presentas al mundo y la primera impresión que das a los demás.`
        },
        calculation_method: 'local'
    };
}

// === RENDERIZADO ===

function renderResults(chartData) {
    DOM.resultName.textContent = `Carta Astral de ${chartData.name}`;
    DOM.sunSign.textContent = chartData.sun_sign;
    DOM.moonSign.textContent = chartData.moon_sign;
    DOM.ascendant.textContent = chartData.ascendant;

    renderPlanets(chartData.planets);
    renderChart(chartData);

    if (chartData.interpretations) {
        DOM.sunInterpretation.textContent = chartData.interpretations.sun;
        DOM.moonInterpretation.textContent = chartData.interpretations.moon;
        DOM.ascInterpretation.textContent = chartData.interpretations.ascendant;

        // Renderizar resumen ejecutivo
        renderSummary(chartData.interpretations.summary);

        // Renderizar distribución de elementos y modalidades
        renderElementModality(chartData.interpretations.element_modality);

        // Renderizar interpretaciones de planetas en casas
        if (chartData.interpretations.planets_in_houses && Object.keys(chartData.interpretations.planets_in_houses).length > 0) {
            renderPlanetsInHouses(chartData.interpretations.planets_in_houses);
            document.getElementById('planets-houses-section')?.classList.remove('hidden');
        }

        // Renderizar interpretaciones de aspectos
        if (chartData.interpretations.aspects && chartData.interpretations.aspects.length > 0) {
            renderAspects(chartData.interpretations.aspects);
            document.getElementById('aspects-section')?.classList.remove('hidden');
        }
    }

    // Renderizar biorritmos (enseñanzas de Ra)
    console.log('🔮 Biorhythms data:', chartData.biorhythms);
    if (chartData.biorhythms && chartData.biorhythms.cycles) {
        console.log('🔮 Renderizando biorritmos...');
        renderBiorhythms(chartData.biorhythms);
        document.getElementById('biorhythms-section')?.classList.remove('hidden');
        console.log('🔮 Biorritmos renderizados');
    } else {
        console.log('🔮 No hay datos de biorritmos');
    }
}

// Símbolos de aspectos
const ASPECT_SYMBOLS = {
    'conjunction': '☌',
    'opposition': '☍',
    'square': '□',
    'trine': '△',
    'sextile': '⚹',
    'quintile': 'Q'
};

function renderAspects(aspects) {
    const container = document.getElementById('aspects-interpretations');
    if (!container || !aspects || aspects.length === 0) return;

    container.innerHTML = '';

    aspects.forEach(aspect => {
        const symbol1 = PLANET_SYMBOLS[aspect.planet1] || '★';
        const symbol2 = PLANET_SYMBOLS[aspect.planet2] || '★';
        const aspectSymbol = ASPECT_SYMBOLS[aspect.aspect] || '•';

        const card = document.createElement('article');
        card.className = 'interpretation-card interpretation-card--aspect';
        card.innerHTML = `
            <header class="interpretation-card__header">
                <span class="interpretation-card__symbols">
                    <span class="interpretation-card__symbol">${symbol1}</span>
                    <span class="interpretation-card__aspect-symbol">${aspectSymbol}</span>
                    <span class="interpretation-card__symbol">${symbol2}</span>
                </span>
                <h4 class="interpretation-card__title">${aspect.planet1} ${aspect.aspect} ${aspect.planet2}</h4>
            </header>
            <p class="interpretation-card__text">${aspect.interpretation}</p>
        `;

        container.appendChild(card);
    });
}

function renderPlanetsInHouses(planetsInHouses) {
    const container = document.getElementById('planets-interpretations');
    if (!container || !planetsInHouses) return;

    container.innerHTML = '';

    Object.entries(planetsInHouses).forEach(([planetName, data]) => {
        const symbol = PLANET_SYMBOLS[planetName] || '★';

        const card = document.createElement('article');
        card.className = 'interpretation-card interpretation-card--compact';
        card.innerHTML = `
            <header class="interpretation-card__header">
                <span class="interpretation-card__symbol">${symbol}</span>
                <h4 class="interpretation-card__title">${planetName} en Casa ${data.house}</h4>
            </header>
            <p class="interpretation-card__text">${data.interpretation}</p>
        `;

        container.appendChild(card);
    });
}

// Nombres de elementos y modalidades en español
const ELEMENT_NAMES = {
    'fire': 'Fuego',
    'earth': 'Tierra',
    'air': 'Aire',
    'water': 'Agua'
};

const MODALITY_NAMES = {
    'cardinal': 'Cardinal',
    'fixed': 'Fijo',
    'mutable': 'Mutable'
};

const ELEMENT_COLORS = {
    'fire': '#e74c3c',
    'earth': '#27ae60',
    'air': '#3498db',
    'water': '#9b59b6'
};

const MODALITY_COLORS = {
    'cardinal': '#e67e22',
    'fixed': '#2980b9',
    'mutable': '#1abc9c'
};

function renderSummary(summary) {
    const container = document.getElementById('summary-container');
    if (!container || !summary) return;

    container.innerHTML = `
        <div class="summary-card">
            <p class="summary-card__text">${summary}</p>
        </div>
    `;
}

function renderBiorhythms(biorhythms) {
    const container = document.getElementById('biorhythms-container');
    if (!container || !biorhythms) return;

    const { cycles, critical_analysis, ra_philosophy } = biorhythms;

    // Crear HTML para cada ciclo
    const cycleHtml = Object.entries(cycles).map(([key, cycle]) => {
        const isSpiritual = key === 'spiritual';
        const barColor = isSpiritual ? cycle.color : getCycleColor(cycle.value);
        const statusClass = cycle.is_critical ? 'critical' : (cycle.value > 0.5 ? 'high' : (cycle.value < -0.5 ? 'low' : 'neutral'));

        return `
            <div class="biorhythm-cycle biorhythm-cycle--${key} ${isSpiritual ? 'biorhythm-cycle--spiritual' : ''}">
                <div class="biorhythm-cycle__header">
                    <span class="biorhythm-cycle__name">${cycle.name}</span>
                    ${isSpiritual ? `<span class="biorhythm-cycle__quality" style="color: ${cycle.color}">${cycle.symbol} ${cycle.quality}</span>` : ''}
                    <span class="biorhythm-cycle__day">Día ${cycle.current_day}/${cycle.duration}</span>
                </div>
                <div class="biorhythm-cycle__bar">
                    <div class="biorhythm-cycle__track">
                        <div class="biorhythm-cycle__fill" style="width: ${cycle.percentage}%; background: ${barColor}"></div>
                        <div class="biorhythm-cycle__marker" style="left: ${cycle.percentage}%"></div>
                    </div>
                    <span class="biorhythm-cycle__value ${statusClass}">${cycle.percentage}%</span>
                </div>
                ${isSpiritual ? `
                    <p class="biorhythm-cycle__description">${cycle.description}</p>
                    ${cycle.ra_quote ? `<blockquote class="biorhythm-cycle__quote">${cycle.ra_quote}</blockquote>` : ''}
                ` : ''}
            </div>
        `;
    }).join('');

    // Crear HTML para análisis crítico
    const criticalClass = critical_analysis.level.toLowerCase();

    container.innerHTML = `
        <div class="biorhythms">
            <div class="biorhythms__cycles">
                ${cycleHtml}
            </div>

            <div class="biorhythms__critical biorhythms__critical--${criticalClass}">
                <span class="biorhythms__critical-level">${getLevelIcon(critical_analysis.level)} ${critical_analysis.level}</span>
                <p class="biorhythms__critical-message">${critical_analysis.message}</p>
            </div>

            <div class="biorhythms__philosophy">
                <blockquote class="biorhythms__philosophy-quote">
                    <p>"${ra_philosophy.map_not_destiny}"</p>
                    <footer>— Enseñanzas de Ra</footer>
                </blockquote>
            </div>
        </div>
    `;
}

function getCycleColor(value) {
    if (value > 0.5) return '#10B981';
    if (value > 0) return '#60A5FA';
    if (value > -0.5) return '#F59E0B';
    return '#EF4444';
}

function getLevelIcon(level) {
    switch(level) {
        case 'BAJO': return '✓';
        case 'MODERADO': return '⚠';
        case 'ALTO': return '⚡';
        default: return '•';
    }
}

function renderElementModality(elementModality) {
    const container = document.getElementById('element-modality-container');
    if (!container || !elementModality) return;

    const elements = elementModality.elements;
    const modalities = elementModality.modalities;

    container.innerHTML = `
        <div class="element-modality">
            <div class="element-modality__section">
                <h4 class="element-modality__title">Elementos</h4>
                <div class="element-modality__dominant">
                    <span class="element-modality__icon element-modality__icon--${elements.dominant}"></span>
                    <span class="element-modality__label">Dominante: ${ELEMENT_NAMES[elements.dominant]}</span>
                </div>
                <div class="element-modality__bars">
                    ${Object.entries(elements.percentages).map(([el, pct]) => `
                        <div class="element-bar">
                            <span class="element-bar__label">${ELEMENT_NAMES[el]}</span>
                            <div class="element-bar__track">
                                <div class="element-bar__fill element-bar__fill--${el}" style="width: ${pct}%"></div>
                            </div>
                            <span class="element-bar__value">${pct}%</span>
                        </div>
                    `).join('')}
                </div>
                <p class="element-modality__interpretation">${elements.interpretation}</p>
            </div>

            <div class="element-modality__section">
                <h4 class="element-modality__title">Modalidades</h4>
                <div class="element-modality__dominant">
                    <span class="element-modality__icon element-modality__icon--${modalities.dominant}"></span>
                    <span class="element-modality__label">Dominante: ${MODALITY_NAMES[modalities.dominant]}</span>
                </div>
                <div class="element-modality__bars">
                    ${Object.entries(modalities.percentages).map(([mod, pct]) => `
                        <div class="element-bar">
                            <span class="element-bar__label">${MODALITY_NAMES[mod]}</span>
                            <div class="element-bar__track">
                                <div class="element-bar__fill element-bar__fill--${mod}" style="width: ${pct}%"></div>
                            </div>
                            <span class="element-bar__value">${pct}%</span>
                        </div>
                    `).join('')}
                </div>
                <p class="element-modality__interpretation">${modalities.interpretation}</p>
            </div>
        </div>
    `;
}

function renderPlanets(planets) {
    DOM.planetsGrid.innerHTML = '';
    
    planets.forEach(planet => {
        const card = document.createElement('div');
        card.className = 'planet-card';
        
        const symbol = PLANET_SYMBOLS[planet.name] || '★';
        const degree = typeof planet.degree === 'number' ? 
            `${Math.floor(planet.degree)}°${Math.floor((planet.degree % 1) * 60)}'` : 
            planet.degree;
        
        card.innerHTML = `
            <span class="planet-card__symbol">${symbol}</span>
            <div class="planet-card__info">
                <span class="planet-card__name">${planet.name}</span>
                <span class="planet-card__position">${planet.sign} ${degree}</span>
                <span class="planet-card__house">Casa ${planet.house}</span>
            </div>
        `;
        
        DOM.planetsGrid.appendChild(card);
    });
}

function renderChart(chartData) {
    DOM.chart.innerHTML = '';
    // Usar nuestra carta SVG personalizada con símbolos Unicode limpios
    renderSimpleChart(chartData);
}

function renderSimpleChart(chartData) {
    // Carta SVG simplificada con posiciones reales
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 400 400');
    svg.style.width = '100%';
    svg.style.height = '100%';

    const cx = 200, cy = 200;
    const outerR = 180, midR = 140, innerR = 100, centerR = 60;

    // Círculo exterior
    drawCircle(svg, cx, cy, outerR, '#d4af37', 2);
    drawCircle(svg, cx, cy, midR, 'rgba(212, 175, 55, 0.4)', 1);
    drawCircle(svg, cx, cy, innerR, 'rgba(212, 175, 55, 0.3)', 1);
    drawCircle(svg, cx, cy, centerR, 'rgba(212, 175, 55, 0.2)', 1);

    // Signos del zodiaco
    const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

    // Obtener offset del Ascendente (Casa 1)
    const ascOffset = chartData.cusps ? chartData.cusps[0] : 0;

    // Divisiones de signos y símbolos
    for (let i = 0; i < 12; i++) {
        const signStart = (i * 30 - ascOffset - 90);
        const angle = signStart * Math.PI / 180;

        // Línea divisoria
        const x1 = cx + midR * Math.cos(angle);
        const y1 = cy + midR * Math.sin(angle);
        const x2 = cx + outerR * Math.cos(angle);
        const y2 = cy + outerR * Math.sin(angle);
        drawLine(svg, x1, y1, x2, y2, 'rgba(212, 175, 55, 0.5)', 1);

        // Símbolo del signo
        const symbolAngle = (signStart + 15) * Math.PI / 180;
        const sx = cx + (midR + 20) * Math.cos(symbolAngle);
        const sy = cy + (midR + 20) * Math.sin(symbolAngle);
        drawText(svg, sx, sy, zodiacSymbols[i], '#8888a0', 14);
    }

    // Dibujar casas si tenemos cúspides
    if (chartData.cusps && chartData.cusps.length === 12) {
        chartData.cusps.forEach((cusp, i) => {
            const angle = (cusp - ascOffset - 90) * Math.PI / 180;
            const x1 = cx + centerR * Math.cos(angle);
            const y1 = cy + centerR * Math.sin(angle);
            const x2 = cx + midR * Math.cos(angle);
            const y2 = cy + midR * Math.sin(angle);

            const strokeWidth = (i === 0 || i === 3 || i === 6 || i === 9) ? 2 : 1;
            const color = (i === 0 || i === 3 || i === 6 || i === 9) ? '#d4af37' : 'rgba(212, 175, 55, 0.4)';
            drawLine(svg, x1, y1, x2, y2, color, strokeWidth);
        });
    }

    // Símbolos de planetas en sus posiciones reales
    const planetSymbols = {
        'Sol': '☉', 'Luna': '☽', 'Mercurio': '☿', 'Venus': '♀', 'Marte': '♂',
        'Júpiter': '♃', 'Saturno': '♄', 'Urano': '♅', 'Neptuno': '♆', 'Plutón': '♇'
    };

    const planetColors = {
        'Sol': '#FFD700', 'Luna': '#C0C0C0', 'Mercurio': '#87CEEB', 'Venus': '#98FB98',
        'Marte': '#FF6347', 'Júpiter': '#DEB887', 'Saturno': '#DAA520',
        'Urano': '#00CED1', 'Neptuno': '#6495ED', 'Plutón': '#9370DB'
    };

    chartData.planets.forEach((planet, i) => {
        const absPos = planet.abs_pos !== undefined ? planet.abs_pos : (i * 36);
        const angle = (absPos - ascOffset - 90) * Math.PI / 180;
        const radius = innerR - 15;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        const symbol = planetSymbols[planet.name] || '★';
        const color = planetColors[planet.name] || '#d4af37';
        drawText(svg, x, y, symbol, color, 18);
    });

    // Texto central
    drawText(svg, cx, cy - 10, 'ASC', '#d4af37', 12);
    drawText(svg, cx, cy + 10, chartData.ascendant, '#e8e8f0', 14);

    DOM.chart.appendChild(svg);
}

// Funciones auxiliares para SVG
function drawCircle(svg, cx, cy, r, stroke, strokeWidth) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', stroke);
    circle.setAttribute('stroke-width', strokeWidth);
    svg.appendChild(circle);
}

function drawLine(svg, x1, y1, x2, y2, stroke, strokeWidth) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', stroke);
    line.setAttribute('stroke-width', strokeWidth);
    svg.appendChild(line);
}

function drawText(svg, x, y, text, fill, fontSize) {
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', x);
    textEl.setAttribute('y', y);
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('dominant-baseline', 'middle');
    textEl.setAttribute('fill', fill);
    textEl.setAttribute('font-size', fontSize);
    textEl.textContent = text;
    svg.appendChild(textEl);
}

// === EVENT HANDLERS ===

async function handleFormSubmit(event) {
    event.preventDefault();

    showLoader();
    hideResults();

    try {
        const formData = new FormData(DOM.form);
        const name = formData.get('name');
        const birthDate = formData.get('birthDate');
        const birthTime = formData.get('birthTime');
        const city = formData.get('city');

        console.log('📝 Datos del formulario:', { name, birthDate, birthTime, city });

        const [year, month, day] = birthDate.split('-').map(Number);
        const [hour, minute] = birthTime.split(':').map(Number);

        let latitude = parseFloat(formData.get('latitude'));
        let longitude = parseFloat(formData.get('longitude'));

        console.log('📍 Coordenadas iniciales:', { latitude, longitude });

        if (!latitude || !longitude) {
            console.log('🔍 Geocodificando ciudad:', city);
            const coords = await geocodeCity(city);
            latitude = coords.lat;
            longitude = coords.lon;
            DOM.latitudeInput.value = latitude;
            DOM.longitudeInput.value = longitude;
            console.log('📍 Coordenadas geocodificadas:', { latitude, longitude });
        }

        const birthData = {
            name,
            year,
            month,
            day,
            hour,
            minute,
            latitude,
            longitude,
            timezone: CONFIG.DEFAULT_TIMEZONE
        };

        console.log('🚀 Enviando al servidor:', birthData);

        const chartData = await calculateChart(birthData);

        console.log('✨ Respuesta del servidor:', chartData);

        renderResults(chartData);
        showResults();

    } catch (error) {
        console.error('❌ Error:', error);
        alert('Hubo un error al calcular la carta. Por favor, intenta de nuevo.');
    } finally {
        hideLoader();
    }
}

async function handleCityChange(event) {
    const city = event.target.value;
    
    if (city.length > 3) {
        const coords = await geocodeCity(city);
        DOM.latitudeInput.value = coords.lat.toFixed(4);
        DOM.longitudeInput.value = coords.lon.toFixed(4);
    }
}

// === PARÁMETROS URL ===

function parseURLParams() {
    // Formato: ?name=Carlos&date=19800822&time=00:00&lat=-33.4489&lon=-70.6693
    // O también: ?Carlos&19800822&00:00&-33.4489&-70.6693 (posicional)
    const params = new URLSearchParams(window.location.search);

    // Intentar formato con nombres
    if (params.has('name') || params.has('date')) {
        return {
            name: params.get('name') || '',
            date: params.get('date') || '',
            time: params.get('time') || '12:00',
            lat: params.get('lat') || '-33.4489',
            lon: params.get('lon') || '-70.6693',
            city: params.get('city') || ''
        };
    }

    // Intentar formato posicional: ?Carlos&19800822&00:00&-33.4489&-70.6693
    const keys = Array.from(params.keys());
    if (keys.length >= 2) {
        return {
            name: keys[0] || '',
            date: keys[1] || '',
            time: keys[2] || '12:00',
            lat: keys[3] || '-33.4489',
            lon: keys[4] || '-70.6693',
            city: ''
        };
    }

    return null;
}

function formatDateForInput(dateStr) {
    // Convierte YYYYMMDD a YYYY-MM-DD
    if (dateStr && dateStr.length === 8) {
        return `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
    }
    return dateStr;
}

function fillFormFromURL() {
    const urlData = parseURLParams();
    if (!urlData) return false;

    if (urlData.name && DOM.nameInput) {
        DOM.nameInput.value = decodeURIComponent(urlData.name);
    }

    if (urlData.date && DOM.birthDate) {
        DOM.birthDate.value = formatDateForInput(urlData.date);
    }

    if (urlData.time && DOM.birthTime) {
        DOM.birthTime.value = urlData.time;
    }

    if (urlData.lat && DOM.latitudeInput) {
        DOM.latitudeInput.value = urlData.lat;
    }

    if (urlData.lon && DOM.longitudeInput) {
        DOM.longitudeInput.value = urlData.lon;
    }

    if (urlData.city && DOM.cityInput) {
        DOM.cityInput.value = decodeURIComponent(urlData.city);
    }

    console.log('📋 Formulario pre-llenado desde URL:', urlData);
    return true;
}

// === INICIALIZACIÓN ===

async function init() {
    // Obtener elementos del DOM
    DOM.form = document.getElementById('birth-form');
    DOM.loader = document.getElementById('loader');
    DOM.results = document.getElementById('results');
    DOM.calculateBtn = document.getElementById('calculate-btn');
    DOM.nameInput = document.getElementById('name');
    DOM.birthDate = document.getElementById('birth-date');
    DOM.birthTime = document.getElementById('birth-time');
    DOM.cityInput = document.getElementById('city');
    DOM.latitudeInput = document.getElementById('latitude');
    DOM.longitudeInput = document.getElementById('longitude');
    DOM.resultName = document.getElementById('result-name');
    DOM.sunSign = document.getElementById('sun-sign');
    DOM.moonSign = document.getElementById('moon-sign');
    DOM.ascendant = document.getElementById('ascendant');
    DOM.planetsGrid = document.getElementById('planets-grid');
    DOM.chart = document.getElementById('chart');
    DOM.sunInterpretation = document.querySelector('#sun-interpretation .interpretation-card__text');
    DOM.moonInterpretation = document.querySelector('#moon-interpretation .interpretation-card__text');
    DOM.ascInterpretation = document.querySelector('#asc-interpretation .interpretation-card__text');

    // Event listeners
    if (DOM.form) DOM.form.addEventListener('submit', handleFormSubmit);
    if (DOM.cityInput) DOM.cityInput.addEventListener('blur', handleCityChange);

    // Fecha máxima = hoy
    if (DOM.birthDate) {
        const today = new Date().toISOString().split('T')[0];
        DOM.birthDate.setAttribute('max', today);
    }

    // Valores por defecto
    if (DOM.latitudeInput) DOM.latitudeInput.value = '-33.4489';
    if (DOM.longitudeInput) DOM.longitudeInput.value = '-70.6693';

    // Pre-llenar desde URL si hay parámetros
    const filledFromURL = fillFormFromURL();

    // Si se llenó desde URL y tiene todos los datos, calcular automáticamente
    if (filledFromURL && DOM.nameInput?.value && DOM.birthDate?.value && DOM.birthTime?.value) {
        console.log('🚀 Calculando carta automáticamente desde URL...');
        setTimeout(() => DOM.form?.dispatchEvent(new Event('submit')), 500);
    }

    console.log('🌟 Astro Chart inicializado');

    // Inicializar i18n
    await i18n.init();
}

// === SISTEMA DE INTERNACIONALIZACIÓN (i18n) ===
const i18n = {
    currentLang: 'en',
    translations: {},
    supportedLangs: ['en', 'es', 'pt'],

    async init() {
        const lang = this.detectLanguage();
        await this.setLanguage(lang);
        this.setupLangSelector();
    },

    detectLanguage() {
        // 1. URL param tiene prioridad
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.supportedLangs.includes(urlLang)) {
            return urlLang;
        }

        // 2. localStorage (preferencia guardada)
        const savedLang = localStorage.getItem('lang');
        if (savedLang && this.supportedLangs.includes(savedLang)) {
            return savedLang;
        }

        // 3. Idioma del navegador
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLangs.includes(browserLang)) {
            return browserLang;
        }

        // 4. Default: inglés
        return 'en';
    },

    async loadTranslations(lang) {
        try {
            const basePath = window.location.pathname.includes('about.html') ? '' : '';
            const response = await fetch(`${basePath}i18n/${lang}.json`);
            if (!response.ok) throw new Error('Failed to load translations');
            const data = await response.json();
            console.log(`🌐 Traducciones cargadas: ${lang}`, data);
            return data;
        } catch (error) {
            console.error(`Error loading ${lang} translations:`, error);
            return null;
        }
    },

    async setLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) {
            lang = 'en';
        }

        const translations = await this.loadTranslations(lang);
        if (!translations) {
            if (lang !== 'en') {
                return this.setLanguage('en');
            }
            return;
        }

        this.currentLang = lang;
        this.translations = translations;
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;

        this.applyTranslations();
        this.updateLangSelector();
    },

    t(key) {
        const keys = key.split('.');
        let value = this.translations;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        return value;
    },

    applyTranslations() {
        // Traducir elementos con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                el.textContent = translation;
            }
        });

        // Traducir placeholders con data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation !== key) {
                el.placeholder = translation;
            }
        });

        // Actualizar título de la página
        const titleKey = document.body.contains(document.querySelector('.about'))
            ? 'about.name'
            : 'header.title';
        const pageTitle = this.t(titleKey);
        if (pageTitle !== titleKey) {
            document.title = `${pageTitle} | ${this.t('header.title')}`;
        }
    },

    setupLangSelector() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
    },

    updateLangSelector() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            if (lang === this.currentLang) {
                btn.classList.add('lang-btn--active');
            } else {
                btn.classList.remove('lang-btn--active');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', init);
