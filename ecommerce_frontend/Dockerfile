# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY ecommerce_frontend/package*.json ./
RUN npm install

# Copy the rest of the code and build the app
COPY ecommerce_frontend/ .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build artifacts to Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose port for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
