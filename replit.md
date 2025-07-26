# FinanceFlow - Personal Finance Management Application

## Overview

FinanceFlow is a modern personal finance management application built with a full-stack TypeScript architecture. The application allows users to track their financial accounts, categorize transactions, analyze spending patterns, and maintain a financial glossary. It features a clean, responsive interface with comprehensive financial management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with conventional HTTP methods
- **Middleware**: Express middleware for JSON parsing, logging, and error handling
- **Development**: Vite middleware integration for seamless full-stack development

### Data Storage
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Zod schemas for runtime type validation
- **Storage Pattern**: Repository pattern with in-memory fallback during development

## Key Components

### Database Schema
The application defines four main entities:
- **Accounts**: Financial accounts (checking, savings, credit, investment) with balances
- **Categories**: Income/expense categories with colors and icons for organization
- **Transactions**: Financial transactions linked to accounts and categories
- **Glossary Terms**: Educational financial terminology with definitions

### Frontend Pages
- **Dashboard**: Overview with account summaries and recent activity
- **Transactions**: Full transaction management with filtering and CRUD operations
- **Categories**: Category management with visual icons and color coding
- **Analytics**: Data visualization with expense breakdowns and trend analysis
- **Accounts**: Account management with balance tracking
- **Glossary**: Financial education with searchable terms

### UI System
- **Design System**: shadcn/ui components with "new-york" style variant
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Theme Support**: CSS custom properties for easy theme switching
- **Icons**: Lucide React icons with centralized icon mapping system

## Data Flow

### Client-Server Communication
1. Frontend makes HTTP requests to `/api/*` endpoints
2. Express server handles routing through centralized route registration
3. Route handlers validate input using Zod schemas
4. Storage layer abstracts database operations
5. Responses return JSON with consistent error handling

### State Management
1. TanStack React Query manages server state with automatic caching
2. Query invalidation ensures data consistency after mutations
3. Local component state handles UI interactions and form data
4. Global state is minimal, focusing on selected account context

### Transaction Flow
1. User creates transaction through modal form
2. Frontend validates and submits to POST `/api/transactions`
3. Server validates with Zod schema and creates database record
4. Account balance is automatically updated
5. React Query invalidates relevant queries to refresh UI

## External Dependencies

### Core Dependencies
- **Database**: `@neondatabase/serverless` for PostgreSQL connection
- **ORM**: `drizzle-orm` and `drizzle-zod` for database operations
- **Validation**: `zod` for schema validation
- **HTTP Client**: Built-in fetch API with custom wrapper
- **Date Handling**: `date-fns` for date manipulation and formatting

### UI Dependencies
- **Component Library**: Extensive Radix UI primitive collection
- **Styling**: `tailwindcss`, `class-variance-authority`, `clsx`
- **Charts**: `recharts` for data visualization
- **Forms**: `react-hook-form` with `@hookform/resolvers`
- **Icons**: `lucide-react` icon library

### Development Tools
- **Build**: `vite` with React plugin and TypeScript support
- **Runtime**: `tsx` for TypeScript execution
- **Bundling**: `esbuild` for production builds
- **Development**: Replit-specific plugins for enhanced development experience

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` using Vite
2. Backend bundles to `dist/index.js` using esbuild
3. Static assets are served by Express in production
4. TypeScript compilation with strict type checking

### Environment Configuration
- **Development**: Uses Vite dev server with Express middleware mode
- **Production**: Serves static files through Express with error handling
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **Session Management**: Prepared for PostgreSQL session storage with `connect-pg-simple`

### Production Considerations
- Database migrations managed through Drizzle Kit
- Error boundaries and comprehensive error handling
- Request logging and performance monitoring
- Static asset serving with proper caching headers
- Environment-based configuration for development vs production