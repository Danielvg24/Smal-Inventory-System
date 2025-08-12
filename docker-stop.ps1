# Inventory Management System - Docker Stop Script for Windows

param(
    [string]$Environment = "all"
)

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
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
        Write-Error "Docker is not running."
        return $false
    }
}

# Function to stop all environments
function Stop-All {
    Write-Info "Stopping all Docker environments..."
    
    if (-not (Test-Docker)) {
        exit 1
    }
    
    # Stop production environment
    Write-Info "Stopping production environment..."
    docker-compose down --remove-orphans
    
    # Stop development environment
    Write-Info "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    
    Write-Success "All environments stopped successfully!"
}

# Function to stop production only
function Stop-Production {
    Write-Info "Stopping production environment..."
    
    if (-not (Test-Docker)) {
        exit 1
    }
    
    docker-compose down --remove-orphans
    Write-Success "Production environment stopped!"
}

# Function to stop development only
function Stop-Development {
    Write-Info "Stopping development environment..."
    
    if (-not (Test-Docker)) {
        exit 1
    }
    
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    Write-Success "Development environment stopped!"
}

# Main script logic
switch ($Environment.ToLower()) {
    "all" { Stop-All }
    "production" { Stop-Production }
    "prod" { Stop-Production }
    "development" { Stop-Development }
    "dev" { Stop-Development }
    default {
        Stop-All
    }
}

Write-Info "You can restart the application anytime with: .\docker-start.ps1" 