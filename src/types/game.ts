export type Screen = 'REGISTER' | 'TUTORIAL' | 'GAME' | 'LEADERBOARD'

export interface Player {
  name: string
  mobile: string
  ageGroup: string
  suburb: string
  email?: string // Keep for backward compatibility but not used in registration
}

export interface CandyType {
  id: number
  char: string
  color: string
  text: string
  image?: string
  /** Override bg & border for logo tile (e.g. Steers #450f41, Carol Glamour #101010). Default is white. */
  tileBg?: string
}

export interface Tile extends CandyType {
  r: number
  c: number
}

export interface GameState {
  screen: Screen
  player: Player
  score: number
  timeLeft: number
  grid: (Tile | null)[][]
  selected: { r: number; c: number } | null
  isProcessing: boolean
}
