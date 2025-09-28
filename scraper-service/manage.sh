#!/bin/bash

# Docker management script for ticket scraper service

export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"

case "$1" in
  "start")
    echo "🚀 Starting ticket scraper service..."
    docker run -d --name ticket-scraper-service -p 3005:3005 ticket-scraper-service
    echo "✅ Service started! Health check: http://localhost:3005/health"
    ;;
  "stop")
    echo "🛑 Stopping ticket scraper service..."
    docker stop ticket-scraper-service
    docker rm ticket-scraper-service
    echo "✅ Service stopped!"
    ;;
  "restart")
    echo "🔄 Restarting ticket scraper service..."
    docker stop ticket-scraper-service 2>/dev/null || true
    docker rm ticket-scraper-service 2>/dev/null || true
    docker run -d --name ticket-scraper-service -p 3005:3005 ticket-scraper-service
    echo "✅ Service restarted!"
    ;;
  "status")
    echo "📊 Service status:"
    docker ps | grep ticket-scraper-service || echo "❌ Service not running"
    ;;
  "logs")
    echo "📋 Service logs:"
    docker logs ticket-scraper-service
    ;;
  "test")
    echo "🧪 Testing service..."
    node test-scraper.js
    ;;
  "build")
    echo "🔨 Building Docker image..."
    docker build -t ticket-scraper-service .
    echo "✅ Image built successfully!"
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs|test|build}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the Docker container"
    echo "  stop    - Stop and remove the Docker container"
    echo "  restart - Restart the Docker container"
    echo "  status  - Show container status"
    echo "  logs    - Show container logs"
    echo "  test    - Run test suite"
    echo "  build   - Build Docker image"
    exit 1
    ;;
esac
