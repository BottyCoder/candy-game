import { Router, Request, Response } from 'express';
import { db } from '../../config/database.js';
import { players, gameSessions } from '../../db/schema.js';
import { authenticateAdmin } from '../../middleware/auth.js';
import { adminExportLimiter } from '../../middleware/rateLimit.js';
import { sql } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import logger from '../../utils/logger.js';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);
router.use(adminExportLimiter);

// Export registrations
router.get('/registrations', async (req: Request, res: Response, next) => {
  try {
    const format = (req.query.format as string) || 'csv';
    const allPlayers = await db.select().from(players).orderBy(players.registeredAt);

    // Get best scores for each player
    const playersWithScores = await Promise.all(
      allPlayers.map(async (player) => {
        const [bestScoreResult] = await db
          .select({ score: sql<number>`MAX(${gameSessions.score})` })
          .from(gameSessions)
          .where(sql`${gameSessions.playerId} = ${player.id}`);

        const [gameCountResult] = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(gameSessions)
          .where(sql`${gameSessions.playerId} = ${player.id}`);

        return {
          Name: player.name,
          Mobile: player.mobile,
          Email: player.email || '',
          'Age Group': player.ageGroup || '',
          Suburb: player.suburb || '',
          'Registered At': player.registeredAt.toISOString(),
          'Best Score': bestScoreResult?.score || 0,
          'Total Games': gameCountResult?.count || 0,
        };
      })
    );

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=registrations.json');
      return res.json(playersWithScores);
    }

    if (format === 'xlsx' || format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(playersWithScores);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=registrations.xlsx');
      return res.send(buffer);
    }

    // CSV format (default)
    const headers = Object.keys(playersWithScores[0] || {});
    const csvRows = [
      headers.join(','),
      ...playersWithScores.map((row) =>
        headers.map((header) => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      ),
    ];
    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// Export scores
router.get('/scores', async (req: Request, res: Response, next) => {
  try {
    const format = (req.query.format as string) || 'csv';
    const allSessions = await db
      .select({
        playerName: players.name,
        mobile: players.mobile,
        score: gameSessions.score,
        matchesMade: gameSessions.matchesMade,
        completedAt: gameSessions.completedAt,
        isBestScore: gameSessions.isBestScore,
      })
      .from(gameSessions)
      .innerJoin(players, sql`${gameSessions.playerId} = ${players.id}`)
      .orderBy(gameSessions.completedAt);

    const scoresData = allSessions.map((session) => ({
      'Player Name': session.playerName,
      Mobile: session.mobile,
      Score: session.score,
      'Matches Made': session.matchesMade,
      'Completed At': session.completedAt.toISOString(),
      'Is Best Score': session.isBestScore ? 'Yes' : 'No',
    }));

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=scores.json');
      return res.json(scoresData);
    }

    if (format === 'xlsx' || format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(scoresData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Scores');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=scores.xlsx');
      return res.send(buffer);
    }

    // CSV format (default)
    const headers = Object.keys(scoresData[0] || {});
    const csvRows = [
      headers.join(','),
      ...scoresData.map((row) =>
        headers.map((header) => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      ),
    ];
    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=scores.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// Export leaderboard
router.get('/leaderboard', async (req: Request, res: Response, next) => {
  try {
    const format = (req.query.format as string) || 'csv';
    const limit = parseInt(req.query.limit as string) || 100;
    const leaderboard = await db
      .select({
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY MAX(${gameSessions.score}) DESC)`,
        name: players.name,
        mobile: players.mobile,
        score: sql<number>`MAX(${gameSessions.score})`,
        totalGames: sql<number>`COUNT(${gameSessions.id})`,
      })
      .from(players)
      .innerJoin(gameSessions, sql`${players.id} = ${gameSessions.playerId}`)
      .groupBy(players.id, players.name, players.mobile)
      .orderBy(sql`MAX(${gameSessions.score}) DESC`)
      .limit(limit);

    const leaderboardData = leaderboard.map((row) => ({
      Rank: row.rank,
      Name: row.name,
      Mobile: row.mobile,
      Score: row.score,
      'Total Games': row.totalGames,
    }));

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=leaderboard.json');
      return res.json(leaderboardData);
    }

    if (format === 'xlsx' || format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(leaderboardData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leaderboard');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=leaderboard.xlsx');
      return res.send(buffer);
    }

    // CSV format (default)
    const headers = Object.keys(leaderboardData[0] || {});
    const csvRows = [
      headers.join(','),
      ...leaderboardData.map((row) =>
        headers.map((header) => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      ),
    ];
    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leaderboard.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// Export analytics
router.get('/analytics', async (req: Request, res: Response, next) => {
  try {
    const [
      totalRegistrations,
      totalGames,
      uniquePlayers,
      averageScore,
      topScore,
    ] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` }).from(players),
      db.select({ count: sql<number>`COUNT(*)` }).from(gameSessions),
      db.select({ count: sql<number>`COUNT(DISTINCT ${gameSessions.playerId})` }).from(gameSessions),
      db.select({ avg: sql<number>`AVG(${gameSessions.score})` }).from(gameSessions),
      db.select({ max: sql<number>`MAX(${gameSessions.score})` }).from(gameSessions),
    ]);

    const analytics = {
      totalRegistrations: totalRegistrations[0]?.count || 0,
      totalGamesPlayed: totalGames[0]?.count || 0,
      uniquePlayers: uniquePlayers[0]?.count || 0,
      averageScore: averageScore[0]?.avg ? Math.round(averageScore[0].avg) : 0,
      topScore: topScore[0]?.max || 0,
      gamesPerPlayer: uniquePlayers[0]?.count
        ? (totalGames[0]?.count || 0) / (uniquePlayers[0].count)
        : 0,
      period: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.json');
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

export default router;
