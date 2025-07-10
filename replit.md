# ORSATH - Qualitative Investment Research Platform

## Overview

ORSATH is a full-stack web application focused on qualitative investment research. It provides a platform for researchers to publish studies, share news insights, and offer personalized dashboards for authenticated users. The system emphasizes in-depth analysis over quantitative metrics, targeting investors who value qualitative research.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Animations**: Framer Motion for smooth transitions and animations

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Key Design Decisions
- **Monorepo Structure**: Client, server, and shared code organized in separate directories
- **Shared Schema**: Common TypeScript types and Zod schemas in `/shared` directory
- **TypeScript-First**: Full TypeScript implementation across frontend and backend
- **Component-Driven UI**: Reusable UI components with consistent design system

## Key Components

### Database Schema
- **Users**: Stores user profiles integrated with Replit Auth
- **Studies**: Research publications with categories and featured content
- **News**: News articles with categorization and priority levels
- **Watchlist**: User-specific stock/company tracking
- **Contact Submissions**: Customer inquiries and feedback
- **Research Insights**: Actionable insights with different types (opportunity, risk, etc.)
- **Sessions**: Authentication session storage

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **Authorization**: Route-level protection for authenticated endpoints
- **User Management**: Automatic user creation/updates on login

### API Structure
- **RESTful Design**: Standard HTTP methods for CRUD operations
- **Route Protection**: Middleware-based authentication checking
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Request Logging**: Comprehensive logging for API requests with response times

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, creating/updating user records
2. **Content Management**: Authenticated users can create studies, news, and manage watchlists
3. **Public Access**: Landing page, studies, and news are publicly accessible
4. **Dashboard**: Authenticated users access personalized dashboards with watchlists and insights
5. **Real-time Updates**: React Query handles cache invalidation and real-time data synchronization

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL for serverless database hosting
- **Authentication**: Replit Auth service for user management
- **Financial Data**: Finnhub API for real-time stock market data
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation

### Development Tools
- **Build**: Vite for frontend, esbuild for backend bundling
- **Database**: Drizzle Kit for migrations and schema management
- **Type Safety**: TypeScript with strict mode enabled
- **Code Quality**: ESLint configuration for consistent code style

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `/dist/public`
- **Backend**: esbuild bundles server code to `/dist/index.js`
- **Database**: Drizzle migrations handle schema changes

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **Authentication**: `REPL_ID`, `ISSUER_URL`, `SESSION_SECRET` for auth setup
- **Domains**: `REPLIT_DOMAINS` for CORS configuration
- **Financial Data**: `FINNHUB_API_KEY` for stock market data access, `TWELVE_DATA_API_KEY` for historical data, `POLYGON_API_KEY` for premium historical data

### Production Considerations
- **Static Assets**: Frontend served from `/dist/public`
- **API Routes**: Backend handles all `/api/*` routes
- **Database**: Serverless PostgreSQL with connection pooling
- **Sessions**: Persistent session storage in PostgreSQL
- **Security**: HTTPS-only cookies, CORS protection, input validation

### Development vs Production
- **Development**: Vite dev server with HMR, middleware mode
- **Production**: Express serves static files, bundled backend code
- **Database**: Same PostgreSQL setup for both environments
- **Authentication**: Environment-specific Replit Auth configuration
- **Financial Data**: Real-time stock data via Finnhub API (60 requests/minute free tier)

## Recent Changes (January 2025)
- **Real Financial Data Integration**: Replaced all mock stock data with authentic market data from Finnhub API
- **Backend Financial Services**: Added `server/finnhub.ts` with stock quote, company profile, and market data endpoints
- **API Routes**: Created comprehensive stock data API endpoints (`/api/stocks/popular`, `/api/stocks/search`, `/api/stocks/batch`)
- **Dashboard Enhancement**: Updated watchlist and search functionality to use real stock prices, market caps, and percentage changes
- **Data Accuracy**: Resolved critical issue with inaccurate stock information by integrating live financial data
- **Historical Data Integration**: Added Twelve Data API (`server/twelvedata.ts`) for authentic historical stock performance data
- **Multi-Source Data**: Implemented fallback system using Twelve Data for historical data and Finnhub for current quotes
- **Rate Limit Handling**: Properly handles API rate limits (Twelve Data: 8 calls/minute, Finnhub: 60 calls/minute)
- **Polygon.io Integration**: Added Polygon.io API (`server/polygon.ts`) as primary source for historical data with rate limiting and fallback logic
- **Triple API Fallback**: Implemented robust data pipeline: Polygon.io → Twelve Data → Finnhub for maximum accuracy and reliability