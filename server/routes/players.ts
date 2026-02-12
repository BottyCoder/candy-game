import { Router, Request, Response } from 'express';
import { createPlayer, getPlayerByMobile, getPlayerById } from '../db/queries.js';
import { validateRegistration } from '../middleware/validation.js';
import { registrationLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

const router = Router();

// Register a new player
router.post(
  '/register',
  registrationLimiter,
  validateRegistration,
  async (req: Request, res: Response, next) => {
    try {
      const { name, mobile, ageGroup, suburb, email } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      // Check if player already exists
      const existingPlayer = await getPlayerByMobile(mobile);
      if (existingPlayer) {
        logger.info(`Player registration attempt - already exists: ${mobile}`);
        return res.json({
          success: true,
          playerId: existingPlayer.id,
          message: 'Player already registered',
        });
      }

      // Create new player
      const player = await createPlayer({
        name,
        mobile,
        ageGroup: ageGroup || undefined,
        suburb,
        email: email || undefined,
        ipAddress,
        userAgent,
      });

      logger.info(`New player registered: ${player.id} - ${mobile}`);

      res.json({
        success: true,
        playerId: player.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get player stats
router.get('/:mobile/stats', async (req: Request, res: Response, next) => {
  try {
    const { mobile } = req.params;

    const player = await getPlayerByMobile(mobile);
    if (!player) {
      return next(new AppError(404, 'Player not found'));
    }

    // Import here to avoid circular dependency
    const {
      getPlayerBestScore,
      getPlayerGameCount,
      getPlayerGames,
      getPlayerRank,
    } = await import('../db/queries.js');

    const [bestScore, totalGames, games, rank] = await Promise.all([
      getPlayerBestScore(player.id),
      getPlayerGameCount(player.id),
      getPlayerGames(player.id, 10),
      getPlayerRank(player.id),
    ]);

    res.json({
      success: true,
      player: {
        id: player.id,
        name: player.name,
        mobile: player.mobile,
        email: player.email,
        registeredAt: player.registeredAt,
      },
      stats: {
        bestScore,
        totalGames,
        rank: rank || null,
        games: games.map((g: { score: number; matchesMade: number | null; completedAt: Date; isBestScore: boolean }) => ({
          score: g.score,
          matchesMade: g.matchesMade,
          completedAt: g.completedAt,
          isBestScore: g.isBestScore,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
