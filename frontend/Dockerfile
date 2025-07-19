FROM node:18-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code and build
COPY . .
RUN npm run build

# Install and use nginx to serve
RUN npm install -g serve
EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]