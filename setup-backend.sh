#!/bin/bash
# Setup script for api.astro.chuchurex.cl backend
# Run this on the VPS: ssh root@64.176.12.233

set -e  # Exit on error

echo "================================================"
echo "Setting up api.astro.chuchurex.cl"
echo "================================================"

# Step 1: Create nginx configuration
echo ""
echo "Step 1: Creating nginx configuration..."
cat > /etc/nginx/sites-available/api-astro <<'EOF'
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

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:8001/health;
        access_log off;
    }
}
EOF

echo "✓ Configuration file created"

# Step 2: Enable site
echo ""
echo "Step 2: Enabling site..."
ln -sf /etc/nginx/sites-available/api-astro /etc/nginx/sites-enabled/
echo "✓ Site enabled"

# Step 3: Test nginx configuration
echo ""
echo "Step 3: Testing nginx configuration..."
nginx -t

# Step 4: Reload nginx
echo ""
echo "Step 4: Reloading nginx..."
systemctl reload nginx
echo "✓ Nginx reloaded"

# Step 5: Check if backend is running
echo ""
echo "Step 5: Checking backend status..."
if docker ps | grep -q astro-api; then
    echo "✓ Backend is already running"
    docker ps | grep astro-api
else
    echo "⚠ Backend is not running. Starting it..."
    cd /root/astro-chart
    git pull origin main
    docker build -t astro-api .
    docker stop astro-api 2>/dev/null || true
    docker rm astro-api 2>/dev/null || true
    docker run -d --name astro-api -p 8001:8001 --restart unless-stopped astro-api
    echo "✓ Backend started"
fi

# Step 6: Test local endpoint
echo ""
echo "Step 6: Testing local endpoint..."
sleep 3
curl -s http://localhost:8001/health | python3 -m json.tool || echo "⚠ Backend not responding yet"

echo ""
echo "================================================"
echo "✅ Setup complete!"
echo "================================================"
echo ""
echo "Now test from your machine:"
echo "  curl https://api.astro.chuchurex.cl/health"
echo ""
echo "Note: It may take 2-3 minutes for DNS to propagate"
