# Mekong - Enterprise Data Platform

A modern microfrontend application built with Modern.js, Umi, shadcn/ui, and Rspack.

## Features

- **Microfrontend Architecture**: Modular application structure with independent micro-applications
- **Modern.js Framework**: React-based framework with built-in routing and state management
- **Rspack Bundler**: Fast Rust-based bundler for optimal performance
- **shadcn/ui Components**: Beautiful and accessible UI components
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

## Applications

- **BigQuery Studio**: Enterprise data platform with SQL query capabilities
- **User Management**: Manage users, roles, and permissions
- **Permission Control**: Configure access controls and security policies
- **Workflow Management**: Design and manage business workflows
- **Data Catalog**: Discover and catalog data assets
- **Vertex AI**: Machine learning and AI model management

## Getting Started

### Prerequisites

- Node.js 16.18.1 or higher
- pnpm (recommended package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Development Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter
- `pnpm new` - Create new components/pages

## Architecture

### Microfrontend Structure

```
src/
├── apps/                    # Microfrontend applications
│   ├── bigquery/           # BigQuery Studio app
│   ├── user-management/    # User Management app
│   ├── permission-control/ # Permission Control app
│   ├── workflow-management/# Workflow Management app
│   ├── data-catalog/       # Data Catalog app
│   └── vertex-ai/          # Vertex AI app
├── components/             # Shared components
│   ├── ui/                # shadcn/ui components
│   ├── shell/             # Shell layout components
│   └── shared/            # Shared utility components
├── lib/                   # Utility libraries
├── hooks/                 # Custom React hooks
└── styles/               # Global styles
```

### Technology Stack

- **Framework**: Modern.js 2.68.11
- **Bundler**: Rspack (configured via Modern.js)
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS 3.4.16
- **Language**: TypeScript 5.7.3
- **State Management**: Built-in Modern.js state plugin
- **Routing**: Modern.js Router (Umi-based)

## Configuration

### Environment Variables

Set these environment variables for microfrontend communication:

```bash
SHELL_URL=http://localhost:3000
USER_MANAGEMENT_URL=http://localhost:3001
PERMISSION_CONTROL_URL=http://localhost:3002
WORKFLOW_MANAGEMENT_URL=http://localhost:3003
BIGQUERY_URL=http://localhost:3004
```

### Rspack Configuration

Rspack is configured through Modern.js in `modern.config.ts`:

```typescript
export default defineConfig({
  plugins: [
    appTools({
      bundler: 'rspack', // Using Rspack for better performance
    }),
  ],
});
```

## Development

### Adding New Applications

1. Create a new directory in `src/apps/`
2. Add the application component (`page.tsx`)
3. Register in `src/lib/microfrontend-registry.ts`
4. Update navigation in shell components

### Component Development

Components follow the shadcn/ui pattern:
- Use Tailwind CSS for styling
- Implement proper TypeScript interfaces
- Follow accessibility best practices
- Use the design system tokens

### State Management

The application uses a combination of:
- React Context for global state
- Modern.js state plugin for complex state management
- Event bus for microfrontend communication

## Deployment

### Production Build

```bash
pnpm build
```

This creates an optimized production build in the `dist/` directory.

### Environment Configuration

Configure environment-specific settings in:
- `.env.local` for local development
- `.env.production` for production deployment

## Contributing

1. Follow the established code style
2. Use TypeScript for all new code
3. Add proper documentation for new features
4. Ensure accessibility compliance
5. Test across different microfrontends

## License

This project is part of the Grokking Playground and follows the repository's license terms.
