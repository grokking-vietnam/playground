# Mekong Frontend - AI Agent Development Overview

## 🎯 Purpose & Context

**Mekong** is an enterprise-grade microfrontend application serving as a unified data platform shell. This document provides AI agents with comprehensive context for spec-driven development, architectural patterns, and development workflows.

## 🏗️ Architecture Overview

### Core Framework Stack
- **Framework**: Modern.js 2.68.11 (React-based with built-in routing & state)
- **Bundler**: Rspack (Rust-based, configured via Modern.js)
- **UI System**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS 3.4.16 with CSS variables
- **Language**: TypeScript 5.7.3 (strict mode)
- **State**: Modern.js state plugin + React Context + Event Bus
- **Package Manager**: pnpm (workspace protocol support)

### Microfrontend Architecture Pattern
```
Shell Application (Port 3000)
├── Home Dashboard (/)
├── BigQuery Studio (/bigquery)
├── Code Editor (/code-editor)  
├── User Management (/user-management)
├── Permission Control (/permission-control)
├── Workflow Management (/workflow-management)
├── Data Catalog (/data-catalog)
└── Vertex AI (/vertex-ai)
```

## 📁 Directory Structure & Conventions

### Source Organization
```
src/
├── apps/                          # 🎯 Microfrontend Applications
│   ├── {app-name}/
│   │   └── page.tsx              # Main app component (required)
│   └── ...
├── components/                    # 🧩 Shared Components
│   ├── ui/                       # shadcn/ui components (auto-generated)
│   ├── shell/                    # Shell layout & navigation
│   └── shared/                   # Cross-app shared components
├── lib/                          # 🔧 Core Libraries
│   ├── microfrontend-registry.ts # App registration & routing
│   ├── event-bus.ts             # Inter-app communication
│   ├── auth-context.tsx         # Authentication state
│   ├── shared-state.tsx         # Global state management
│   └── utils.ts                 # Utility functions
├── hooks/                        # 🪝 Custom React Hooks
├── routes/                       # 🛣️ Modern.js Routes
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Root page
├── shared/                       # 📦 Shared Resources
└── styles/
    └── globals.css              # Global styles & CSS variables
```

### Path Aliases (TypeScript)
```json
{
  "@/*": ["src/*"],
  "@/components/*": ["src/components/*"],
  "@/lib/*": ["src/lib/*"],
  "@/hooks/*": ["src/hooks/*"],
  "@/apps/*": ["src/apps/*"],
  "@/shared/*": ["src/shared/*"]
}
```

## 🎨 Design System & UI Patterns

### Component Architecture
- **Base**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties
- **Theme**: New York style, neutral base color
- **Icons**: Lucide React
- **Responsive**: Mobile-first approach

### Color System (CSS Variables)
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... full design token system */
}
```

### Component Patterns
1. **Composition over Inheritance**: Use compound components
2. **Prop Forwarding**: Support `...props` spreading
3. **Variant System**: Use `class-variance-authority` for component variants
4. **Accessibility**: ARIA compliance via Radix UI

## 🔄 Microfrontend Communication

### Registry System (`microfrontend-registry.ts`)
```typescript
interface MicrofrontendConfig {
  id: string                    // Unique identifier
  name: string                  // Display name
  path: string                  // Route path
  component: () => Promise<...>  // Lazy-loaded component
  icon: string                  // Lucide icon name
  category: string              // Grouping category
  description?: string          // Optional description
}
```

### Event Bus Communication (`event-bus.ts`)
```typescript
// Predefined event types for type safety
const EVENT_TYPES = {
  USER_SELECTED: 'user.selected',
  PROJECT_CHANGED: 'project.changed',
  NOTIFICATION_SHOW: 'notification.show',
  NAVIGATION_REQUEST: 'navigation.request',
  DATA_UPDATED: 'data.updated',
  THEME_CHANGED: 'theme.changed',
}

