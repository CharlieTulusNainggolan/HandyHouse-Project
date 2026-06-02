# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
# If you are using TypeScript, this will compile the TS files
# Ensure there is a build script in package.json. If not, it just copies the files
RUN npm run build --if-present

# Stage 2: Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist
# If the build outputs to a 'dist' or 'build' folder, you would copy that instead:
# COPY --from=builder /app/dist ./dist

# Expose the internal port (matches docker-compose)
EXPOSE 4002

# Start the service
CMD ["npm", "start"]
