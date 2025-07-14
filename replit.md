# Paper Trading Competition Platform

## Overview

A comprehensive paper trading competition platform that connects participants with trading competitions worldwide. The system provides virtual portfolio management, real-time market data, and competitive leaderboards. Built for aspiring traders who want to test their skills in a risk-free environment with authentic market conditions.

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
- **Users**: Stores user profiles with trading account balances
- **Watchlist**: User-specific stock/company tracking for competition preparation
- **Stock Purchases**: Paper trading transaction records
- **Contact Submissions**: Customer inquiries and feedback
- **Admin Logs**: Administrative action tracking
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

1. **User Authentication**: Users authenticate via email/password, creating trading accounts
2. **Paper Trading**: Authenticated users can buy/sell stocks with virtual money
3. **Competition Participation**: Users join trading competitions through the platform
4. **Portfolio Management**: Real-time tracking of virtual portfolios and performance
5. **Real-time Updates**: Live market data and portfolio updates via React Query

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
- **Platform Transformation** (January 2025): Complete transformation from investment research platform to paper trading competition platform - removed all studies, news, research insights, partner panels, and subscription tiers while preserving core trading functionality
- **Simplified Navigation** (January 2025): Streamlined navigation by removing Studies, News, and Pricing routes, focusing on core competition features
- **Landing Page Redesign** (January 2025): Updated hero and about sections to focus on paper trading competitions, leaderboards, and virtual portfolio management
- **Database Schema Cleanup** (January 2025): Removed partner-related tables (partners, research_requests, partner_conversations, chat_messages, research_insights, research_publications) and subscription tier system
- **API Route Simplification** (January 2025): Cleaned up backend routes by removing subscription management, research features, and partner system endpoints while maintaining trading and watchlist functionality
- **User Profile Simplification** (January 2025): Removed subscription tier field from user profiles - all users now have equal access to platform features
- **Trading System Preservation** (January 2025): Maintained complete trading functionality including virtual balance management, stock purchases, portfolio tracking, and real-time market data integration
- **Competition-Focused Architecture** (January 2025): Restructured the platform to serve as a middleman between trading competitions and participants rather than a research platform
- **Dashboard Cleanup** (January 2025): Removed all remaining research-related components, state variables, and functions from dashboard - now purely focused on trading and watchlist management
- **Complete Dark Mode Implementation** (January 2025): Implemented comprehensive dark mode theme with dark gray-blue background (HSL 220, 25%, 14%) and light text throughout entire application
- **Admin Panel Simplification** (January 2025): Removed partner panel from admin interface, simplified subscription tiers to only free/premium, and added proper subscription tier update API endpoint
- **CSS Variable System**: Updated all CSS variables to use dark gray-blue color scheme with proper contrast ratios for accessibility
- **Component Styling Update**: Updated all components (header, footer, hero, about, landing page) to use CSS variables for consistent dark mode appearance
- **Theme Provider Override**: Modified theme provider to always use dark mode, removing light mode options to maintain consistent visual experience
- **Footer Content Update**: Updated footer to reflect paper trading competition platform focus instead of investment research platform
- **Tournament Balance System Implementation** (January 2025): Successfully implemented unique tournament balance system where each tournament maintains its own separate balance, buy-in amount, name, code, and member count tied to tournament ID
- **Tournament-Specific Trading**: Each tournament now has completely isolated balance tracking, purchase history, and portfolio management
- **Automatic Tournament Selection**: System automatically selects first available tournament and properly manages tournament switching with real-time balance updates
- **Fixed Tournament Balance Queries**: Resolved React Query caching issues that were causing all tournaments to show the same balance - each tournament now displays its correct unique balance
- **Tournament Purchase System**: Fixed stock purchasing system to work with tournament-specific balances and validation
- **Authentication Pages Dark Mode** (January 2025): Updated login and signup pages to use consistent dark mode styling with proper CSS variables and color schemes
- **Portfolio Enhancement** (January 2025): Added comprehensive portfolio table with purchase price, current price, dollar/percentage change calculations, and real-time price updates
- **Buy-in System Removal** (January 2025): Completely removed buy-in functionality from the entire platform - tournaments now provide standard $10,000 starting balance without buy-in requirements, simplifying tournament creation and participation
- **Personal Portfolio Trading System** (January 2025): Implemented complete personal portfolio trading system with stock purchase/sell functionality, real-time price lookup, balance validation, and transaction processing
- **Personal Trading UI** (January 2025): Added "Buy Stock" and "Sell" buttons with modal dialogs for stock trading, real-time price fetching, and comprehensive transaction validation
- **Personal Portfolio API** (January 2025): Created complete API endpoints for personal portfolio trading including purchase, sell, and portfolio management with database integration
- **Leaderboard System** (January 2025): Added comprehensive leaderboard page with tournaments and personal portfolio sub-tabs, real-time portfolio value calculations, ranking system with trophy icons, and user performance metrics with full dark mode support
- **Tournament Countdown Timer** (January 2025): Added real-time countdown timer to tournament info sections showing remaining time based on selected timeframe, updates every second with different display formats (days/hours/minutes for longer durations, seconds for shorter)
- **Account Page Dark Mode Fix** (January 2025): Fixed account/profile page dark mode styling by replacing all hardcoded colors with CSS variables (bg-background, text-foreground, text-muted-foreground, etc.) for proper theme consistency
- **People Browser System** (January 2025): Implemented comprehensive people browsing system with public profile viewing, user achievement displays, and social discovery features
- **Profile System Restructure** (January 2025): Split profile page into Public Profile and Account Settings sections - public profile shows achievements, trading stats, and visibility settings while account settings manages private information
- **User Public API Endpoints** (January 2025): Added API endpoints for fetching all users (/api/users/public) and individual user profiles (/api/users/public/:userId) with only public information exposed
- **Navigation Enhancement** (January 2025): Added People tab to main navigation allowing authenticated users to browse all platform users and view public profiles with achievements and trading statistics
- **Real Member Since Dates** (January 2025): Updated People page to display actual user creation dates instead of hardcoded mock values, showing authentic "Member Since" information from database
- **5-Tier Badge System** (January 2025): Implemented comprehensive achievement badge system with Gray (Common), Green (Uncommon), Blue (Rare), Purple (Epic), and Orange (Legendary) tiers based on specific trading accomplishments and milestones