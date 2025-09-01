# AI Agents Development Context

This document provides essential context for AI-driven development within the grokking playground repository.

## Project Overview

This is a modern development playground featuring multiple technology stacks and architectural patterns for learning and experimentation.

## Repository Structure

```
grokking/playground/
├── AGENTS.md                    # This file - AI development context
├── README.md                    # Main project documentation
├── LICENSE                      # Project license
├── CODEOWNERS                   # Code ownership definitions
│
├── iac/                        # Infrastructure as Code
│   ├── __main__.py             # Pulumi main entry point
│   ├── requirements.txt        # Python dependencies
│   ├── Pulumi.yaml             # Pulumi project configuration
│   ├── Pulumi.aws.yaml         # AWS stack configuration
│   ├── README.md               # IaC documentation
│   ├── venv/                   # Python virtual environment
│   └── stacks/                 # Infrastructure stacks
│       ├── aws/                # AWS infrastructure
│       │   ├── __init__.py
│       │   ├── kms.py          # KMS key management
│       │   └── iam/            # Identity and Access Management
│       │       ├── assignments.py
│       │       ├── groups.py
│       │       ├── users.py
│       │       ├── sso.py
│       │       ├── permission_sets.py
│       │       ├── managed_policy_attachment.py
│       │       ├── group_memberships.py
│       │       ├── groups.yaml # Group definitions
│       │       └── users.yaml  # User definitions
│       │
│       ├── pulumi-fundamentals/ # Learning examples
│       └── vm-hcloud/          # Hetzner Cloud VMs
│
├── aws/                        # AWS CLI and tools
│   ├── install                 # Installation script
│   ├── README.md               # AWS tools documentation
│   └── dist/                   # AWS CLI distribution
│
├── age/                        # Age encryption tools
│   ├── age-keygen              # Key generation tool
│   ├── encrypt                 # Encryption tool
│   ├── keys.txt                # Key storage
│   ├── LICENSE                 # Age license
│   └── x.enc.yaml              # Encrypted configuration
│
├── simulator/                  # Load testing and simulation
│   └── artillery/              # Artillery.js load testing
│       ├── README.md
│       └── quickstart-asciiart-load-test.yml
│
├── sql/                        # SQL tools and utilities
│   └── chdb.py                 # ClickHouse database tools
│
├── dotfiles/                   # Development environment configs
│   └── tmux/                   # tmux configuration
│       ├── LICENSE.MIT
│       ├── LICENSE.WTFPLv2
│       └── README.md
│
├── x.yaml                      # Configuration file
└── x.enc.yaml                  # Encrypted configuration
```

## Software Development Lifecycle

### Development methodologies
- TBD

## Technology Stack

### Frontend Architecture
- **Build System**: Rspack (Rust-based bundler for performance)
- **Package Manager**: pnpm (fast, disk space efficient)
- **Monorepo**: Turborepo for build orchestration
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Routing**: React Router v6
- **Development**: Hot Module Replacement (HMR) with React Refresh

### Infrastructure
- **IaC Tool**: Pulumi (Python)
- **Cloud Provider**: AWS
- **Services**: IAM, SSO, KMS
- **Alternative Cloud**: Hetzner Cloud for VMs

### Development Tools
- **Encryption**: Age (modern encryption tool)
- **AWS CLI**: Bundled distribution
- **Load Testing**: Artillery.js
- **Database**: ClickHouse utilities
- **Terminal**: tmux configuration

## AI Development Guidelines

### When Working on Frontend
1. **Build System**: Use `pnpm run build` for production builds, `pnpm run dev` for development
2. **Package Management**: Always use pnpm commands, leverage workspace protocol (`workspace:*`)
3. **Component Development**: Follow shadcn/ui patterns in the `packages/ui` directory
4. **Styling**: Use Tailwind CSS classes, refer to existing components for patterns
5. **TypeScript**: Maintain strict typing, use proper imports from workspace packages

### When Working on Infrastructure
1. **Pulumi**: Use Python-based infrastructure definitions
2. **AWS Resources**: Follow the existing IAM/SSO patterns in `iac/stacks/aws/`
3. **Configuration**: Store sensitive data in encrypted YAML files using Age
4. **Environment**: Activate the Python virtual environment before running Pulumi commands

### When Working on Tools/Utilities
1. **Encryption**: Use Age for sensitive file encryption/decryption
2. **Load Testing**: Artillery configurations in `simulator/artillery/`
3. **SQL**: ClickHouse utilities for database operations
4. **AWS**: Use the bundled AWS CLI distribution

## Development Workflow

### Frontend Development
```bash
cd frontend/
pnpm install                    # Install dependencies
pnpm run dev                   # Start development server
pnpm run build                 # Build for production
pnpm run lint                  # Run linting
pnpm run type-check           # TypeScript type checking
```

### Infrastructure Development
```bash
cd iac/
source venv/bin/activate      # Activate Python environment
pip install -r requirements.txt
pulumi up                     # Deploy infrastructure
```

### Key Files for AI Context

- **Frontend Entry Points**: `frontend/apps/shell/src/main.tsx`, `frontend/packages/ui/src/index.ts`
- **Build Configurations**: `frontend/apps/shell/rspack.config.js`, `frontend/packages/ui/tsup.config.ts`
- **Infrastructure Main**: `iac/__main__.py`
- **Package Definitions**: All `package.json` files for dependencies and scripts
- **Configuration**: `x.yaml` (plain), `x.enc.yaml` (encrypted)

## Common Tasks

### Adding a New Frontend Component
1. Create in `frontend/packages/ui/src/components/ui/`
2. Export from `frontend/packages/ui/src/index.ts`
3. Use in shell app by importing from `@modern-mf/ui`

### Adding Infrastructure Resources
1. Create new module in `iac/stacks/aws/`
2. Import and use in `iac/__main__.py`
3. Configure in appropriate Pulumi YAML file

### Updating Dependencies
1. Frontend: Use `pnpm add <package>` in appropriate workspace
2. Infrastructure: Update `iac/requirements.txt` and reinstall

This structure supports modern development practices with AI assistance, providing clear separation of concerns and well-defined interfaces between components.
