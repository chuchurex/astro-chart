# Migración: Vultr VPS → Fly.io (Gratis, siempre activo)

## Resumen

Mover el backend de mapanatal.org desde Vultr VPS ($5-6/mes) a Fly.io (gratis, 24/7).

**Antes:**
```
Frontend (Cloudflare Pages) → API (Vultr VPS 64.176.12.233)
```

**Después:**
```
Frontend (Cloudflare Pages) → API (Fly.io — Santiago, Chile)
```

Fly.io tiene servidores en Santiago (región `scl`), así que la latencia se mantiene igual. La VM queda siempre encendida, sin cold starts.

---

## Pasos

### 1. Instalar Fly CLI

```bash
# macOS
brew install flyctl

# o directamente
curl -L https://fly.io/install.sh | sh
```

### 2. Crear cuenta y autenticarse

```bash
fly auth signup
# o si ya tienes cuenta:
fly auth login
```

### 3. Subir cambios a GitHub

```bash
cd ~/Sites/active/mapanatal.org
git add fly.toml app.py
git commit -m "feat: add Fly.io config for free hosting migration"
git push origin main
```

### 4. Desplegar en Fly.io

```bash
cd ~/Sites/active/mapanatal.org

# Primera vez: crea la app y despliega
fly launch --copy-config --yes
# Fly detecta el Dockerfile y fly.toml automáticamente

# Si fly launch pide cambiar algo, responde:
#   - App name: mapanatal-api (o el que te ofrezca)
#   - Region: scl (Santiago)
#   - No a base de datos
```

Si `fly launch` no funciona bien, hazlo manual:
```bash
fly apps create mapanatal-api
fly deploy
```

### 5. Verificar que funciona

```bash
# Ver estado
fly status

# Ver logs
fly logs

# Probar health
curl https://mapanatal-api.fly.dev/health
```

### 6. Configurar dominio custom (api.mapanatal.org)

```bash
# Agregar certificado SSL para tu dominio
fly certs add api.mapanatal.org
```

Fly te dará una IP dedicada. Anótala.

### 7. Actualizar DNS en Cloudflare

1. Ir a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Seleccionar dominio `mapanatal.org`
3. Ir a **DNS → Records**
4. Buscar el registro de `api.mapanatal.org`
5. Cambiar de:
   - Tipo: A → `64.176.12.233` (Vultr)
6. A:
   - Tipo: AAAA → la IPv6 que Fly te dio
   - O Tipo: A → la IPv4 que Fly te dio
   - Proxy: OFF (nube gris) — Fly maneja su propio SSL

**Importante:** Desactivar el proxy de Cloudflare (nube gris) para `api.mapanatal.org` porque Fly maneja su propio certificado SSL.

### 8. Verificar todo

```bash
# Esperar unos minutos para propagación DNS, luego:
curl https://api.mapanatal.org/health

# Verificar frontend completo
open https://mapanatal.org
```

### 9. Cancelar Vultr

Una vez que todo funcione en Fly.io:
1. Ir a [Vultr Dashboard](https://my.vultr.com/)
2. Seleccionar el VPS `64.176.12.233`
3. Click "Server Destroy"
4. Confirmar eliminación

---

## Fly.io vs Vultr

| Aspecto | Vultr VPS | Fly.io Free |
|---------|-----------|-------------|
| Costo | ~$5-6 USD/mes | $0 |
| Región | Chile (SCL) | Chile (SCL) |
| Latencia | ~5ms | ~5ms |
| Siempre activo | Sí | Sí |
| Cold start | No | No |
| Deploy | Manual (SSH + Docker) | `fly deploy` |
| SSL | Let's Encrypt manual | Automático |
| Mantenimiento | Tú manejas todo | Fly maneja infra |
| RAM | Según plan VPS | 256 MB (suficiente) |

---

## Deploy futuro

Cada vez que hagas cambios al backend:

```bash
cd ~/Sites/active/mapanatal.org
fly deploy
```

O configurar deploy automático desde GitHub:
```bash
fly deploy --remote-only
# Luego configurar GitHub Action (ver fly.io/docs/app-guides/continuous-deployment-with-github-actions)
```

---

## Comandos útiles de Fly

```bash
fly status              # Estado de la app
fly logs                # Ver logs en tiempo real
fly ssh console         # SSH al contenedor
fly scale show          # Ver recursos asignados
fly certs list          # Ver certificados SSL
fly deploy              # Redesplegar
```

---

## Rollback

Si algo falla, revertir el DNS en Cloudflare:
- `api.mapanatal.org` → A record → `64.176.12.233`

Mientras el VPS siga activo, puedes volver al estado anterior en segundos.
