# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm install --workspace=backend --include=dev

# Copy source code
COPY apps/backend ./apps/backend
COPY tsconfig.json ./

# Build the application
WORKDIR /app/apps/backend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install production dependencies only
RUN npm install --workspace=backend --omit=dev --ignore-scripts

# Copy built application from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Set working directory
WORKDIR /app/apps/backend

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
