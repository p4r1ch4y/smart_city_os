# Frontend Dockerfile (multi-stage)
FROM node:18-alpine AS build
WORKDIR /app

# Install deps
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Build
COPY frontend ./
# Allow build-time override of API base URL; default to backend service name
ARG REACT_APP_API_URL=http://backend:3001/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Production image using Nginx
FROM nginx:alpine

# Copy build output
COPY --from=build /app/build /usr/share/nginx/html

# SPA routing support
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

