/**
 * Astro Chart - Frontend Application
 * ===================================
 * Aplicación para calcular y visualizar cartas natales
 */

// === CONFIGURACIÓN ===
const CONFIG = {
    // En producción usa Railway, en desarrollo usa localhost
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000'
        : 'https://web-production-22c8f.up.railway.app',
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
        renderPlanetsInHouses(chartData.interpretations.planets_in_houses);

        // Renderizar interpretaciones de aspectos
        renderAspects(chartData.interpretations.aspects);
    }

    // Renderizar biorritmos (enseñanzas de Ra)
    if (chartData.biorhythms) {
        renderBiorhythms(chartData.biorhythms);
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
    
    // Crear carta SVG simplificada
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 400 400');
    svg.style.width = '100%';
    svg.style.height = '100%';
    
    // Círculo exterior
    const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outerCircle.setAttribute('cx', '200');
    outerCircle.setAttribute('cy', '200');
    outerCircle.setAttribute('r', '180');
    outerCircle.setAttribute('fill', 'none');
    outerCircle.setAttribute('stroke', '#d4af37');
    outerCircle.setAttribute('stroke-width', '2');
    svg.appendChild(outerCircle);
    
    // Círculo medio
    const midCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    midCircle.setAttribute('cx', '200');
    midCircle.setAttribute('cy', '200');
    midCircle.setAttribute('r', '140');
    midCircle.setAttribute('fill', 'none');
    midCircle.setAttribute('stroke', 'rgba(212, 175, 55, 0.4)');
    midCircle.setAttribute('stroke-width', '1');
    svg.appendChild(midCircle);
    
    // Círculo interior
    const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    innerCircle.setAttribute('cx', '200');
    innerCircle.setAttribute('cy', '200');
    innerCircle.setAttribute('r', '60');
    innerCircle.setAttribute('fill', 'none');
    innerCircle.setAttribute('stroke', 'rgba(212, 175, 55, 0.3)');
    innerCircle.setAttribute('stroke-width', '1');
    svg.appendChild(innerCircle);
    
    // Signos del zodiaco
    const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    
    // Divisiones de signos y símbolos
    for (let i = 0; i < 12; i++) {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x1 = 200 + 140 * Math.cos(angle);
        const y1 = 200 + 140 * Math.sin(angle);
        const x2 = 200 + 180 * Math.cos(angle);
        const y2 = 200 + 180 * Math.sin(angle);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'rgba(212, 175, 55, 0.5)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
        
        // Símbolo del signo
        const symbolAngle = ((i * 30) + 15 - 90) * Math.PI / 180;
        const sx = 200 + 160 * Math.cos(symbolAngle);
        const sy = 200 + 160 * Math.sin(symbolAngle);
        
        const signText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        signText.setAttribute('x', sx);
        signText.setAttribute('y', sy);
        signText.setAttribute('text-anchor', 'middle');
        signText.setAttribute('dominant-baseline', 'middle');
        signText.setAttribute('fill', '#8888a0');
        signText.setAttribute('font-size', '16');
        signText.textContent = zodiacSymbols[i];
        svg.appendChild(signText);
    }
    
    // Texto central con el ascendente
    const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerText.setAttribute('x', '200');
    centerText.setAttribute('y', '195');
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('fill', '#d4af37');
    centerText.setAttribute('font-family', 'Cinzel, serif');
    centerText.setAttribute('font-size', '12');
    centerText.textContent = 'ASC';
    svg.appendChild(centerText);
    
    const ascText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ascText.setAttribute('x', '200');
    ascText.setAttribute('y', '215');
    ascText.setAttribute('text-anchor', 'middle');
    ascText.setAttribute('fill', '#e8e8f0');
    ascText.setAttribute('font-family', 'Cinzel, serif');
    ascText.setAttribute('font-size', '14');
    ascText.textContent = chartData.ascendant;
    svg.appendChild(ascText);
    
    // Símbolos de planetas
    const planetSymbols = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♅', '♆', '♇'];
    chartData.planets.forEach((planet, i) => {
        const angle = (i * 36 - 90) * Math.PI / 180;
        const radius = 100;
        const x = 200 + radius * Math.cos(angle);
        const y = 200 + radius * Math.sin(angle);
        
        const planetText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        planetText.setAttribute('x', x);
        planetText.setAttribute('y', y);
        planetText.setAttribute('text-anchor', 'middle');
        planetText.setAttribute('dominant-baseline', 'middle');
        planetText.setAttribute('fill', '#d4af37');
        planetText.setAttribute('font-size', '20');
        planetText.textContent = planetSymbols[i] || '★';
        svg.appendChild(planetText);
    });
    
    DOM.chart.appendChild(svg);
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

// === INICIALIZACIÓN ===

function init() {
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
    
    console.log('🌟 Astro Chart inicializado');
}

document.addEventListener('DOMContentLoaded', init);
