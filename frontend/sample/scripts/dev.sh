#!/bin/bash

# Development script for running microfrontends locally
set -e

echo "🚀 Starting microfrontend development environment..."

# Function to start a microfrontend in development mode
start_microfrontend() {
    local name=$1
    local port=$2
    
    echo "🔧 Starting $name on port $port..."
    MICROFRONTEND=$name PORT=$port npm run dev &
}

# Check if specific microfrontend is provided
if [ "$1" != "" ]; then
    case $1 in
        "shell")
            MICROFRONTEND=shell PORT=3000 npm run dev
            ;;
        "user-management")
            MICROFRONTEND=user-management PORT=3001 npm run dev
            ;;
        "permission-control")
            MICROFRONTEND=permission-control PORT=3002 npm run dev
            ;;
        "workflow-management")
            MICROFRONTEND=workflow-management PORT=3003 npm run dev
            ;;
        "bigquery")
            MICROFRONTEND=bigquery PORT=3004 npm run dev
            ;;
        *)
            echo "❌ Unknown microfrontend: $1"
            echo "Available options: shell, user-management, permission-control, workflow-management, bigquery"
            exit 1
            ;;
    esac
else
    # Start all microfrontends
    echo "🚀 Starting all microfrontends..."
    
    start_microfrontend "shell" 3000
    start_microfrontend "user-management" 3001
    start_microfrontend "permission-control" 3002
    start_microfrontend "workflow-management" 3003
    start_microfrontend "bigquery" 3004
    
    echo "🎉 All microfrontends started!"
    echo "📱 Shell: http://localhost:3000"
    echo "👥 User Management: http://localhost:3001"
    echo "🔒 Permission Control: http://localhost:3002"
    echo "⚡ Workflow Management: http://localhost:3003"
    echo "📊 BigQuery: http://localhost:3004"
    
    # Wait for all background processes
    wait
fi
