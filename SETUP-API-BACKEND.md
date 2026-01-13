# Setup API Backend: api.astro.chuchurex.cl

## Problema Actual

- ✅ Frontend funcionando: https://astro.chuchurex.cl
- ❌ Backend NO funcionando: https://api.astro.chuchurex.cl
- ✅ Backend antiguo funcionando: https://api.chuchurex.cl

El frontend en `astro.chuchurex.cl` intenta conectarse a `api.astro.chuchurex.cl` pero ese dominio no existe todavía.

---

## Solución Rápida (Opción 1): Usar el backend existente temporalmente

### Cambiar temporalmente al backend antiguo:

```javascript
// En app.js línea 12, cambiar:
: 'https://api.astro.chuchurex.cl',
// Por:
: 'https://api.chuchurex.cl',
```

Esto hará que el sitio funcione INMEDIATAMENTE mientras configuramos el nuevo backend.

---

## Solución Permanente (Opción 2): Configurar api.astro.chuchurex.cl

### Paso 1: Configurar DNS en Cloudflare

1. Ve a: https://dash.cloudflare.com
2. Selecciona el dominio: `chuchurex.cl`
3. Ve a **DNS** > **Records**
4. Agrega un nuevo registro:
   ```
   Tipo: A
   Nombre: api.astro
   IPv4 address: 64.176.12.233
   Proxy status: DNS only (⚪ gris, NO naranja)
   TTL: Auto
   ```
5. Click en **Save**

**¿Por qué DNS only?** Porque vamos a usar el certificado SSL de Let's Encrypt en el VPS, no el de Cloudflare.

### Paso 2: SSH al VPS

```bash
ssh root@64.176.12.233
```

### Paso 3: Crear configuración nginx

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/api-astro
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name api.astro.chuchurex.cl;

    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers (opcional, ya lo maneja FastAPI)
        add_header Access-Control-Allow-Origin * always;
    }
}
```

Guardar: `Ctrl + O`, `Enter`, `Ctrl + X`

### Paso 4: Activar configuración

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/api-astro /etc/nginx/sites-enabled/

# Verificar sintaxis
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

### Paso 5: Obtener certificado SSL

```bash
# Instalar certbot si no está instalado
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot --nginx -d api.astro.chuchurex.cl
```

Certbot te preguntará:
- Email: ingresa tu email
- Terms: acepta
- Redirect HTTP to HTTPS: Yes (opción 2)

Certbot automáticamente:
- Obtiene el certificado de Let's Encrypt
- Modifica la config de nginx para HTTPS
- Configura renovación automática

### Paso 6: Verificar que el backend esté corriendo

```bash
# Ver si el contenedor Docker está corriendo
docker ps | grep astro

# Si no está corriendo, iniciarlo
cd /root/astro-chart
git pull origin main
docker build -t astro-api .
docker stop astro-api && docker rm astro-api
docker run -d --name astro-api -p 8001:8001 astro-api

# Verificar logs
docker logs astro-api -f
```

### Paso 7: Probar

```bash
# Desde el VPS
curl http://localhost:8001/health

# Desde tu máquina local (después de esperar 1-2 min para DNS)
curl https://api.astro.chuchurex.cl/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "kerykeion": true,
  "timestamp": "...",
  "cache": {...}
}
```

---

## Opción Recomendada: Solución Rápida primero

**Para que el sitio funcione YA:**

1. Cambiar `app.js` para usar `api.chuchurex.cl` (backend existente)
2. Hacer commit y push
3. El sitio funcionará en minutos

**Luego, cuando tengas tiempo:**

1. Configurar `api.astro.chuchurex.cl` siguiendo Opción 2
2. Cambiar `app.js` de vuelta a `api.astro.chuchurex.cl`
3. Hacer commit y push

---

## Comandos Rápidos de Referencia

**Ver estado nginx:**
```bash
ssh root@64.176.12.233
sudo systemctl status nginx
sudo nginx -t
```

**Ver logs del backend:**
```bash
ssh root@64.176.12.233
docker logs astro-api -f
```

**Reiniciar todo:**
```bash
ssh root@64.176.12.233
sudo systemctl restart nginx
docker restart astro-api
```

**Verificar DNS:**
```bash
dig api.astro.chuchurex.cl
nslookup api.astro.chuchurex.cl
```

---

*Documento creado: January 5, 2026*
