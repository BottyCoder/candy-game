-- Migration: Add suburb column to players table
-- Created: 2026-01-28
-- Description: Adds suburb field to players table for competition entry

ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "suburb" varchar(100);
