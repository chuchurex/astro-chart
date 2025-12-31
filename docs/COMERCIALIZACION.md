# Análisis de Comercialización - astro.cl

*Guardado: 30 Diciembre 2025*

## Estado Actual del Proyecto

**astro.cl** es un MVP funcional con:
- ~5,900 líneas de código
- Backend Python (FastAPI + Kerykeion/Swiss Ephemeris)
- Frontend vanilla JS con diseño responsive
- Soporte i18n (EN/ES/PT)
- Cálculos precisos de carta natal + biorritmos Ra
- Desplegado en producción

---

## Opciones de Comercialización

### Opción 1: SaaS para Astrólogos (B2B)
**Modelo:** Suscripción mensual para astrólogos profesionales

**Qué falta desarrollar:**
- Sistema de usuarios/autenticación
- Dashboard personalizado (logo, colores, dominio propio)
- Exportación PDF con marca del astrólogo
- Base de datos para guardar cartas de clientes
- Panel de administración

**Precio sugerido:** $15-50 USD/mes
**Mercado:** Astrólogos independientes, escuelas de astrología
**Ventaja:** Recurrente, escalable

---

### Opción 2: Plugin WordPress
**Modelo:** Venta única + soporte premium

**Qué falta desarrollar:**
- Wrapper PHP para WordPress
- Shortcodes [carta_natal]
- Widget de sidebar
- Panel de configuración WP
- API embebida o llamada al backend existente

**Precio sugerido:** $49-99 USD (licencia única)
**Mercado:** Sitios de astrología, blogs esotéricos
**Ventaja:** Mercado masivo de WordPress

---

### Opción 3: White-label / Licencia
**Modelo:** Vender el código completo a empresas

**Qué falta desarrollar:**
- Documentación técnica completa
- Guía de instalación
- Personalización de marca
- Soporte técnico (opcional)

**Precio sugerido:** $500-2,000 USD por licencia
**Mercado:** Apps de bienestar, plataformas esotéricas
**Ventaja:** Ingreso alto por venta

---

### Opción 4: API as a Service
**Modelo:** Cobrar por llamada a la API

**Qué falta desarrollar:**
- Sistema de API keys
- Rate limiting y quotas
- Dashboard de uso
- Documentación OpenAPI
- Billing/facturación

**Precio sugerido:** $0.01-0.05 USD por cálculo
**Mercado:** Desarrolladores, apps móviles
**Ventaja:** Muy escalable

---

### Opción 5: Freemium con Premium
**Modelo:** App gratuita + features de pago

**Features premium posibles:**
- Tránsitos y progresiones
- Sinastría (compatibilidad)
- Reportes PDF descargables
- Cartas ilimitadas guardadas
- Sin publicidad

**Precio sugerido:** $5-10 USD/mes o $50/año
**Mercado:** Usuarios finales interesados en astrología
**Ventaja:** Base de usuarios grande

---

## Recomendación de Implementación

### Corto plazo (1-2 semanas):
→ **API as a Service** - Solo necesitas autenticación y documentación

### Mediano plazo (1-2 meses):
→ **Plugin WordPress** - Mercado masivo, una vez desarrollado es pasivo

### Largo plazo (3-6 meses):
→ **SaaS para Astrólogos** - Mayor valor, recurrente
