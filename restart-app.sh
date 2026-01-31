#!/bin/bash
echo "🛑 Zatrzymuję aplikację..."

# Zabij procesy
pkill -f "python3 app.py"
pkill -f "npm run preview"
pkill -f vite
sleep 2

echo "🚀 Uruchamiam Backend..."
cd /opt/myniu-lite/backend
nohup python3 app.py > backend.log 2>&1 &
BACKEND_PID=$!

echo "🚀 Uruchamiam Frontend..."
cd /opt/myniu-lite/frontend
nohup npm run preview -- --host > frontend.log 2>&1 &
FRONTEND_PID=$!

echo "✅ Aplikacja działa!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Logi: tail -f backend.log / frontend.log"
echo "Dostęp: http://192.168.0.153:4173"
