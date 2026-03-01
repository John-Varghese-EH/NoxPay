# Use a slim Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY worker/requirements.txt ./worker/
COPY api/requirements.txt ./api/

# Install Python dependencies
RUN pip install --no-cache-dir -r worker/requirements.txt
RUN pip install --no-cache-dir -r api/requirements.txt

# Copy the rest of the application
COPY . .

# Environment variables will be provided by Koyeb secrets
# The default command runs the worker, but can be overridden in Koyeb to run the API
CMD ["python", "worker/main.py"]
