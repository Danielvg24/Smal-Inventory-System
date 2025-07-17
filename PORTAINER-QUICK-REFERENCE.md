# 🚀 Portainer Quick Reference - Inventory System

## 📁 Files Needed for Portainer

### Required Files:
```
inventory-management-system/
├── backend/                    (entire folder)
├── frontend/                   (entire folder)
├── portainer-stack.yml         (main stack file)
├── portainer-stack-simple.yml  (alternative)
├── portainer-stack-dev.yml     (development)
└── PORTAINER-SETUP.md          (this guide)
```

## ⚡ Super Quick Deployment

### 1. Access Portainer
- URL: `https://localhost:9443` or `http://localhost:9000`

### 2. Create Stack
- Go to **Stacks** → **Add Stack**
- Name: `inventory-system`
- Method: **Web editor**

### 3. Copy-Paste Stack Configuration

**Production Stack** (copy this):
```yaml
version: '3.8'

services:
  inventory-backend:
    image: inventory-backend:latest
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: inventory-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - PORT=${BACKEND_PORT:-5000}
      - DB_PATH=/app/database/inventory.db
      - CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:3000}
      - RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS:-900000}
      - RATE_LIMIT_MAX_REQUESTS=${RATE_LIMIT_MAX_REQUESTS:-100}
    volumes:
      - inventory_database:/app/database
      - inventory_logs:/app/logs
    ports:
      - "${BACKEND_PORT:-5000}:5000"
    networks:
      - inventory-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  inventory-frontend:
    image: inventory-frontend:latest
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: inventory-frontend
    restart: unless-stopped
    environment:
      - VITE_API_URL=${API_URL:-http://localhost:5000/api}
    ports:
      - "${FRONTEND_PORT:-3000}:80"
    networks:
      - inventory-network
    depends_on:
      inventory-backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  inventory-network:
    driver: bridge
    name: inventory-network

volumes:
  inventory_database:
    name: inventory_database
    driver: local
  inventory_logs:
    name: inventory_logs
    driver: local
```

### 4. Environment Variables
Add these in the **Environment Variables** section:
```
NODE_ENV=production
BACKEND_PORT=5000
FRONTEND_PORT=3000
CORS_ORIGIN=http://localhost:3000
API_URL=http://localhost:5000/api
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Deploy
- Set build context: `/portainer/Files/AppData/inventory`
- Click **Deploy the stack**

## 🌐 Access Points

After deployment:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔧 Common Environment Configurations

### Local Testing
```
BACKEND_PORT=5000
FRONTEND_PORT=3000
CORS_ORIGIN=http://localhost:3000
API_URL=http://localhost:5000/api
```

### Custom Ports
```
BACKEND_PORT=8080
FRONTEND_PORT=8000
CORS_ORIGIN=http://localhost:8000
API_URL=http://localhost:8080/api
```

### Domain Setup
```
FRONTEND_DOMAIN=inventory.yourdomain.com
BACKEND_DOMAIN=api.inventory.yourdomain.com
CORS_ORIGIN=https://inventory.yourdomain.com
API_URL=https://api.inventory.yourdomain.com/api
```

## 🔍 Quick Troubleshooting

### Stack Won't Deploy
1. Check file upload path: `/portainer/Files/AppData/inventory`
2. Verify build context is set correctly
3. Ensure ports aren't in use

### Container Issues
1. Check logs in Portainer: **Containers** → Select container → **Logs**
2. Verify environment variables are set
3. Check health status indicators

### API Not Responding
1. Verify backend container is running
2. Check CORS_ORIGIN matches frontend URL
3. Test health endpoint: `curl http://localhost:5000/health`

## 📊 Quick Tests

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Create item
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"itemId":"TEST001","itemName":"Test Item"}'

# List items
curl http://localhost:5000/api/items
```

### Test Frontend
- Navigate to http://localhost:3000
- Check all pages load
- Test check-in/check-out workflow

## 🛠️ File Upload Methods

### Method 1: Portainer File Manager
1. Go to **Volumes** → **Browse**
2. Navigate to upload location
3. Upload files/folders

### Method 2: Host File Copy
```bash
mkdir -p /portainer/Files/AppData/inventory
cp -r ./backend /portainer/Files/AppData/inventory/
cp -r ./frontend /portainer/Files/AppData/inventory/
```

### Method 3: Git Clone (if files are in repo)
```bash
cd /portainer/Files/AppData/
git clone <repo-url> inventory
```

## 📚 Stack Options

1. **portainer-stack.yml** - Production with builds
2. **portainer-stack-simple.yml** - No building required
3. **portainer-stack-dev.yml** - Development with hot reload

Choose based on your needs and Portainer capabilities.

---

💡 **Tip**: Always check container logs if something isn't working. Portainer makes this easy with the web interface! 