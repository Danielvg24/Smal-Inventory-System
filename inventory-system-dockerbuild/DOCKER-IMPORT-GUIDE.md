# 🐳 Docker Import Guide - Inventory Management System

This guide will help you quickly import and run the Inventory Management System using Docker Desktop on Windows.

## 📋 Prerequisites

1. **Docker Desktop** - Download and install from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **PowerShell** - Available by default on Windows 10/11
3. **Git** (optional) - For version control

## 🚀 Quick Start (5 minutes)

### Step 1: Extract the Files
1. Extract the `.dockerbuild.zip` file to a folder on your PC
2. Open PowerShell as Administrator
3. Navigate to the extracted folder:
   ```powershell
   cd "C:\path\to\your\extracted\folder"
   ```

### Step 2: Start Docker Desktop
1. Launch Docker Desktop from the Start menu
2. Wait for Docker to fully start (you'll see the Docker icon in the system tray)

### Step 3: Run the Application
Choose one of the following options:

#### Option A: Production Mode (Recommended)
```powershell
.\docker-start.ps1 production
```

#### Option B: Development Mode (for developers)
```powershell
.\docker-start.ps1 development
```

### Step 4: Access the Application
- **Frontend (Web Interface)**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔧 Alternative Start Methods

If the PowerShell script doesn't work, use these Docker Compose commands directly:

### Production Mode
```bash
docker-compose up --build -d
```

### Development Mode
```bash
docker-compose -f docker-compose.dev.yml up --build -d
```

## 📊 Application Features

- **Frontend**: Modern React interface with Tailwind CSS
- **Backend**: Node.js/TypeScript REST API
- **Database**: SQLite (persistent storage)
- **Health Monitoring**: Built-in health checks
- **Hot Reload**: Available in development mode

## 🛠️ Useful Commands

### View Application Status
```bash
docker-compose ps
```

### View Logs
```bash
# Production logs
docker-compose logs -f

# Development logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Stop the Application
```bash
# Stop production
docker-compose down

# Stop development
docker-compose -f docker-compose.dev.yml down
```

### Restart the Application
```bash
# Restart production
docker-compose restart

# Restart development
docker-compose -f docker-compose.dev.yml restart
```

## 🔍 Troubleshooting

### Docker Not Running
**Error**: `Docker is not running`
**Solution**: Start Docker Desktop and wait for it to fully initialize

### Port Already in Use
**Error**: `Port 3000 is already in use`
**Solution**: 
1. Stop other applications using port 3000
2. Or modify the ports in `docker-compose.yml`

### Container Build Fails
**Error**: Build process fails
**Solution**:
1. Ensure you have a stable internet connection
2. Try rebuilding with: `docker-compose up --build --force-recreate`

### Cannot Access Application
**Issue**: Browser shows "Site can't be reached"
**Solution**:
1. Wait 30-60 seconds after starting containers
2. Check if containers are healthy: `docker-compose ps`
3. Check logs: `docker-compose logs`

## 📁 Project Structure

```
inventory-management-system/
├── backend/                # Node.js backend
│   ├── src/               # Source code
│   ├── Dockerfile         # Production build
│   └── Dockerfile.dev     # Development build
├── frontend/              # React frontend
│   ├── src/               # Source code
│   ├── Dockerfile         # Production build
│   └── Dockerfile.dev     # Development build
├── docker-compose.yml     # Production configuration
├── docker-compose.dev.yml # Development configuration
├── docker-start.ps1       # Windows startup script
└── DOCKER-IMPORT-GUIDE.md # This guide
```

## 🌐 Port Configuration

| Service | Production Port | Development Port |
|---------|----------------|------------------|
| Frontend | 3000 | 3001 |
| Backend | 5000 | 5001 |

## 💾 Data Persistence

- Database files are stored in `./backend/database/`
- Logs are stored in Docker volumes
- Data persists between container restarts

## 🔄 Environment Variables

You can customize the application by creating a `.env` file in the backend directory. Use `docker.env.example` as a template.

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. View container logs for error details
3. Ensure Docker Desktop is running and up to date
4. Verify your Windows PowerShell execution policy allows scripts

## 🎉 Next Steps

Once the application is running:
1. Open http://localhost:3000 in your browser
2. Explore the inventory management interface
3. Test the API endpoints at http://localhost:5000
4. Check the health status at http://localhost:5000/health

Enjoy using your Inventory Management System! 🚀 