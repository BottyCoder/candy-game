import { Tile, CandyType } from '../types/game'
import { CANDY_TYPES, GRID_SIZE, CANDY_TYPES_PER_GAME, TEST_SEEDS, TYPES_PER_TEST_SEED, MIN_VALID_MOVES, RANDOM_SEED_MIN, RANDOM_SEED_POOL_SIZE } from '../constants/game'

/** Seeded RNG (mulberry32) so the same seed always produces the same grid. Use for testing. */
function createSeededRandom(seed: number) {
  return function seededRandom() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Generate a fingerprint string of the grid (tile ids row by row) for logging/verification.
 * Same grid => same fingerprint. Different grid => different fingerprint.
 */
export function gridFingerprint(grid: (Tile | null)[][]): string {
  return grid.map(row => row.map(t => t?.id ?? '.').join('')).join('|')
}

/**
 * Pick a random subset of candy types for this game so each type appears more often (more matches).
 * Uses the same RNG as the grid so seed gives reproducible boards.
 */
function pickTypesForGame(random: () => number): CandyType[] {
  const indices = CANDY_TYPES.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices.slice(0, CANDY_TYPES_PER_GAME).map(i => CANDY_TYPES[i])
}

/**
 * For test seeds 1111, 2222, 3333, 4444: return the fixed block of 5 types (1111=0–4, 2222=5–9, etc.).
 * When you have 20 images, each seed gets a unique set of 5. Returns [] if block is out of range.
 */
function typesForTestSeed(seed: number): CandyType[] {
  const blockIndex = TEST_SEEDS.indexOf(seed as (typeof TEST_SEEDS)[number])
  if (blockIndex === -1) return []
  const start = blockIndex * TYPES_PER_TEST_SEED
  const end = Math.min(CANDY_TYPES.length, start + TYPES_PER_TEST_SEED)
  return CANDY_TYPES.slice(start, end)
}

/**
 * Internal: build one grid for a given seed. All seeds use MIN_VALID_MOVES (8) so every board has at least 8 valid moves.
 */
function generateGridWithSeed(seed: number): (Tile | null)[][] {
  const random = createSeededRandom(seed)
  const testTypes = typesForTestSeed(seed)
  const typesThisGame =
    testTypes.length >= 3
      ? testTypes
      : pickTypesForGame(random)
  const grid: (Tile | null)[][] = []

  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = []
    for (let c = 0; c < GRID_SIZE; c++) {
      let randomCandy: CandyType
      do {
        randomCandy = typesThisGame[Math.floor(random() * typesThisGame.length)]
      } while (
        (c >= 2 && grid[r][c-1]?.id === randomCandy.id && grid[r][c-2]?.id === randomCandy.id) ||
        (r >= 2 && grid[r-1][c]?.id === randomCandy.id && grid[r-2][c]?.id === randomCandy.id)
      )
      grid[r][c] = { ...randomCandy, r, c }
    }
  }

  const minMoves = MIN_VALID_MOVES
  let result = ensureMinimumMoves(grid, minMoves)
  const typeIds = typesThisGame.map(t => t.id)
  let cleared = findMatches(result)
  while (cleared.length > 0) {
    result = processMatches(result, cleared, typeIds)
    cleared = findMatches(result)
  }
  result = ensurePlayable(result, 1)
  cleared = findMatches(result)
  while (cleared.length > 0) {
    result = processMatches(result, cleared, typeIds)
    cleared = findMatches(result)
  }
  return result
}

/**
 * Generate the game grid. Returns grid and the seed actually used (may differ from requested seed for pool seeds if the requested board was too hard).
 * All seeds: we require at least MIN_VALID_MOVES (8). Pool seeds (1000–1999) retry with seed+1 if the board has fewer, so players don't get stuck.
 */
export function generateGrid(seed?: number): { grid: (Tile | null)[][], seedUsed: number } {
  const poolStart = RANDOM_SEED_MIN
  const poolEnd = RANDOM_SEED_MIN + RANDOM_SEED_POOL_SIZE
  const requested = seed ?? poolStart + Math.floor(Math.random() * RANDOM_SEED_POOL_SIZE)
  let trySeed = requested
  const maxTries = 120

  for (let i = 0; i < maxTries; i++) {
    const grid = generateGridWithSeed(trySeed)
    if (countValidMoves(grid) >= MIN_VALID_MOVES) {
      return { grid, seedUsed: trySeed }
    }
    trySeed = trySeed + 1
    if (trySeed >= poolEnd) trySeed = poolStart
    if (seed !== undefined && trySeed === requested && i > 0) break
  }

  const grid = generateGridWithSeed(trySeed)
  return { grid, seedUsed: trySeed }
}

/**
 * Count how many distinct adjacent swaps would create at least one 3-in-a-row.
 * Used to tune difficulty: more valid moves = mid-level, enjoyable; fewer = frustrating.
 * Exported for board analysis scripts.
 */
export function countValidMoves(grid: (Tile | null)[][]): number {
  const moves = new Set<string>()
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c < GRID_SIZE - 1 && grid[r][c] && grid[r][c + 1] && trySwap(grid, r, c, r, c + 1)) {
        moves.add(`${r},${c},${r},${c+1}`)
      }
      if (r < GRID_SIZE - 1 && grid[r][c] && grid[r + 1][c] && trySwap(grid, r, c, r + 1, c)) {
        moves.add(`${r},${c},${r+1},${c}`)
      }
    }
  }
  return moves.size
}

