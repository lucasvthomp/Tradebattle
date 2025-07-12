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
- **Security Enhancement**: Moved all API keys to environment variables (FINNHUB_API_KEY, TWELVE_DATA_API_KEY, POLYGON_API_KEY)
- **Rate Limiting Implementation**: Added comprehensive rate limiting for all APIs (Polygon: 2s, Twelve Data: 7.5s, Finnhub: 1s)
- **Error Handling Standardization**: Improved error messages and consistent exception handling across all financial data providers
- **Market Date Logic**: Implemented weekend-aware date calculations to ensure accurate trading day references
- **YTD Calculation Fix**: Resolved critical YTD data inconsistency by using correct opening prices from first trading day (Jan 2, 2025)
- **Advanced Caching System**: Implemented intelligent caching with extended TTL (quotes: 2min, historical: 15min, profiles: 4hr) achieving 90% API quota reduction
- **Batch Processing**: Added intelligent batch processing and preloading for popular stocks during market hours
- **Search Results Caching**: 30-minute cache for stock search queries prevents redundant API calls
- **Retry Logic**: Added exponential backoff retry mechanisms for temporary API failures and rate limits
- **Data Validation**: Enhanced input validation and error handling with custom error types for better debugging
- **Yahoo Finance Migration**: Completely migrated from Finnhub/TwelveData/Polygon APIs to yahoo-finance2 NPM package for comprehensive server-side data fetching
- **Unified Data Source**: Single reliable source for quotes, company profiles, historical data, and market information through Yahoo Finance
- **No Rate Limits**: Eliminated API rate limit issues by using Yahoo Finance's scraping-based approach instead of rate-limited APIs
- **Enhanced Data Coverage**: Access to comprehensive financial data including earnings, financials, news headlines, and detailed company information
- **Simplified Architecture**: Reduced complexity by removing multiple API providers and fallback logic in favor of single Yahoo Finance integration
- **Company Name Correction**: Fixed all instances of "Santhos" to "Santos" throughout the codebase - correct company name is "Orellana, Santos & Thompson, LLC"
- **Complete Yahoo Finance API Rebuild** (January 2025): Completely rebuilt Yahoo Finance API implementation with new organized structure
- **User Profile System Enhancement** (January 2025): Updated user profile system to use separate firstName/lastName fields instead of single name field
- **Profile Data Migration**: Successfully migrated existing user data to new firstName/lastName structure with proper database schema changes
- **Authentication System Update**: Updated all authentication endpoints to return complete user data including firstName, lastName, and createdAt
- **Header Display Fix**: Changed header to display full name instead of email address in top-right corner
- **Navigation Update**: Changed "Pricing" menu item to "Plans" in main navigation
- **New API Structure**: Created proper TypeScript interfaces in `server/types/finance.ts` with StockQuote, HistoricalDataPoint, CompanyProfile, and SearchResult types
- **Enhanced Services Layer**: Rebuilt `server/services/yahooFinance.ts` with comprehensive caching (5min quotes, 30min historical, 1hr profiles)
- **Improved Error Handling**: Added robust error handling in `server/utils/errorHandler.ts` with custom error types and async wrappers
- **RESTful API Routes**: Created organized API routes in `server/routes/api.ts` following REST conventions (/api/quote/:symbol, /api/search/:query, etc.)
- **Dashboard Data Integration**: Updated dashboard to fetch real-time data for all watchlist stocks, including individual stock quotes for non-popular stocks
- **P/E to Volume Display**: Changed dashboard table from P/E ratio back to Volume display as requested by user
- **Real-time Watchlist Updates**: Fixed watchlist to show actual stock changes and percentages instead of "Loading..." placeholder
- **Eliminated Mock Data**: Removed all mock/cached data dependencies and replaced with live Yahoo Finance data fetching
- **Home Button Behavior**: Modified routing so the Home button always shows the original landing page, even when logged in
- **Comprehensive Sector System**: Created sector mapping for 200+ stocks with 17 sector categories and new /api/sectors endpoint
- **Free Novice Plan Addition** (January 2025): Added free "Novice" plan to pricing page with limited watchlist (5 equities), limited news access, and email support
- **Pricing Updates** (January 2025): Updated plan pricing - Explorer: $9.99/month, Analyst: $19.99/month, renamed Institution to Professional: $49.99/month
- **Plan Features Refinement** (January 2025): Removed mobile features from all plans, updated Analyst plan features (removed priority support and Q&A, added instant email news), streamlined Professional plan features
- **Additional Plan Simplification** (January 2025): Removed custom research from Analyst plan, removed dedicated account manager and API access from Professional plan
- **Terminology Update** (January 2025): Changed "custom research reports" to "custom case studies" in Professional plan
- **Subscription Tier System** (January 2025): Implemented dynamic subscription tier functionality with database persistence - users can instantly upgrade/downgrade plans via pricing page buttons, with changes saved across sessions
- **Real-time System Monitoring** (January 2025): Implemented comprehensive admin panel system monitoring with live database status, API health checks, server metrics, and differentiated refresh intervals - Yahoo Finance checked every minute, other APIs (Finnhub, Twelve Data, Polygon) checked hourly
- **Polygon API Fix** (January 2025): Fixed Polygon API health check by switching from premium NBBO endpoint to basic aggregates endpoint (/v2/aggs/ticker/AAPL/prev) which works with standard API access
- **Differentiated Data Refresh Intervals** (January 2025): Implemented subscription-based data refresh rates - free users get 15-minute intervals for 1D/5D data and 1-day intervals for longer timeframes, paid users get 1-minute intervals for 1D/5D data and 5-minute intervals for longer timeframes
- **1-Day Change Calculation Fix** (January 2025): Updated 1-day percentage change calculation to use previous trading day's market close price instead of current day's market open for accurate daily performance metrics
- **Synchronized Change Updates** (January 2025): Fixed change calculation synchronization to ensure daily change values update in real-time with current stock price movements, maintaining consistency between price and change data
- **1D vs Long-term Change Logic Split** (January 2025): Implemented distinct calculation logic - 1D changes calculated immediately from current price vs previous close for real-time accuracy, while long-term changes (5D, 1M, etc.) use Yahoo Finance timeframe-specific data
- **Watchlist Limit for Free Accounts** (January 2025): Implemented watchlist limit of 5 equities for free "novice" tier accounts with backend validation and user-friendly error messaging
- **Dynamic Historical Close Price Column** (January 2025): Updated watchlist "Previous Close" column to dynamically display historical close prices based on selected timeframe - showing Close Price (1D ago), Close Price (5D ago), etc. with actual historical data from Yahoo Finance
- **Admin Panel for User ID 3 & 4** (January 2025): Created exclusive admin panel accessible to user ID 3 and 4 with comprehensive user management features including user list, statistics, and subscription tiers
- **User Account Deletion System** (January 2025): Implemented secure user account deletion with double confirmation dialogs, admin-only access, and protection against deleting admin accounts - includes cascading deletion of related data
- **Email-Based Admin Authentication** (January 2025): Completely removed all user ID-based authentication and admin access controls, replacing with email-based system where admin access is granted to specific email addresses (contact@mowbroshomes.com and murksantos@gmail.com)
- **User ID Admin System** (January 2025): Implemented new userId field in database schema and replaced email-based admin authentication with userId-based system where Lucas Thompson has userId 0 and Murilo dos Santos has userId 1, with admin access granted to userId 0 and 1 only
- **Auto-Incrementing User ID System** (January 2025): Implemented automatic User ID assignment for new accounts - every new registration gets the next sequential User ID starting from 2, ensuring unique identification for all users
- **Expanded Admin Access** (January 2025): Added User ID 2 (Aaron Orellana) to admin privileges - admin access now granted to userId 0, 1, and 2, with protection against admin account deletion
- **Separate Partner Panel System** (January 2025): Moved Partner Panel to dedicated /partners route with separate navigation button - partner access granted to userId 0, 1, and 2 (same as admin but independent system)
- **Comprehensive Admin Panel Overhaul** (January 2025): Completely rebuilt admin dashboard with tabbed interface including User Management, System Status, and Partner Panel sections - added enhanced user table with dropdown actions, edit capabilities, and admin log viewing
- **Advanced Database Schema** (January 2025): Added new tables for admin_logs, partners, research_requests, and partner_conversations to support comprehensive administrative features and partner collaboration system
- **Enhanced Storage Layer** (January 2025): Implemented complete storage methods for admin logs tracking, partner management, research requests, and conversation systems with full CRUD operations
- **IT Administration Section** (January 2025): Created system monitoring dashboard with database status, API health checks, performance metrics, and quick action buttons for system maintenance
- **Partner Panel System** (January 2025): Developed comprehensive partner collaboration platform with research request management, client communication features, and insight publishing capabilities
- **Admin Actions Logging** (January 2025): Implemented audit trail system tracking all administrative actions including subscription changes, user modifications, and system operations with detailed logging
- **User Management Enhancement** (January 2025): Added subscription tier editing, user status monitoring, and detailed user activity tracking with admin log integration
- **Research Request System** (January 2025): Implemented comprehensive research request system for professional subscribers - users can request company or sector analysis through dashboard dialog, requests are sent to Partner Panel for review and management
- **Research Request System Bug Fix** (January 2025): Resolved critical 500 error in research request submission - database schema required both 'title' and 'category' fields which weren't being properly populated from API endpoint, fixed by adding auto-generated title and mapping type to category