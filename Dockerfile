FROM python:3.12-slim

# Instalar dependencias del sistema para pyswisseph
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar requirements primero para cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de la aplicación
COPY . .

# Puerto
EXPOSE 8000

# Copiar y ejecutar script de inicio
COPY start.sh .
RUN chmod +x start.sh
CMD ["./start.sh"]
