# Valentine's Candy Crush Game

## Overview
A Valentine's Day themed Match-3 puzzle game with mobile-first design. Players register with their details, play a timed matching game, and compete on a leaderboard.

## Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with glassmorphism design
- **Build Tool**: Vite (dev server on port 5000)
- **State**: React hooks for local state management

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT for admin panel
- **Port**: 3001 (proxied through Vite)

### Database Schema
- **players**: User registration data (name, mobile, email)
- **game_sessions**: Game scores and statistics
- **admin_users**: Admin panel authentication

## Project Structure
```
├── src/              # React frontend
│   ├── components/   # UI components
│   ├── utils/        # Utility functions
│   └── App.tsx       # Main app component
├── server/           # Express backend
│   ├── config/       # Environment and database config
│   ├── db/           # Drizzle schema and queries
│   ├── routes/       # API endpoints
│   └── index.ts      # Server entry point
├── admin/            # Static admin panel
└── drizzle.config.ts # Drizzle Kit configuration
```

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Backend server port (3001)
- `JWT_SECRET`: Secret for JWT tokens
- `ADMIN_USERNAME`: Admin login username
- `ADMIN_PASSWORD`: Admin login password
- `CORS_ORIGIN`: Allowed CORS origins

## Scripts
- `npm run dev`: Start Vite frontend dev server
- `npm run server:dev`: Start Express backend with tsx
- `npm run db:push`: Push schema changes to database
- `npm run build`: Build for production

## Recent Changes
- Configured Vite to allow all hosts for Replit proxy
- Set up PostgreSQL database with Drizzle
- Fixed Tailwind CSS class compatibility issues
