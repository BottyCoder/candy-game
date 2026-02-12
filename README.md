# Candy Game

A production-ready Match-3 game with backend API for player registration, score tracking, and leaderboard management. Clone of the Valentine's game; use a new database and deploy separately.

## Features

- **Match-3 Gameplay**: Classic candy crush-style matching game
- **Player Registration**: Register with name, mobile, and optional email
- **Score Tracking**: All game attempts stored, best score displayed
- **Real-time Leaderboard**: Shows top players with best scores
- **Admin Panel**: Dashboard for viewing stats and exporting data
- **Data Export**: CSV, Excel, and JSON export options
- **60-Day Data Retention**: Automatic cleanup of old records

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS

### Backend
- Express.js (Node.js/TypeScript)
- PostgreSQL
- Drizzle ORM
- JWT Authentication
- Winston Logging

## Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository** (or ensure you're in the project directory)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Random 32+ character string
   - `ADMIN_USERNAME` - Admin login username
   - `ADMIN_PASSWORD` - Admin login password
   - `CORS_ORIGIN` - Frontend origin (e.g., `http://localhost:5173`)

4. **Set up the database:**
   ```bash
   npm run db:push
   ```
   
   This will create the database schema using Drizzle.

5. **Start the development server:**
   ```bash
   # Terminal 1: Backend
   npm run server:dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Admin Panel: http://localhost:3001/admin

## Production Build

```bash
# Build frontend
npm run build

# Build backend
npm run server:build

# Start production server
npm run server:start
```

## API Endpoints

### Public Endpoints

- `POST /api/players/register` - Register a new player
- `POST /api/games/submit` - Submit a game score
- `GET /api/leaderboard` - Get leaderboard (best scores)
- `GET /api/players/:mobile/stats` - Get player statistics

### Admin Endpoints (Require Authentication)

- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/export/registrations` - Export registrations
- `GET /api/admin/export/scores` - Export scores
- `GET /api/admin/export/leaderboard` - Export leaderboard
- `GET /api/admin/export/analytics` - Export analytics (JSON)

## Database Schema

- **players**: Player registrations
- **game_sessions**: All game attempts with scores
- **admin_users**: Admin authentication

## Data Retention

The system automatically deletes records older than 60 days via a scheduled job that runs daily at 2 AM.

## Deployment to Replit

1. Push code to a Git repository
2. Clone the repository in Replit
3. Replit's agent will auto-detect and configure the Node.js project
4. Set environment variables in Replit Secrets:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `CORS_ORIGIN`
5. The server will start automatically

## Admin Panel

Access the admin panel at `/admin` after deployment. Login with the credentials set in your environment variables.

Features:
- Real-time statistics dashboard
- Top 10 leaderboard preview
- Data export (CSV, Excel, JSON)
- Analytics export

## License

Proprietary - Valentine's Day Competition Game
