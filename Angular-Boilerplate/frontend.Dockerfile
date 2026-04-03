# Development Dockerfile for Angular
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the source
COPY . .

# Expose the dev port
EXPOSE 4200

# Start with polling for hot-reload in Docker volumes
# --host 0.0.0.0 is enough so Docker can proxy requests to the dev server
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]
