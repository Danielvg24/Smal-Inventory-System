# 🐳 Portainer Deployment Guide - Inventory Management System

This comprehensive guide will walk you through deploying the Inventory Management System using Portainer's web interface.

## 📋 Prerequisites

1. **Docker** installed and running
2. **Portainer** installed and accessible
3. **File access** to the Docker host (for uploading files)

## 🚀 Step 1: Install Portainer (if not already installed)

If you don't have Portainer yet, install it with these commands:

```bash
# Create Portainer volume
docker volume create portainer_data

# Run Portainer
docker run -d -p 8000:8000 -p 9443:9443 \
  --name portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Then access Portainer at: **https://localhost:9443** or **http://localhost:9000**

## 📁 Step 2: Prepare Your Files

### Option A: Upload Files via Portainer File Manager

1. In Portainer, go to **"Volumes"** → **"Browse"** a volume or use the file manager
2. Create directory structure:
   ```
   /portainer/Files/AppData/inventory/
   ├── backend/          (upload entire backend folder)
   ├── frontend/         (upload entire frontend folder)
   ├── portainer-stack.yml
   └── portainer-stack-simple.yml
   ```

### Option B: Copy Files to Docker Host

If you have shell access to the Docker host:

```bash
# Create directory
mkdir -p /portainer/Files/AppData/inventory

# Copy your project files
cp -r ./backend /portainer/Files/AppData/inventory/
cp -r ./frontend /portainer/Files/AppData/inventory/
cp portainer-stack*.yml /portainer/Files/AppData/inventory/
```

## 🛠️ Step 3: Deploy the Stack

### Method 1: Using Custom Build Stack (Recommended)

1. **Access Portainer** web interface
2. Go to **"Stacks"** → **"Add Stack"**
3. **Name your stack**: `inventory-system`
4. **Choose deployment method**: "Web editor"
5. **Copy and paste** the content from `portainer-stack.yml`:

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

6. **Configure Environment Variables** (scroll down):
   ```
   NODE_ENV=production
   BACKEND_PORT=5000
   FRONTEND_PORT=3000
   CORS_ORIGIN=http://localhost:3000
   API_URL=http://localhost:5000/api
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

7. **Enable "Build method"** if you see the option
8. **Set build context path** to `/portainer/Files/AppData/inventory` (if prompted)
9. Click **"Deploy the stack"**

### Method 2: Using Simple Stack (No Building Required)

If you prefer not to build images:

1. Follow steps 1-4 above
2. Use the content from `portainer-stack-simple.yml` instead
3. This method uses base Node.js and Nginx images and builds the code at runtime

## ⚙️ Step 4: Configure Environment Variables

In the **Environment Variables** section of the stack deployment:

### Production Configuration
```
NODE_ENV=production
BACKEND_PORT=5000
FRONTEND_PORT=3000
CORS_ORIGIN=http://localhost:3000
API_URL=http://localhost:5000/api
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Development Configuration (if using dev stack)
```
NODE_ENV=development
BACKEND_PORT=5001
FRONTEND_PORT=3001
CORS_ORIGIN=http://localhost:3001
API_URL=http://localhost:5001/api
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Custom Domain Configuration
```
FRONTEND_DOMAIN=inventory.yourdomain.com
BACKEND_DOMAIN=api.inventory.yourdomain.com
CORS_ORIGIN=https://inventory.yourdomain.com
API_URL=https://api.inventory.yourdomain.com/api
```

## 📊 Step 5: Monitor Deployment

1. **Watch the deployment**: In Portainer, you'll see the deployment progress
2. **Check container status**: Go to **"Containers"** to see if both services are running
3. **View logs**: Click on each container to view logs for troubleshooting
4. **Health checks**: Wait for health checks to pass (green status indicators)

## 🌐 Step 6: Access Your Application

Once deployed successfully:

- **Frontend**: http://localhost:3000 (or your configured port)
- **Backend API**: http://localhost:5000 (or your configured port)
- **API Health Check**: http://localhost:5000/health

## 🔧 Advanced Configuration

### Using Custom Domains with Reverse Proxy

If you have Traefik or Nginx Proxy Manager:

1. **Add Traefik labels** (already included in the stack):
   ```yaml
   labels:
     - "traefik.enable=true"
     - "traefik.http.routers.inventory-frontend.rule=Host(`inventory.yourdomain.com`)"
     - "traefik.http.services.inventory-frontend.loadbalancer.server.port=80"
   ```

