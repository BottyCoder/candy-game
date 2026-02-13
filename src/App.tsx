import { useState, useEffect, useCallback } from 'react'
import { Screen, Player, Tile } from './types/game'
import { generateGrid, findMatches, areAdjacent, processMatches, ensurePlayable } from './utils/gameLogic'
import { GAME_TIME, GRID_SIZE, RANDOM_SEED_MIN, RANDOM_SEED_POOL_SIZE } from './constants/game'
import { registerPlayer, submitScore } from './utils/api'
import RegisterScreen from './components/RegisterScreen'
import TutorialScreen from './components/TutorialScreen'
import GameScreen from './components/GameScreen'
import LeaderboardScreen from './components/LeaderboardScreen'

function App() {
  const [screen, setScreen] = useState<Screen>('REGISTER')
  const [player, setPlayer] = useState<Player>({ name: '', mobile: '', ageGroup: '', suburb: '' })
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [grid, setGrid] = useState<(Tile | null)[][]>([])
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [matchedTiles, setMatchedTiles] = useState<Set<string>>(new Set())
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationError, setRegistrationError] = useState<string | null>(null)
  const [, setIsSubmittingScore] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number; r: number; c: number } | null>(null)
  const [gameTypeIds, setGameTypeIds] = useState<number[]>([])
  const [currentGameSeed, setCurrentGameSeed] = useState<number | null>(null)

  // Scroll to top when entering REGISTER, TUTORIAL, or LEADERBOARD so logo/top content is visible on load
  useEffect(() => {
    if (screen === 'REGISTER' || screen === 'TUTORIAL') {
      document.getElementById('main-scroll')?.scrollTo(0, 0)
    }
    if (screen === 'LEADERBOARD') {
      requestAnimationFrame(() => {
        document.getElementById('leaderboard-scroll')?.scrollTo(0, 0)
      })
    }
  }, [screen])

  // Timer effect
  useEffect(() => {
    if (screen !== 'GAME' || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [screen, timeLeft])

  // Handle time up separately
  useEffect(() => {
    if (screen === 'GAME' && timeLeft === 0) {
      const timeout = setTimeout(() => {
        handleTimeUp()
      }, 100)
      return () => clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, timeLeft])

  const handleRegistration = async (newPlayer: Player) => {
    setIsRegistering(true)
    setRegistrationError(null)
    
    try {
      const response = await registerPlayer(newPlayer)
      if (response.success) {
        setPlayer(newPlayer)
        setScreen('TUTORIAL')
      }
    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : 'Registration failed. Please try again.')
      console.error('Registration error:', error)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleStartGame = () => {
    setScreen('GAME')
    setScore(0)
    setTimeLeft(GAME_TIME)
    const params = new URLSearchParams(window.location.search)
    const seedParam = params.get('seed')
    const parsed = seedParam != null && seedParam !== '' ? parseInt(seedParam, 10) : NaN
    const seed = Number.isNaN(parsed)
      ? RANDOM_SEED_MIN + Math.floor(Math.random() * RANDOM_SEED_POOL_SIZE)
      : parsed
    const { grid: newGrid, seedUsed } = generateGrid(seed)
    const typeIds = [...new Set(newGrid.flat().filter((t): t is Tile => t != null).map(t => t.id))]
    setGameTypeIds(typeIds)
    setGrid(newGrid)
    setSelected(null)
    setIsProcessing(false)
    setCurrentGameSeed(seedUsed)
    console.log('[Candy Game] Grid generated', { seed, seedUsed, typeIds })
  }

  const handleTimeUp = async () => {
    // Submit score before showing leaderboard
    if (player.mobile && score > 0) {
      setIsSubmittingScore(true)
      try {
        // Calculate matches made (approximate from score)
        const matchesMade = Math.floor(score / 10)
        await submitScore(player.mobile, score, matchesMade, currentGameSeed ?? undefined)
      } catch (error) {
        console.error('Score submission error:', error)
        // Continue to leaderboard even if submission fails
      } finally {
        setIsSubmittingScore(false)
      }
    }
    setScreen('LEADERBOARD')
  }

  const showFloatingScore = useCallback((pts: number, r: number, c: number) => {
    const gridEl = document.getElementById('game-grid')
    if (!gridEl) return

    const floatingScoresContainer = document.getElementById('floating-scores')
    if (!floatingScoresContainer) return

    // Tiles are inside gridEl's first child (the .grid div), not direct children of game-grid
    const innerGrid = gridEl.firstElementChild
    if (!innerGrid) return
    const tileEl = innerGrid.children[r * GRID_SIZE + c] as HTMLElement
    if (!tileEl) return

    const rect = tileEl.getBoundingClientRect()
    const containerRect = floatingScoresContainer.getBoundingClientRect()

    const x = rect.left - containerRect.left + rect.width / 2
    const y = rect.top - containerRect.top + rect.height / 2

    const el = document.createElement('div')
    el.className = 'absolute font-black text-action-cyan text-2xl float-up pointer-events-none z-[100] drop-shadow-lg whitespace-nowrap'
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    el.textContent = `+${pts}`

    floatingScoresContainer.appendChild(el)
    setTimeout(() => el.remove(), 1000)
  }, [])

  const processMatchesRecursive = useCallback(async (
    currentGrid: (Tile | null)[][],
    matches: { r: number; c: number }[]
  ) => {
    if (matches.length === 0) {
      setIsProcessing(false)
      setMatchedTiles(new Set())
      return
    }

    // Screen pulse animation
    const appRoot = document.getElementById('app-root')
    if (appRoot) {
      appRoot.classList.remove('screen-pulse')
      void appRoot.offsetWidth // Trigger reflow
      appRoot.classList.add('screen-pulse')
    }

    // Show match animation and floating scores
    const matchKeys = matches.map(m => `${m.r},${m.c}`)
    setMatchedTiles(new Set(matchKeys))

    const points = matches.length * 10
    setScore(prev => prev + points)

    // Show floating score for each match
    matches.forEach(m => {
      showFloatingScore(10, m.r, m.c)
    })

    // Wait for match animation
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Clear matched tiles visual
    setMatchedTiles(new Set())

    // Process matches and update grid (refill only with same types as this game – no Steers on seed 1111)
    let newGrid = processMatches(currentGrid, matches, gameTypeIds)
    newGrid = ensurePlayable(newGrid, 1)
    setGrid(newGrid)

    // Wait for new candies to fall
    await new Promise(resolve => setTimeout(resolve, 200))

    // Check for chain matches
    const newMatches = findMatches(newGrid)
    if (newMatches.length > 0) {
      await processMatchesRecursive(newGrid, newMatches)
    } else {
      setIsProcessing(false)
    }
  }, [showFloatingScore, gameTypeIds])

  const handleSwap = useCallback(async (p1: { r: number; c: number }, p2: { r: number; c: number }) => {
    if (isProcessing) return
    
    setIsProcessing(true)
    setSelected(null)

    // Swap tiles
    setGrid(currentGrid => {
      const newGrid = currentGrid.map(row => [...row])
      const temp = newGrid[p1.r][p1.c]
      newGrid[p1.r][p1.c] = newGrid[p2.r][p2.c]
      newGrid[p2.r][p2.c] = temp

      // Check for matches
      const matches = findMatches(newGrid)
      if (matches.length > 0) {
        // Matches found - process them
        setTimeout(() => processMatchesRecursive(newGrid, matches), 0)
      } else {
        // No matches - shake and swap back
        const gridEl = document.getElementById('game-grid')
        if (gridEl) {
          gridEl.classList.add('shake')
          setTimeout(() => {
            gridEl.classList.remove('shake')
            const temp2 = newGrid[p1.r][p1.c]
            newGrid[p1.r][p1.c] = newGrid[p2.r][p2.c]
            newGrid[p2.r][p2.c] = temp2
            setGrid([...newGrid])
            setIsProcessing(false)
          }, 400)
        } else {
          setIsProcessing(false)
        }
      }

      return newGrid
    })
  }, [isProcessing, processMatchesRecursive])

  const handleTileClick = useCallback((r: number, c: number) => {
    if (isProcessing) return

    if (!selected) {
      setSelected({ r, c })
    } else {
      const first = selected
      const second = { r, c }

      if (areAdjacent(first, second)) {
        handleSwap(first, second)
      } else {
        setSelected(second)
      }
    }
  }, [selected, isProcessing, handleSwap])

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, r: number, c: number) => {
    const point = 'touches' in e ? e.touches[0] : e
    setDragStart({ x: point.clientX, y: point.clientY, r, c })
  }, [])

  const handleDragEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart) return

    const point = 'changedTouches' in e ? e.changedTouches[0] : e
    const dx = point.clientX - dragStart.x
    const dy = point.clientY - dragStart.y
    const threshold = 30

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      let targetR = dragStart.r
      let targetC = dragStart.c
      if (Math.abs(dx) > Math.abs(dy)) {
        targetC += dx > 0 ? 1 : -1
      } else {
        targetR += dy > 0 ? 1 : -1
      }

      if (targetR >= 0 && targetR < GRID_SIZE && targetC >= 0 && targetC < GRID_SIZE) {
        const p1 = { r: dragStart.r, c: dragStart.c }
        const p2 = { r: targetR, c: targetC }
        handleSwap(p1, p2)
      }
    }
    setDragStart(null)
  }, [dragStart, handleSwap])

  const handlePlayAgain = () => {
    setScreen('TUTORIAL')
    setScore(0)
    setSelected(null)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-bg-outer flex items-center justify-center p-1 sm:p-4">
      {/* Mobile frame: full width on small phones (e.g. 375px), max 390px, full viewport height */}
      <div id="app-root" className="w-full max-w-[390px] min-w-0 h-[100dvh] max-h-[100dvh] bg-app-container shadow-2xl border-x border-white/20 overflow-hidden relative flex flex-col">
        {/* Decorative Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-decorative-blob/50 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-decorative-blob/50 rounded-full blur-3xl"></div>
        </div>

        {/* Header: centred logo on Tutorial & Game (per Screen 1 & 4); refresh on right */}
        <header className={`relative z-50 p-4 flex justify-center items-center ${screen === 'LEADERBOARD' || screen === 'REGISTER' ? 'hidden' : ''}`}>
          <img 
            src="/images/candy-game-logo.png" 
            alt="Candy Game" 
            className="h-10 object-contain"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            <button 
              onClick={handlePlayAgain}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Refresh"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content - scrollable; less horizontal padding on small screens so leaderboard fits */}
        <main id="main-scroll" className="relative z-10 flex-1 flex flex-col min-h-0 min-w-0 px-3 sm:px-6 pb-6 overflow-y-auto overflow-x-hidden overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {screen === 'REGISTER' && (
            <RegisterScreen 
              onSubmit={handleRegistration} 
              isRegistering={isRegistering}
              error={registrationError}
            />
          )}

          {screen === 'TUTORIAL' && (
            <TutorialScreen onStart={handleStartGame} />
          )}

          {screen === 'GAME' && (
            <GameScreen
              playerName={player.name}
              grid={grid}
              selected={selected}
              matchedTiles={matchedTiles}
              score={score}
              timeLeft={timeLeft}
              onTileClick={handleTileClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          )}

          {screen === 'LEADERBOARD' && (
            <LeaderboardScreen
              player={player}
              score={score}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
