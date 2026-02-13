import { useState, useEffect } from 'react'
import { Player } from '../types/game'
import { getLeaderboard, LeaderboardEntry } from '../utils/api'

interface LeaderboardScreenProps {
  player: Player
  score: number
  onPlayAgain: () => void
}

export default function LeaderboardScreen({ player, score, onPlayAgain }: LeaderboardScreenProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)
        const response = await getLeaderboard(100)
        if (response.success) {
          setLeaderboard(response.leaderboard)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
        console.error('Leaderboard error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
    triggerHeartCelebration()
  }, [])

  const triggerHeartCelebration = () => {
    const appRoot = document.getElementById('app-root')
    if (!appRoot) return

    const hearts = ['❤️', '💖', '💗', '💕', '✨']
    for (let i = 0; i < 25; i++) {
      const heart = document.createElement('div')
      heart.className = 'absolute text-2xl animate-fall pointer-events-none z-[100]'
      heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)]
      heart.style.left = Math.random() * 100 + '%'
      heart.style.top = '-5%'
      heart.style.animationDuration = (2 + Math.random() * 2) + 's'
      heart.style.animationDelay = Math.random() * 3 + 's'
      heart.style.fontSize = (16 + Math.random() * 20) + 'px'
      appRoot.appendChild(heart)
      setTimeout(() => heart.remove(), 5000)
    }
  }

  const shareScore = () => {
    const text = `I just scored ${score} in Candy Game! Can you beat me? 🎮 #CandyGame`
    const url = window.location.href

    if (navigator.share) {
      navigator.share({
        title: 'Candy Game',
        text: text,
        url: url
      }).catch((err: Error) => {
        // NotAllowedError often happens in iframes or restricted environments
        if (err.name !== 'AbortError') {
          handleShareFallback(text, url)
        }
      })
    } else {
      handleShareFallback(text, url)
    }
  }

  const handleShareFallback = (text: string, url: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text + ' ' + url)
        .then(() => alert("Score details copied to clipboard! 💖"))
        .catch(() => alert("My Score: " + score + "! 💖"))
    } else {
      alert("My Score: " + score + "! 💖")
    }
  }

  // Deduplicate by mobile (unique): keep best score per person, then re-rank
  const byMobile = new Map<string, LeaderboardEntry>()
  for (const entry of leaderboard) {
    const existing = byMobile.get(entry.mobile)
    if (!existing || entry.score > existing.score) {
      byMobile.set(entry.mobile, entry)
    }
  }
  const deduped = Array.from(byMobile.values()).sort((a, b) => b.score - a.score)
  const ranked = deduped.map((entry, i) => ({ ...entry, rank: i + 1 }))

  // Find current player or add them, and mark (YOU)
  const displayLeaderboard = [...ranked]
  const playerIndex = displayLeaderboard.findIndex(entry => entry.mobile === player.mobile)

  if (playerIndex === -1 && score > 0) {
    displayLeaderboard.push({
      rank: displayLeaderboard.length + 1,
      playerId: 0,
      name: `${player.name} (YOU)`,
      mobile: player.mobile,
      score,
      totalGames: 1,
    })
  } else if (playerIndex !== -1) {
    displayLeaderboard[playerIndex] = {
      ...displayLeaderboard[playerIndex],
      name: `${displayLeaderboard[playerIndex].name} (YOU)`,
    }
  }

  return (
    <div id="leaderboard-scroll" className="flex flex-col min-w-0 animate-fade-in flex-1 min-h-0">
      <div className="flex justify-center pt-2 pb-1 shrink-0">
        <img 
          src="/images/candy-game-logo.png" 
          alt="Candy Game" 
          className="h-11 sm:h-14 object-contain"
        />
      </div>
      <div className="text-center mb-2 sm:mb-4 shrink-0 px-0 pt-4 sm:pt-6">
        <h2 className="text-xl sm:text-3xl font-black uppercase leading-tight text-action-cyan">Leaderboard</h2>
        <p className="text-pink-600 text-xs sm:text-base font-bold mt-1 sm:mt-2">Congratulations! Your score has been recorded.</p>
        <p className="text-gray-600 text-[11px] sm:text-sm mt-0.5 sm:mt-1 px-0">Play more. Score higher. Top the leaderboard!</p>
      </div>

      <div className="bg-white/80 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden mb-2 sm:mb-4 flex-1 min-h-0 min-w-0 pr-1 sm:pr-0 flex flex-col">
        {isLoading ? (
          <div className="p-4 sm:p-8 text-center text-gray-500 text-sm">Loading leaderboard...</div>
        ) : error ? (
          <div className="p-4 sm:p-8 text-center text-red-500 text-sm">{error}</div>
        ) : displayLeaderboard.length === 0 ? (
          <div className="p-4 sm:p-8 text-center text-gray-500 text-sm">No scores yet. Be the first!</div>
        ) : (
          <div className="overflow-y-auto overscroll-contain flex-1 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="w-9 sm:w-12 py-1.5 px-1 sm:py-2 sm:px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">Rank</th>
                  <th className="min-w-0 py-1.5 px-1 sm:py-2 sm:px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">Player</th>
                  <th className="w-14 sm:w-20 py-1.5 pl-0 pr-1.5 sm:py-2 sm:pl-2 sm:pr-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {displayLeaderboard.map((entry) => {
                  const isPlayer = entry.name.includes('(YOU)')
                  return (
                    <tr
                      key={entry.mobile}
                      className={`border-b border-gray-100 ${
                        entry.rank === 1 ? 'bg-cyan-50/50' : 
                        entry.rank === 2 ? 'bg-pink-50/50' : 
                        entry.rank === 3 ? 'bg-purple-50/50' :
                        isPlayer ? 'bg-yellow-50/50' : ''
                      }`}
                    >
                      <td className={`py-1.5 px-1 sm:py-2 sm:px-3 text-xs sm:text-sm font-bold ${
                        entry.rank === 1 ? 'text-action-cyan' : 
                        entry.rank === 2 ? 'text-action-pink' : 
                        entry.rank === 3 ? 'text-accent-purple' :
                        isPlayer ? 'text-yellow-600' :
                        'text-gray-400'
                      }`}>
                        {entry.rank}
                      </td>
                      <td className="py-1.5 px-1 sm:py-2 sm:px-3 text-xs sm:text-sm font-bold truncate" title={entry.name}>{entry.name}</td>
                      <td className="py-1.5 pl-0 pr-1.5 sm:py-2 sm:pl-2 sm:pr-3 text-xs sm:text-sm font-black text-right tabular-nums">{entry.score.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:gap-3 shrink-0 pb-safe-bottom">
        <button
          onClick={onPlayAgain}
          className="w-full bg-action-pink py-3 sm:py-4 rounded-xl text-white text-sm sm:text-base font-bold uppercase tracking-widest shadow-lg"
        >
          Hit Play Again!
        </button>
        <button
          onClick={shareScore}
          className="w-full bg-white/80 border border-gray-200 py-3 sm:py-4 rounded-xl text-gray-700 text-sm sm:text-base font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  )
}
