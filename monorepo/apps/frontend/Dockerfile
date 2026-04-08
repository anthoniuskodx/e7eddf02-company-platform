# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies
RUN npm install --workspace=frontend --include=dev

# Copy source code
COPY apps/frontend ./apps/frontend
COPY tsconfig.json ./

# Build the application
WORKDIR /app/apps/frontend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Install production dependencies only
RUN npm install --workspace=frontend --omit=dev

# Copy built application from builder
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

# Set working directory
WORKDIR /app/apps/frontend

# Expose port
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start"]
