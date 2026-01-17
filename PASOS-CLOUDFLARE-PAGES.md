# Configuración de mapanatal.org en Cloudflare Pages

## 📍 Estás aquí: Workers & Pages → Create application

---

## PASO 1: Crear la aplicación desde GitHub

1. **Click en "Create application"**

2. **Selecciona la pestaña "Pages"** (no Workers)

3. **Click en "Connect to Git"**

4. **Conectar GitHub:**
   - Si ya conectaste GitHub antes: selecciona el repositorio `chuchurex/astro-chart`
   - Si es primera vez:
     - Click "Connect GitHub"
     - Autoriza Cloudflare
     - Selecciona el repositorio `chuchurex/astro-chart`

5. **Configuración del proyecto:**
   ```
   Project name: mapanatal
   Production branch: main
   Build command: [DEJAR VACÍO - es un sitio estático]
   Build output directory: / [o dejar vacío]
   Root directory: / [o dejar vacío]
   ```

6. **Variables de entorno:** (SKIP - no necesitas ninguna)

7. **Click "Save and Deploy"**
   - Espera ~1 minuto mientras hace el primer deploy
   - Te dará una URL temporal: `mapanatal.pages.dev`

---

## PASO 2: Agregar dominio personalizado

1. **Una vez desplegado**, ve a la sección **"Custom domains"**
   (Dentro del proyecto mapanatal → Settings → Custom domains)

2. **Click "Set up a custom domain"**

3. **Agregar dominio raíz:**
   - Ingresa: `mapanatal.org`
   - Click "Continue"
   - Cloudflare detectará automáticamente tu zona DNS
   - Click "Activate domain"

   ✅ Cloudflare creará automáticamente el registro DNS necesario

4. **Agregar www (opcional pero recomendado):**
   - Click "Set up a custom domain" nuevamente
   - Ingresa: `www.mapanatal.org`
   - Click "Continue"
   - Click "Activate domain"

---

## PASO 3: Verificar configuración DNS

1. **Ve a: Cloudflare Dashboard → DNS → Records**

2. **Deberías ver estos registros (creados automáticamente):**
   ```
   Tipo    Nombre          Contenido                    Proxy
   ────────────────────────────────────────────────────────────
   CNAME   mapanatal.org   mapanatal.pages.dev         ☁️ Proxied
   CNAME   www             mapanatal.pages.dev         ☁️ Proxied
   ```

3. **Agregar registro para API (MANUAL):**
   - Click "Add record"
   - Tipo: `A`
   - Name: `api`
   - IPv4 address: `64.176.12.233`
   - Proxy status: **DNS only** (nube GRIS, no naranja)
   - TTL: Auto
   - Click "Save"

---

## PASO 4: Configurar SSL/TLS

1. **Ve a: SSL/TLS → Overview**

2. **Selecciona modo: Full (strict)**
   - Esto es importante porque tu VPS tiene certificado Let's Encrypt

---

## PASO 5: Verificar que funciona

**Frontend:**
- Abre: https://mapanatal.org
- Debería cargar el sitio (puede tardar 1-5 minutos en propagarse)
- Si sale "DNS_PROBE_FINISHED_NXDOMAIN", espera 5-10 minutos más

**Temporal:**
- https://mapanatal.pages.dev (debería funcionar inmediatamente)

---

## ✅ CHECKLIST

- [ ] Repositorio conectado a Cloudflare Pages
- [ ] Primer deploy exitoso (mapanatal.pages.dev funciona)
- [ ] Dominio personalizado `mapanatal.org` agregado
- [ ] Dominio `www.mapanatal.org` agregado (opcional)
- [ ] Registro DNS `A` para `api.mapanatal.org` creado manualmente
- [ ] SSL/TLS en modo "Full (strict)"
- [ ] https://mapanatal.org carga correctamente

---

## 🔄 Auto-deploy configurado

De ahora en adelante:
- Cada `git push origin main` → deploy automático
- Cloudflare reconstruye y publica en ~30 segundos
- No necesitas hacer nada más

---

## ⚠️ IMPORTANTE

**NO** elimines el proyecto actual de Cloudflare Pages (astro.chuchurex.cl) hasta que confirmes que mapanatal.org funciona 100%.

Puedes tener ambos funcionando en paralelo temporalmente.

---

## 🆘 Troubleshooting

### "This site can't be reached"
→ DNS aún propagando. Esperar 5-30 minutos.
→ Verificar en: https://dnschecker.org/#A/mapanatal.org

### "Too many redirects"
→ Cambiar SSL/TLS a "Full (strict)"

### "Build failed"
→ Es sitio estático, no debería fallar. Verificar que Build command esté VACÍO.

---

**¿Completaste estos pasos?**

Confírmame cuando:
1. ✅ Cloudflare Pages esté configurado
2. ✅ https://mapanatal.org cargue (aunque sea con contenido viejo)

Y procederé a actualizar el código con las nuevas URLs.
