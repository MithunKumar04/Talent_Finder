# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements/ai-requirements.txt .
RUN pip install --no-cache-dir -r ai-requirements.txt

# Copy backend code
COPY . .

# Expose port FastAPI runs on
EXPOSE 8000

# Command to run FastAPI
CMD ["uvicorn", "src.api.rest.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]