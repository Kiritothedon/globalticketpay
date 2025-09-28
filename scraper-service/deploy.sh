#!/bin/bash

# Deploy script for ticket scraper service

echo "🚀 Deploying Ticket Scraper Service..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t ticket-scraper-service .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

# Stop existing container if running
echo "🛑 Stopping existing container..."
docker stop ticket-scraper-service 2>/dev/null || true
docker rm ticket-scraper-service 2>/dev/null || true

# Run the new container
echo "🏃 Starting new container..."
docker run -d \
    --name ticket-scraper-service \
    -p 3005:3005 \
    --restart unless-stopped \
    ticket-scraper-service

if [ $? -eq 0 ]; then
    echo "✅ Ticket scraper service deployed successfully!"
    echo "🌐 Service URL: http://localhost:3005"
    echo "🔍 Health check: http://localhost:3005/health"
    echo "📊 Scrape endpoint: http://localhost:3005/scrape"
    
    # Wait a moment and test the health endpoint
    sleep 5
    if curl -f http://localhost:3005/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed. Check logs with: docker logs ticket-scraper-service"
    fi
else
    echo "❌ Failed to start container"
    exit 1
fi
