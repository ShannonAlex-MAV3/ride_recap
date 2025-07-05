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

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Create uploads directory and set proper permissions
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads
RUN mkdir -p node_modules && chown -R nodejs:nodejs node_modules

USER nodejs

EXPOSE 8080

ENV NODE_ENV=production

CMD ["npm", "start"]
