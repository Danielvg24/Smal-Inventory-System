# 🐳 Docker Test Environment - Quick Setup Guide

This guide will help you quickly set up and test the Inventory Management System using Docker.

## 📋 Prerequisites

1. **Docker Desktop** installed and running
2. **Git** to clone the repository
3. At least **2GB free RAM**

## 🚀 Quick Start (5 Minutes)

### Step 1: Get the Code
```bash
# Clone the repository
git clone <your-repository-url>
cd inventory-management-system

# OR if you're copying files manually, ensure you have all these files:
# - docker-compose.yml
# - docker-compose.dev.yml  
# - docker-scripts.sh
# - backend/ folder with Dockerfile
# - frontend/ folder with Dockerfile
```

### Step 2: Start the Test Environment
```bash
# Option A: Use the management script (easiest)
chmod +x docker-scripts.sh
./docker-scripts.sh start-prod

# Option B: Use docker-compose directly
docker-compose up --build -d
```

### Step 3: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🧪 Testing the System

### 1. Test the API Directly
```bash
# Health check
curl http://localhost:5000/health

# Get all items (should be empty initially)
curl http://localhost:5000/api/items

# Create a test item
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "TEST001",
    "itemName": "Test Laptop",
    "serialNumber": "SN123456"
  }'

# Check out the item
curl -X POST http://localhost:5000/api/checkin-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "TEST001",
    "serialNumber": "SN123456",
    "action": "checkout",
    "userId": "testuser"
  }'

# Check in the item
curl -X POST http://localhost:5000/api/checkin-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "TEST001",
    "serialNumber": "SN123456",
    "action": "checkin",
    "userId": "testuser"
  }'

# Get item history
curl http://localhost:5000/api/items/TEST001/history

# Export CSV
curl http://localhost:5000/api/export/csv -o inventory.csv
```

### 2. Test the Frontend
1. Go to http://localhost:3000
2. Navigate through the different pages
3. Try the check-in/check-out process
4. Test creating new items
5. Verify the inventory overview works

## 🔧 Development Environment (with Hot Reload)

If you want to test with hot reload for development:

```bash
# Start development environment
./docker-scripts.sh start-dev

# Access at different ports:
# Frontend: http://localhost:3001  
# Backend: http://localhost:5001
```

## 📊 Monitoring and Logs

```bash
# View logs
./docker-scripts.sh logs

# View development logs
./docker-scripts.sh logs dev

# Check service status
./docker-scripts.sh status

# View container status
docker-compose ps
```

## 🛑 Stop and Cleanup

```bash
# Stop all services
./docker-scripts.sh stop

# Or using docker-compose
docker-compose down

# Clean up everything (removes images, volumes, etc.)
./docker-scripts.sh cleanup
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000 5000

# Or find and kill manually
lsof -ti:3000,5000 | xargs kill -9
```

### Services Not Starting
```bash
# Check logs for errors
docker-compose logs

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Database Issues
```bash
# Reset database (warning: deletes all data)
docker-compose down -v
docker-compose up --build -d
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Ensure Docker has enough resources:
# - Memory: At least 2GB
# - CPU: At least 2 cores recommended
```

## 📝 Test Scenarios

### Basic Workflow Test
1. **Create Items**: Add 3-5 test items with different IDs
2. **Check Out**: Check out 2-3 items to different users
3. **Search**: Test search functionality by item ID and name
4. **Filter**: Filter by "Available" and "Checked Out" status
5. **Check In**: Check in some items
6. **History**: View history for items
7. **Export**: Export inventory to CSV

### Error Handling Test
1. **Non-existent Item**: Try to check out an item that doesn't exist
2. **Already Checked Out**: Try to check out an already checked out item
3. **Already Available**: Try to check in an already available item
4. **Invalid Data**: Send requests with missing or invalid fields

### API Endpoints to Test
- `GET /api/items` - List all items
- `POST /api/items` - Create new item
- `GET /api/items/:itemId` - Get specific item
- `PUT /api/items/:itemId` - Update item
- `DELETE /api/items/:itemId` - Delete item
- `POST /api/checkin-checkout` - Check in/out items
- `GET /api/items/:itemId/history` - Get item history
- `GET /api/stats` - Get statistics
- `GET /api/export/csv` - Export CSV

## ✅ Expected Results

After successful setup, you should see:
- ✅ Frontend loads at http://localhost:3000
- ✅ Backend API responds at http://localhost:5000
- ✅ Health check returns success
- ✅ Database operations work (create, read, update, delete)
- ✅ Check-in/check-out workflow functions
- ✅ Search and filtering work
- ✅ CSV export downloads properly
- ✅ Real-time notifications appear
- ✅ Mobile responsive design works

## 🎯 What to Test

1. **Core Functionality**
   - Item registration workflow
   - Check-in/check-out process
   - Search and filtering
   - Inventory overview

2. **User Experience**
   - Navigation between pages
   - Form validation
   - Error messages
   - Mobile responsiveness

3. **API Functionality**
   - All CRUD operations
   - Data validation
   - Error handling
   - CSV export

4. **Performance**
   - Page load times
   - API response times
   - Database query performance

Good luck testing! 🚀 