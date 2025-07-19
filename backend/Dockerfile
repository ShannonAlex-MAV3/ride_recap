FROM node:18-alpine

WORKDIR /app

# Copy package files and install ALL dependencies (including dev for build)
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application (requires TypeScript from devDependencies)
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

EXPOSE 8080

CMD ["npm", "start"]