import { Router, Request, Response } from 'express';
import { getLeaderboard } from '../db/queries.js';
import { leaderboardLimiter } from '../middleware/rateLimit.js';
import logger from '../utils/logger.js';

const router = Router();

// Get leaderboard
router.get('/', leaderboardLimiter, async (req: Request, res: Response, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const maxLimit = 500; // Cap at 500 for performance

    const actualLimit = Math.min(limit, maxLimit);
    const leaderboard = await getLeaderboard(actualLimit);

    logger.debug(`Leaderboard requested: limit=${actualLimit}, returned=${leaderboard.length}`);

    res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
