# Plan de Accesibilidad WCAG AAA - Chuchurex Astral

## Estado Actual del Sitio

### ✅ Lo que ya está bien:
- Labels en formularios con `for` asociado a inputs
- Estructura semántica básica (header, main, footer, section, article)
- Lang attribute en HTML (aunque fijo en "en")
- Inputs con `required` attribute

### ❌ Problemas detectados:

## Fase 1: Fundamentos (Prioridad Alta)

### 1.1 Idioma dinámico
- [ ] Cambiar `<html lang="en">` dinámicamente según el idioma seleccionado
- [ ] Agregar `lang` a contenido en diferentes idiomas cuando sea necesario

### 1.2 Skip Links
- [ ] Agregar link "Saltar al contenido principal" al inicio
- [ ] Agregar link "Saltar al formulario"
- [ ] Estilos: visible solo con focus

### 1.3 Focus visible
- [ ] Asegurar outline visible en todos los elementos interactivos
- [ ] Contraste mínimo 3:1 para el indicador de focus
- [ ] No usar `outline: none` sin alternativa

### 1.4 Roles ARIA básicos
- [ ] `role="main"` en sección principal
- [ ] `role="navigation"` en nav
- [ ] `role="banner"` en header
- [ ] `role="contentinfo"` en footer
- [ ] `aria-label` en botones con solo iconos

---

## Fase 2: Contraste y Color (WCAG AAA requiere 7:1)

### 2.1 Verificar ratios de contraste
Colores actuales a revisar:
- Texto principal: `#e8e8f0` sobre `#0a0a12` → Verificar
- Texto secundario: `#8888a0` sobre `#0a0a12` → Probablemente falla AAA
- Links: `#d4af37` (dorado) → Verificar
- Botones y CTAs

### 2.2 Ajustes de color necesarios
- [ ] Subir contraste de textos secundarios (#8888a0 → algo más claro)
- [ ] Verificar contraste en estados hover/focus
- [ ] Verificar contraste en mensajes de error
- [ ] No transmitir información solo por color (agregar iconos/texto)

---

## Fase 3: Formularios Accesibles

### 3.1 Mejoras en inputs
- [ ] `aria-required="true"` en campos obligatorios
- [ ] `aria-describedby` para instrucciones/errores
- [ ] `aria-invalid="true"` cuando hay errores
- [ ] Mensajes de error asociados al campo

### 3.2 Autocompletado
- [ ] `autocomplete="name"` en campo nombre
- [ ] `autocomplete="bday"` en fecha de nacimiento

### 3.3 Manejo de errores
- [ ] Descripción clara del error
- [ ] Sugerencias de corrección
- [ ] Focus automático al primer error
- [ ] `aria-live="polite"` para anuncios dinámicos

---

## Fase 4: Navegación por Teclado

### 4.1 Orden de tabulación
- [ ] Verificar orden lógico de tab
- [ ] `tabindex="0"` solo donde sea necesario
- [ ] Evitar `tabindex` positivos

### 4.2 Trampas de teclado
- [ ] Verificar que no hay trampas de focus
- [ ] Escape cierra modales/overlays si los hay

### 4.3 Atajos de teclado
- [ ] Enter/Space activan botones
- [ ] Escape cancela acciones

---

## Fase 5: Contenido Dinámico

### 5.1 Live Regions
- [ ] `aria-live="polite"` para resultados de carta natal
- [ ] `aria-busy="true"` durante carga
- [ ] Anunciar cambios de sección

### 5.2 Loading states
- [ ] `role="status"` en loader
- [ ] `aria-label="Cargando..."` en spinner
- [ ] Texto alternativo para estados de carga

### 5.3 Resultados
- [ ] Anunciar cuando los resultados están listos
- [ ] Estructura de headings correcta (h1 → h2 → h3)

---

## Fase 6: Imágenes y Gráficos

### 6.1 SVG del Chart
- [ ] `role="img"` en contenedor del chart
- [ ] `aria-label` descriptivo del chart
- [ ] Alternativa textual de las posiciones planetarias

### 6.2 Iconos
- [ ] `aria-hidden="true"` en iconos decorativos
- [ ] `aria-label` en iconos funcionales
- [ ] Símbolos astrológicos con texto alternativo

---

## Fase 7: Texto y Legibilidad (AAA específico)

### 7.1 Tamaño de texto
- [ ] Mínimo 16px para texto principal
- [ ] Texto debe ser escalable hasta 200% sin pérdida
- [ ] Line-height mínimo 1.5 para párrafos

### 7.2 Espaciado
- [ ] Espaciado entre párrafos al menos 1.5x tamaño de fuente
- [ ] Espaciado entre letras ajustable
- [ ] Ancho de línea máximo 80 caracteres

### 7.3 Fuentes
- [ ] Verificar legibilidad de "Cinzel" y "Cormorant Garamond"
- [ ] Considerar opción de fuente más legible

---

## Fase 8: Responsive y Zoom

### 8.1 Zoom
- [ ] Funcional hasta 400% zoom
- [ ] Sin scroll horizontal hasta 320px de ancho
- [ ] Contenido no se corta ni superpone

### 8.2 Orientación
- [ ] Funciona en portrait y landscape
- [ ] No forzar orientación específica

---

## Fase 9: Preferencias del Usuario

### 9.1 Reduced Motion
- [ ] `@media (prefers-reduced-motion: reduce)` para animaciones de estrellas
- [ ] Deshabilitar animaciones del loader
- [ ] Transiciones mínimas

### 9.2 High Contrast
- [ ] Verificar en modo alto contraste de Windows
- [ ] Mantener bordes/outlines visibles

### 9.3 Color Scheme
- [ ] `@media (prefers-color-scheme)` si se implementa light mode

---

## Fase 10: Testing y Validación

### 10.1 Herramientas automáticas
- [ ] axe DevTools
- [ ] WAVE
- [ ] Lighthouse Accessibility audit

### 10.2 Testing manual
- [ ] Navegación solo con teclado
- [ ] Screen reader (VoiceOver/NVDA)
- [ ] Zoom al 200% y 400%

### 10.3 Testing con usuarios
- [ ] Feedback de usuarios con discapacidades (opcional)

---

## Orden de Implementación Sugerido

1. **Sprint 1**: Fases 1-2 (Fundamentos + Contraste)
2. **Sprint 2**: Fases 3-4 (Formularios + Teclado)
3. **Sprint 3**: Fases 5-6 (Contenido dinámico + Gráficos)
4. **Sprint 4**: Fases 7-9 (Texto + Responsive + Preferencias)
5. **Sprint 5**: Fase 10 (Testing completo)

---

## Recursos

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
