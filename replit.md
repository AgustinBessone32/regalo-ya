# RegaloYa - Collaborative Gift Collection Platform

## Overview

RegaloYa is a full-stack web application for organizing collaborative gift collections. The platform allows users to create fundraising projects for special events, invite others to contribute, and track progress toward funding goals. Built with modern web technologies, it features a React frontend with TypeScript, Express.js backend, PostgreSQL database with Drizzle ORM, and includes features like file uploads, payment integration, and real-time updates.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, Vite build tool, TailwindCSS and shadcn/ui components
- **Backend**: Express.js with TypeScript, session-based authentication
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Storage**: UploadThing integration for image uploads
- **Payment Processing**: MercadoPago integration for handling contributions
- **Deployment**: Configured for Replit with auto-scaling deployment

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **TanStack Query** for server state management and caching
- **Wouter** for lightweight client-side routing
- **React Hook Form** with Zod validation for form handling
- **shadcn/ui** component library built on Radix UI primitives
- **TailwindCSS** for styling with custom theme configuration

### Backend Architecture
- **Express.js** server with TypeScript
- **Passport.js** with local strategy for authentication
- **Express sessions** with memory store for development
- **Drizzle ORM** for database operations with migration support
- **File upload handling** via UploadThing Express adapter

### Database Schema
The application uses PostgreSQL with the following core entities:
- **Users**: Authentication and user management
- **Projects**: Main fundraising projects with targets and details
- **Contributions**: Individual donations to projects
- **Reactions**: Emoji reactions to projects
- **Shares**: Social sharing tracking

### Authentication & Authorization
- Session-based authentication using Passport.js
- Password hashing with scrypt for security
- Role-based access control for project ownership
- Protected routes requiring authentication

## Data Flow

1. **User Registration/Login**: Handled via Passport.js with secure password hashing
2. **Project Creation**: Multi-step wizard form with image upload capability
3. **Contribution Flow**: Form submission with real-time progress updates
4. **File Uploads**: Direct integration with UploadThing for image storage
5. **Payment Processing**: Integration with MercadoPago for handling monetary contributions
6. **Real-time Updates**: Query invalidation and refetching for live data sync

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL driver for serverless environments
- **drizzle-orm**: Type-safe ORM with migration support
- **@uploadthing/react**: File upload handling
- **mercadopago**: Payment processing integration
- **@tanstack/react-query**: Server state management
- **passport**: Authentication framework

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **canvas-confetti**: Celebration animations
- **date-fns**: Date manipulation utilities

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Build Process
- **Development**: `npm run dev` - Runs TypeScript server with hot reload
- **Production Build**: `npm run build` - Builds both client and server
- **Production Start**: `npm run start` - Runs compiled production server

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable
- **File Uploads**: Requires `UPLOADTHING_APP_ID` and `UPLOADTHING_SECRET`
- **Payment**: Requires MercadoPago API credentials
- **Session**: Uses `REPL_ID` or fallback secret for session management

### Auto-scaling Deployment
- Configured for Replit's auto-scaling deployment target
- Port 5000 mapped to external port 80
- Build and run scripts defined for production deployment

## Changelog

- February 16, 2025. Successfully migrated from Replit Agent to Replit environment
  - Database setup complete with all tables and relationships
  - UploadThing API keys configured for file uploads
  - MercadoPago payment URLs fixed to use correct success redirect format
  - Server configured to run on port 5000 with proper binding
  - Progress bars now calculate from approved payments table instead of manual contributions
  - Contribution counts updated to show actual payment counts from MercadoPago
  - Added progress percentage calculation based on target amounts
  - Mobile view optimized for project detail pages
  - Removed CBU/Cash payment options in favor of MercadoPago only
  - Added fixed amount selection feature for contributors
  - Added recipient account field for fund transfer after project completion
  - Removed all participation analytics and metrics (BudgetAnalytics component)
  - Simplified project display to focus only on essential contribution information
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.