# ==========================
# Base Image
# ==========================
FROM python:3.12-slim

# ==========================
# Environment Variables
# ==========================
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ==========================
# Working Directory
# ==========================
WORKDIR /app

# ==========================
# Install System Dependencies
# ==========================
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ==========================
# Copy Requirements
# ==========================
COPY requirements.txt .

# ==========================
# Install Python Packages
# ==========================
RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

# ==========================
# Copy Project
# ==========================
COPY . .

# ==========================
# Expose Port
# ==========================
EXPOSE 8000

# ==========================
# Start FastAPI
# ==========================
CMD ["uvicorn","app:app","--host","0.0.0.0","--port","8000"]