FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY iot-simulation/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy IoT simulation source code
COPY iot-simulation/ ./

# Create non-root user
RUN groupadd -r iot && useradd -r -g iot iot
RUN chown -R iot:iot /app
USER iot

# Make main.py executable
RUN chmod +x main.py

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD python -c "import requests; requests.get('http://backend:3000/health', timeout=5)" || exit 1

# Start the simulation
CMD ["python", "main.py", "--duration", "0"]
