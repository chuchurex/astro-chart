# Configurar SSL para api.mapanatal.org en VPS

**Objetivo**: Obtener certificado SSL Let's Encrypt para que la API funcione con HTTPS

---

## ⚠️ IMPORTANTE

Antes de empezar, verifica que el DNS ya esté propagado:

```bash
# Desde tu Mac, ejecuta:
dig +short api.mapanatal.org
```

**Debe retornar**: `64.176.12.233`

Si no retorna esa IP, espera unos minutos más para que el DNS propague.

---

## PASO 1: Conectar al VPS

```bash
ssh root@64.176.12.233
```

Ingresa la contraseña cuando te la pida.

---

## PASO 2: Detener nginx temporalmente

```bash
# Detener nginx para liberar el puerto 80/443
systemctl stop nginx
```

---

## PASO 3: Obtener certificado SSL con Certbot

```bash
# Ejecutar certbot en modo standalone
certbot certonly --standalone -d api.mapanatal.org --non-interactive --agree-tos --email tu-email@ejemplo.com
```

**Reemplaza** `tu-email@ejemplo.com` con tu email real.

**Salida esperada**:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/api.mapanatal.org/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/api.mapanatal.org/privkey.pem
```

---

## PASO 4: Crear configuración de nginx

```bash
# Crear archivo de configuración
nano /etc/nginx/sites-available/api.mapanatal.org
```

**Pega este contenido completo**:

```nginx
# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name api.mapanatal.org;
    return 301 https://$server_name$request_uri;
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name api.mapanatal.org;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/api.mapanatal.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.mapanatal.org/privkey.pem;

    # Configuración SSL segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy al contenedor Docker
    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Logs
    access_log /var/log/nginx/api.mapanatal.org.access.log;
    error_log /var/log/nginx/api.mapanatal.org.error.log;
}
```

**Guardar**: `Ctrl+O` → Enter → `Ctrl+X`

---

## PASO 5: Activar el sitio y verificar configuración

```bash
# Crear symlink para activar el sitio
ln -s /etc/nginx/sites-available/api.mapanatal.org /etc/nginx/sites-enabled/

# Verificar que la configuración sea válida
nginx -t
```

**Salida esperada**:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

## PASO 6: Iniciar nginx

```bash
systemctl start nginx
```

---

## PASO 7: Verificar que el contenedor Docker esté corriendo

```bash
# Ver contenedores activos
docker ps
```

**Debe mostrar algo como**:
```
CONTAINER ID   IMAGE          PORTS                    NAMES
abc123def456   astro-api      0.0.0.0:8001->8000/tcp   astro-api-container
```

**Si NO aparece ningún contenedor**, iniciar Docker:

```bash
cd /root/astro-api  # O donde esté tu Dockerfile
docker-compose up -d
```

---

## PASO 8: Probar que funciona

### Desde el VPS:

```bash
# Probar localmente
curl http://localhost:8001/health

# Probar con HTTPS
curl https://api.mapanatal.org/health
```

**Salida esperada**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-17T12:00:00",
  "cache_size": 0
}
```

### Desde tu Mac:

```bash
curl https://api.mapanatal.org/health
```

Debe retornar el mismo JSON.

---

## PASO 9: Configurar auto-renovación del certificado

```bash
# Editar crontab
crontab -e
```

**Agregar esta línea al final**:

```cron
0 3 * * * certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

**Guardar**: `Ctrl+O` → Enter → `Ctrl+X`

Esto renovará automáticamente el certificado cada día a las 3 AM (solo lo renueva si está por vencer).

---

## PASO 10: Opcional - Eliminar configuración antigua

Si existe una configuración antigua para `api.astro.chuchurex.cl`:

```bash
# Ver qué configuraciones existen
ls -la /etc/nginx/sites-enabled/

# Si existe api.astro.chuchurex.cl, eliminarla
rm /etc/nginx/sites-enabled/api.astro.chuchurex.cl
rm /etc/nginx/sites-available/api.astro.chuchurex.cl

# Recargar nginx
systemctl reload nginx
```

---

## ✅ VERIFICACIÓN FINAL

### Checklist:

- [ ] DNS propagado: `dig +short api.mapanatal.org` → `64.176.12.233`
- [ ] Certificado SSL obtenido: `/etc/letsencrypt/live/api.mapanatal.org/`
- [ ] nginx configurado y corriendo: `systemctl status nginx`
- [ ] Docker corriendo: `docker ps` muestra contenedor
- [ ] HTTPS funciona: `curl https://api.mapanatal.org/health` retorna JSON
- [ ] Cron configurado para auto-renovación: `crontab -l`

---

## 🆘 TROUBLESHOOTING

### Error: "Could not bind to IPv4 or IPv6"
→ nginx está corriendo. Ejecuta: `systemctl stop nginx` y vuelve a intentar.

### Error: "Connection refused"
→ El contenedor Docker no está corriendo. Ejecuta: `docker-compose up -d`

### Error: "502 Bad Gateway"
→ nginx está corriendo pero no puede conectar al Docker. Verifica:
```bash
curl http://localhost:8001/health
```

### Certificado no se renueva automáticamente
→ Verifica crontab: `crontab -l`
→ Prueba renovación manual: `certbot renew --dry-run`

---

## 📊 COMANDOS ÚTILES

```bash
# Ver logs de nginx
tail -f /var/log/nginx/api.mapanatal.org.error.log

# Ver logs del contenedor Docker
docker logs -f astro-api-container

# Reiniciar nginx
systemctl restart nginx

# Ver estado de certificados
certbot certificates

# Renovar certificado manualmente
certbot renew
```

---

## 🎯 DESPUÉS DE COMPLETAR

1. Verificar desde el navegador: https://api.mapanatal.org/health
2. Verificar desde tu sitio: https://mapanatal.org (calcular una carta)
3. Verificar que no haya errores en la consola del navegador (F12)

---

**¿Todo funcionando?** 🎉

Si https://api.mapanatal.org/health retorna JSON con status "healthy", estás listo!

El sitio completo en https://mapanatal.org ahora debería funcionar perfectamente.
