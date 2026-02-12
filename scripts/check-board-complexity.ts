/**
 * Check board complexity for a given seed, or count moves for a board fingerprint.
 * Run: npx tsx scripts/check-board-complexity.ts [seed]
 * Or:  npx tsx scripts/check-board-complexity.ts [seed] "<fingerprint>"
 *      (fingerprint = row1|row2|... e.g. "1719101111|331111717|...")
 */
import { generateGrid, gridFingerprint, countValidMoves } from '../src/utils/gameLogic'
import { GRID_SIZE, MIN_VALID_MOVES } from '../src/constants/game'
import type { Tile } from '../src/types/game'

/** Parse a fingerprint row string into 6 tile ids (1–9 one digit, 10–20 two digits). */
function parseFingerprintRow(s: string): number[] {
  const ids: number[] = []
  let i = 0
  while (i < s.length && ids.length < GRID_SIZE) {
    if (s[i] === '1' && i + 1 < s.length && s[i + 1] !== ' ') {
      const two = parseInt(s.slice(i, i + 2), 10)
      if (two >= 10 && two <= 19) {
        ids.push(two)
        i += 2
        continue
      }
    }
    if (s[i] === '2' && i + 1 < s.length && s[i + 1] === '0') {
      ids.push(20)
      i += 2
      continue
    }
    const d = parseInt(s[i], 10)
    if (d >= 1 && d <= 9) {
      ids.push(d)
      i += 1
      continue
    }
    i += 1
  }
  return ids
}

/** Build a grid from a fingerprint string (row1|row2|row3|row4|row5|row6). */
function gridFromFingerprint(fingerprint: string): (Tile | null)[][] {
  const rows = fingerprint.trim().split('|').map(r => r.replace(/\s/g, ''))
  const grid: (Tile | null)[][] = []
  for (let r = 0; r < GRID_SIZE; r++) {
    const ids = parseFingerprintRow(rows[r] || '')
    grid[r] = ids.map((id, c) => ({ id, r, c, char: '', color: '', text: '' } as Tile))
    while (grid[r].length < GRID_SIZE) grid[r].push(null)
  }
  return grid
}

const seed = parseInt(process.argv[2] || '1661', 10)
const fingerprintArg = process.argv[3]

console.log('\n--- Board complexity report ---')
console.log('Seed requested:', seed)

let grid: (Tile | null)[][]
let seedUsed = seed

if (fingerprintArg) {
  console.log('Using provided fingerprint (stuck-state board)')
  grid = gridFromFingerprint(fingerprintArg)
  console.log('Seed used (board): N/A (custom grid)')
} else {
  const out = generateGrid(seed)
  grid = out.grid
  seedUsed = out.seedUsed
  console.log('Seed used (board):', seedUsed)
}
console.log('')
const validMoves = countValidMoves(grid)
const fingerprint = gridFingerprint(grid)

// Type distribution (tile ids on board)
const idCounts: Record<number, number> = {}
for (let r = 0; r < GRID_SIZE; r++) {
  for (let c = 0; c < GRID_SIZE; c++) {
    const t = grid[r][c]
    if (t) {
      idCounts[t.id] = (idCounts[t.id] || 0) + 1
    }
  }
}
const typeIds = Object.keys(idCounts).map(Number).sort((a, b) => a - b)

console.log('Valid moves (swaps that create a match):', validMoves)
console.log('Expected minimum (all seeds):', MIN_VALID_MOVES)
console.log('')
console.log('Tile types on board (id → count):', typeIds.map(id => `${id}:${idCounts[id]}`).join(', '))
console.log('')
console.log('Grid fingerprint (tile ids by row):')
console.log(fingerprint)
console.log('')
console.log('--- End report ---\n')
