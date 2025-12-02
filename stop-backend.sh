#!/bin/bash

# PDFly Backend Stopper Script

echo "🔍 Looking for backend process..."

if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -t -i:8080)
    echo "✅ Found backend running (PID: $PID)"
    echo "🛑 Stopping backend..."
    kill -9 $PID
    sleep 1
    
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Failed to stop backend"
        exit 1
    else
        echo "✅ Backend stopped successfully"
    fi
else
    echo "ℹ️  Backend is not running"
fi
