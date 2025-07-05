# Docker Setup Instructions for Ride Recap

This document provides instructions for running the Ride Recap application using Docker.

## Prerequisites

- Docker Desktop installed on your machine
- Docker Compose (comes with Docker Desktop)

## Project Structure

```
ride_recap/
├── backend/
│   ├── Dockerfile (Production)
│   ├── Dockerfile.dev (Development)
│   └── ...
├── frontend/
│   ├── Dockerfile (Production)
│   ├── Dockerfile.dev (Development)
│   ├── nginx.conf
│   └── ...
├── docker-compose.yml (Production)
├── docker-compose.dev.yml (Development)
└── .env.example
```

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific configuration values.

### 2. Development Mode

For development with hot reloading:

```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d --build
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 8080 (with hot reloading)
- Frontend on port 3000 (with hot reloading)

### 3. Production Mode

For production deployment:

```bash
# Start all services in production mode
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 8080 (optimized build)
- Frontend on port 3000 (served by Nginx)
- Database migrations (runs once)

## Available Services

| Service | Development Port | Production Port | Description |
|---------|------------------|-----------------|-------------|
| Frontend | 3000 | 3000 | React application |
| Backend | 8080 | 8080 | Express.js API |
| Database | 5432 | 5432 | PostgreSQL |

## Useful Commands

### View running containers
```bash
docker-compose ps
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f backend
```

### Stop services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete your database data)
docker-compose down -v
```

### Rebuild specific service
```bash
# Rebuild backend
docker-compose up --build backend

# Rebuild frontend
docker-compose up --build frontend
```

### Execute commands in containers
```bash
# Access backend container shell
docker-compose exec backend sh

# Access database
docker-compose exec db psql -U postgres -d ride_recap

# Run Prisma commands
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma studio
```

## Database Management

### Run migrations
```bash
# In development
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# In production (migrations run automatically)
docker-compose exec backend npx prisma migrate deploy
```

### Access Prisma Studio
```bash
docker-compose exec backend npx prisma studio
```

Then open http://localhost:5555 in your browser.

### Reset database
```bash
# WARNING: This will delete all data
docker-compose exec backend npx prisma migrate reset
```

## File Uploads

The backend uploads directory is mounted as a volume, so uploaded files persist between container restarts.

## Troubleshooting

### Container won't start
1. Check if ports are already in use:
   ```bash
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8080
   netstat -tulpn | grep :5432
   ```

2. Check container logs:
   ```bash
   docker-compose logs [service-name]
   ```

### Database connection issues
1. Ensure the database container is healthy:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs db
   ```

### Frontend not loading
1. Check if the backend is running and accessible
2. Verify the API URL in your environment variables
3. Check nginx configuration in production mode

### Permission issues
If you encounter permission issues with file uploads:
```bash
# Fix upload directory permissions
docker-compose exec backend chown -R nodejs:nodejs /app/uploads
```

## Environment Variables

Key environment variables to configure:

- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DATABASE_URL`: Full database connection string
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Backend server port
- `VITE_API_URL`: Frontend API URL

## Security Notes

- Change default database credentials in production
- Use environment variables for sensitive data
- Consider using Docker secrets for production deployments
- The current setup uses basic authentication - implement proper authentication as needed

## Performance Optimization

For production deployments:
- Use multi-stage builds (already implemented)
- Enable gzip compression (configured in nginx)
- Consider using a reverse proxy like Traefik or nginx-proxy
- Implement proper logging and monitoring
- Use Docker health checks (already implemented)

## Maintenance

### Update dependencies
```bash
# Update backend dependencies
docker-compose exec backend npm update

# Update frontend dependencies
docker-compose exec frontend npm update
```

### Backup database
```bash
# Create backup
docker-compose exec db pg_dump -U postgres ride_recap > backup.sql

# Restore backup
docker-compose exec -T db psql -U postgres ride_recap < backup.sql
```
