#!/bin/bash

# Inventory Management System - Docker Management Script
# This script helps manage different Docker environments for testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build and start production environment
start_production() {
    print_status "Starting production environment..."
    check_docker
    
    # Build and start containers
    docker-compose down --remove-orphans
    docker-compose up --build -d
    
    print_status "Waiting for services to be healthy..."
    docker-compose logs -f &
    LOGS_PID=$!
    
    # Wait for health checks
    sleep 30
    
    if docker-compose ps | grep -q "healthy"; then
        kill $LOGS_PID 2>/dev/null || true
        print_success "Production environment is running!"
        print_status "Frontend: http://localhost:3000"
        print_status "Backend API: http://localhost:5000"
        print_status "Health check: http://localhost:5000/health"
    else
        kill $LOGS_PID 2>/dev/null || true
        print_error "Some services failed to start properly. Check logs with: docker-compose logs"
    fi
}

# Function to build and start development environment
start_development() {
    print_status "Starting development environment with hot reload..."
    check_docker
    
    # Build and start containers
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    docker-compose -f docker-compose.dev.yml up --build -d
    
    print_status "Waiting for services to be healthy..."
    docker-compose -f docker-compose.dev.yml logs -f &
    LOGS_PID=$!
    
    # Wait for health checks
    sleep 30
    
    if docker-compose -f docker-compose.dev.yml ps | grep -q "healthy"; then
        kill $LOGS_PID 2>/dev/null || true
        print_success "Development environment is running!"
        print_status "Frontend (dev): http://localhost:3001"
        print_status "Backend API (dev): http://localhost:5001"
        print_status "Health check: http://localhost:5001/health"
        print_warning "Hot reload is enabled. Changes to code will be reflected automatically."
    else
        kill $LOGS_PID 2>/dev/null || true
        print_error "Some services failed to start properly. Check logs with: docker-compose -f docker-compose.dev.yml logs"
    fi
}

# Function to stop all environments
stop_all() {
    print_status "Stopping all Docker environments..."
    check_docker
    
    docker-compose down --remove-orphans
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    
    print_success "All environments stopped."
}

# Function to clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    check_docker
    
    # Stop all containers
    stop_all
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    read -p "Do you want to remove unused volumes? This will delete database data! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
        print_warning "Unused volumes removed. Database data may be lost."
    fi
    
    print_success "Cleanup completed."
}

# Function to show logs
show_logs() {
    local env=${1:-production}
    
    if [ "$env" = "dev" ] || [ "$env" = "development" ]; then
        print_status "Showing development environment logs..."
        docker-compose -f docker-compose.dev.yml logs -f
    else
        print_status "Showing production environment logs..."
        docker-compose logs -f
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests in Docker environment..."
    check_docker
    
    # Start test environment
    docker-compose -f docker-compose.dev.yml up -d backend-dev
    
    # Wait for backend to be ready
    sleep 10
    
    # Run backend tests
    print_status "Running backend tests..."
    docker-compose -f docker-compose.dev.yml exec backend-dev npm test
    
    # Cleanup
    docker-compose -f docker-compose.dev.yml down
    
    print_success "Tests completed."
}

# Function to show status
show_status() {
    print_status "Checking Docker environment status..."
    check_docker
    
    echo
    print_status "Production Environment:"
    docker-compose ps
    
    echo
    print_status "Development Environment:"
    docker-compose -f docker-compose.dev.yml ps
    
    echo
    print_status "Docker Resources:"
    echo "Images:"
    docker images | grep inventory || echo "No inventory images found"
    echo
    echo "Volumes:"
    docker volume ls | grep inventory || echo "No inventory volumes found"
    echo
    echo "Networks:"
    docker network ls | grep inventory || echo "No inventory networks found"
}

# Function to show help
show_help() {
    echo "Inventory Management System - Docker Management Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start-prod       Start production environment (default)"
    echo "  start-dev        Start development environment with hot reload"
    echo "  stop             Stop all environments"
    echo "  restart-prod     Restart production environment"
    echo "  restart-dev      Restart development environment"
    echo "  logs [env]       Show logs (env: prod or dev, default: prod)"
    echo "  status           Show status of all environments"
    echo "  test             Run tests in Docker environment"
    echo "  cleanup          Clean up Docker resources"
    echo "  help             Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start-prod    # Start production environment"
    echo "  $0 start-dev     # Start development environment"
    echo "  $0 logs dev      # Show development logs"
    echo "  $0 status        # Show status of all services"
}

# Main script logic
case "${1:-start-prod}" in
    "start-prod"|"start-production"|"production"|"prod")
        start_production
        ;;
    "start-dev"|"start-development"|"development"|"dev")
        start_development
        ;;
    "stop"|"down")
        stop_all
        ;;
    "restart-prod"|"restart-production")
        stop_all
        sleep 2
        start_production
        ;;
    "restart-dev"|"restart-development")
        stop_all
        sleep 2
        start_development
        ;;
    "logs")
        show_logs "$2"
        ;;
    "status"|"ps")
        show_status
        ;;
    "test"|"tests")
        run_tests
        ;;
    "cleanup"|"clean")
        cleanup
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo
        show_help
        exit 1
        ;;
esac 