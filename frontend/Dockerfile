# Multi-stage build for production
FROM node:18-alpine AS base

# Install OpenSSL and other dependencies
RUN apk add --no-cache openssl libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .
# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Build the application
RUN npm run build

# Production image - use nginx to serve static files
FROM nginx:alpine AS runner

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
