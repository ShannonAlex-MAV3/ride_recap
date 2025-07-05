#!/bin/bash

# Ride Recap Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development environment"
    echo "  prod        Start production environment"
    echo "  stop        Stop all services"
    echo "  logs        Show logs for all services"
    echo "  logs [svc]  Show logs for specific service (backend, frontend, db)"
    echo "  migrate     Run database migrations"
    echo "  reset       Reset database (WARNING: deletes all data)"
    echo "  build       Build all images"
    echo "  clean       Clean up containers, images, and volumes"
    echo "  help        Show this help message"
}

check_env() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Warning: .env file not found. Creating from template...${NC}"
        cp .env.example .env
        echo -e "${GREEN}Created .env file. Please update it with your configuration.${NC}"
    fi
}

case "$1" in
    "dev")
        echo -e "${GREEN}Starting development environment...${NC}"
        check_env
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    
    "prod")
        echo -e "${GREEN}Starting production environment...${NC}"
        check_env
        docker-compose up --build
        ;;
    
    "stop")
        echo -e "${YELLOW}Stopping all services...${NC}"
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        ;;
    
    "logs")
        if [ -z "$2" ]; then
            docker-compose logs -f
        else
            docker-compose logs -f "$2"
        fi
        ;;
    
    "migrate")
        echo -e "${GREEN}Running database migrations...${NC}"
        docker-compose exec backend npx prisma migrate deploy
        ;;
    
    "reset")
        echo -e "${RED}WARNING: This will delete all database data!${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose exec backend npx prisma migrate reset --force
        fi
        ;;
    
    "build")
        echo -e "${GREEN}Building all images...${NC}"
        docker-compose build
        docker-compose -f docker-compose.dev.yml build
        ;;
    
    "clean")
        echo -e "${YELLOW}Cleaning up Docker resources...${NC}"
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        ;;
    
    "help"|"")
        print_usage
        ;;
    
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        print_usage
        exit 1
        ;;
esac
