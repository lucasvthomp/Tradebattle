# Paper Trading Competition Platform

## Overview
A comprehensive paper trading competition platform enabling users to participate in global trading competitions. It offers virtual portfolio management, real-time market data, and competitive leaderboards, allowing aspiring traders to test skills in a risk-free environment with authentic market conditions. The platform fosters competition through features like tournament-specific trading, achievement systems, and real-time leaderboards, aiming to be a central hub for virtual trading challenges.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS variables
- **Animations**: Framer Motion
- **Internationalization**: Comprehensive multi-language support (English, Portuguese, Spanish)
- **Currency System**: Supports 10 currencies with proper formatting
- **Signup Flow**: Multi-step signup experience with preferences selection
- **Theming**: Dark mode implementation with consistent color schemes

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (Neon Database provider)
- **Authentication**: Replit Auth with OpenID Connect (username-based)
- **Session Management**: PostgreSQL-backed sessions
- **Monorepo Structure**: Client, server, and shared code separation
- **API Design**: RESTful with middleware-based protection, centralized error handling, and request logging
- **Financial Data Integration**: Real-time and historical stock data from Yahoo Finance API (previously Finnhub, Twelve Data, Polygon.io)
- **Tournament Management**: Isolated tournament balances, unique codes, buy-ins, and customizable trading restrictions
- **Achievement System**: Tiered badge system based on trading accomplishments and milestones
- **Chat System**: Real-time global and tournament-specific chat functionality
- **Market Status**: Real-time market open/close detection with disclaimers and trade scheduling

### Key Design Decisions
- **TypeScript-First**: End-to-end TypeScript implementation.
- **Component-Driven UI**: Reusable components for consistent design.
- **Data Flow**: User authentication, paper trading, competition participation, portfolio management, and real-time updates.
- **Scalability**: Designed to handle real-time market data and a growing user base.
- **User Experience**: Focus on intuitive interfaces, clear navigation, and engaging competitive features.
- **Unified Dashboard**: Consolidation of personal portfolio and tournament trading into a single interface.
- **Dynamic Home Page**: Dual home page system for unauthenticated (marketing-focused) and authenticated (gaming-style hub) users.

## External Dependencies
- **Database**: Neon PostgreSQL
- **Authentication**: Replit Auth
- **Financial Data**: Yahoo Finance API (via `yahoo-finance2` NPM package)
- **UI Components**: Radix UI, shadcn/ui
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form, Zod
- **Date Handling**: date-fns
- **Charting**: Recharts (for portfolio graphs)