// Usage pattern
eventBus.emit(EVENT_TYPES.USER_SELECTED, { userId: '123' })
eventBus.subscribe(EVENT_TYPES.PROJECT_CHANGED, handleProjectChange)
```

### State Management Patterns
1. **Local State**: React `useState` for component-specific state
2. **Global State**: React Context via `shared-state.tsx`
3. **Cross-App State**: Event bus for loosely coupled communication
4. **Modern.js State**: For complex state management needs

## 🛠️ Development Workflows

### Adding New Microfrontend Applications

1. **Create App Structure**
   ```bash
   mkdir src/apps/{app-name}
   touch src/apps/{app-name}/page.tsx
   ```

2. **Implement App Component**
   ```typescript
   // src/apps/{app-name}/page.tsx
   import React from 'react'
   
   export default function AppNamePage() {
     return (
       <div className="container mx-auto py-6">
         <h1 className="text-3xl font-bold">App Name</h1>
         {/* App content */}
       </div>
     )
   }
   ```

3. **Register in Registry**
   ```typescript
   // Add to microfrontendRegistry array in lib/microfrontend-registry.ts
   {
     id: "appname",
     name: "App Name",
     path: "/app-name",
     component: () => import("@/apps/app-name/page"),
     icon: "IconName", // Lucide React icon
     category: "Category",
     description: "App description"
   }
   ```

4. **Update Navigation** (handled automatically via registry)

### Adding UI Components

1. **shadcn/ui Components**
   ```bash
   # Auto-generates in src/components/ui/
   npx shadcn@latest add button
   npx shadcn@latest add card
   ```

2. **Custom Shared Components**
   ```typescript
   // src/components/shared/{component-name}.tsx
   import React from 'react'
   import { cn } from '@/lib/utils'
   
   interface ComponentProps {
     className?: string
     // ... other props
   }
   
   export function ComponentName({ className, ...props }: ComponentProps) {
     return (
       <div className={cn("base-styles", className)} {...props}>
         {/* Component content */}
       </div>
     )
   }
   ```

### Environment Configuration

```typescript
// modern.config.ts - Environment variables for microfrontend URLs
define: {
  'process.env.SHELL_URL': JSON.stringify(process.env.SHELL_URL || 'http://localhost:3001'),
  'process.env.USER_MANAGEMENT_URL': JSON.stringify(process.env.USER_MANAGEMENT_URL || 'http://localhost:3002'),
  // ... other microfrontend URLs
}
```

## 🔍 Key Files for AI Agents

### Critical Configuration Files
- `package.json` - Dependencies, scripts, engine requirements
- `modern.config.ts` - Modern.js configuration, Rspack setup, environment variables
- `tsconfig.json` - TypeScript configuration, path aliases
- `tailwind.config.js` - Tailwind CSS configuration, design tokens
- `components.json` - shadcn/ui configuration

### Core Application Files
- `src/lib/microfrontend-registry.ts` - App registration and routing logic
- `src/lib/event-bus.ts` - Inter-app communication system
- `src/lib/shared-state.tsx` - Global state management
- `src/components/shell/shell-layout.tsx` - Main application shell
- `src/routes/layout.tsx` - Root layout component
- `src/styles/globals.css` - Global styles and CSS variables

### Development Scripts
```json
{
  "dev": "modern dev",           // Development server
  "build": "modern build",       // Production build
  "start": "modern start",       // Production server
  "lint": "biome check",         // Code linting
  "new": "modern new"            // Generate new components
}
```

## 🎯 AI Agent Development Guidelines

### When Adding Features
1. **Check Registry**: Verify if similar functionality exists
2. **Follow Patterns**: Use established component and state patterns
3. **Type Safety**: Maintain strict TypeScript compliance
4. **Accessibility**: Ensure ARIA compliance and keyboard navigation
5. **Performance**: Implement lazy loading for heavy components
6. **Communication**: Use event bus for cross-app interactions

### When Modifying Existing Code
1. **Read Registry**: Understand app relationships and dependencies
2. **Check Event Types**: Verify event bus usage and subscriptions
3. **Test Cross-App**: Ensure changes don't break other microfrontends
4. **Update Types**: Maintain TypeScript interfaces and types
5. **Preserve Styling**: Follow existing Tailwind CSS patterns

### Code Quality Standards
- **TypeScript**: Strict mode, no `any` types
- **Components**: Functional components with proper prop types
- **Styling**: Tailwind CSS classes, avoid inline styles
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Imports**: Use path aliases, group imports logically
- **Accessibility**: Include ARIA labels, keyboard navigation

### Testing Considerations
- **Component Testing**: Test component rendering and interactions
- **Event Bus Testing**: Verify cross-app communication
- **Route Testing**: Ensure proper navigation and lazy loading
- **Responsive Testing**: Verify mobile and desktop layouts
- **Accessibility Testing**: Screen reader and keyboard navigation

## 🚀 Performance Optimization

### Bundle Optimization
- **Code Splitting**: Automatic via Modern.js route-based splitting
- **Lazy Loading**: All microfrontends loaded on demand
- **Tree Shaking**: Enabled via Rspack bundler
- **Asset Optimization**: Automatic via Modern.js build process

### Runtime Performance
- **Event Bus**: Efficient subscription/unsubscription patterns
- **State Management**: Minimal re-renders via proper state structure
- **Component Memoization**: Use React.memo for expensive components
- **Image Optimization**: Lazy loading and proper sizing

## 📚 Learning Resources & References

### Documentation Links
- [Modern.js Documentation](https://modernjs.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

### Architecture Patterns
- **Microfrontend Architecture**: Module Federation concepts
- **Event-Driven Architecture**: Loose coupling via event bus
- **Component Composition**: Compound component patterns
- **State Management**: Context + Event Bus hybrid approach

---

This overview provides AI agents with the complete context needed for effective spec-driven development within the Mekong frontend ecosystem. Use this as your primary reference for understanding the codebase structure, patterns, and development workflows.
