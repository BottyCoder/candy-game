import cron from 'node-cron';
import {
  deleteOldGameSessions,
  getPlayersWithNoRecentGames,
  deletePlayer,
} from '../db/queries.js';
import logger from './logger.js';

// Run cleanup daily at 2 AM
export function startCleanupJob(daysOld = 60) {
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info(`Starting data retention cleanup (older than ${daysOld} days)...`);

      // Delete old game sessions
      const deletedSessions = await deleteOldGameSessions(daysOld);
      logger.info(`Deleted ${deletedSessions} old game sessions`);

      // Find players with no recent games
      const oldPlayers = await getPlayersWithNoRecentGames(daysOld);

      // Delete old players
      let deletedPlayers = 0;
      for (const player of oldPlayers) {
        await deletePlayer(player.id);
        deletedPlayers++;
      }
      logger.info(`Deleted ${deletedPlayers} old players`);

      logger.info('Data retention cleanup completed');
    } catch (error) {
      logger.error('Error during data retention cleanup:', error);
    }
  });

  logger.info(`Data retention cleanup job scheduled (runs daily at 2 AM, deletes records older than ${daysOld} days)`);
}
