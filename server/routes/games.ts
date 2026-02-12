import { Router, Request, Response } from 'express';
import {
  getPlayerByMobile,
  createGameSession,
  getPlayerBestScore,
  getPlayerRank,
} from '../db/queries.js';
import { validateScoreSubmission } from '../middleware/validation.js';
import { scoreSubmissionLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

const router = Router();

// Submit game score
router.post(
  '/submit',
  scoreSubmissionLimiter,
  validateScoreSubmission,
  async (req: Request, res: Response, next) => {
    try {
      const { mobile, score, matchesMade, seed } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;

      // Find player
      const player = await getPlayerByMobile(mobile);
      if (!player) {
        return next(new AppError(404, 'Player not found. Please register first.'));
      }

      // Get previous best score
      const previousBest = await getPlayerBestScore(player.id);

      // Create game session (seed = grid seed played for verification)
      const session = await createGameSession({
        playerId: player.id,
        score,
        matchesMade,
        seed: seed != null ? Number(seed) : undefined,
        ipAddress,
      });

      // Check if this is a new best score
      const isBestScore = score > previousBest;

      // Get new rank
      const rank = await getPlayerRank(player.id);

      logger.info(
        `Game score submitted: Player ${player.id} - Score: ${score} - Best: ${isBestScore}`
      );

      res.json({
        success: true,
        rank: rank || null,
        isBestScore,
        personalBest: isBestScore ? score : previousBest,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
