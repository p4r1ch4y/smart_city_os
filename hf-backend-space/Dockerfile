# Hugging Face Spaces - Docker Space for SmartCityOS Backend (No-DB)
FROM node:18-slim

WORKDIR /app

# Copy minimal package manifest dedicated to this Space
COPY package.json ./package.json

# Install production deps only
RUN npm ci --omit=dev --no-optional || npm install --omit=dev --no-optional

# Copy backend code
COPY backend ./backend

# Env and port (HF injects PORT)
ENV NODE_ENV=production
EXPOSE 7860

# Start the lightweight server
CMD ["sh", "-c", "node backend/server-no-db.js"]

