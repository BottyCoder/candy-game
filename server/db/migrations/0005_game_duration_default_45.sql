-- Set column default to 45 so new rows get 45 even if inserted without game_duration.
-- Run on Development and Production.

ALTER TABLE game_sessions ALTER COLUMN game_duration SET DEFAULT 45;
