# Use an official Python runtime as a base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements.txt
COPY ecommerce_backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ecommerce_backend/ .

# Expose port for the app
EXPOSE 8000

# Command to run the application
CMD ["gunicorn", "ecommerce_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
