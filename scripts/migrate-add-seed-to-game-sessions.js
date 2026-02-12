#!/usr/bin/env node
/**
 * Production migration: add "seed" column to game_sessions.
 *
 * Run on Development first (e.g. npm run db:push or apply 0003 SQL manually),
 * then on the server with Production DATABASE_URL:
 *
 *   DATABASE_URL="postgresql://..." node scripts/migrate-add-seed-to-game-sessions.js
 *
 * Or from project root with .env.production:
 *   node -r dotenv/config scripts/migrate-add-seed-to-game-sessions.js dotenv_config_path=.env.production
 */

import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Set it to your Production DB URL.');
    process.exit(1);
  }

  console.log('Applying migration: add seed column to game_sessions...');
  const sql = postgres(url, { max: 1 });
  try {
    await sql`ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "seed" integer`;
    console.log('Done. game_sessions.seed column is in place.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