2. **Configure environment variables**:
   ```
   FRONTEND_DOMAIN=inventory.yourdomain.com
   BACKEND_DOMAIN=api.inventory.yourdomain.com
   CORS_ORIGIN=https://inventory.yourdomain.com
   ```

### Persistent Data Configuration

The stack automatically creates persistent volumes:
- `inventory_database` - Stores SQLite database
- `inventory_logs` - Stores application logs

These volumes persist data even when containers are recreated.

## 🔍 Troubleshooting

### Stack Deployment Issues

1. **Build Context Error**:
   - Ensure files are uploaded to the correct path
   - Check that build context is set to `/portainer/Files/AppData/inventory`
   - Verify Dockerfile paths are correct

2. **Port Conflicts**:
   - Change `BACKEND_PORT` and `FRONTEND_PORT` environment variables
   - Check for other services using the same ports

3. **Health Check Failures**:
   - Increase `start_period` in health checks to 120s
   - Check container logs for startup errors
   - Verify all dependencies are correctly configured

### Container Issues

1. **Backend Won't Start**:
   ```bash
   # Check logs in Portainer or via command line
   docker logs inventory-backend
   ```
   - Common issues: Missing dependencies, database permissions
   - Solution: Verify file uploads and environment variables

2. **Frontend Build Failures**:
   ```bash
   # Check frontend builder logs
   docker logs frontend-builder
   ```
   - Common issues: npm install failures, missing files
   - Solution: Ensure all frontend files are uploaded correctly

3. **Network Connectivity Issues**:
   - Verify both containers are on the same network
   - Check CORS configuration in environment variables
   - Ensure API_URL points to correct backend container

### Performance Issues

1. **Slow Initial Start**:
   - First deployment takes longer due to npm installs and builds
   - Subsequent starts are much faster

2. **Memory Issues**:
   - Ensure Docker has at least 2GB RAM allocated
   - Monitor container resource usage in Portainer

## 📝 Stack Management Commands

### Via Portainer UI:
- **Update Stack**: Edit and redeploy from Stacks page
- **View Logs**: Go to Containers → Select container → View logs
- **Shell Access**: Go to Containers → Select container → Console → Connect
- **Resource Usage**: Monitor CPU, memory, and network usage

### Via Docker CLI (if needed):
```bash
# View stack status
docker stack ps inventory-system

# View container logs
docker logs inventory-backend
docker logs inventory-frontend

# Access container shell
docker exec -it inventory-backend sh
docker exec -it inventory-frontend sh

# Update environment variables (requires stack redeploy)
# Do this through Portainer UI for easiest management
```

## 🔄 Updating the Application

1. **Update Source Code**:
   - Upload new files to `/portainer/Files/AppData/inventory/`
   - Or update via Portainer file manager

2. **Redeploy Stack**:
   - Go to **Stacks** → **inventory-system** → **Editor**
   - Click **"Update the stack"**
   - Enable **"Re-pull image and redeploy"** if using external images

3. **Zero-Downtime Updates**:
   - Deploy a new stack with different container names
   - Switch traffic once new stack is healthy
   - Remove old stack

## 🎯 Testing Your Deployment

### Quick API Tests
```bash
# Health check
curl http://localhost:5000/health

# Create test item
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"itemId": "TEST001", "itemName": "Test Item", "serialNumber": "SN123"}'

# List items
curl http://localhost:5000/api/items

# Check out item
curl -X POST http://localhost:5000/api/checkin-checkout \
  -H "Content-Type: application/json" \
  -d '{"itemId": "TEST001", "serialNumber": "SN123", "action": "checkout"}'
```

### Frontend Testing
1. Navigate to http://localhost:3000
2. Test all major workflows:
   - Dashboard view
   - Check-in/check-out process
   - Inventory management
   - Search and filtering
   - CSV export

## 🎉 Success Indicators

You've successfully deployed when you see:

✅ **Both containers running** in Portainer  
✅ **Health checks passing** (green indicators)  
✅ **Frontend loads** at configured URL  
✅ **API responds** to health check  
✅ **Database operations work** (create, read, update)  
✅ **Check-in/check-out workflow** functions  
✅ **No errors in container logs**  

## 📞 Support

If you encounter issues:

1. **Check container logs** in Portainer
2. **Verify environment variables** are set correctly
3. **Ensure file uploads** completed successfully
4. **Review network connectivity** between containers
5. **Check resource allocation** (CPU, memory)

The system should be fully functional once deployed successfully! 🚀 