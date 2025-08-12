# Inventory Management System - Docker Startup Script for Windows
# This script helps you easily start the Docker application

param(
    [string]$Environment = "production"
)

# Colors for PowerShell output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop and try again."
        return $false
    }
}

# Function to start production environment
function Start-Production {
    Write-Info "Starting production environment..."
    
    if (-not (Test-Docker)) {
        exit 1
    }
    
    # Stop any existing containers
    docker-compose down --remove-orphans
    
    # Build and start containers
    Write-Info "Building and starting containers..."
    docker-compose up --build -d
    
    # Wait for services to be ready
    Write-Info "Waiting for services to start..."
    Start-Sleep -Seconds 30
    
    # Check if services are healthy
    $healthStatus = docker-compose ps --format "table {{.Service}}\t{{.Status}}"
    
    Write-Success "Production environment is running!"
    Write-Info "Frontend: http://localhost:3000"
    Write-Info "Backend API: http://localhost:5000"
    Write-Info "Health check: http://localhost:5000/health"
    Write-Info ""
    Write-Info "To stop the application, run: docker-compose down"
    Write-Info "To view logs, run: docker-compose logs -f"
}

# Function to start development environment
function Start-Development {
    Write-Info "Starting development environment with hot reload..."
    
    if (-not (Test-Docker)) {
        exit 1
    }
    
    # Stop any existing containers
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    
    # Build and start containers
    Write-Info "Building and starting containers..."
    docker-compose -f docker-compose.dev.yml up --build -d
    
    # Wait for services to be ready
    Write-Info "Waiting for services to start..."
    Start-Sleep -Seconds 30
    
    Write-Success "Development environment is running!"
    Write-Info "Frontend (dev): http://localhost:3001"
    Write-Info "Backend API (dev): http://localhost:5001"
    Write-Info "Health check: http://localhost:5001/health"
    Write-Warning "Hot reload is enabled. Changes to code will be reflected automatically."
    Write-Info ""
    Write-Info "To stop the application, run: docker-compose -f docker-compose.dev.yml down"
    Write-Info "To view logs, run: docker-compose -f docker-compose.dev.yml logs -f"
}

# Function to show help
function Show-Help {
    Write-Host "Inventory Management System - Docker Startup Script"
    Write-Host ""
    Write-Host "Usage: .\docker-start.ps1 [ENVIRONMENT]"
    Write-Host ""
    Write-Host "Environments:"
    Write-Host "  production   Start production environment (default)"
    Write-Host "  development  Start development environment with hot reload"
    Write-Host "  dev          Alias for development"
    Write-Host "  help         Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\docker-start.ps1                    # Start production"
    Write-Host "  .\docker-start.ps1 production         # Start production"
    Write-Host "  .\docker-start.ps1 development        # Start development"
    Write-Host "  .\docker-start.ps1 dev                # Start development"
    Write-Host ""
    Write-Host "Prerequisites:"
    Write-Host "  - Docker Desktop must be installed and running"
    Write-Host "  - Make sure you're in the project directory"
}

# Main script logic
switch ($Environment.ToLower()) {
    "production" { Start-Production }
    "prod" { Start-Production }
    "development" { Start-Development }
    "dev" { Start-Development }
    "help" { Show-Help }
    "-h" { Show-Help }
    "--help" { Show-Help }
    default {
        if ($Environment -eq "production") {
            Start-Production
        } else {
            Write-Error "Unknown environment: $Environment"
            Write-Host ""
            Show-Help
            exit 1
        }
    }
} 