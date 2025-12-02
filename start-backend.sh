#!/bin/bash

# PDFly Backend - Smart Start Script
# This script safely starts the backend with all necessary checks

echo "🚀 PDFly Backend Starter"
echo "========================"
echo ""

# Navigate to script directory
cd "$(dirname "$0")" || exit 1

# Check if backend is already running
echo "🔍 Checking for existing backend process..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -t -i:8080)
    echo "⚠️  Backend is already running (PID: $PID)"
    echo ""
    echo "Options:"
    echo "  1. Press Ctrl+C to cancel"
    echo "  2. Run './stop-backend.sh' first, then start again"
    echo "  3. Wait - auto-stopping in 5 seconds..."
    echo ""
    
    for i in 5 4 3 2 1; do
        echo -n "$i..."
        sleep 1
    done
    echo ""
    
    echo "🛑 Stopping existing backend (PID: $PID)..."
    kill -9 $PID 2>/dev/null
    sleep 2
    
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Failed to stop existing backend"
        echo "Please run: ./stop-backend.sh"
        exit 1
    fi
    echo "✅ Existing backend stopped"
    echo ""
fi

echo "✅ Port 8080 is free"
echo "📂 Navigating to backend directory..."

cd pdf-wiz-backend || {
    echo "❌ Error: pdf-wiz-backend directory not found"
    exit 1
}

echo "🗄️  Database: H2 File-based (data/pdflydb)"
echo "💾 Data persists between restarts"
echo ""
echo "🚀 Starting backend..."
echo "📝 Logs will appear below. Press Ctrl+C to stop."
echo "========================================"
echo ""

# Start the backend
mvn spring-boot:run
