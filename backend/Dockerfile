# Backend Dockerfile (robust build, no-db mode)
FROM node:18-bullseye-slim

# Work directory
WORKDIR /app

# Install dependencies (use root package.json which contains backend deps)
COPY package.json package-lock.json* ./
# Prefer CI when lockfile exists, fallback to install. Skip optional native deps to reduce build failures.
RUN (npm ci --omit=dev --no-optional || npm install --omit=dev --no-optional)

# Copy backend source
COPY backend ./backend
# Copy Anchor IDL required by realBlockchainService
COPY anchor_project/target/idl ./anchor_project/target/idl


# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose API port
EXPOSE 3001

# Start the no-db server (uses in-memory data)
CMD ["node", "backend/server-no-db.js"]

