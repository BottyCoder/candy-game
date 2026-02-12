import { eq, desc, sql, and, gte, max, ilike } from 'drizzle-orm';
import { db } from '../config/database.js';
import { players, gameSessions, adminUsers } from './schema.js';

const AGE_GROUP_OPTIONS = ['Under 18', '18-25', '26-35', '36-45', '46-55', '56-65', '66+'] as const;

// Player queries
export async function createPlayer(data: {
  name: string;
  mobile: string;
  ageGroup?: string;
  suburb: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const [player] = await db
    .insert(players)
    .values({
      name: data.name,
      mobile: data.mobile,
      ageGroup: data.ageGroup || null,
      suburb: data.suburb,
      email: data.email || null,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
    .returning();
  return player;
}

export async function getPlayerByMobile(mobile: string) {
  const [player] = await db
    .select()
    .from(players)
    .where(eq(players.mobile, mobile))
    .limit(1);
  return player;
}

export async function getPlayerById(id: number) {
  const [player] = await db
    .select()
    .from(players)
    .where(eq(players.id, id))
    .limit(1);
  return player;
}

/** Look up players by name (case-insensitive partial match). Returns id, name, mobile for each. */
export async function getPlayersByName(name: string) {
  const search = `%${name.trim()}%`;
  return db
    .select({
      id: players.id,
      name: players.name,
      mobile: players.mobile,
    })
    .from(players)
    .where(ilike(players.name, search))
    .orderBy(players.id);
}

// Game session queries
export async function createGameSession(data: {
  playerId: number;
  score: number;
  matchesMade: number;
  seed?: number;
  ipAddress?: string;
}) {
  // Check if this is the player's best score
  const bestScoreResult = await db
    .select({ bestScore: max(gameSessions.score) })
    .from(gameSessions)
    .where(eq(gameSessions.playerId, data.playerId));

  const bestScore = bestScoreResult[0]?.bestScore || 0;
  const isBestScore = data.score > bestScore;

  const [session] = await db
    .insert(gameSessions)
    .values({
      playerId: data.playerId,
      score: data.score,
      matchesMade: data.matchesMade,
      isBestScore,
      seed: data.seed ?? null,
      ipAddress: data.ipAddress,
      gameDuration: 45,
    })
    .returning();

  // If this is a new best score, update previous best scores
  if (isBestScore) {
    await db
      .update(gameSessions)
      .set({ isBestScore: false })
      .where(
        and(
          eq(gameSessions.playerId, data.playerId),
          sql`${gameSessions.id} != ${session.id}`
        )
      );
  }

  return session;
}

export async function getPlayerBestScore(playerId: number) {
  const [result] = await db
    .select({ score: max(gameSessions.score) })
    .from(gameSessions)
    .where(eq(gameSessions.playerId, playerId));
  return result?.score || 0;
}

export async function getPlayerGameCount(playerId: number) {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(gameSessions)
    .where(eq(gameSessions.playerId, playerId));
  return result?.count || 0;
}

export async function getPlayerGames(playerId: number, limit = 10) {
  return await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.playerId, playerId))
    .orderBy(desc(gameSessions.completedAt))
    .limit(limit);
}

// Leaderboard query - shows best score per player
export async function getLeaderboard(limit = 100) {
  const result = await db
    .select({
      playerId: players.id,
      name: players.name,
      mobile: players.mobile,
      bestScore: max(gameSessions.score),
      totalGames: sql<number>`count(${gameSessions.id})`,
    })
    .from(players)
    .innerJoin(gameSessions, eq(players.id, gameSessions.playerId))
    .groupBy(players.id, players.name, players.mobile)
    .orderBy(desc(max(gameSessions.score)))
    .limit(limit);

  return result.map((row, index) => ({
    rank: index + 1,
    playerId: row.playerId,
    name: row.name,
    mobile: row.mobile,
    score: row.bestScore || 0,
    totalGames: Number(row.totalGames),
  }));
}

/** Full leaderboard for stats page (no limit). */
export async function getLeaderboardAll() {
  return getLeaderboard(100000);
}

/** All game sessions with player name, for stats page (e.g. Games per User). */
export async function getAllGameSessions() {
  const rows = await db
    .select({
      id: gameSessions.id,
      playerId: gameSessions.playerId,
      playerName: players.name,
      mobile: players.mobile,
      score: gameSessions.score,
      seed: gameSessions.seed,
      completedAt: gameSessions.completedAt,
      isBestScore: gameSessions.isBestScore,
    })
    .from(gameSessions)
    .innerJoin(players, eq(gameSessions.playerId, players.id))
    .orderBy(desc(gameSessions.completedAt));
  return rows;
}

/** Game sessions paginated (last first). Returns { sessions, total }. */
export async function getGameSessionsPaginated(page: number, limit: number) {
  const offset = (page - 1) * limit;
  const [sessions, countResult] = await Promise.all([
    db
      .select({
        id: gameSessions.id,
        playerId: gameSessions.playerId,
        playerName: players.name,
        mobile: players.mobile,
        score: gameSessions.score,
        seed: gameSessions.seed,
        completedAt: gameSessions.completedAt,
        isBestScore: gameSessions.isBestScore,
      })
      .from(gameSessions)
      .innerJoin(players, eq(gameSessions.playerId, players.id))
      .orderBy(desc(gameSessions.completedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(gameSessions),
  ]);
  const total = Number(countResult[0]?.count ?? 0);
  return { sessions, total };
}

export async function getPlayerRank(playerId: number) {
  const playerBestScore = await getPlayerBestScore(playerId);
  if (!playerBestScore) return null;

  const [result] = await db
    .select({ count: sql<number>`count(distinct ${players.id})` })
    .from(players)
    .innerJoin(gameSessions, eq(players.id, gameSessions.playerId))
    .where(
      sql`(
        SELECT MAX(${gameSessions.score}) 
        FROM ${gameSessions} 
        WHERE ${gameSessions.playerId} = ${players.id}
      ) > ${playerBestScore}`
    );

  return (result?.count || 0) + 1;
}

// Analytics queries
export async function getTotalRegistrations() {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(players);
  return result?.count || 0;
}

export async function getTotalGames() {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(gameSessions);
  return result?.count || 0;
}

export async function getUniquePlayers() {
  const [result] = await db
    .select({ count: sql<number>`count(distinct ${gameSessions.playerId})` })
    .from(gameSessions);
  return result?.count || 0;
}

/** Count of players per age group. Returns all offered age groups with count (0 if none). */
export async function getCountByAgeGroup() {
  const rows = await db
    .select({
      ageGroup: players.ageGroup,
      count: sql<number>`count(*)`,
    })
    .from(players)
    .where(sql`${players.ageGroup} is not null`)
    .groupBy(players.ageGroup);
  const map = new Map(rows.map((r) => [r.ageGroup, Number(r.count)]));
  return AGE_GROUP_OPTIONS.map((ageGroup) => ({
    ageGroup,
    count: map.get(ageGroup) ?? 0,
  }));
}

/** Count of players per suburb. */
export async function getCountBySuburb() {
  const rows = await db
    .select({
      suburb: players.suburb,
      count: sql<number>`count(*)`,
    })
    .from(players)
    .where(sql`${players.suburb} is not null and trim(${players.suburb}) != ''`)
    .groupBy(players.suburb)
    .orderBy(desc(sql`count(*)`));
  return rows.map((r) => ({ suburb: r.suburb || '', count: Number(r.count) }));
}

export async function getAverageScore() {
  const [result] = await db
    .select({ avg: sql<number>`avg(${gameSessions.score})` })
    .from(gameSessions);
  return result?.avg ? Math.round(result.avg) : 0;
}

export async function getTopScore() {
  const [result] = await db
    .select({ max: max(gameSessions.score) })
    .from(gameSessions);
  return result?.max || 0;
}

// Admin queries
export async function getAdminByUsername(username: string) {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);
  return admin;
}

export async function getAdminById(id: number) {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  return admin;
}

export async function updateAdminLastLogin(id: number) {
  await db
    .update(adminUsers)
    .set({ lastLogin: new Date() })
    .where(eq(adminUsers.id, id));
}

// Data retention - get records older than 60 days
export async function getOldGameSessions(daysOld = 60) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await db
    .select()
    .from(gameSessions)
    .where(sql`${gameSessions.createdAt} < ${cutoffDate}`);
}

export async function deleteOldGameSessions(daysOld = 60) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await db
    .delete(gameSessions)
    .where(sql`${gameSessions.createdAt} < ${cutoffDate}`)
    .returning();

  return result.length;
}

