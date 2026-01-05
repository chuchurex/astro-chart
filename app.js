/**
 * Astro Chart - Frontend Application
 * ===================================
 * Aplicación para calcular y visualizar cartas natales
 */

// === CONFIGURACIÓN ===
const CONFIG = {
    // En producción usa Vultr (Chile), en desarrollo usa localhost
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8001'
        : 'http://api.astro.chuchurex.cl',
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

// === PARSEO FLEXIBLE DE FECHA Y HORA ===

/**
 * Parsea fecha en múltiples formatos:
 * - DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
 * - YYYY/MM/DD, YYYY-MM-DD
 * - "15 marzo 1985", "march 15 1985"
 * Retorna { year, month, day } o null si no puede parsear
 */
function parseFlexibleDate(input) {
    if (!input) return null;
    const str = input.trim();

    // Meses en español, inglés y portugués
    const monthNames = {
        'enero': 1, 'january': 1, 'jan': 1, 'janeiro': 1,
        'febrero': 2, 'february': 2, 'feb': 2, 'fevereiro': 2,
        'marzo': 3, 'march': 3, 'mar': 3, 'março': 3,
        'abril': 4, 'april': 4, 'apr': 4,
        'mayo': 5, 'may': 5, 'maio': 5,
        'junio': 6, 'june': 6, 'jun': 6, 'junho': 6,
        'julio': 7, 'july': 7, 'jul': 7, 'julho': 7,
        'agosto': 8, 'august': 8, 'aug': 8,
        'septiembre': 9, 'september': 9, 'sep': 9, 'setembro': 9,
        'octubre': 10, 'october': 10, 'oct': 10, 'outubro': 10,
        'noviembre': 11, 'november': 11, 'nov': 11, 'novembro': 11,
        'diciembre': 12, 'december': 12, 'dec': 12, 'dezembro': 12
    };

    // Intenta formato con nombre de mes: "15 marzo 1985" o "march 15, 1985"
    const monthNameMatch = str.toLowerCase().match(/(\d{1,2})\s*(?:de\s+)?([a-záéíóúñ]+)\s*(?:de\s+)?(\d{4})|([a-záéíóúñ]+)\s+(\d{1,2}),?\s+(\d{4})/i);
    if (monthNameMatch) {
        let day, monthName, year;
        if (monthNameMatch[1]) {
            // Formato: 15 marzo 1985
            day = parseInt(monthNameMatch[1]);
            monthName = monthNameMatch[2].toLowerCase();
            year = parseInt(monthNameMatch[3]);
        } else {
            // Formato: march 15, 1985
            monthName = monthNameMatch[4].toLowerCase();
            day = parseInt(monthNameMatch[5]);
            year = parseInt(monthNameMatch[6]);
        }
        const month = monthNames[monthName];
        if (month && day >= 1 && day <= 31 && year >= 1900 && year <= new Date().getFullYear()) {
            return { year, month, day };
        }
    }

    // Intenta formatos numéricos: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    const numericMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (numericMatch) {
        const first = parseInt(numericMatch[1]);
        const second = parseInt(numericMatch[2]);
        const third = parseInt(numericMatch[3]);

        // Asumimos DD/MM/YYYY (formato común en Latinoamérica y Europa)
        if (first >= 1 && first <= 31 && second >= 1 && second <= 12) {
            return { year: third, month: second, day: first };
        }
    }

    // Intenta formato ISO: YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (isoMatch) {
        return {
            year: parseInt(isoMatch[1]),
            month: parseInt(isoMatch[2]),
            day: parseInt(isoMatch[3])
        };
    }

    return null;
}

/**
 * Parsea hora en formatos flexibles:
 * - HH:MM, H:MM
 * - HH.MM, H.MM
 * - HHMM
 * Retorna { hour, minute } o null
 */
