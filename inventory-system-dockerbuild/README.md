# 🏭 Inventory Management System

A modern, full-stack web-based inventory management system built with React, TypeScript, Node.js, Express, and SQLite. This system provides an intuitive interface for managing inventory items with check-in/check-out functionality, search capabilities, and comprehensive reporting.

## ✨ Features

### Core Functionality
- **Check-In/Check-Out System**: Process items with serial numbers and item IDs
- **Smart Item Registration**: Automatic prompting for new item registration when Item ID doesn't exist
- **Inventory Overview**: Complete dashboard with real-time statistics
- **Search & Filter**: Advanced search by Item ID, name, or serial number with status filtering
- **Item Management**: Create, update, and delete inventory items
- **History Tracking**: Complete audit trail of all inventory actions

### User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Accessibility**: Full keyboard navigation and screen reader support
- **Real-time Feedback**: Toast notifications for all user actions
- **Mobile-First**: Optimized for mobile usage with touch-friendly controls

### Technical Features
- **RESTful API**: Clean, documented API endpoints
- **Type Safety**: Full TypeScript implementation on both frontend and backend
- **Database**: SQLite with optimized queries and indexes
- **Security**: Input validation, rate limiting, CORS protection, and SQL injection prevention
- **Export**: CSV export functionality for reporting
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hook Form** for form management
- **React Hot Toast** for notifications
- **Axios** for API communication

### Backend
- **Node.js** with Express and TypeScript
- **SQLite** with better-sqlite3 for database
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for request logging
- **Rate Limiting** for API protection

## 📋 Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (version 8 or higher)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd inventory-management-system

# Install all dependencies (root, frontend, and backend)
npm run install:all
```

### 2. Start Development Servers

```bash
# Start both frontend and backend in development mode
npm run dev
```

This will start:
- Backend API at `http://localhost:5000`
- Frontend application at `http://localhost:3000`

### 3. Access the Application

Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
inventory-management-system/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── database/       # Database setup and connection
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # TypeScript interfaces
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Main server file
│   ├── database/           # SQLite database files
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main App component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── package.json            # Root package.json with workspace config
└── README.md
```

## 🔧 Development Commands

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build for production
npm run build

# Build only frontend
npm run build:frontend

# Build only backend
npm run build:backend
```

## 🌐 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Items Management
- `GET /items` - Get all items with optional search and status filtering
- `GET /items/:itemId` - Get specific item by ID
- `POST /items` - Create new item
- `PUT /items/:itemId` - Update item details
- `DELETE /items/:itemId` - Delete item

#### Check-In/Check-Out
- `POST /checkin-checkout` - Process check-in or check-out operation

#### Statistics & Reporting
- `GET /stats` - Get inventory statistics
- `GET /items/:itemId/history` - Get item action history
- `GET /export/csv` - Export inventory as CSV

#### Health Check
- `GET /health` - API health status

### Example API Usage

#### Create a New Item
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "LAPTOP001",
    "itemName": "Dell Laptop",
    "serialNumber": "DL123456"
  }'
```

#### Check Out an Item
```bash
curl -X POST http://localhost:5000/api/checkin-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "LAPTOP001",
    "serialNumber": "DL123456",
    "action": "checkout",
    "userId": "john.doe"
  }'
```

## 🔒 Security Features

- **Input Validation**: All inputs are validated on both client and server
- **Rate Limiting**: API endpoints are protected against abuse
- **CORS Protection**: Configured for secure cross-origin requests
- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Protection**: Input sanitization and secure headers
- **Error Handling**: Secure error messages that don't leak sensitive information

## 📱 User Guide

### Check-In/Check-Out Process
1. Navigate to the "Check In/Out" page
2. Enter the Item ID and Serial Number
3. Select "Check In" or "Check Out"
4. If the Item ID doesn't exist, you'll be prompted to register it
5. Confirm the action and receive feedback

### Adding New Items
1. Go to "Add Item" page
2. Fill in the Item ID, Item Name, and optional Serial Number
3. Submit the form to create the item

### Viewing Inventory
1. Visit the "Inventory" page
2. Use the search bar to find specific items
3. Filter by status (Available/Checked Out)
4. Click on any item to view detailed information and history

### Dashboard Overview
- View real-time statistics
- See recent activity
- Quick access to common actions

## 🐳 Docker Test Environment

The project includes multiple Docker deployment options for easy testing and deployment.

### Prerequisites
- **Docker** and **Docker Compose** installed
- At least 2GB of available RAM
- **Portainer** (optional, for web-based management)

### Quick Start with Docker

#### Option 1: Portainer (Web-Based Management)
```bash
# Install Portainer if not already installed
docker volume create portainer_data
docker run -d -p 9443:9443 --name portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data portainer/portainer-ce:latest