export async function getPlayersWithNoRecentGames(daysOld = 60) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await db
    .select()
    .from(players)
    .where(
      sql`NOT EXISTS (
        SELECT 1 FROM ${gameSessions} 
        WHERE ${gameSessions.playerId} = ${players.id} 
        AND ${gameSessions.createdAt} >= ${cutoffDate}
      )`
    );
}

export async function deletePlayer(id: number) {
  await db.delete(players).where(eq(players.id, id));
}

/** Export all players for backup (go-live wipe). */
export async function getAllPlayersForBackup() {
  return db.select().from(players);
}

/** Export all game sessions for backup (go-live wipe). */
export async function getAllGameSessionsForBackup() {
  return db.select().from(gameSessions);
}

/** Wipe all gameplay data (Option B: game_sessions then players). Uses a transaction. Does not touch admin_users. */
export async function wipeAllGameplayData(): Promise<{ deletedSessions: number; deletedPlayers: number }> {
  return db.transaction(async (tx) => {
    const deletedSessions = await tx.delete(gameSessions).where(sql`1 = 1`).returning({ id: gameSessions.id });
    const deletedPlayers = await tx.delete(players).where(sql`1 = 1`).returning({ id: players.id });
    return { deletedSessions: deletedSessions.length, deletedPlayers: deletedPlayers.length };
  });
}
