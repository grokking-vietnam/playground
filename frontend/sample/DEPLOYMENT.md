# Microfrontend Deployment Guide

This guide explains how to deploy the BigQuery Studio microfrontend architecture independently.

## Architecture Overview

The application is structured as a microfrontend architecture with the following components:

- **Shell**: Main application shell that hosts other microfrontends
- **User Management**: Independent user management application
- **Permission Control**: Role and permission management application
- **Workflow Management**: Workflow automation and monitoring
- **BigQuery Studio**: Data analytics and query interface

## Development

### Running Individual Microfrontends

\`\`\`bash
# Run specific microfrontend
./scripts/dev.sh shell
./scripts/dev.sh user-management
./scripts/dev.sh permission-control
./scripts/dev.sh workflow-management
./scripts/dev.sh bigquery

# Run all microfrontends
./scripts/dev.sh
\`\`\`

### Running with Docker

\`\`\`bash
# Build and run all services
docker-compose up --build

# Run specific service
docker-compose up shell
docker-compose up user-management
\`\`\`

## Deployment

### Environment Variables

Set up the following environment variables for each deployment:

\`\`\`bash
# Vercel deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID_SHELL=shell_project_id
VERCEL_PROJECT_ID_USER_MANAGEMENT=user_management_project_id
VERCEL_PROJECT_ID_PERMISSION_CONTROL=permission_control_project_id
VERCEL_PROJECT_ID_WORKFLOW_MANAGEMENT=workflow_management_project_id
VERCEL_PROJECT_ID_BIGQUERY=bigquery_project_id

# Application URLs
SHELL_URL=https://your-shell-app.vercel.app
USER_MANAGEMENT_URL=https://your-user-management.vercel.app
PERMISSION_CONTROL_URL=https://your-permission-control.vercel.app
WORKFLOW_MANAGEMENT_URL=https://your-workflow-management.vercel.app
BIGQUERY_URL=https://your-bigquery.vercel.app

# Auth configuration
NEXTAUTH_URL=https://your-shell-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
\`\`\`

### Manual Deployment

\`\`\`bash
# Deploy specific microfrontend
./scripts/deploy.sh shell
./scripts/deploy.sh user-management

# Deploy all microfrontends
./scripts/deploy.sh
\`\`\`

### Automated Deployment

The GitHub Actions workflow automatically deploys changed microfrontends:

1. Detects changes in specific microfrontend directories
2. Builds only the changed microfrontends
3. Deploys to separate Vercel projects
4. Maintains independent deployment cycles

## Independent Development

Each microfrontend can be developed and deployed independently:

1. **Separate repositories**: Each microfrontend can be moved to its own repository
2. **Independent CI/CD**: Each has its own deployment pipeline
3. **Shared dependencies**: Common components and utilities are shared via npm packages
4. **Communication**: Uses event bus and shared state for inter-app communication

## Monitoring and Scaling

- Each microfrontend can be scaled independently
- Monitoring is set up per application
- Error boundaries prevent one app from crashing others
- Shared authentication state is maintained across all apps

## Best Practices

1. **Version Management**: Use semantic versioning for shared components
2. **Testing**: Test each microfrontend independently
3. **Performance**: Lazy load microfrontends to improve initial load time
4. **Security**: Maintain consistent security policies across all apps
5. **Documentation**: Keep deployment docs updated for each microfrontend
