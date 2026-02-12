import { Router, Request, Response, NextFunction } from 'express';
import {
  getTotalRegistrations,
  getTotalGames,
  getUniquePlayers,
  getAverageScore,
  getTopScore,
  getLeaderboard,
  getPlayersByName,
} from '../../db/queries.js';
import { authenticateAdmin } from '../../middleware/auth.js';
import logger from '../../utils/logger.js';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// Get dashboard stats
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalRegistrations,
      totalGames,
      uniquePlayers,
      averageScore,
      topScore,
    ] = await Promise.all([
      getTotalRegistrations(),
      getTotalGames(),
      getUniquePlayers(),
      getAverageScore(),
      getTopScore(),
    ]);

    const topLeaderboard = await getLeaderboard(10);

    res.json({
      success: true,
      stats: {
        totalRegistrations,
        totalGames,
        uniquePlayers,
        averageScore,
        topScore,
        gamesPerPlayer: uniquePlayers > 0 ? (totalGames / uniquePlayers).toFixed(2) : '0',
      },
      topLeaderboard,
    });
  } catch (error) {
    next(error);
  }
});

// Look up players by name (e.g. to see which mobile numbers are linked to "Jas")
router.get('/players/by-name', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = typeof req.query.name === 'string' ? req.query.name : '';
    if (!name) {
      return res.status(400).json({ success: false, error: 'Query param "name" is required' });
    }
    const players = await getPlayersByName(name);
    res.json({ success: true, players });
  } catch (error) {
    next(error);
  }
});

export default router;
