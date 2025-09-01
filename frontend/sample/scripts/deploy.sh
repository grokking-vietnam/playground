#!/bin/bash

# Deployment script for microfrontends
set -e

echo "🚀 Starting microfrontend deployment..."

# Function to deploy a specific microfrontend
deploy_microfrontend() {
    local name=$1
    local project_id=$2
    
    echo "📦 Building $name..."
    MICROFRONTEND=$name npm run build
    
    echo "🚀 Deploying $name..."
    MICROFRONTEND=$name vercel --prod --token $VERCEL_TOKEN --scope $VERCEL_ORG_ID --confirm
    
    echo "✅ $name deployed successfully!"
}

# Check if specific microfrontend is provided
if [ "$1" != "" ]; then
    case $1 in
        "shell")
            deploy_microfrontend "shell" $VERCEL_PROJECT_ID_SHELL
            ;;
        "user-management")
            deploy_microfrontend "user-management" $VERCEL_PROJECT_ID_USER_MANAGEMENT
            ;;
        "permission-control")
            deploy_microfrontend "permission-control" $VERCEL_PROJECT_ID_PERMISSION_CONTROL
            ;;
        "workflow-management")
            deploy_microfrontend "workflow-management" $VERCEL_PROJECT_ID_WORKFLOW_MANAGEMENT
            ;;
        "bigquery")
            deploy_microfrontend "bigquery" $VERCEL_PROJECT_ID_BIGQUERY
            ;;
        *)
            echo "❌ Unknown microfrontend: $1"
            echo "Available options: shell, user-management, permission-control, workflow-management, bigquery"
            exit 1
            ;;
    esac
else
    # Deploy all microfrontends
    echo "🚀 Deploying all microfrontends..."
    
    deploy_microfrontend "shell" $VERCEL_PROJECT_ID_SHELL
    deploy_microfrontend "user-management" $VERCEL_PROJECT_ID_USER_MANAGEMENT
    deploy_microfrontend "permission-control" $VERCEL_PROJECT_ID_PERMISSION_CONTROL
    deploy_microfrontend "workflow-management" $VERCEL_PROJECT_ID_WORKFLOW_MANAGEMENT
    deploy_microfrontend "bigquery" $VERCEL_PROJECT_ID_BIGQUERY
    
    echo "🎉 All microfrontends deployed successfully!"
fi
