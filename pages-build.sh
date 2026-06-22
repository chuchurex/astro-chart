#!/bin/bash
# Genera el directorio que Cloudflare Pages publica (public_deploy/).
# Allowlist explícita: solo assets del sitio. Nunca scripts, docs internos,
# fuentes del backend ni credenciales. (Sin rsync: no existe en la imagen de build.)
set -e

rm -rf public_deploy
mkdir -p public_deploy

PUBLICAR=(
  _headers
  _redirects
  index.html
  app.js
  sw.js
  styles.css
  manifest.webmanifest
  pop.ogg
  share.jpeg
  share.svg
  about
  i18n
  icons
  styles
)

for item in "${PUBLICAR[@]}"; do
  if [ -e "$item" ]; then
    cp -R "$item" public_deploy/
  else
    echo "aviso: $item no existe, se omite"
  fi
done

echo "Archivos publicados:"
find public_deploy -maxdepth 1 | sort
