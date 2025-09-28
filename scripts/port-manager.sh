#!/bin/bash

# Port Manager Script for Traffic Ticket App
# This script helps manage port conflicts between projects

echo "🚀 Traffic Ticket App - Port Manager"
echo "=================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Port $port is in use"
        lsof -Pi :$port -sTCP:LISTEN
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Function to kill process on a port
kill_port() {
    local port=$1
    echo "🔪 Killing processes on port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null
    echo "✅ Port $port cleared"
}

# Function to start dev server on specific port
start_dev() {
    local port=$1
    echo "🚀 Starting dev server on port $port..."
    npm run dev -- --port $port
}

echo ""
echo "Current port status:"
echo "==================="
check_port 3000
check_port 3001
check_port 3002
check_port 3003
check_port 3004

echo ""
echo "Available commands:"
echo "=================="
echo "1. Check all ports: ./scripts/port-manager.sh check"
echo "2. Clear port 3001: ./scripts/port-manager.sh clear 3001"
echo "3. Start on port 3004: ./scripts/port-manager.sh start 3004"
echo "4. Start on port 3001: ./scripts/port-manager.sh start 3001"

# Handle command line arguments
case "$1" in
    "check")
        echo ""
        echo "Checking all ports..."
        check_port 3000
        check_port 3001
        check_port 3002
        check_port 3003
        check_port 3004
        ;;
    "clear")
        if [ -n "$2" ]; then
            kill_port $2
        else
            echo "❌ Please specify a port number"
            echo "Usage: ./scripts/port-manager.sh clear 3001"
        fi
        ;;
    "start")
        if [ -n "$2" ]; then
            start_dev $2
        else
            echo "❌ Please specify a port number"
            echo "Usage: ./scripts/port-manager.sh start 3004"
        fi
        ;;
    *)
        echo ""
        echo "For your other project, use port 3001:"
        echo "http://localhost:3001"
        echo ""
        echo "This project is configured for port 3004:"
        echo "http://localhost:3004"
        ;;
esac
