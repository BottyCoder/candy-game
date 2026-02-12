const API_BASE = '';

export interface Player {
  name: string;
  mobile: string;
  ageGroup: string;
  suburb: string;
  email?: string;
}

export interface RegisterResponse {
  success: boolean;
  playerId: number;
  message?: string;
}

export interface ScoreSubmissionResponse {
  success: boolean;
  rank: number | null;
  isBestScore: boolean;
  personalBest: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: number;
  name: string;
  mobile: string;
  score: number;
  totalGames: number;
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
}

export interface PlayerStats {
  player: {
    id: number;
    name: string;
    mobile: string;
    email?: string;
    registeredAt: string;
  };
  stats: {
    bestScore: number;
    totalGames: number;
    rank: number | null;
    games: Array<{
      score: number;
      matchesMade: number;
      completedAt: string;
      isBestScore: boolean;
    }>;
  };
}

export interface PlayerStatsResponse {
  success: boolean;
  player: PlayerStats['player'];
  stats: PlayerStats['stats'];
}

export async function registerPlayer(data: Player): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/api/players/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(error.error || 'Registration failed');
  }

  return res.json();
}

export async function submitScore(
  mobile: string,
  score: number,
  matchesMade: number,
  seed?: number
): Promise<ScoreSubmissionResponse> {
  const res = await fetch(`${API_BASE}/api/games/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, score, matchesMade, seed }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Score submission failed' }));
    throw new Error(error.error || 'Score submission failed');
  }

  return res.json();
}

export async function getLeaderboard(limit = 100): Promise<LeaderboardResponse> {
  const res = await fetch(`${API_BASE}/api/leaderboard?limit=${limit}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch leaderboard' }));
    throw new Error(error.error || 'Failed to fetch leaderboard');
  }

  return res.json();
}

export async function getPlayerStats(mobile: string): Promise<PlayerStatsResponse> {
  const res = await fetch(`${API_BASE}/api/players/${mobile}/stats`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch player stats' }));
    throw new Error(error.error || 'Failed to fetch player stats');
  }

  return res.json();
}
