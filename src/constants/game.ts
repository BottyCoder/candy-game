import { CandyType } from '../types/game'

export const CANDY_TYPES: CandyType[] = [
  { id: 1, char: '💎', color: 'bg-cyan-100', text: 'text-cyan-500', image: '/images/Absa.png' },
  { id: 2, char: '😊', color: 'bg-purple-100', text: 'text-purple-500', image: '/images/Assupol.png' },
  { id: 3, char: '⭐', color: 'bg-yellow-50', text: 'text-yellow-500', image: '/images/Cappello.png' },
  { id: 4, char: '🔵', color: 'bg-blue-100', text: 'text-blue-500', image: '/images/Carol%20Glamour.jpeg', tileBg: '#101010' },
  { id: 5, char: '❤️', color: 'bg-red-50', text: 'text-red-500', image: '/images/Clicks.png' },
  { id: 6, char: '🍪', color: 'bg-orange-100', text: 'text-orange-500', image: '/images/Footgear.png' },
  { id: 7, char: '🌟', color: 'bg-pink-100', text: 'text-pink-500', image: '/images/Legends.png' },
  { id: 8, char: '🛒', color: 'bg-slate-100', text: 'text-slate-500', image: '/images/Mr%20Price.png' },
  { id: 9, char: '💪', color: 'bg-emerald-100', text: 'text-emerald-500', image: '/images/Planet%20Fitness%20Just%20Gym.png' },
  { id: 10, char: '📦', color: 'bg-amber-100', text: 'text-amber-500', image: '/images/Postnet.png' },
  { id: 11, char: '👗', color: 'bg-rose-100', text: 'text-rose-500', image: '/images/Power%20Fahion.png' },
  { id: 12, char: '🛍️', color: 'bg-green-100', text: 'text-green-500', image: '/images/Shoprite.png' },
  { id: 13, char: '🍔', color: 'bg-orange-100', text: 'text-orange-600', image: '/images/Steers-Logo.png', tileBg: '#450f41' },
  { id: 14, char: '📱', color: 'bg-red-100', text: 'text-red-600', image: '/images/Telkom.png' },
  { id: 15, char: '🏪', color: 'bg-sky-100', text: 'text-sky-600', image: '/images/Apara.png' },
  { id: 16, char: '👟', color: 'bg-zinc-100', text: 'text-zinc-600', image: '/images/Bathu%20Logo_1.png' },
  { id: 17, char: '🔌', color: 'bg-indigo-100', text: 'text-indigo-600', image: '/images/BC%20Electronics.png' },
  { id: 18, char: '🌸', color: 'bg-pink-50', text: 'text-pink-600', image: '/images/M-Scents%20Logo.png' },
  { id: 19, char: '💄', color: 'bg-rose-50', text: 'text-rose-600', image: '/images/Avon.png' },
  { id: 20, char: '✨', color: 'bg-amber-50', text: 'text-amber-600', image: '/images/Sowetos%20Finest.jpg' },
]

export const GRID_SIZE = 6
/** Number of candy types used per board. Fewer = more tiles per type = more matches. 8 gives ~4–5 per type on 6×6. */
export const CANDY_TYPES_PER_GAME = 8
/** Fixed test seeds: each loads a fixed block of 5 types so you can retest the same board. 1111=types 0–4, 2222=5–9, 3333=10–14, 4444=15–19 (when you have 20 images). */
export const TEST_SEEDS = [1111, 2222, 3333, 4444] as const
export const TYPES_PER_TEST_SEED = 5
/** When no ?seed= in URL: pick a random seed from this pool (1000 boards, same quality guarantees). */
export const RANDOM_SEED_MIN = 1000
export const RANDOM_SEED_POOL_SIZE = 1000
/** Minimum number of valid moves (swaps that create a match) so the board feels mid-level and enjoyable, not hard. */
export const MIN_VALID_MOVES = 12
export const GAME_TIME = 45 // seconds
export const SCORE_PER_MATCH = 10

export const AGE_GROUPS = [
  'Under 18',
  '18-25',
  '26-35',
  '36-45',
  '46-55',
  '56-65',
  '66+',
]

export const SUBURBS = [
  'Newtown',
  'Braamfontein',
  'Fordsburg',
  'Marshalltown',
  'Johannesburg CBD',
  'Maboneng',
  'Yeoville',
  'Berea',
  'Hillbrow',
  'Other'
]