# Access Portainer at https://localhost:9443
# Follow the PORTAINER-SETUP.md guide for deployment
```

#### Option 2: Use the Management Script (Command Line)
```bash
# Make script executable
chmod +x docker-scripts.sh

# Start production environment
./docker-scripts.sh start-prod

# Or start development environment with hot reload
./docker-scripts.sh start-dev

# View logs
./docker-scripts.sh logs

# Stop all environments
./docker-scripts.sh stop

# Show help
./docker-scripts.sh help
```

#### Option 3: Use Docker Compose Directly

**Production Environment:**
```bash
# Start production environment
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

**Development Environment:**
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up --build -d

# Access the application
# Frontend: http://localhost:3001
# Backend API: http://localhost:5001
```

### Docker Environment Details

#### Production Environment
- **Frontend**: Runs on port 3000 using Nginx
- **Backend**: Runs on port 5000 using Node.js
- **Database**: SQLite mounted as volume for persistence
- **Optimized**: Production builds with compression and caching

#### Development Environment
- **Frontend**: Runs on port 3001 with Vite dev server
- **Backend**: Runs on port 5001 with Nodemon hot reload
- **Live Reload**: Changes to code are reflected immediately
- **Debug Friendly**: Full source maps and development tools

#### Available Scripts
```bash
./docker-scripts.sh start-prod      # Start production environment
./docker-scripts.sh start-dev       # Start development environment
./docker-scripts.sh stop            # Stop all environments
./docker-scripts.sh restart-prod    # Restart production environment
./docker-scripts.sh restart-dev     # Restart development environment
./docker-scripts.sh logs [env]      # Show logs (prod/dev)
./docker-scripts.sh status          # Show service status
./docker-scripts.sh cleanup         # Clean up Docker resources
```

### Docker Configuration Files

#### Command Line Deployment
- `docker-compose.yml` - Production environment
- `docker-compose.dev.yml` - Development environment with hot reload
- `docker-scripts.sh` - Management script for easy operations

#### Portainer Deployment
- `portainer-stack.yml` - Production stack for Portainer
- `portainer-stack-dev.yml` - Development stack with hot reload
- `portainer-stack-simple.yml` - Simplified stack (no building)
- `PORTAINER-SETUP.md` - Complete Portainer deployment guide
- `PORTAINER-QUICK-REFERENCE.md` - Quick reference for Portainer

#### Docker Images
- `backend/Dockerfile` - Production backend image
- `frontend/Dockerfile` - Production frontend image with Nginx
- `backend/Dockerfile.dev` - Development backend image
- `frontend/Dockerfile.dev` - Development frontend image

## 🚀 Traditional Deployment

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=production
DB_PATH=./database/inventory.db
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Build

```bash
# Build both frontend and backend
npm run build

# The frontend build will be in frontend/dist
# The backend build will be in backend/dist
```

### Deployment Options

1. **Docker** (Recommended): Complete containerized setup
2. **Traditional Hosting**: Deploy backend to any Node.js hosting service, frontend to any static hosting
3. **Cloud Platforms**: Works with Vercel, Netlify, AWS, Heroku, etc.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000 5000
```

**Database connection issues**
- Ensure the database directory exists and has write permissions
- Check that SQLite is properly installed

**Frontend not connecting to backend**
- Verify both servers are running
- Check CORS configuration
- Ensure API_URL is correctly set

### Development Tips

- Use the browser's developer tools to inspect API calls
- Check the backend logs for detailed error information
- Database files are created automatically on first run
- Hot reload is enabled for both frontend and backend

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world inventory management needs
- Designed for scalability and maintainability

---

For questions or support, please open an issue in the repository. 