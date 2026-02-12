-- Migration: Add seed column to game_sessions table
-- Run on Development first, then on Production via the production migration script.
-- Description: Tracks the grid seed number played for each session so you can verify/replay.

ALTER TABLE "game_sessions" ADD COLUMN IF NOT EXISTS "seed" integer;
