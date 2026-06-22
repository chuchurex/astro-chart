"""
API de Astrología - Backend
============================
Calcula cartas natales y devuelve interpretaciones.

Para ejecutar:
1. pip install kerykeion fastapi uvicorn
2. uvicorn app:app --reload
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from functools import lru_cache
from collections import defaultdict
import time
import json
import os

# === RATE LIMITING ===
# Límite: 60 requests por minuto por IP
RATE_LIMIT = 60
RATE_WINDOW = 60  # segundos
request_counts = defaultdict(list)

# Intentar importar kerykeion, si no está disponible usar cálculos básicos
try:
    from kerykeion import AstrologicalSubjectFactory
    from kerykeion.chart_data_factory import ChartDataFactory
    KERYKEION_AVAILABLE = True
except ImportError:
    KERYKEION_AVAILABLE = False
    print("⚠️  Kerykeion no disponible. Usando cálculos simplificados.")

# TimezoneFinder para derivar la zona horaria desde lat/lon.
# La timezone que envía el cliente es solo un fallback: confiar en ella
# produce cartas desplazadas para nacimientos fuera de Chile.
try:
    from timezonefinder import TimezoneFinder
    _timezone_finder = TimezoneFinder()
    TIMEZONEFINDER_AVAILABLE = True
except ImportError:
    _timezone_finder = None
    TIMEZONEFINDER_AVAILABLE = False
    print("⚠️  timezonefinder no disponible. Se usará la timezone enviada por el cliente.")


@lru_cache(maxsize=10000)
def resolve_timezone(lat: float, lng: float, fallback: str) -> str:
    """Deriva la zona horaria IANA desde las coordenadas de nacimiento."""
    if not TIMEZONEFINDER_AVAILABLE:
        return fallback
    try:
        tz = _timezone_finder.timezone_at(lat=lat, lng=lng)
        if tz is None:
            # Coordenadas en el océano: buscar la zona terrestre más cercana
            tz = _timezone_finder.timezone_at_land(lat=lat, lng=lng)
        return tz or fallback
    except Exception:
        return fallback

app = FastAPI(
    title="Astro API",
    description="API para cálculos astrológicos y cartas natales",
    version="1.0.0"
)

# Compresión gzip para responses grandes (reduce ~70% el tamaño)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS restringido a dominios propios
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mapanatal.org",
        "https://www.mapanatal.org",
        "https://astro.chuchurex.cl",
        "https://www.astro.chuchurex.cl",
        "https://chuchurex.cl",
        "https://www.chuchurex.cl",
        "http://localhost:8000",
        "http://localhost:3000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# === MODELOS DE DATOS ===

class BirthData(BaseModel):
    """Datos de nacimiento para calcular la carta natal"""
    name: str
    year: int
    month: int
    day: int
    hour: int
    minute: int
    latitude: float
    longitude: float
    timezone: str = "America/Santiago"

class PlanetPosition(BaseModel):
    """Posición de un planeta"""
    name: str
    sign: str
    degree: float
    abs_pos: float  # Posición absoluta 0-360° para el gráfico
    house: int
    retrograde: bool = False

class ChartResponse(BaseModel):
    """Respuesta con la carta natal completa"""
    name: str
    sun_sign: str
    moon_sign: str
    ascendant: str
    planets: list[PlanetPosition]
    houses: list[dict]
    aspects: list[dict]
    interpretations: dict

# === DATOS DE SIGNOS Y PLANETAS ===

SIGNS = [
    "Aries", "Tauro", "Géminis", "Cáncer", 
    "Leo", "Virgo", "Libra", "Escorpio",
    "Sagitario", "Capricornio", "Acuario", "Piscis"
]

SIGNS_EN = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio", 
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

PLANETS = ["Sol", "Luna", "Mercurio", "Venus", "Marte", 
           "Júpiter", "Saturno", "Urano", "Neptuno", "Plutón"]

# === CÁLCULOS SIMPLIFICADOS (fallback sin Kerykeion) ===

def calculate_sun_sign_simple(month: int, day: int) -> str:
    """Calcula el signo solar de forma simplificada"""
    # (mes, día, signo que EMPIEZA ese día)
    transitions = [
        (1, 20, "Acuario"), (2, 19, "Piscis"), (3, 21, "Aries"),
        (4, 20, "Tauro"), (5, 21, "Géminis"), (6, 21, "Cáncer"),
        (7, 23, "Leo"), (8, 23, "Virgo"), (9, 23, "Libra"),
        (10, 23, "Escorpio"), (11, 22, "Sagitario"), (12, 22, "Capricornio")
    ]

    sign = "Capricornio"  # Enero antes del 20
    for m, d, s in transitions:
        if m < month or (m == month and day >= d):
            sign = s
        elif m > month:
            break
    return sign

def calculate_moon_sign_simple(year: int, month: int, day: int) -> str:
    """
    Cálculo aproximado del signo lunar.
    La Luna cambia de signo cada ~2.5 días.
    Este es un cálculo simplificado, para precisión usar Kerykeion.
    """
    from datetime import date
    base_date = date(2000, 1, 1)
    birth_date = date(year, month, day)
    days_diff = (birth_date - base_date).days
    
    # La Luna completa el zodíaco en ~27.3 días
    moon_cycle = 27.3
    position = (days_diff % moon_cycle) / moon_cycle * 12
    sign_index = int(position) % 12
    
    return SIGNS[sign_index]

def calculate_ascendant_simple(hour: int, month: int) -> str:
    """
    Cálculo muy aproximado del ascendente.
    El ascendente cambia cada ~2 horas.
    Para precisión real se necesita la latitud y Kerykeion.
    """
    # Cada signo rige ~2 horas del día
    # El signo solar está en el ascendente al amanecer (~6am)
    sun_sign_index = (month - 1) % 12
    hour_offset = (hour - 6) // 2
    asc_index = (sun_sign_index + hour_offset) % 12
    
    return SIGNS[asc_index]

def generate_simple_chart(data: BirthData) -> dict:
    """Genera una carta natal con cálculos simplificados"""
    sun_sign = calculate_sun_sign_simple(data.month, data.day)
    moon_sign = calculate_moon_sign_simple(data.year, data.month, data.day)
    ascendant = calculate_ascendant_simple(data.hour, data.month)
    
    # Planetas simplificados (posiciones aproximadas).
    # abs_pos (0-360) es obligatorio en PlanetPosition: sin él Pydantic
    # lanza ValidationError y este fallback devuelve 500.
    def _planet(name, sign, degree, house):
        abs_pos = SIGNS.index(sign) * 30 + degree
        return PlanetPosition(name=name, sign=sign, degree=degree, abs_pos=abs_pos, house=house)

    sun_idx = SIGNS.index(sun_sign)
    planets = [
        _planet("Sol", sun_sign, 15.0, 1),
        _planet("Luna", moon_sign, 20.0, 4),
        _planet("Mercurio", sun_sign, 10.0, 1),
        _planet("Venus", SIGNS[(sun_idx + 1) % 12], 25.0, 2),
        _planet("Marte", SIGNS[(sun_idx + 2) % 12], 8.0, 3),
        _planet("Júpiter", SIGNS[(sun_idx + 4) % 12], 12.0, 5),
        _planet("Saturno", SIGNS[(sun_idx + 6) % 12], 18.0, 7),
        _planet("Urano", SIGNS[(sun_idx + 8) % 12], 5.0, 9),
        _planet("Neptuno", SIGNS[(sun_idx + 9) % 12], 22.0, 10),
        _planet("Plutón", SIGNS[(sun_idx + 10) % 12], 28.0, 11),
    ]
    
    return {
        "name": data.name,
        "sun_sign": sun_sign,
        "moon_sign": moon_sign,
        "ascendant": ascendant,
        "planets": planets,
        "houses": [{"house": i+1, "sign": SIGNS[(SIGNS.index(ascendant) + i) % 12]} for i in range(12)],
        "aspects": [],
        "calculation_method": "simplified"
    }

# === CÁLCULOS CON KERYKEION (con caché) ===

# Caché para cálculos astronómicos - misma fecha/hora/lugar = mismo resultado
@lru_cache(maxsize=10000)
def _cached_kerykeion_calculation(year: int, month: int, day: int, hour: int, minute: int, lat: float, lng: float, tz: str) -> tuple:
    """
    Calcula posiciones astronómicas y las cachea.
    Retorna tupla para ser hasheable.
    """
    subject = AstrologicalSubjectFactory.from_birth_data(
        name="cached",
        year=year,
        month=month,
        day=day,
        hour=hour,
        minute=minute,
        lng=lng,
        lat=lat,
        tz_str=tz,
        online=False
    )
    chart_data = ChartDataFactory.create_natal_chart_data(subject)
    return (subject, chart_data)

def generate_kerykeion_chart(data: BirthData) -> dict:
    """Genera una carta natal precisa usando Kerykeion (con caché)"""
    # Redondear lat/lng para mejor hit rate del caché
    lat_rounded = round(data.latitude, 2)
    lng_rounded = round(data.longitude, 2)

    # Usar cálculo cacheado
    subject, chart_data = _cached_kerykeion_calculation(
        data.year, data.month, data.day,
        data.hour, data.minute,
        lat_rounded, lng_rounded,
        data.timezone
    )

    # Nombres de planetas a extraer del subject
    planet_names = ['sun', 'moon', 'mercury', 'venus', 'mars',
                    'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']

    # Mapeo de nombres en inglés a español
    planet_names_es = {
        'Sun': 'Sol', 'Moon': 'Luna', 'Mercury': 'Mercurio',
        'Venus': 'Venus', 'Mars': 'Marte', 'Jupiter': 'Júpiter',
        'Saturn': 'Saturno', 'Uranus': 'Urano', 'Neptune': 'Neptuno',
        'Pluto': 'Plutón'
    }

    # Mapeo de signos abreviados a español
    sign_names_es = {
        'Ari': 'Aries', 'Tau': 'Tauro', 'Gem': 'Géminis', 'Can': 'Cáncer',
        'Leo': 'Leo', 'Vir': 'Virgo', 'Lib': 'Libra', 'Sco': 'Escorpio',
        'Sag': 'Sagitario', 'Cap': 'Capricornio', 'Aqu': 'Acuario', 'Pis': 'Piscis'
    }

    # Extraer número de casa del nombre (ej: "Eighth_House" -> 8)
    def get_house_number(house_name: str) -> int:
        house_map = {
            'First': 1, 'Second': 2, 'Third': 3, 'Fourth': 4,
            'Fifth': 5, 'Sixth': 6, 'Seventh': 7, 'Eighth': 8,
            'Ninth': 9, 'Tenth': 10, 'Eleventh': 11, 'Twelfth': 12
        }
        for name, num in house_map.items():
            if house_name.startswith(name):
                return num
        return 1

    # Extraer posiciones de planetas desde subject
    planets = []
    for planet_attr in planet_names:
        planet = getattr(subject, planet_attr, None)
        if planet:
            planets.append(PlanetPosition(
                name=planet_names_es.get(planet.name, planet.name),
                sign=sign_names_es.get(planet.sign, planet.sign),
                degree=planet.abs_pos % 30,
                abs_pos=planet.abs_pos,  # Posición absoluta 0-360°
                house=get_house_number(planet.house) if planet.house else 1,
                retrograde=planet.retrograde or False
            ))

    # Extraer casas con posiciones absolutas (cúspides)
    house_attrs = ['first_house', 'second_house', 'third_house', 'fourth_house',
                   'fifth_house', 'sixth_house', 'seventh_house', 'eighth_house',
                   'ninth_house', 'tenth_house', 'eleventh_house', 'twelfth_house']

    houses = []
    cusps = []  # Posiciones absolutas para el gráfico
    for i, house_attr in enumerate(house_attrs):
        house = getattr(subject, house_attr, None)
        if house:
            houses.append({
                "house": i + 1,
                "sign": sign_names_es.get(house.sign, house.sign),
                "degree": house.abs_pos if hasattr(house, 'abs_pos') else 0
            })
            cusps.append(house.abs_pos if hasattr(house, 'abs_pos') else i * 30)

    # Extraer aspectos
    aspects = []
    for aspect in chart_data.aspects:
        aspects.append({
            "planet1": planet_names_es.get(aspect.p1_name, aspect.p1_name),
            "planet2": planet_names_es.get(aspect.p2_name, aspect.p2_name),
            "aspect": aspect.aspect_name if hasattr(aspect, 'aspect_name') else str(aspect.aspect)
        })

    return {
        "name": data.name,
        "sun_sign": sign_names_es.get(subject.sun.sign, subject.sun.sign),
        "moon_sign": sign_names_es.get(subject.moon.sign, subject.moon.sign),
        "ascendant": sign_names_es.get(subject.first_house.sign, subject.first_house.sign),
        "ascendant_degree": subject.first_house.abs_pos if hasattr(subject.first_house, 'abs_pos') else 0,
        "planets": planets,
        "houses": houses,
        "cusps": cusps,
        "aspects": aspects,
        "calculation_method": "kerykeion"
    }

# === CÁLCULO DE ELEMENTOS Y MODALIDADES ===

# Mapeo de signos a elementos
SIGN_ELEMENTS = {
    'Aries': 'fire', 'Leo': 'fire', 'Sagitario': 'fire',
    'Tauro': 'earth', 'Virgo': 'earth', 'Capricornio': 'earth',
    'Géminis': 'air', 'Libra': 'air', 'Acuario': 'air',
    'Cáncer': 'water', 'Escorpio': 'water', 'Piscis': 'water'
}

# Mapeo de signos a modalidades
SIGN_MODALITIES = {
    'Aries': 'cardinal', 'Cáncer': 'cardinal', 'Libra': 'cardinal', 'Capricornio': 'cardinal',
    'Tauro': 'fixed', 'Leo': 'fixed', 'Escorpio': 'fixed', 'Acuario': 'fixed',
    'Géminis': 'mutable', 'Virgo': 'mutable', 'Sagitario': 'mutable', 'Piscis': 'mutable'
}

# Pesos de los planetas (luminarias y personales pesan más)
PLANET_WEIGHTS = {
    'Sol': 3, 'Luna': 3, 'Mercurio': 2, 'Venus': 2, 'Marte': 2,
    'Júpiter': 1, 'Saturno': 1, 'Urano': 0.5, 'Neptuno': 0.5, 'Plutón': 0.5
}

# Nombres de aspectos en español y significado genérico de respaldo.
# interpretations.json no cubre todas las combinaciones (sobre todo sextiles
# y quintiles): sin esto, esos aspectos desaparecían de la respuesta.
ASPECT_NAMES_ES = {
    'conjunction': 'conjunción', 'sextile': 'sextil', 'square': 'cuadratura',
    'trine': 'trígono', 'opposition': 'oposición', 'quintile': 'quintil'
}
ASPECT_GENERIC_MEANINGS = {
    'conjunction': 'fusionan sus energías en una fuerza concentrada e intensa que actúa como una sola en tu vida.',
    'sextile': 'crean una oportunidad armónica entre sus energías, un flujo natural que aprovechas con algo de esfuerzo consciente.',
    'square': 'generan una tensión dinámica que te impulsa a crecer; aunque desafiante, esta fricción produce los mayores desarrollos personales.',
    'trine': 'fluyen en perfecta armonía, indicando un talento natural en el que ambas energías se apoyan sin esfuerzo.',
    'opposition': 'forman una polaridad que busca equilibrio; aprendes a integrar ambos polos en lugar de oscilar entre ellos.',
    'quintile': 'establecen una conexión creativa y sutil, asociada al talento singular y a la expresión personal.'
}

# === BIORRITMOS Y CICLO DEL ADEPTO (Enseñanzas de Ra) ===

def calculate_biorhythms(birth_date: str, target_date: str = None) -> dict:
    """
    Calcula los 4 biorritmos según las enseñanzas de Ra:
    - Físico: 23 días
    - Emocional: 28 días
    - Intelectual: 33 días
    - Espiritual/Adepto: 18 días (con análisis especial)
    """
    from datetime import datetime, date
    import math

    # Parsear fechas
    if isinstance(birth_date, str):
        birth = datetime.strptime(birth_date, "%Y-%m-%d").date()
    else:
        birth = birth_date

    if target_date is None:
        target = date.today()
    elif isinstance(target_date, str):
        target = datetime.strptime(target_date, "%Y-%m-%d").date()
    else:
        target = target_date

    days_alive = (target - birth).days

    # Ciclos tradicionales (seno) - Compatible con Bring4th
    # La fórmula estándar de biorritmos: sin(2π * días / duración)
    # El ciclo empieza en 0%, sube al 100% en 1/4, baja a 0% en 1/2,
    # llega a -100% en 3/4, y vuelve a 0% al final
    def get_cycle(days, duration, name_es):
        # Bring4th usa días desde nacimiento directamente (día 0 = nacimiento)
        day_in_cycle = days % duration
        angle = (2 * math.pi * days) / duration
        value = math.sin(angle)

        # Porcentaje en escala -100% a +100% (como Bring4th)
        percentage = round(value * 100)

        # Día crítico: cuando cruza el 0 (inicio/mitad del ciclo)
        is_critical = day_in_cycle == 0 or day_in_cycle == duration // 2

        return {
            "name": name_es,
            "duration": duration,
            "current_day": day_in_cycle + 1,  # Mostrar 1-based para UI
            "value": round(value, 2),
            "percentage": percentage,  # -100 a +100
            "phase": "ascenso" if value >= 0 and day_in_cycle < duration // 4 else "descenso" if value >= 0 else "bajo",
            "is_critical": is_critical
        }

    # Ciclo espiritual del adepto (18 días)
    # Según Ra: días 4, 5, 6 son óptimos (pico)
    # Usamos seno desplazado para que el pico esté en día 5
    def get_spiritual_cycle(days):
        day_in_cycle = days % 18
        day = day_in_cycle + 1  # 1-based para mostrar

        # Desplazar para que el pico (100%) esté en día 5 (mostrado 1-based)
        # sin alcanza su pico cuando (days + offset) = 18/4 = 4.5
        # Día mostrado 5 corresponde a days % 18 == 4, por lo tanto offset = 0.5
        offset = 0.5
        angle = (2 * math.pi * (days + offset)) / 18
        value = math.sin(angle)

        # Clasificación según Ra
        if day in [4, 5, 6]:
            quality = "ÓPTIMO"
            symbol = "⭐"
            description = "Días de máximo poder. Ideales para meditación profunda, rituales, trabajo energético."
            work_recommended = True
            color = "#FFD700"
        elif day in [9, 10]:
            quality = "CRÍTICO"
            symbol = "🔄"
            description = "Transición de mitad de ciclo. Mayor vulnerabilidad. Autoobservación recomendada."
            work_recommended = False
            color = "#FF6B6B"
        elif day in [18, 1]:
            quality = "CRÍTICO"
            symbol = "🔄"
            description = "Renovación del ciclo. Fragilidad en la transición. Evitar trabajos importantes."
            work_recommended = False
            color = "#FF6B6B"
        elif day in [13, 14]:
            quality = "NADIR"
            symbol = "⬇️"
            description = "Valle del ciclo. Menor poder pero paradójicamente más estable. Ideal para descanso e integración."
            work_recommended = False
            color = "#6B7280"
        elif day in [2, 3]:
            quality = "ASCENSO"
            symbol = "📈"
            description = "Energía creciente. Buen momento para preparar trabajos espirituales."
            work_recommended = True
            color = "#10B981"
        elif day in [7, 8]:
            quality = "DESCENSO"
            symbol = "📉"
            description = "Cerrando ventana óptima. Completar trabajos iniciados."
            work_recommended = True
            color = "#60A5FA"
        elif day in [11, 12]:
            quality = "BAJO"
            symbol = "📉"
            description = "Energía disminuida. Favorece actividades ligeras."
            work_recommended = False
            color = "#9CA3AF"
        else:  # 15, 16, 17
            quality = "RECUPERACIÓN"
            symbol = "📈"
            description = "Ascenso desde el valle. Preparando el próximo ciclo."
            work_recommended = day >= 16
            color = "#8B5CF6"

        return {
            "name": "Espiritual / Adepto",
            "duration": 18,
            "current_day": day,
            "value": round(value, 2),
            "percentage": round(value * 100),  # -100 a +100 como los otros ciclos
            "quality": quality,
            "symbol": symbol,
            "description": description,
            "work_recommended": work_recommended,
            "color": color,
            "is_optimal": day in [4, 5, 6],
            "is_critical": day in [9, 10, 18, 1],
            "is_nadir": day in [13, 14],
            "ra_quote": get_ra_quote_for_day(day)
        }

    def get_ra_quote_for_day(day):
        if day in [4, 5, 6]:
            return '"precisely the fourth, the fifth, and the sixth—when workings are most appropriately undertaken"'
        elif day in [9, 10]:
            return '"passing from the ninth to the tenth... the adept will experience some difficulty"'
        elif day in [18, 1]:
            return '"passing from the eighteenth to the first days"'
        elif day in [13, 14]:
            return '"at its least powerful but will not be open to difficulties"'
        return ""

    cycles = {
        "physical": get_cycle(days_alive, 23, "Físico"),
        "emotional": get_cycle(days_alive, 28, "Emocional"),
        "intellectual": get_cycle(days_alive, 33, "Intelectual"),
        "spiritual": get_spiritual_cycle(days_alive)
    }

    # Análisis de coincidencias críticas
    critical_cycles = [name for name, cycle in cycles.items() if cycle.get("is_critical")]

    if len(critical_cycles) == 0:
        critical_level = "BAJO"
        critical_message = "Sin puntos críticos activos. Día estable para todo tipo de actividades."
    elif len(critical_cycles) == 1:
        critical_level = "MODERADO"
        critical_message = f"Transición en ciclo {critical_cycles[0]}. Mayor consciencia recomendada."
    else:
        critical_level = "ALTO"
        critical_message = f"Ra advierte sobre transiciones simultáneas. Coinciden {len(critical_cycles)} puntos críticos. Día para autoobservación."

    return {
        "days_alive": days_alive,
        "cycles": cycles,
        "critical_analysis": {
            "level": critical_level,
            "cycles_in_critical": critical_cycles,
            "message": critical_message
        },
        "ra_philosophy": {
            "map_not_destiny": "Tu carta natal es un mapa, no un destino. El mapa no camina el camino por ti.",
            "water_nature": "Tu naturaleza es como el agua — fácilmente impresionada y movida por las mareas cósmicas.",
            "free_will": "Cada elección sigue siendo tuya. El libre albedrío es la ley primaria."
        }
    }


def generate_executive_summary(chart: dict, element_modality: dict) -> str:
    """Genera un resumen ejecutivo de la carta natal"""
    sun_sign = chart.get('sun_sign', '')
    moon_sign = chart.get('moon_sign', '')
    ascendant = chart.get('ascendant', '')

    dominant_element = element_modality['elements']['dominant']
    dominant_modality = element_modality['modalities']['dominant']

    # Nombres en español
    element_names = {'fire': 'Fuego', 'earth': 'Tierra', 'air': 'Aire', 'water': 'Agua'}
    modality_names = {'cardinal': 'Cardinal', 'fixed': 'Fija', 'mutable': 'Mutable'}

    element_es = element_names.get(dominant_element, dominant_element)
    modality_es = modality_names.get(dominant_modality, dominant_modality)

    # Cualidades por elemento
    element_qualities = {
        'fire': 'pasión, iniciativa y energía vital',
        'earth': 'practicidad, estabilidad y sensibilidad material',
        'air': 'intelecto, comunicación y conexión social',
        'water': 'intuición, profundidad emocional y sensibilidad'
    }

    # Cualidades por modalidad
    modality_qualities = {
        'cardinal': 'iniciar proyectos y liderar cambios',
        'fixed': 'perseverar, mantener y consolidar',
        'mutable': 'adaptarte y fluir con los cambios'
    }

    el_quality = element_qualities.get(dominant_element, '')
    mod_quality = modality_qualities.get(dominant_modality, '')

    summary = (
        f"Con el Sol en {sun_sign}, tu esencia vital busca expresarse a través de las cualidades de este signo. "
        f"Tu Luna en {moon_sign} revela cómo procesas las emociones y qué necesitas para sentirte seguro/a. "
        f"El Ascendente en {ascendant} define la máscara que presentas al mundo y cómo inicias nuevas experiencias. "
        f"Tu carta está dominada por el elemento {element_es}, lo que enfatiza {el_quality}. "
        f"Con energía {modality_es} predominante, tu naturaleza te impulsa a {mod_quality}."
    )

    return summary


def calculate_element_modality_distribution(chart: dict) -> dict:
    """Calcula la distribución de elementos y modalidades en la carta"""
    elements = {'fire': 0, 'earth': 0, 'air': 0, 'water': 0}
    modalities = {'cardinal': 0, 'fixed': 0, 'mutable': 0}

    # Contar planetas
    for planet in chart.get('planets', []):
        planet_name = planet.name if hasattr(planet, 'name') else planet.get('name', '')
        sign = planet.sign if hasattr(planet, 'sign') else planet.get('sign', '')

        weight = PLANET_WEIGHTS.get(planet_name, 1)

        if sign in SIGN_ELEMENTS:
            elements[SIGN_ELEMENTS[sign]] += weight
        if sign in SIGN_MODALITIES:
            modalities[SIGN_MODALITIES[sign]] += weight

    # Incluir Ascendente con peso alto
    ascendant = chart.get('ascendant', '')
    if ascendant in SIGN_ELEMENTS:
        elements[SIGN_ELEMENTS[ascendant]] += 2
    if ascendant in SIGN_MODALITIES:
        modalities[SIGN_MODALITIES[ascendant]] += 2

    # Calcular totales y porcentajes
    total_elements = sum(elements.values())
    total_modalities = sum(modalities.values())

    element_percentages = {k: round(v / total_elements * 100) for k, v in elements.items()}
    modality_percentages = {k: round(v / total_modalities * 100) for k, v in modalities.items()}

    # Determinar dominantes
    dominant_element = max(elements, key=elements.get)
    dominant_modality = max(modalities, key=modalities.get)

    return {
        'elements': {
            'distribution': elements,
            'percentages': element_percentages,
            'dominant': dominant_element
        },
        'modalities': {
            'distribution': modalities,
            'percentages': modality_percentages,
            'dominant': dominant_modality
        }
    }

# === CARGA DE INTERPRETACIONES (cacheada) ===

# Cargar interpretaciones una sola vez al inicio
def _load_interpretations_from_file() -> dict:
    """Carga las interpretaciones desde el archivo JSON"""
    interpretations_path = os.path.join(
        os.path.dirname(__file__),
        "interpretations.json"
    )

    if os.path.exists(interpretations_path):
        with open(interpretations_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    # Interpretaciones por defecto si no existe el archivo
    return {
        "sun_in_signs": {},
        "moon_in_signs": {},
        "ascendants": {},
        "planets_in_houses": {},
        "aspects": {}
    }

# Cache global - se carga una sola vez
INTERPRETATIONS_CACHE = _load_interpretations_from_file()
print(f"✅ Interpretaciones cargadas: {len(INTERPRETATIONS_CACHE.get('planets_in_houses', {}))} planetas en casas")

def load_interpretations() -> dict:
    """Retorna las interpretaciones cacheadas"""
    return INTERPRETATIONS_CACHE

def get_interpretations_for_chart(chart: dict) -> dict:
    """Obtiene las interpretaciones relevantes para una carta"""
    interp_data = load_interpretations()
    result = {}

    sun_key = f"sun_{chart['sun_sign'].lower()}"
    moon_key = f"moon_{chart['moon_sign'].lower()}"
    asc_key = chart['ascendant'].lower()

    result['sun'] = interp_data.get('sun_in_signs', {}).get(sun_key,
        f"El Sol en {chart['sun_sign']} representa tu esencia vital y propósito de vida.")

    result['moon'] = interp_data.get('moon_in_signs', {}).get(moon_key,
        f"La Luna en {chart['moon_sign']} indica tus emociones y mundo interior.")

    result['ascendant'] = interp_data.get('ascendants', {}).get(asc_key,
        f"El Ascendente en {chart['ascendant']} define cómo te presentas al mundo.")

    # Calcular y agregar distribución de elementos y modalidades
    element_modality = calculate_element_modality_distribution(chart)

    # Agregar interpretaciones de elementos y modalidades
    elements_data = interp_data.get('elements', {})
    modalities_data = interp_data.get('modalities', {})

    dominant_element = element_modality['elements']['dominant']
    dominant_modality = element_modality['modalities']['dominant']

    element_modality['elements']['interpretation'] = elements_data.get(
        f"{dominant_element}_dominant",
        f"Tu elemento dominante es {dominant_element}."
    )
    element_modality['modalities']['interpretation'] = modalities_data.get(
        f"{dominant_modality}_dominant",
        f"Tu modalidad dominante es {dominant_modality}."
    )

    result['element_modality'] = element_modality

    # Generar resumen ejecutivo
    result['summary'] = generate_executive_summary(chart, element_modality)

    # Interpretaciones de planetas en casas
    planets_in_houses = interp_data.get('planets_in_houses', {})
    result['planets_in_houses'] = {}

    for planet in chart.get('planets', []):
        planet_name = planet.name if hasattr(planet, 'name') else planet.get('name', '')
        house = planet.house if hasattr(planet, 'house') else planet.get('house', 0)

        # Normalizar nombre del planeta para la clave
        planet_key = planet_name.lower()

        # Buscar interpretación
        key = f"{planet_key}_{house}"
        if key in planets_in_houses:
            result['planets_in_houses'][planet_name] = {
                'house': house,
                'interpretation': planets_in_houses[key]
            }

    # Interpretaciones de aspectos
    aspects_data = interp_data.get('aspects', {})
    result['aspects'] = []

    # Planetas principales para filtrar aspectos relevantes
    main_planets = ['Sol', 'Luna', 'Mercurio', 'Venus', 'Marte',
                    'Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutón']

    for aspect in chart.get('aspects', []):
        planet1 = aspect.get('planet1', '')
        planet2 = aspect.get('planet2', '')
        aspect_type = aspect.get('aspect', '')

        # Solo procesar aspectos entre planetas principales
        if planet1 not in main_planets or planet2 not in main_planets:
            continue

        # Crear clave para buscar interpretación (planeta1_aspecto_planeta2)
        key = f"{planet1.lower()}_{aspect_type}_{planet2.lower()}"

        # También intentar en orden inverso
        key_reverse = f"{planet2.lower()}_{aspect_type}_{planet1.lower()}"

        interpretation = aspects_data.get(key) or aspects_data.get(key_reverse)

        # Fallback genérico: si no hay texto específico, igual mostramos el
        # aspecto con un significado por tipo (no lo descartamos en silencio).
        if not interpretation:
            meaning = ASPECT_GENERIC_MEANINGS.get(aspect_type)
            if meaning:
                aspecto_es = ASPECT_NAMES_ES.get(aspect_type, aspect_type)
                interpretation = f"{planet1} y {planet2} en {aspecto_es} {meaning}"

        if interpretation:
            result['aspects'].append({
                'planet1': planet1,
                'planet2': planet2,
                'aspect': aspect_type,
                'interpretation': interpretation
            })

    return result

# === ENDPOINTS ===

@app.get("/api")
def api_info():
    """Endpoint de información de la API"""
    return {
        "message": "API de Astrología",
        "version": "1.0.0",
        "kerykeion_available": KERYKEION_AVAILABLE,
        "endpoints": {
            "/chart": "POST - Calcular carta natal",
            "/signs": "GET - Lista de signos zodiacales",
            "/planets": "GET - Lista de planetas",
            "/health": "GET - Estado de la API"
        }
    }

@app.get("/health")
def health_check():
    """Verifica el estado de la API"""
    # Estadísticas del caché
    cache_info = _cached_kerykeion_calculation.cache_info() if KERYKEION_AVAILABLE else None

    return {
        "status": "healthy",
        "kerykeion": KERYKEION_AVAILABLE,
        "timestamp": datetime.now().isoformat(),
        "cache": {
            "hits": cache_info.hits if cache_info else 0,
            "misses": cache_info.misses if cache_info else 0,
            "size": cache_info.currsize if cache_info else 0,
            "maxsize": cache_info.maxsize if cache_info else 0
        } if KERYKEION_AVAILABLE else None
    }

@app.get("/signs")
def get_signs():
    """Retorna la lista de signos zodiacales"""
    return {
        "signs": [
            {"name": sign, "name_en": sign_en, "index": i}
            for i, (sign, sign_en) in enumerate(zip(SIGNS, SIGNS_EN))
        ]
    }

@app.get("/planets")
def get_planets():
    """Retorna la lista de planetas"""
    return {"planets": PLANETS}

def check_rate_limit(ip: str) -> bool:
    """Verifica si la IP excedió el límite de requests"""
    now = time.time()
    # Limpiar requests antiguos
    recent = [t for t in request_counts[ip] if now - t < RATE_WINDOW]
    # Verificar límite
    if len(recent) >= RATE_LIMIT:
        request_counts[ip] = recent
        return False
    recent.append(now)
    request_counts[ip] = recent

    # Evitar fuga de memoria: purgar IPs cuya ventana expiró por completo.
    # Sin esto, request_counts acumula una entrada por cada IP histórica.
    if len(request_counts) > 1000:
        for stale_ip in [k for k, v in request_counts.items()
                         if not v or now - v[-1] >= RATE_WINDOW]:
            del request_counts[stale_ip]

    return True

@app.post("/chart")
def calculate_chart(data: BirthData, request: Request):
    """
    Calcula la carta natal completa.

    Requiere:
    - name: Nombre de la persona
    - year, month, day: Fecha de nacimiento
    - hour, minute: Hora de nacimiento
    - latitude, longitude: Coordenadas del lugar de nacimiento
    - timezone: Zona horaria (ej: "America/Santiago")
    """
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Límite de requests excedido. Intenta en un minuto.")
    try:
        # Derivar la timezone real desde las coordenadas de nacimiento.
        # El campo timezone del cliente queda solo como fallback.
        data.timezone = resolve_timezone(
            round(data.latitude, 4), round(data.longitude, 4), data.timezone
        )

        # Usar Kerykeion si está disponible, sino cálculos simplificados
        if KERYKEION_AVAILABLE:
            chart = generate_kerykeion_chart(data)
        else:
            chart = generate_simple_chart(data)

        # Timezone efectivamente usada en el cálculo (transparencia para el cliente)
        chart['timezone_used'] = data.timezone

        # Agregar interpretaciones
        chart['interpretations'] = get_interpretations_for_chart(chart)

        # Agregar biorritmos (enseñanzas de Ra)
        birth_date_str = f"{data.year}-{data.month:02d}-{data.day:02d}"
        chart['biorhythms'] = calculate_biorhythms(birth_date_str)

        return chart
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chart/example")
def example_chart():
    """Retorna una carta natal de ejemplo"""
    example_data = BirthData(
        name="Ejemplo",
        year=1990,
        month=6,
        day=15,
        hour=14,
        minute=30,
        latitude=-33.4489,
        longitude=-70.6693,
        timezone="America/Santiago"
    )
    return calculate_chart(example_data)


# === ARCHIVOS ESTÁTICOS (Producción) ===

# Directorio base de la aplicación
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Headers de caché para assets estáticos (1 año para versionados)
CACHE_HEADERS = {"Cache-Control": "public, max-age=31536000, immutable"}
NO_CACHE_HEADERS = {"Cache-Control": "no-cache, must-revalidate"}

@app.get("/app.js")
def get_js():
    """Sirve el archivo JavaScript (cacheado 1 año, versionado en HTML)"""
    return FileResponse(
        os.path.join(BASE_DIR, "app.js"),
        media_type="application/javascript",
        headers=CACHE_HEADERS
    )

@app.get("/styles.css")
def get_css():
    """Sirve el archivo CSS (cacheado 1 año, versionado en HTML)"""
    return FileResponse(
        os.path.join(BASE_DIR, "styles.css"),
        media_type="text/css",
        headers=CACHE_HEADERS
    )

@app.get("/share.jpeg")
def get_share_image():
    """Sirve la imagen para compartir en redes sociales"""
    return FileResponse(
        os.path.join(BASE_DIR, "share.jpeg"),
        media_type="image/jpeg",
        headers=CACHE_HEADERS
    )

@app.get("/")
def get_index():
    """Sirve la página principal (sin caché para actualizaciones inmediatas)"""
    return FileResponse(
        os.path.join(BASE_DIR, "index.html"),
        media_type="text/html",
        headers=NO_CACHE_HEADERS
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
