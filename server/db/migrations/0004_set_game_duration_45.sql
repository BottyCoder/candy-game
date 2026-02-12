-- Set game_duration to 45 seconds for all existing game_sessions.
-- Run this in your SQL console (Development and/or Production) after deploying the schema default change.

UPDATE game_sessions SET game_duration = 45 WHERE game_duration != 45;
