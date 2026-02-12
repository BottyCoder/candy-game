import rateLimit from 'express-rate-limit';

// Registration rate limit: 5 per IP per hour
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many registration attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Score submission rate limit: 10 per mobile per hour
// Note: This is a basic IP-based limiter; for mobile-based limiting, 
// we'll need to check in the route handler
export const scoreSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many score submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Leaderboard rate limit: 60 per IP per minute
export const leaderboardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Too many leaderboard requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin export rate limit: 10 per hour
export const adminExportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many export requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
