import { pgTable, serial, varchar, integer, timestamp, boolean, text, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Players table
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  mobile: varchar('mobile', { length: 20 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  ageGroup: varchar('age_group', { length: 20 }),
  suburb: varchar('suburb', { length: 100 }),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  mobileIdx: index('players_mobile_idx').on(table.mobile),
  registeredAtIdx: index('players_registered_at_idx').on(table.registeredAt),
}));

// Game sessions table
export const gameSessions = pgTable('game_sessions', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').references(() => players.id, { onDelete: 'cascade' }).notNull(),
  score: integer('score').notNull(),
  matchesMade: integer('matches_made'),
  gameDuration: integer('game_duration').default(45).notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
  isBestScore: boolean('is_best_score').default(false).notNull(),
  seed: integer('seed'), // grid seed played for this session (for verification)
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  playerIdIdx: index('game_sessions_player_id_idx').on(table.playerId),
  scoreIdx: index('game_sessions_score_idx').on(table.score),
  completedAtIdx: index('game_sessions_completed_at_idx').on(table.completedAt),
  bestScoreIdx: index('game_sessions_best_score_idx').on(table.isBestScore),
  playerScoreIdx: index('game_sessions_player_score_idx').on(table.playerId, table.score),
}));

// Admin users table
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('admin').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
});

// Relations
export const playersRelations = relations(players, ({ many }) => ({
  gameSessions: many(gameSessions),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one }) => ({
  player: one(players, {
    fields: [gameSessions.playerId],
    references: [players.id],
  }),
}));
