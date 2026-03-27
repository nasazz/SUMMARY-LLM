# ------------------------------------------------
# Stage 1: Build Angular Application
# ------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
# This leverages Docker layer caching - if package.json doesn't change, skip npm install
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy all source code
COPY . .

# Build the application for production
RUN npm run build -- --configuration production

# ------------------------------------------------
# Stage 2: Serve with Nginx
# ------------------------------------------------
FROM nginx:alpine AS final

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built Angular app from build stage
COPY --from=build /app/dist/ng-tailadmin/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
