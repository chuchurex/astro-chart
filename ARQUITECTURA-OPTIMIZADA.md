# Arquitectura Optimizada para astro.chuchurex.cl

## 🎯 Arquitectura Propuesta (Mejor Práctica)

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE (Edge)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend: astro.chuchurex.cl                                   │
│  ┌──────────────────────────────────────┐                       │
│  │  Cloudflare Pages                    │                       │
│  │  - HTML/CSS/JS estático              │                       │
│  │  - CDN global                         │                       │
│  │  - SSL automático                     │                       │
│  │  - Deploy automático desde GitHub     │                       │
│  └──────────────────────────────────────┘                       │
│                                                                  │
│  Backend: api.astro.chuchurex.cl                                │
│  ┌──────────────────────────────────────┐                       │
│  │  Cloudflare Proxy (🟠 Proxied)       │                       │
│  │  - SSL de Cloudflare (automático)    │                       │
│  │  - DDoS protection                    │                       │
│  │  - Cache de respuestas                │                       │
│  │  - Oculta IP del servidor             │                       │
│  └──────────┬───────────────────────────┘                       │
│             │                                                    │
└─────────────┼────────────────────────────────────────────────────┘
              │ HTTPS (origen flexible)
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VULTR VPS (Origen)                           │
│                    64.176.12.233                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  nginx → FastAPI (puerto 8001)                                  │
│  - SSL: No necesario (Cloudflare maneja SSL)                   │
│  - O usar certificado autofirmado                               │
│  - O usar Cloudflare Origin Certificate                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Configuración DNS Correcta

### Para api.astro.chuchurex.cl:

```
Type:  A
Name:  api.astro
IPv4:  64.176.12.233
Proxy: 🟠 Proxied (NARANJA)  ← ESTO ES MEJOR
TTL:   Auto
```

**¿Por qué Proxied es mejor?**
1. SSL gratuito y automático de Cloudflare
2. Protección DDoS incluida
3. CDN global (más rápido desde cualquier país)
4. Cache automático de respuestas
5. Oculta la IP real del VPS

---

## 🔧 Configuración nginx Simplificada

Con Cloudflare Proxy, nginx se simplifica mucho:

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
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**No necesitas:**
- ❌ certbot
- ❌ Configuración SSL
- ❌ Renovación de certificados

---

## 🚀 Pasos de Implementación

### Paso 1: DNS en Cloudflare

**Link directo:** https://dash.cloudflare.com/

1. Selecciona **chuchurex.cl**
2. Ve a **DNS**
3. Click **Add record**
4. Configura:
   ```
   Type:  A
   Name:  api.astro
   IPv4:  64.176.12.233
   Proxy: 🟠 Proxied (naranja)
   TTL:   Auto
   ```
5. **Save**

### Paso 2: Configurar Cloudflare SSL/TLS

1. En Cloudflare, ve a **SSL/TLS**
2. En **Overview**, selecciona:
   - **Flexible** (si tu VPS no tiene SSL)
   - **Full** (si tu VPS tiene SSL autofirmado)
   - **Full (strict)** (si tu VPS tiene Let's Encrypt)

**Recomendación:** Usar **Flexible** para empezar (más simple)

### Paso 3: SSH al VPS

```bash
ssh root@64.176.12.233
```

### Paso 4: Crear configuración nginx

```bash
sudo nano /etc/nginx/sites-available/api-astro
```

Contenido:

```nginx
server {
    listen 80;
    server_name api.astro.chuchurex.cl;

    # Logs
    access_log /var/log/nginx/api-astro-access.log;
    error_log /var/log/nginx/api-astro-error.log;

    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;

        # Headers para FastAPI
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;

        # IP real del cliente (desde Cloudflare)
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache bypass
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (para monitoreo)
    location /health {
        proxy_pass http://localhost:8001/health;
        access_log off;
    }
}
```

### Paso 5: Activar configuración

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/api-astro /etc/nginx/sites-enabled/

# Verificar sintaxis
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

### Paso 6: Verificar backend

```bash
# Ver si FastAPI está corriendo
docker ps | grep astro

# Si no está, iniciarlo
cd /root/astro-chart
git pull origin main
docker build -t astro-api .
docker stop astro-api 2>/dev/null || true
docker rm astro-api 2>/dev/null || true
docker run -d --name astro-api -p 8001:8001 --restart unless-stopped astro-api

# Ver logs
docker logs astro-api -f
```

### Paso 7: Probar

```bash
# Desde el VPS
curl http://localhost:8001/health

# Desde tu máquina local (esperar 2-3 minutos)
curl https://api.astro.chuchurex.cl/health
```

---

## 🎨 Mejoras Adicionales (Opcionales)

### 1. Cloudflare Page Rules (Cache para API)

En Cloudflare:
1. **Rules** > **Page Rules**
2. **Create Page Rule**
3. URL: `api.astro.chuchurex.cl/health*`
4. Settings:
   - Cache Level: Standard
   - Edge Cache TTL: 5 minutes
5. **Save**

### 2. Cloudflare Workers (Rate Limiting Avanzado)

Crear un Worker para rate limiting más sofisticado que el actual.

### 3. Firewall Rules

En Cloudflare:
1. **Security** > **WAF**
2. Crear reglas para:
   - Bloquear bots
   - Rate limiting por IP
   - Permitir solo requests válidos

---

## 📊 Comparación de Arquitecturas

| Feature | DNS Only (⚪) | Proxied (🟠) |
|---------|--------------|--------------|
| SSL | Manual (certbot) | Automático ✅ |
| DDoS Protection | No | Sí ✅ |
| CDN Global | No | Sí ✅ |
| Cache | Manual | Automático ✅ |
| IP Oculta | No | Sí ✅ |
| Configuración | Compleja | Simple ✅ |
| Costo | Gratis | Gratis ✅ |

**Ganador:** 🟠 Proxied

---

## ✅ Checklist de Implementación

- [ ] Configurar DNS en Cloudflare (Proxied)
- [ ] Configurar SSL mode en Cloudflare (Flexible)
- [ ] SSH al VPS
- [ ] Crear config nginx
- [ ] Activar config nginx
- [ ] Verificar backend está corriendo
- [ ] Probar endpoint
- [ ] Actualizar app.js a api.astro.chuchurex.cl
- [ ] Deploy a producción

---

## 🔐 Seguridad Extra (Opcional)

### Restringir acceso solo desde Cloudflare

En nginx, agregar:

```nginx
# Solo permitir IPs de Cloudflare
include /etc/nginx/cloudflare-ips.conf;
deny all;
```

Crear `/etc/nginx/cloudflare-ips.conf`:
```bash
curl https://www.cloudflare.com/ips-v4 | sed 's/^/allow /' | sudo tee /etc/nginx/cloudflare-ips.conf
curl https://www.cloudflare.com/ips-v6 | sed 's/^/allow /' | sudo tee -a /etc/nginx/cloudflare-ips.conf
```

---

*Arquitectura optimizada - January 5, 2026*
