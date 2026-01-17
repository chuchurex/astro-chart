# Plan de Migración: astro.chuchurex.cl → mapanatal.org

**Fecha**: 17 de enero de 2026
**Objetivo**: Migrar proyecto a nuevo dominio mapanatal.org manteniendo funcionalidad completa

---

## 📋 ARQUITECTURA ACTUAL

```
Frontend: astro.chuchurex.cl (Cloudflare Pages)
Backend:  api.astro.chuchurex.cl (Vultr VPS 64.176.12.233)
Repo:     github.com/chuchurex/astro-chart
```

## 🎯 ARQUITECTURA NUEVA

```
Frontend: mapanatal.org (Cloudflare Pages)
Backend:  api.mapanatal.org (mismo Vultr VPS)
Repo:     mismo repositorio GitHub
```

---

## 🔧 PASOS QUE DEBE HACER EL USUARIO (TÚ)

### 1. Configurar DNS en tu registrador de dominios (mapanatal.org)

**Opción A: DNS directo con Cloudflare (RECOMENDADO)**
- Ve al registrador donde compraste mapanatal.org
- Cambia los nameservers a Cloudflare:
  ```
  amber.ns.cloudflare.com
  curt.ns.cloudflare.com
  ```
- Esto puede tardar 24-48 horas en propagarse

**Opción B: DNS manual (si no puedes cambiar nameservers)**
- Agrega estos registros DNS en tu registrador:
  ```
  Tipo  Nombre              Valor                           Proxy
  ────────────────────────────────────────────────────────────────
  A     mapanatal.org       [IP de Cloudflare Pages]        Sí
  CNAME www                 mapanatal.org                   Sí
  CNAME api                 64.176.12.233                   No
  ```

### 2. Configurar Cloudflare Pages

1. **Agregar dominio personalizado**:
   - Ve a: Cloudflare Dashboard → Pages → astro-chart → Custom domains
   - Click "Set up a custom domain"
   - Ingresa: `mapanatal.org`
   - Click "Activate domain"
   - Repite para `www.mapanatal.org`

2. **Configurar SSL/TLS**:
   - Ve a: SSL/TLS → Overview
   - Modo: **Full (strict)** (ya que tu VPS tiene Let's Encrypt)

### 3. Configurar certificado SSL en VPS (api.mapanatal.org)

**SSH al VPS:**
```bash
ssh root@64.176.12.233
```

**Obtener certificado SSL:**
```bash
# Detener nginx temporalmente
docker-compose down

# Obtener certificado para api.mapanatal.org
certbot certonly --standalone -d api.mapanatal.org

# Actualizar configuración de nginx
nano /etc/nginx/sites-available/api.mapanatal.org

# Contenido del archivo nginx:
server {
    listen 80;
    server_name api.mapanatal.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.mapanatal.org;

    ssl_certificate /etc/letsencrypt/live/api.mapanatal.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.mapanatal.org/privkey.pem;

    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Crear symlink y reiniciar
ln -s /etc/nginx/sites-available/api.mapanatal.org /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
docker-compose up -d
```

**Configurar auto-renovación:**
```bash
crontab -e
# Agregar línea:
0 3 * * * certbot renew --quiet && systemctl reload nginx
```

### 4. Verificar que todo funciona

**Frontend:**
- Abre https://mapanatal.org
- Verifica que carga el sitio

**Backend:**
- Verifica: https://api.mapanatal.org/health
- Debe retornar JSON con status 200

**Formulario:**
- Ingresa datos de prueba
- Verifica que calcule la carta natal correctamente

---

## 💻 CAMBIOS QUE HARÁ CLAUDE (YO)

### Archivos a modificar (41 referencias):

1. **app.js** - Cambiar API_BASE_URL
2. **index.html** - Meta tags, canonical, og:url
3. **about/index.html** - Links y canonical
4. **CLAUDE.md** - Documentación del proyecto
5. **README.md** - URLs de producción
6. **package.json** (si existe) - Homepage
7. **.env** (si existe) - Variables de entorno

### Búsqueda y reemplazo:
```
astro.chuchurex.cl → mapanatal.org
api.astro.chuchurex.cl → api.mapanatal.org
```

---

## ⏱️ CRONOGRAMA SUGERIDO

### Día 1 (HOY):
1. ✅ Usuario configura DNS (nameservers o registros A/CNAME)
2. ⏳ Esperar propagación DNS (2-24 horas)
3. ✅ Claude actualiza código con nuevas URLs

### Día 2:
4. ✅ Usuario configura Cloudflare Pages con dominio personalizado
5. ✅ Usuario configura certificado SSL en VPS para api.mapanatal.org
6. ✅ Testing completo

### Día 3:
7. ✅ Deploy a producción (git push)
8. ✅ Verificación final
9. ✅ Opcional: Redirección 301 de astro.chuchurex.cl → mapanatal.org

---

## 🔄 MANTENER DOMINIO ANTIGUO (OPCIONAL)

Si quieres que astro.chuchurex.cl redirija a mapanatal.org:

**Opción 1: Cloudflare Page Rule**
- Dashboard → Page Rules → Create Page Rule
- URL: `astro.chuchurex.cl/*`
- Setting: Forwarding URL (301 - Permanent Redirect)
- Destination: `https://mapanatal.org/$1`

**Opción 2: Cloudflare Worker** (más potente)
```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const newUrl = url.toString().replace('astro.chuchurex.cl', 'mapanatal.org')
  return Response.redirect(newUrl, 301)
}
```

---

## 📊 CHECKLIST DE VERIFICACIÓN POST-MIGRACIÓN

- [ ] Frontend carga en https://mapanatal.org
- [ ] Frontend carga en https://www.mapanatal.org
- [ ] API responde en https://api.mapanatal.org/health
- [ ] Formulario calcula carta natal correctamente
- [ ] Biorhythms se generan sin errores
- [ ] PDFs se generan correctamente
- [ ] Links de compartir funcionan con nuevo dominio
- [ ] Selector de idioma funciona (ES/EN/PT)
- [ ] Google Analytics trackea correctamente
- [ ] Página /about/ carga correctamente
- [ ] Certificados SSL válidos (sin warnings)
- [ ] Redirección desde dominio antiguo (si aplica)

---

## 🆘 TROUBLESHOOTING

### "DNS_PROBE_FINISHED_NXDOMAIN"
→ DNS aún no ha propagado. Esperar 2-24 horas.

### "ERR_CERT_COMMON_NAME_INVALID"
→ Certificado SSL no configurado para api.mapanatal.org. Repetir paso 3.

### "Mixed Content" en consola
→ Verificar que app.js use `https://api.mapanatal.org` (no http)

### API no responde
→ Verificar nginx y docker en VPS:
```bash
systemctl status nginx
docker ps
curl http://localhost:8001/health
```

---

## 📞 CONTACTO

Si hay problemas técnicos:
1. Verificar DNS con: https://dnschecker.org
2. Verificar SSL con: https://www.ssllabs.com/ssltest/
3. Revisar logs: `docker logs astro-api-container`

---

**¿Listo para empezar?**

Confirma cuando hayas completado los pasos del usuario (DNS + Cloudflare Pages + SSL VPS) y procederé a actualizar todo el código.
