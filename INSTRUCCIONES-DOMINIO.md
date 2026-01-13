# Instrucciones: Configurar astro.chuchurex.cl

## Estado Actual ✅

**Proyecto Cloudflare Pages:** Creado y desplegado
- Nombre: `astro-chuchurex`
- URL preview: https://astro-chuchurex.pages.dev
- Deploy ID: 16b6caee
- Estado: ✅ LIVE

**Código:** Pusheado a GitHub
- Commit: eeac6b6
- Branch: main

---

## Paso 1: Configurar Dominio Personalizado

### Opción A: Usando el Dashboard Web (Recomendado)

1. Abre: https://dash.cloudflare.com/
2. Ve a **Workers & Pages** → **astro-chuchurex**
3. Click en la pestaña **Custom domains**
4. Click en **"Set up a custom domain"**
5. Ingresa: `astro.chuchurex.cl`
6. Click en **"Continue"**
7. Cloudflare automáticamente:
   - Verificará que tienes acceso al dominio
   - Creará el registro DNS CNAME
   - Configurará SSL

### Opción B: Configurar DNS Manualmente

Si prefieres hacerlo manual:

1. Ve a **DNS** en Cloudflare
2. Agrega un registro CNAME:
   ```
   Tipo: CNAME
   Nombre: astro
   Destino: astro-chuchurex.pages.dev
   Proxy: Activado (🟠 naranja)
   TTL: Auto
   ```
3. Guarda

---

## Paso 2: Verificar el Dominio

Una vez configurado, espera 1-2 minutos y verifica:

**Verificar DNS:**
```bash
dig astro.chuchurex.cl
# Debería resolver a Cloudflare IPs
```

**Verificar HTTPS:**
```bash
curl -I https://astro.chuchurex.cl
# Debería devolver HTTP/2 200
```

**Abrir en navegador:**
- https://astro.chuchurex.cl

---

## Paso 3: Configurar Backend API

Una vez que el frontend esté funcionando, configura el backend.

### 3.1 SSH al VPS

```bash
ssh root@64.176.12.233
```

### 3.2 Crear configuración nginx

```bash
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
    }
}
```

### 3.3 Activar configuración

```bash
sudo ln -s /etc/nginx/sites-available/api-astro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.4 Obtener certificado SSL

```bash
sudo certbot --nginx -d api.astro.chuchurex.cl
```

Certbot automáticamente:
- Obtendrá el certificado
- Modificará la config de nginx para HTTPS
- Configurará renovación automática

### 3.5 Actualizar DNS para API

En Cloudflare DNS:
```
Tipo: A
Nombre: api.astro
Destino: 64.176.12.233
Proxy: Desactivado (⚪ gris) - para que funcione SSL de Let's Encrypt
TTL: Auto
```

O usar CNAME:
```
Tipo: CNAME
Nombre: api.astro
Destino: api.chuchurex.cl (el que ya existe)
Proxy: Desactivado (⚪ gris)
TTL: Auto
```

### 3.6 Pull código actualizado y reiniciar

```bash
cd /root/astro-chart
git pull origin main
docker build -t astro-api .
docker stop astro-api && docker rm astro-api
docker run -d --name astro-api -p 8001:8001 astro-api
```

### 3.7 Verificar backend

```bash
curl https://api.astro.chuchurex.cl/health
```

Debería devolver:
```json
{
  "status": "healthy",
  "kerykeion": true,
  "timestamp": "...",
  "cache": {...}
}
```

---

## Paso 4: Prueba Completa

1. Abre https://astro.chuchurex.cl
2. Completa el formulario de carta natal
3. Verifica que calcule correctamente
4. Verifica que la consola del navegador no muestre errores CORS

---

## Troubleshooting

### Frontend no carga
- Verificar DNS: `dig astro.chuchurex.cl`
- Verificar en CF Pages que el dominio esté activo
- Esperar propagación DNS (hasta 5 minutos)

### Error CORS
- Verificar que api.astro.chuchurex.cl esté accesible
- Verificar CORS en app.py incluye https://astro.chuchurex.cl
- Verificar CSP en _headers

### SSL no funciona
- Esperar 1-2 minutos después de configurar
- Verificar en CF Pages que SSL esté activo
- Para backend: verificar certbot se ejecutó correctamente

---

## Comandos Útiles

**Ver logs del backend:**
```bash
ssh root@64.176.12.233
docker logs astro-api -f
```

**Reiniciar backend:**
```bash
ssh root@64.176.12.233
docker restart astro-api
```

**Ver estado nginx:**
```bash
ssh root@64.176.12.233
sudo systemctl status nginx
```

---

*Instrucciones generadas: January 5, 2026*
