# Configurar DNS en Cloudflare - Paso a Paso

## 🔗 Link Directo

**Abre este link:** https://dash.cloudflare.com/

---

## 📋 Paso a Paso con Screenshots

### Paso 1: Acceder a Cloudflare Dashboard

1. Abre: https://dash.cloudflare.com/
2. Inicia sesión con tu cuenta (chuchurex@gmail.com)

### Paso 2: Seleccionar el Dominio

1. En la lista de sitios, busca: **chuchurex.cl**
2. Click en **chuchurex.cl**

### Paso 3: Ir a DNS

1. En el menú lateral izquierdo, click en **DNS**
2. O busca la pestaña que dice **DNS Records**

### Paso 4: Agregar Registro A para API

1. Click en el botón **"Add record"** (botón azul)
2. Completa el formulario:

```
┌─────────────────────────────────────────┐
│ Type:    [A ▼]                          │
│                                         │
│ Name:    api.astro                      │
│                                         │
│ IPv4:    64.176.12.233                  │
│                                         │
│ Proxy:   🟠 Proxied                     │
│          (IMPORTANTE: NARANJA)          │
│                                         │
│ TTL:     Auto                           │
└─────────────────────────────────────────┘
```

**IMPORTANTE:**
- El **Proxy status** debe estar en **Proxied** (🟠 naranja)
- Esto activa el SSL automático de Cloudflare
- Si está en gris (DNS only), click en él para cambiarlo a naranja

### Paso 5: Guardar

1. Click en **"Save"**
2. Espera la confirmación verde

---

## ✅ Verificación

Después de 1-2 minutos, verifica que el DNS se haya propagado:

```bash
# En tu terminal:
dig api.astro.chuchurex.cl

# O usa esta herramienta online:
https://dnschecker.org/#A/api.astro.chuchurex.cl
```

Deberías ver:
```
api.astro.chuchurex.cl. 300 IN A 64.176.12.233
```

---

## 🎯 Resumen de lo que configuraste

```
Tipo: A Record
Nombre: api.astro.chuchurex.cl
Apunta a: 64.176.12.233 (tu VPS en Vultr)
Proxy: Desactivado (para SSL de Let's Encrypt)
```

Esto hace que cuando alguien visite `api.astro.chuchurex.cl`,
se conecte directamente a tu servidor VPS.

---

## 🔄 Configurar SSL Mode en Cloudflare

**PASO CRÍTICO:** Después de guardar el DNS, debes configurar el modo SSL:

1. En el mismo dashboard de Cloudflare, ve a **SSL/TLS**
2. En la pestaña **Overview**, busca **SSL/TLS encryption mode**
3. Selecciona **Flexible**

```
┌────────────────────────────────────────┐
│ SSL/TLS encryption mode                │
│                                        │
│ ○ Off (not secure)                     │
│ ● Flexible    👈 SELECCIONA ESTE       │
│ ○ Full                                 │
│ ○ Full (strict)                        │
└────────────────────────────────────────┘
```

**¿Por qué Flexible?**
- Cloudflare maneja el SSL entre el usuario y Cloudflare (HTTPS)
- La conexión entre Cloudflare y tu VPS es HTTP (sin SSL)
- No necesitas configurar certificados en el VPS
- Es más simple y funciona perfecto con nginx básico

---

## 💡 Alternativa: CNAME (si prefieres)

En lugar de crear un registro A nuevo, puedes crear un CNAME
que apunte al dominio API existente:

```
Tipo: CNAME
Nombre: api.astro
Target: api.chuchurex.cl
Proxy: DNS only (⚪ gris)
TTL: Auto
```

Esto reutiliza la configuración existente del backend.

---

*Instrucciones creadas: January 5, 2026*
