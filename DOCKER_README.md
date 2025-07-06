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
- Backend API on port 8080 (optimized build)
- Frontend on port 3000 (served by Nginx)
- Database migrations (runs once on external cloud database)

## Available Services

| Service | Development Port | Production Port | Description |
|---------|------------------|-----------------|-------------|
| Frontend | 3000 | 3000 | React application |
| Backend | 8080 | 8080 | Express.js API |

**Note:** This project uses an external cloud database (Aiven PostgreSQL), so no local database container is needed.

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

# Follow logs in real-time
docker-compose logs -f backend
```

### Stop services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (NOTE: No local database volumes to worry about)
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

### Run migrations on external cloud database
```bash
# In development
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# In production (migrations run automatically during deployment)
docker-compose exec backend npx prisma migrate deploy
```

### Access Prisma Studio (connects to external cloud database)
```bash
docker-compose exec backend npx prisma studio
```

Then open http://localhost:5555 in your browser to view your cloud database data.

### Database Management
**Note:** This project uses an external cloud database (Aiven PostgreSQL). Database reset operations should be performed carefully through your cloud provider's interface or Prisma Studio.

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
1. Verify your external cloud database connection string in the `.env` file
2. Ensure your cloud database is accessible and credentials are correct
3. Check backend logs for connection errors:
   ```bash
   docker-compose logs backend
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

### Database Backup
**Note:** Database backup and restore operations for the external cloud database should be performed through your cloud provider's interface (Aiven Console) or using Prisma Studio. Local backup commands are not applicable since the database is hosted externally.