function parseFlexibleTime(input) {
    if (!input) return null;
    const str = input.trim();

    // Formato con separador: 14:30, 14.30, 9:05
    const sepMatch = str.match(/^(\d{1,2})[\:\.](\d{2})$/);
    if (sepMatch) {
        const hour = parseInt(sepMatch[1]);
        const minute = parseInt(sepMatch[2]);
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            return { hour, minute };
        }
    }

    // Formato sin separador: 1430, 0905
    const noSepMatch = str.match(/^(\d{1,2})(\d{2})$/);
    if (noSepMatch) {
        const hour = parseInt(noSepMatch[1]);
        const minute = parseInt(noSepMatch[2]);
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            return { hour, minute };
        }
    }

    return null;
}

/**
 * Máscara automática para fecha DD/MM/YYYY
 * El usuario solo escribe dígitos, las / se agregan solas
 */
function maskDate(value) {
    let v = value.replace(/\D/g, '').slice(0, 8);
    if (v.length >= 5) {
        return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length >= 3) {
        return `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    return v;
}

/**
 * Máscara automática para hora HH:MM
 * El usuario solo escribe dígitos, el : se agrega solo
 */
function maskTime(value) {
    let v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) {
        return `${v.slice(0, 2)}:${v.slice(2)}`;
    }
    return v;
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
        const statusClass = cycle.is_critical ? 'critical' : (cycle.percentage > 50 ? 'high' : (cycle.percentage < -50 ? 'low' : 'neutral'));

        // Convertir porcentaje -100 a +100 en posición 0-100 para la barra (50 = centro)
        const barPosition = (cycle.percentage + 100) / 2;
        const displayPercent = cycle.percentage > 0 ? `+${cycle.percentage}%` : `${cycle.percentage}%`;

        // Determinar tendencia para todos los ciclos
        const getTrendIndicator = (phase, value) => {
            if (phase === 'ascenso' || (value >= 0 && phase !== 'descenso')) {
                return { symbol: '📈', label: 'Ascenso', color: '#10B981' };
            } else {
                return { symbol: '📉', label: 'Descenso', color: '#F59E0B' };
            }
        };
        const trend = getTrendIndicator(cycle.phase, cycle.value);

        return `
            <div class="biorhythm-cycle biorhythm-cycle--${key} ${isSpiritual ? 'biorhythm-cycle--spiritual' : ''}">
                <div class="biorhythm-cycle__header">
                    <span class="biorhythm-cycle__name">${cycle.name}</span>
                    ${isSpiritual
                        ? `<span class="biorhythm-cycle__quality" style="color: ${cycle.color}">${cycle.symbol} ${cycle.quality}</span>`
                        : `<span class="biorhythm-cycle__trend" style="color: ${trend.color}">${trend.symbol} ${trend.label}</span>`}
                    <span class="biorhythm-cycle__day">Día ${cycle.current_day}/${cycle.duration}</span>
                </div>
                <div class="biorhythm-cycle__bar">
                    <div class="biorhythm-cycle__track">
                        <div class="biorhythm-cycle__center"></div>
                        <div class="biorhythm-cycle__fill" style="width: ${barPosition}%; background: ${barColor}"></div>
                        <div class="biorhythm-cycle__marker" style="left: ${barPosition}%"></div>
                    </div>
                    <span class="biorhythm-cycle__value ${statusClass}">${displayPercent}</span>
                </div>
                ${isSpiritual ? `
                    <p class="biorhythm-cycle__description">${cycle.description}</p>
                    ${cycle.ra_quote ? `<blockquote class="biorhythm-cycle__quote">${getTranslatedRaQuote(cycle.current_day)}</blockquote>` : ''}
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

function getTranslatedRaQuote(day) {
    const quotes = i18n.translations?.ra_quotes || {};
    if (day >= 4 && day <= 6) {
        return quotes.optimal || '"precisely the fourth, the fifth, and the sixth—when workings are most appropriately undertaken"';
    } else if (day === 9 || day === 10) {
        return quotes.critical_9_10 || '"passing from the ninth to the tenth... the adept will experience some difficulty"';
    } else if (day === 18 || day === 1) {
        return quotes.critical_18_1 || '"passing from the eighteenth to the first days"';
    } else if (day === 13 || day === 14) {
        return quotes.nadir || '"at its least powerful but will not be open to difficulties"';
    }
    return '';
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
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1058 1058');  // Escalado a 1058px para coincidir con contenedor
    svg.style.width = '100%';
    svg.style.height = '100%';

    const cx = 529, cy = 529;
    // Radios escalados proporcionalmente (factor ~1.41 desde 750)
    const outerR = 486, signR = 402, planetR = 360, airR = 318, houseR = 233, centerR = 106;

    // Colores por elemento (sutiles, semi-transparentes)
    const elementColors = {
        fire: 'rgba(239, 68, 68, 0.12)',
        earth: 'rgba(34, 197, 94, 0.12)',
        air: 'rgba(59, 130, 246, 0.12)',
        water: 'rgba(147, 51, 234, 0.12)'
    };
    const signElements = ['fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water'];

    // Círculos base (de afuera hacia adentro)
    drawCircle(svg, cx, cy, outerR, '#d4af37', 2);           // Borde exterior
    drawCircle(svg, cx, cy, signR, 'rgba(212, 175, 55, 0.5)', 1);   // Límite signos/planetas
    drawCircle(svg, cx, cy, airR, 'rgba(212, 175, 55, 0.3)', 1);    // Límite planetas/aire
    drawCircle(svg, cx, cy, houseR, 'rgba(212, 175, 55, 0.4)', 1);  // Límite aire/casas
    drawCircle(svg, cx, cy, centerR, 'rgba(212, 175, 55, 0.2)', 1); // Centro

    // Símbolos zodiacales SVG paths (profesionales) + abreviaturas
    const zodiacPaths = {
        aries: 'M12 2C9.5 2 7.5 4 7.5 6.5c0 1.5.7 2.8 1.8 3.7L12 12l2.7-1.8c1.1-.9 1.8-2.2 1.8-3.7C16.5 4 14.5 2 12 2zm0 2c1.4 0 2.5 1.1 2.5 2.5S13.4 9 12 9s-2.5-1.1-2.5-2.5S10.6 4 12 4zM12 14l-4 8h2l2-4 2 4h2l-4-8z',
        taurus: 'M12 2C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V22h8v-7.3c1.8-1.2 3-3.3 3-5.7 0-3.9-3.1-7-7-7zm0 2c2.8 0 5 2.2 5 5 0 1.5-.7 2.9-1.8 3.8L14 13.7V20h-4v-6.3l-1.2-.9C7.7 11.9 7 10.5 7 9c0-2.8 2.2-5 5-5z',
        gemini: 'M7 2v4h2V4h2v16H9v2h6v-2h-2V4h2v2h2V2H7zm0 16v4h2v-2h2v-2H7zm8 0v2h2v2h2v-4h-4z',
        cancer: 'M12 4c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM6 12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm12 0c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm12 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z',
        leo: 'M12 2C9.2 2 7 4.2 7 7c0 1.9 1 3.5 2.5 4.3-.3.4-.5.9-.5 1.5 0 1.2.8 2.2 2 2.2s2-1 2-2.2c0-.6-.2-1.1-.5-1.5C14 10.5 15 8.9 15 7c0-2.8-2.2-5-3-5zm0 2c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm-4 13v5h8v-5h-2v3h-4v-3H8z',
        virgo: 'M8 2v10c0 1.1-.9 2-2 2v2c2.2 0 4-1.8 4-4V2H8zm4 0v10c0 1.1-.9 2-2 2v2c2.2 0 4-1.8 4-4V2h-2zm4 0v10c0 2.2 1.8 4 4 4v-2c-1.1 0-2-.9-2-2V2h-2zm2 14c-1.1 0-2 .9-2 2v4h2v-4c0-.6.4-1 1-1v-1z',
        libra: 'M12 2L8 6h8l-4-4zM6 8v2h12V8H6zm0 4v2h2v6H6v2h12v-2h-2v-6h2v-2H6zm4 2h4v6h-4v-6z',
        scorpio: 'M6 2v12h2V4h2v10h2V4h2v10c0 2.2 1.8 4 4 4v-2c-1.1 0-2-.9-2-2V2H6zm12 12l-2 2 2 2 2-2-2-2z',
        sagittarius: 'M18 2l-8 8-4-4-4 4 4 4-4 4 2 2 4-4 4 4 8-8-2-2-6 6-4-4 6-6 4 4 2-2-4-4 4-4-2-2z',
        capricorn: 'M12 2C9.8 2 8 3.8 8 6v6c0 1.1-.9 2-2 2v2c2.2 0 4-1.8 4-4V6c0-1.1.9-2 2-2s2 .9 2 2v8c0 2.2 1.8 4 4 4v-2c-1.1 0-2-.9-2-2V6c0-2.2-1.8-4-4-4zm6 14c-1.1 0-2 .9-2 2v4h2v-4c0-.6.4-1 1-1h1v-1h-2z',
        aquarius: 'M4 6l2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2v3l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2V6zm0 8l2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2v3l-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2v-3z',
        pisces: 'M6 4v16h2V12h8v8h2V4h-2v8H8V4H6zm-2 6v4h4v-4H4zm14 0v4h4v-4h-4z'
    };
    const zodiacKeys = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    const zodiacAbbr = ['Ari', 'Tau', 'Gem', 'Cnc', 'Leo', 'Vir', 'Lib', 'Sco', 'Sgr', 'Cap', 'Aqr', 'Psc'];
    const ascOffset = chartData.cusps ? chartData.cusps[0] : 0;

    // Segmentos de signos con color de fondo (sentido antihorario)
    for (let i = 0; i < 12; i++) {
        const startAngle = (ascOffset - i * 30 + 180) * Math.PI / 180;
        const endAngle = (ascOffset - (i + 1) * 30 + 180) * Math.PI / 180;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const x1 = cx + signR * Math.cos(startAngle);
        const y1 = cy + signR * Math.sin(startAngle);
        const x2 = cx + outerR * Math.cos(startAngle);
        const y2 = cy + outerR * Math.sin(startAngle);
        const x3 = cx + outerR * Math.cos(endAngle);
        const y3 = cy + outerR * Math.sin(endAngle);
        const x4 = cx + signR * Math.cos(endAngle);
        const y4 = cy + signR * Math.sin(endAngle);

        path.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 0 ${x3} ${y3} L ${x4} ${y4} A ${signR} ${signR} 0 0 1 ${x1} ${y1}`);
        path.setAttribute('fill', elementColors[signElements[i]]);
        path.setAttribute('stroke', 'rgba(212, 175, 55, 0.3)');
        svg.appendChild(path);

        // Símbolo del signo (SVG icon al 200% + abreviatura)
        const symbolAngle = (ascOffset - i * 30 - 15 + 180) * Math.PI / 180;
        const iconR = signR + 35;
        const abbrR = signR + 70;
        const ix = cx + iconR * Math.cos(symbolAngle);
        const iy = cy + iconR * Math.sin(symbolAngle);
        const ax = cx + abbrR * Math.cos(symbolAngle);
        const ay = cy + abbrR * Math.sin(symbolAngle);

        // Dibujar icono SVG del signo (escala 2 = 200%)
        const iconGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        iconPath.setAttribute('d', zodiacPaths[zodiacKeys[i]]);
        iconPath.setAttribute('fill', '#e0e0f0');
        iconGroup.setAttribute('transform', `translate(${ix - 24}, ${iy - 24}) scale(2)`);
        iconGroup.appendChild(iconPath);
        svg.appendChild(iconGroup);

        // Abreviatura debajo (tamaño aumentado)
        drawText(svg, ax, ay, zodiacAbbr[i], 'rgba(220, 220, 240, 0.85)', 20);
    }

    // Casas con números (sentido antihorario)
    if (chartData.cusps && chartData.cusps.length === 12) {
        chartData.cusps.forEach((cusp, i) => {
            const angle = (ascOffset - cusp + 180) * Math.PI / 180;
            const isCardinal = (i === 0 || i === 3 || i === 6 || i === 9);

            // Las líneas cardinales cruzan todo, las demás solo hasta el límite de casas
            const x1 = cx + centerR * Math.cos(angle);
            const y1 = cy + centerR * Math.sin(angle);
            const x2 = cx + (isCardinal ? signR : houseR) * Math.cos(angle);
            const y2 = cy + (isCardinal ? signR : houseR) * Math.sin(angle);
            drawLine(svg, x1, y1, x2, y2, isCardinal ? 'rgba(212, 175, 55, 0.7)' : 'rgba(212, 175, 55, 0.3)', isCardinal ? 2 : 1);

            // Número de casa (entre centro y límite de casas)
            const nextCusp = chartData.cusps[(i + 1) % 12];
            const midAngle = (cusp + (nextCusp > cusp ? nextCusp : nextCusp + 360)) / 2;
            const numAngle = (ascOffset - midAngle + 180) * Math.PI / 180;
            const numR = (centerR + houseR) / 2;
            drawText(svg, cx + numR * Math.cos(numAngle), cy + numR * Math.sin(numAngle), String(i + 1), 'rgba(212, 175, 55, 0.7)', 24);
        });

        // Etiquetas AC, DC, MC, IC
        [{ i: 0, l: 'AC' }, { i: 6, l: 'DC' }, { i: 9, l: 'MC' }, { i: 3, l: 'IC' }].forEach(axis => {
            const angle = (ascOffset - chartData.cusps[axis.i] + 180) * Math.PI / 180;
            drawText(svg, cx + (outerR + 35) * Math.cos(angle), cy + (outerR + 35) * Math.sin(angle), axis.l, '#d4af37', 24);
        });
    }

    // Planetas
    const planetSymbols = {
        'Sol': '☉', 'Luna': '☽', 'Mercurio': '☿', 'Venus': '♀', 'Marte': '♂',
        'Júpiter': '♃', 'Saturno': '♄', 'Urano': '♅', 'Neptuno': '♆', 'Plutón': '♇'
    };
    const planetColors = {
        'Sol': '#FFD700', 'Luna': '#C0C0C0', 'Mercurio': '#87CEEB', 'Venus': '#98FB98',
        'Marte': '#FF6347', 'Júpiter': '#DEB887', 'Saturno': '#DAA520',
        'Urano': '#00CED1', 'Neptuno': '#6495ED', 'Plutón': '#9370DB'
    };

    // Posiciones ajustadas para evitar superposición
    const positions = [];
    chartData.planets.forEach((planet) => {
        if (!planetSymbols[planet.name]) return;
        let pos = planet.abs_pos !== undefined ? planet.abs_pos : 0;
        for (let p of positions) {
            const diff = Math.abs(pos - p.pos);
            if (diff < 10 || diff > 350) pos += 10;
        }
        positions.push({ ...planet, pos });
    });

    positions.forEach((planet) => {
        const angle = (ascOffset - planet.pos + 180) * Math.PI / 180;
        const r = planetR;  // Planetas en la nueva zona entre aire y signos
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        drawText(svg, x, y, planetSymbols[planet.name], planetColors[planet.name] || '#d4af37', 38);

        // Grado con fondo para mejor legibilidad
        const deg = Math.floor(planet.abs_pos % 30);
        const degX = cx + (r - 42) * Math.cos(angle);
        const degY = cy + (r - 42) * Math.sin(angle);

        // Fondo del grado
        const degBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        degBg.setAttribute('x', degX - 18);
        degBg.setAttribute('y', degY - 12);
        degBg.setAttribute('width', 36);
        degBg.setAttribute('height', 24);
        degBg.setAttribute('rx', 4);
        degBg.setAttribute('fill', 'rgba(0, 0, 0, 0.6)');
        svg.appendChild(degBg);
        drawText(svg, degX, degY, `${deg}°`, '#ffffff', 18);

        // Retrógrado (más hacia afuera)
        if (planet.retrograde) {
            drawText(svg, cx + (r + 25) * Math.cos(angle), cy + (r + 25) * Math.sin(angle), 'R', '#FF6347', 20);
        }
    });

    // Líneas de aspectos (en la zona de aire, entre casas y planetas)
    if (chartData.aspects && chartData.aspects.length > 0) {
        const aspectColors = { conjunction: '#FFD700', opposition: '#EF4444', trine: '#3B82F6', square: '#EF4444', sextile: '#22C55E' };
        const aspectDash = { square: '4,4', sextile: '2,2' };
        const planetPosMap = {};
        chartData.planets.forEach(p => { if (p.abs_pos !== undefined) planetPosMap[p.name] = p.abs_pos; });

        chartData.aspects.forEach(aspect => {
            const pos1 = planetPosMap[aspect.planet1];
            const pos2 = planetPosMap[aspect.planet2];
            if (pos1 === undefined || pos2 === undefined) return;

            const r = (houseR + airR) / 2;  // En medio de la zona de aire
            const a1 = (ascOffset - pos1 + 180) * Math.PI / 180;
            const a2 = (ascOffset - pos2 + 180) * Math.PI / 180;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', cx + r * Math.cos(a1));
            line.setAttribute('y1', cy + r * Math.sin(a1));
            line.setAttribute('x2', cx + r * Math.cos(a2));
            line.setAttribute('y2', cy + r * Math.sin(a2));
            line.setAttribute('stroke', aspectColors[aspect.aspect] || 'rgba(255,255,255,0.3)');
            line.setAttribute('stroke-width', '1');
            if (aspectDash[aspect.aspect]) line.setAttribute('stroke-dasharray', aspectDash[aspect.aspect]);
            line.setAttribute('opacity', '0.5');
            svg.appendChild(line);
        });
    }

    // Centro
    const centerBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerBg.setAttribute('cx', cx);
    centerBg.setAttribute('cy', cy);
    centerBg.setAttribute('r', centerR);
    centerBg.setAttribute('fill', 'rgba(10, 10, 18, 0.9)');
    svg.appendChild(centerBg);

    drawText(svg, cx, cy - 25, 'ASC', '#d4af37', 26);
    drawText(svg, cx, cy + 25, chartData.ascendant, '#e8e8f0', 28);

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
        const birthDateInput = formData.get('birthDate');
        const birthTimeInput = formData.get('birthTime');
        const city = formData.get('city');

        console.log('📝 Datos del formulario:', { name, birthDate: birthDateInput, birthTime: birthTimeInput, city });

        // Parsear fecha y hora con formatos flexibles
        const parsedDate = parseFlexibleDate(birthDateInput);
        const parsedTime = parseFlexibleTime(birthTimeInput);

        if (!parsedDate) {
            hideLoader();
            alert(i18n.translations?.errors?.invalid_date || 'Fecha inválida. Usa formato: DD/MM/AAAA');
            return;
        }

        if (!parsedTime) {
            hideLoader();
            alert(i18n.translations?.errors?.invalid_time || 'Hora inválida. Usa formato: HH:MM');
            return;
        }

        const { year, month, day } = parsedDate;
        const { hour, minute } = parsedTime;

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

        // Mostrar navegación de resultados
        const resultsNav = document.getElementById('results-nav');
        if (resultsNav) resultsNav.classList.remove('hidden');

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

// Genera la URL para compartir
// Formato: ?Nombre&YYYYMMDD&HH:MM&latitud&longitud
function generateShareURL() {
    const name = encodeURIComponent(DOM.nameInput?.value || '');

    // Parsear fecha del input de texto y formatear como YYYYMMDD
    const parsedDate = parseFlexibleDate(DOM.birthDate?.value);
    const date = parsedDate
        ? `${parsedDate.year}${String(parsedDate.month).padStart(2, '0')}${String(parsedDate.day).padStart(2, '0')}`
        : '';

    // Parsear hora del input de texto y formatear como HH:MM
    const parsedTime = parseFlexibleTime(DOM.birthTime?.value);
    const time = parsedTime
        ? `${String(parsedTime.hour).padStart(2, '0')}:${String(parsedTime.minute).padStart(2, '0')}`
        : '12:00';

    const lat = DOM.latitudeInput?.value || '-33.4489';
    const lon = DOM.longitudeInput?.value || '-70.6693';

    return `${window.location.origin}${window.location.pathname}?${name}&${date}&${time}&${lat}&${lon}`;
}

// Copia al portapapeles y muestra feedback
async function handleShare() {
    const url = generateShareURL();

    try {
        await navigator.clipboard.writeText(url);

        // Feedback visual
        const btn = document.getElementById('share-btn');
        const originalText = btn.querySelector('.btn__text').textContent;
        btn.querySelector('.btn__icon').textContent = '✓';
        btn.querySelector('.btn__text').textContent = i18n.translations?.results?.copied || 'Copied!';

        setTimeout(() => {
            btn.querySelector('.btn__icon').textContent = '🔗';
            btn.querySelector('.btn__text').textContent = originalText;
        }, 2000);

    } catch (e) {
        // Fallback para navegadores antiguos
        prompt('Copy this URL:', url);
    }
}

// Parsea los parámetros de URL
// Formato: ?Nombre&YYYYMMDD&HH:MM&latitud&longitud
function parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    const keys = Array.from(params.keys());

    if (keys.length >= 2) {
        return {
            name: decodeURIComponent(keys[0] || ''),
            date: keys[1] || '',
            time: keys[2] || '12:00',
            lat: keys[3] || '-33.4489',
            lon: keys[4] || '-70.6693'
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
        // Convertir YYYYMMDD a DD/MM/YYYY para el input
        const formattedDate = formatDateForInput(urlData.date);
        if (formattedDate) {
            const [y, m, d] = formattedDate.split('-');
            DOM.birthDate.value = `${d}/${m}/${y}`;
        }
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

    // Máscaras automáticas para fecha y hora
    if (DOM.birthDate) {
        DOM.birthDate.addEventListener('input', (e) => {
            const cursorPos = e.target.selectionStart;
            const oldLen = e.target.value.length;
            e.target.value = maskDate(e.target.value);
            const newLen = e.target.value.length;
            // Ajustar cursor si se agregaron caracteres
            e.target.setSelectionRange(cursorPos + (newLen - oldLen), cursorPos + (newLen - oldLen));
        });
    }
    if (DOM.birthTime) {
        DOM.birthTime.addEventListener('input', (e) => {
            const cursorPos = e.target.selectionStart;
            const oldLen = e.target.value.length;
            e.target.value = maskTime(e.target.value);
            const newLen = e.target.value.length;
            e.target.setSelectionRange(cursorPos + (newLen - oldLen), cursorPos + (newLen - oldLen));
        });
    }

    // Botón compartir
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) shareBtn.addEventListener('click', handleShare);

    // Botón PDF - abre vista de impresión
    const pdfBtn = document.getElementById('pdf-btn');
    if (pdfBtn) pdfBtn.addEventListener('click', () => window.print());

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

    // Pre-llenar desde URL si hay parámetros
    fillFormFromURL();
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
            const response = await fetch(`/i18n/${lang}.json`);
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
                // Soporte para HTML (data-i18n-html="true") y saltos de línea
                if (el.hasAttribute('data-i18n-html')) {
                    el.innerHTML = translation.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
                } else {
                    el.textContent = translation;
                }
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
