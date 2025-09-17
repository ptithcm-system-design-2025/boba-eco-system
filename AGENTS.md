# AGENTS.md

## Overview

Boba Eco-System: Multi-service TypeScript application for boba tea shop management with NestJS backend, dual Next.js frontends (Manager Dashboard + POS), and PostgreSQL database.

## Architecture

```
boba-eco-system/
├── backend/          # NestJS API server (port 4653)
├── frontend/
│   ├── manager/      # Next.js management dashboard (port 4811)
│   └── pos/         # Next.js point-of-sale system (port 4810)
├── database/        # PostgreSQL setup & migrations
└── compose-dev.yml  # Docker development environment
```

## Prerequisites

- Node.js 20+
- pnpm (package manager)
- Docker & Docker Compose
- PostgreSQL 16

## Environment Setup

### Required Environment Files

Create these files before starting:

1. `.env.dev` (Docker database):
```bash
POSTGRES_USER=user
POSTGRES_PASSWORD=user
POSTGRES_DB=cake_pos_db
POSTGRES_PORT=5432
```

2. `backend/.env.development` (NestJS):
```bash
DATABASE_URL="postgresql://user:user@localhost:5432/cake_pos_db"
JWT_SECRET=your-jwt-secret
FIREBASE_PROJECT_ID=your-firebase-project
```

3. `frontend/manager/.env.development`:
```bash
PORT=4811
NEXT_PUBLIC_API_URL=https://localhost:4653/api/v1
```

4. `frontend/pos/.env.development`:
```bash
PORT=4810
NEXT_PUBLIC_API_URL=https://localhost:4653/api/v1
```

## Development Workflow

### 1. Database Setup

```bash
# Start PostgreSQL container
docker-compose -f compose-dev.yml up -d

# Verify database is running
docker-compose -f compose-dev.yml ps
```

### 2. Backend Development

```bash
cd backend

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run database migrations (if needed)
pnpm prisma db push

# Start development server (with hot reload)
pnpm start:dev

# Alternative: debug mode
pnpm start:debug
```

Backend runs on: `https://localhost:4653`

### 3. Frontend Manager Development

```bash
cd frontend/manager

# Install dependencies
pnpm install

# Start development server (Turbopack + HTTPS)
pnpm dev
```

Manager dashboard runs on: `https://localhost:4811`

### 4. Frontend POS Development

```bash
cd frontend/pos

# Install dependencies
pnpm install

# Start development server (Turbopack + HTTPS)
pnpm dev
```

POS system runs on: `https://localhost:4810`

## Build & Production

### Backend Build

```bash
cd backend
pnpm build
pnpm start:prod
```

### Frontend Builds

```bash
# Manager
cd frontend/manager
pnpm build
pnpm start

# POS
cd frontend/pos
pnpm build
pnpm start
```

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov

# Watch mode
pnpm test:watch
```

### Frontend Tests

```bash
# Manager
cd frontend/manager
pnpm lint

# POS
cd frontend/pos
pnpm lint
```

## Code Quality

### Backend (Biome)

```bash
cd backend

# Format code
pnpm format

# Lint and fix
pnpm lint
```

### Frontend (ESLint)

```bash
# Manager
cd frontend/manager
pnpm lint

# POS
cd frontend/pos
pnpm lint
```

## Database Operations

### Prisma Commands

```bash
cd backend

# Generate client after schema changes
pnpm prisma generate

# Apply schema changes to database
pnpm prisma db push

# View database in browser
pnpm prisma studio

# Reset database (destructive)
pnpm prisma db reset
```

### Database Migrations

SQL migration files located in `database/src/`:
- `B1.0.0__base_line.sql` - Initial schema
- `V1.0.1__init_default_data.sql` - Default data
- `V1.0.2__trigger.sql` - Database triggers
- `V1.0.4__membership_trigger_event.sql` - Membership events
- `V1.0.5__scheduled_events.sql` - Scheduled events
- `V1.0.8__init_optional_data.sql` - Optional data

## Git Workflow

### Commit Standards

- Uses conventional commits with commitlint
- Header max length: 65 characters
- Body max line length: 72 characters
- Requires signed-off-by
- Branch name linting enabled

### Pre-commit Hooks

```bash
# Install git hooks
pnpm prepare
```

Hooks run:
- Lint-staged for code formatting
- Commitlint for commit message validation
- Branch name validation

## Key Technologies

### Backend Stack
- **Framework**: NestJS 11 with TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Authentication**: JWT + Passport
- **Payment**: VNPay integration
- **File Storage**: Firebase Admin
- **Testing**: Jest
- **Code Quality**: Biome

### Frontend Stack
- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand
- **Charts**: Recharts (Manager only)
- **Development**: Turbopack, HTTPS certificates

## SSL Certificates

Local HTTPS certificates included:
- `frontend/manager/certificates/`
- `frontend/pos/certificates/`
- `backend/src/ssl/`

## API Documentation

Backend provides Swagger documentation at: `https://localhost:4653/api`

## Troubleshooting

### Common Issues

1. **Database connection failed**: Ensure Docker container is running
2. **SSL certificate errors**: Use provided certificates or regenerate
3. **Port conflicts**: Check if ports 4653, 4810, 4811, 5432 are available
4. **Prisma client outdated**: Run `pnpm prisma generate`

### Reset Development Environment

```bash
# Stop all services
docker-compose -f compose-dev.yml down -v

# Clean node_modules
rm -rf node_modules backend/node_modules frontend/*/node_modules

# Reinstall dependencies
pnpm install
cd backend && pnpm install
cd ../frontend/manager && pnpm install
cd ../pos && pnpm install

# Restart database
docker-compose -f compose-dev.yml up -d
```
