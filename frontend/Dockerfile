# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the app
RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy nginx config template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run uses the PORT environment variable
ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
