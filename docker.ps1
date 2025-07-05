# Ride Recap Docker Management Script for Windows

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [string]$Service
)

function Print-Usage {
    Write-Host "Usage: .\docker.ps1 [COMMAND] [SERVICE]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  dev         Start development environment"
    Write-Host "  prod        Start production environment"
    Write-Host "  stop        Stop all services"
    Write-Host "  logs        Show logs for all services"
    Write-Host "  logs [svc]  Show logs for specific service (backend, frontend, db)"
    Write-Host "  migrate     Run database migrations"
    Write-Host "  reset       Reset database (WARNING: deletes all data)"
    Write-Host "  build       Build all images"
    Write-Host "  clean       Clean up containers, images, and volumes"
    Write-Host "  help        Show this help message"
}

function Check-Env {
    if (-not (Test-Path ".env")) {
        Write-Host "Warning: .env file not found. Creating from template..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env file. Please update it with your configuration." -ForegroundColor Green
    }
}

switch ($Command.ToLower()) {
    "dev" {
        Write-Host "Starting development environment..." -ForegroundColor Green
        Check-Env
        docker-compose -f docker-compose.dev.yml up --build
    }
    
    "prod" {
        Write-Host "Starting production environment..." -ForegroundColor Green
        Check-Env
        docker-compose up --build
    }
    
    "stop" {
        Write-Host "Stopping all services..." -ForegroundColor Yellow
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
    }
    
    "logs" {
        if ([string]::IsNullOrEmpty($Service)) {
            docker-compose logs -f
        } else {
            docker-compose logs -f $Service
        }
    }
    
    "migrate" {
        Write-Host "Running database migrations..." -ForegroundColor Green
        docker-compose exec backend npx prisma migrate deploy
    }
    
    "reset" {
        Write-Host "WARNING: This will delete all database data!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (y/N)"
        if ($confirm -eq 'y' -or $confirm -eq 'Y') {
            docker-compose exec backend npx prisma migrate reset --force
        }
    }
    
    "build" {
        Write-Host "Building all images..." -ForegroundColor Green
        docker-compose build
        docker-compose -f docker-compose.dev.yml build
    }
    
    "clean" {
        Write-Host "Cleaning up Docker resources..." -ForegroundColor Yellow
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
    }
    
    "help" {
        Print-Usage
    }
    
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Print-Usage
        exit 1
    }
}
