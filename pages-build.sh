#!/bin/bash
# Genera el directorio que Cloudflare Pages publica (public_deploy/).
# Solo assets del sitio: nunca scripts, docs internos, fuentes del backend ni credenciales.
set -e

rm -rf public_deploy
mkdir -p public_deploy

rsync -a \
  --exclude='.git*' --exclude='.agent' --exclude='.env*' \
  --exclude='*.md' --exclude='*.sh' --exclude='*.py' --exclude='*.bak' \
  --exclude='Dockerfile' --exclude='Procfile' --exclude='requirements.txt' --exclude='runtime.txt' \
  --exclude='docs' --exclude='inbox' --exclude='modelos-de-ia' --exclude='scss' \
  --exclude='styles.scss' --exclude='styles.css.map' --exclude='DOCUMENTACION_PROYECTO.html' \
  --exclude='node_modules' --exclude='venv' --exclude='__pycache__' \
  --exclude='fly.toml' --exclude='public_deploy' \
  ./ public_deploy/

echo "Archivos publicados:"
find public_deploy -maxdepth 1 | sort