/** Simulate swapping two cells; return true if the swap creates at least one match. */
function trySwap(
  grid: (Tile | null)[][],
  r1: number,
  c1: number,
  r2: number,
  c2: number
): boolean {
  const copy = grid.map(row => row.map(t => (t ? { ...t } : null)))
  const t1 = copy[r1][c1]
  const t2 = copy[r2][c2]
  if (!t1 || !t2) return false
  copy[r1][c1] = { ...t2, r: r1, c: c1 }
  copy[r2][c2] = { ...t1, r: r2, c: c2 }
  return findMatches(copy).length > 0
}

/**
 * Ensure the board has at least minMoves valid swaps, WITHOUT ever creating an existing 3-in-a-row.
 * Only applies a swap if after the swap the board has zero matches (so no 3-match on initial load).
 * Deterministic order so the same seed still produces the same board.
 */
function ensureMinimumMoves(grid: (Tile | null)[][], minMoves: number): (Tile | null)[][] {
  let result = grid.map(row => row.map(t => (t ? { ...t } : null)))
  const maxNudges = 200
  let nudges = 0
  while (countValidMoves(result) < minMoves && nudges < maxNudges) {
    let applied = false
    for (let r = 0; r < GRID_SIZE && !applied; r++) {
      for (let c = 0; c < GRID_SIZE && !applied; c++) {
        if (c < GRID_SIZE - 1) {
          const t1 = result[r][c]
          const t2 = result[r][c + 1]
          if (t1 && t2 && trySwap(result, r, c, r, c + 1)) {
            const after = result.map(row => row.map(t => (t ? { ...t } : null)))
            after[r][c] = { ...t2, r, c }
            after[r][c + 1] = { ...t1, r, c: c + 1 }
            if (findMatches(after).length === 0) {
              result[r][c] = { ...t2, r, c }
              result[r][c + 1] = { ...t1, r, c: c + 1 }
              applied = true
            }
          }
        }
        if (!applied && r < GRID_SIZE - 1) {
          const t1 = result[r][c]
          const t2 = result[r + 1][c]
          if (t1 && t2 && trySwap(result, r, c, r + 1, c)) {
            const after = result.map(row => row.map(t => (t ? { ...t } : null)))
            after[r][c] = { ...t2, r, c }
            after[r + 1][c] = { ...t1, r: r + 1, c }
            if (findMatches(after).length === 0) {
              result[r][c] = { ...t2, r, c }
              result[r + 1][c] = { ...t1, r: r + 1, c }
              applied = true
            }
          }
        }
      }
    }
    if (!applied) break
    nudges++
  }
  return result
}

export function findMatches(grid: (Tile | null)[][]): { r: number; c: number }[] {
  const matched = new Set<string>()

  // Horizontal matches
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE - 2; c++) {
      const t1 = grid[r][c]
      const t2 = grid[r][c+1]
      const t3 = grid[r][c+2]
      if (t1 && t2 && t3 && t1.id === t2.id && t2.id === t3.id) {
        matched.add(`${r},${c}`)
        matched.add(`${r},${c+1}`)
        matched.add(`${r},${c+2}`)
      }
    }
  }

  // Vertical matches
  for (let c = 0; c < GRID_SIZE; c++) {
    for (let r = 0; r < GRID_SIZE - 2; r++) {
      const t1 = grid[r][c]
      const t2 = grid[r+1][c]
      const t3 = grid[r+2][c]
      if (t1 && t2 && t3 && t1.id === t2.id && t2.id === t3.id) {
        matched.add(`${r},${c}`)
        matched.add(`${r+1},${c}`)
        matched.add(`${r+2},${c}`)
      }
    }
  }

  return Array.from(matched).map(s => {
    const [r, c] = s.split(',').map(Number)
    return { r, c }
  })
}

/**
 * Refill uses only the given type IDs (same as the board) so no "other seed" logos appear.
 * If typeIds is omitted, uses all CANDY_TYPES (legacy).
 */
export function processMatches(
  grid: (Tile | null)[][],
  matches: { r: number; c: number }[],
  typeIds?: number[]
): (Tile | null)[][] {
  const newGrid = grid.map(row => row.map(t => (t ? { ...t } : null)))
  const typesForRefill = typeIds?.length
    ? CANDY_TYPES.filter(t => typeIds.includes(t.id))
    : CANDY_TYPES
  if (typesForRefill.length === 0) return newGrid

  // Remove matched tiles and shift down
  for (let c = 0; c < GRID_SIZE; c++) {
    let shift = 0
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      const isMatch = matches.some(m => m.r === r && m.c === c)
      if (isMatch) {
        shift++
        newGrid[r][c] = null
      } else if (shift > 0 && newGrid[r][c]) {
        newGrid[r + shift][c] = { ...newGrid[r][c]!, r: r + shift, c }
        newGrid[r][c] = null
      }
    }
    // Fill top with new candies (only from the same types as this game)
    for (let r = 0; r < shift; r++) {
      const randomCandy = typesForRefill[Math.floor(Math.random() * typesForRefill.length)]
      newGrid[r][c] = { ...randomCandy, r, c }
    }
  }

  return newGrid
}

/** Exported so App can ensure the board has at least minMoves after refill (avoid dead boards). */
export function ensurePlayable(grid: (Tile | null)[][], minMoves: number): (Tile | null)[][] {
  return ensureMinimumMoves(grid, minMoves)
}

export function areAdjacent(
  p1: { r: number; c: number },
  p2: { r: number; c: number }
): boolean {
  const dr = Math.abs(p1.r - p2.r)
  const dc = Math.abs(p1.c - p2.c)
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1)
}
