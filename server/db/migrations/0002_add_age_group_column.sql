-- Migration: Add age_group column to players table
-- Created: 2026-01-28
-- Description: Adds age group field for competition entry (Under 18, 18-25, etc.)

ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "age_group" varchar(20);
