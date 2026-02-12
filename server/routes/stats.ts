import { Router, Request, Response, NextFunction } from 'express';
import {
  getLeaderboardAll,
  getAllGameSessions,
  getGameSessionsPaginated,
  getTotalRegistrations,
  getTotalGames,
  getUniquePlayers,
  getCountByAgeGroup,
  getCountBySuburb,
} from '../db/queries.js';
import logger from '../utils/logger.js';

const router = Router();

/** Summary stats for stats page. Public, no auth. */
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUniqueEntries, totalGamesPlayed, uniquePlayers] = await Promise.all([
      getTotalRegistrations(),
      getTotalGames(),
      getUniquePlayers(),
    ]);
    const averageTimesPlayedPerPerson =
      uniquePlayers > 0 ? Math.round((totalGamesPlayed / uniquePlayers) * 100) / 100 : 0;
    res.json({
      success: true,
      summary: {
        totalUniqueEntries,
        totalGamesPlayed,
        uniquePlayers, // same as leaderboard row count (one row per player with at least one game)
        averageTimesPlayedPerPerson,
      },
    });
  } catch (error) {
    next(error);
  }
});

/** Full leaderboard (no limit). Public, no auth. */
router.get('/leaderboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await getLeaderboardAll();
    logger.debug(`Stats leaderboard: ${leaderboard.length} rows`);
    res.json({ success: true, leaderboard });
  } catch (error) {
    next(error);
  }
});

/** Game sessions. Public, no auth. With ?page=1&limit=20 returns paginated; without params returns all (for Games per User). */
router.get('/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limitParam = parseInt(req.query.limit as string);
    const limit = limitParam > 0 ? Math.min(limitParam, 100) : 0;

    if (limit > 0) {
      const { sessions, total } = await getGameSessionsPaginated(page, limit);
      logger.debug(`Stats sessions: page=${page}, limit=${limit}, total=${total}`);
      res.json({ success: true, sessions, total, page, limit });
    } else {
      const sessions = await getAllGameSessions();
      logger.debug(`Stats sessions: all, ${sessions.length} rows`);
      res.json({ success: true, sessions });
    }
  } catch (error) {
    next(error);
  }
});

/** Count per age group (all offered groups, count on right). Public, no auth. */
router.get('/age-group', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ageGroup = await getCountByAgeGroup();
    res.json({ success: true, ageGroup });
  } catch (error) {
    next(error);
  }
});

/** Count per suburb (suburb on left, count on right). Public, no auth. */
router.get('/suburb', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suburb = await getCountBySuburb();
    res.json({ success: true, suburb });
  } catch (error) {
    next(error);
  }
});

export default router;
