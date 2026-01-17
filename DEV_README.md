# Guía de Desarrollo Local

Este proyecto consta de un Frontend (HTML/JS/SCSS) y un Backend (Python/FastAPI).

## Puertos Configurados

*   **Frontend**: Puerto **3000** (recomendado para desarrollo).
*   **Backend API**: Puerto **8000** (configurado en `app.py` y `app.js`).

## Cómo ejecutar localmente

### 1. Frontend (Estático)
Para ver la interfaz gráfica y los cambios de diseño.
Si no tienes el backend corriendo, la aplicación detectará el error y usará cálculos locales (aproximados) automáticamente.

```bash
# Opción rápida (Python 3)
python3 -m http.server 3000
```
Luego abrir: [http://localhost:3000](http://localhost:3000)

### 2. Backend (API - Opcional)
Para cálculos precisos con efemérides (requiere instalar dependencias).

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
uvicorn app:app --reload --port 8000
```

## Solución de Problemas
*   **Error de puertos**: Si el puerto 3000 o 8000 está ocupado, busca procesos corriendo con `lsof -i :3000` o `lsof -i :8000`.
*   **Mismatch de puertos**: Asegúrate de que `app.js` apunte al mismo puerto que levanta `uvicorn` (por defecto 8000).
