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
  - Added new ContributionMetrics component showing contributor details and gift statistics
  - Displays contributor count, total gifts, average gift amount, and ranked contributor list
  - Updated sharing functionality to include only copy link and WhatsApp options (removed Twitter/Facebook)
  - Added sharing modal in project cards with copy and WhatsApp options
  - Added dedicated sharing block within project pages
  - Optimized mobile responsive design for better project visibility
  - Improved landing page: removed "Ver como funciona" button, eliminated "Sin comisiones" text
  - Added favicon with RegaloYa branding
  - Created comprehensive FAQ section for user confidence and SEO positioning
  - Added payment methods accessibility message in benefits section
  - Enhanced meta tags and page titles for better SEO optimization
  - Strengthened security messaging highlighting MercadoPago integration across all sections
  - Updated FAQs to emphasize MercadoPago's security and trustworthiness
  - Enhanced features section to highlight secure payment processing
  - Improved authentication page with color-coded tabs and visual indicators
  - Added clear differentiation between login and registration states to prevent user confusion
  - Implemented gradient buttons and contextual messages for better UX
  - Enhanced project creation process: removed target amount requirement from step 1
  - Added helpful text for location field suggesting Google Maps links or manual address
  - Removed alias requirement from step 3 payment configuration
  - Added feedback screen during project creation with loading animation and status updates
- July 6, 2025. Created specialized landing page for school birthday collections
  - Added new landing page at /colecta-cumpleanos-escuela targeting "colecta cumpleaños niños escuela" keyword
  - Implemented complete SEO optimization with meta tags, structured content, and keyword targeting
  - Added new footer structure with "Soluciones por Industria" section linking to specialized pages
  - Created dedicated content for school parents organizing birthday gift collections
  - Maintained founder photos section and consistent branding across all pages
  - Configured server to serve founder images from attached_assets directory
  - Enhanced footer navigation with industry-specific solutions and discovery sections
- July 7, 2025. Extended specialized landing pages ecosystem
  - Created /eventos-familiares landing page targeting family event gift collections
  - Created /regalos-corporativos landing page targeting corporate gift collections
  - Created /colecta-baby-shower landing page targeting baby shower gift collections
  - Created /colecta-casamientos landing page targeting wedding gift collections
  - Created /colecta-cumpleanos-adultos landing page targeting adult birthday gift collections
  - Created /colecta-despedida-solteros landing page targeting bachelor/bachelorette party gift collections
  - All 6 specialized pages follow identical design structure as main landing page
  - Added proper routing in App.tsx for all new specialized pages
  - Updated footer navigation across all pages to interconnect the complete landing page ecosystem
  - Each specialized page includes targeted content, testimonials, FAQs and features for specific use cases
  - All pages implement SEO optimization with specific meta titles, descriptions, and keyword targeting
  - Maintained consistent founder photos section and RegaloYa branding across all specialized pages
  - Added WhatsApp chaos description with emojis that effectively resonates with target audiences
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.