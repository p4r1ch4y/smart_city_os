# Hugging Face Spaces - Docker Space for Analytics (Flask)
FROM python:3.11-slim

WORKDIR /app

# System deps (optional, keep minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
  && rm -rf /var/lib/apt/lists/*

# Python deps
COPY analytics/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY analytics/ .

# Spaces will set PORT (usually 7860)
ENV PORT=7860
EXPOSE 7860

# Start the Flask app via Gunicorn
CMD ["sh", "-c", "gunicorn -w 2 -b 0.0.0.0:$PORT app:app"]

