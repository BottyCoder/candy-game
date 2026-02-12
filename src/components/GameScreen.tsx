import { Tile } from '../types/game'

interface GameScreenProps {
  playerName: string
  grid: (Tile | null)[][]
  selected: { r: number; c: number } | null
  matchedTiles: Set<string>
  score: number
  timeLeft: number
  onTileClick: (r: number, c: number) => void
  onDragStart: (e: React.MouseEvent | React.TouchEvent, r: number, c: number) => void
  onDragEnd: (e: React.MouseEvent | React.TouchEvent) => void
}

export default function GameScreen({
  playerName,
  grid,
  selected,
  matchedTiles,
  score,
  timeLeft,
  onTileClick,
  onDragStart,
  onDragEnd
}: GameScreenProps) {
  return (
    <div className="flex flex-col h-full space-y-4 relative">
      {/* Floating scores container - covers full game area so +10 appears over tiles */}
      <div id="floating-scores" className="absolute inset-0 pointer-events-none z-[50]" aria-hidden="true" />

      {/* Stats Bar */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-4 flex justify-between items-center shadow-sm relative z-10">
        <div className="flex flex-col">
          <span className="data-label">Player</span>
          <span className="text-sm font-bold text-action-pink">{playerName}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="data-label">Time</span>
          <span className="text-2xl font-black text-action-pink tabular-nums">{timeLeft}s</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="data-label">Score</span>
          <span className="text-2xl font-black text-action-cyan tabular-nums">{score}</span>
        </div>
      </div>

      {/* Game Grid - touch-action: none so dragging a tile does not scroll the page */}
      <div id="game-grid" className="bg-white/40 p-2 rounded-3xl shadow-inner flex-1 flex flex-col justify-center relative z-10 touch-none">
        <div className="grid grid-cols-6 gap-1">
          {grid.map((row, r) =>
            row.map((tile, c) => {
              if (!tile) return <div key={`${r}-${c}`} className="aspect-square" />
              
              const isSelected = selected?.r === r && selected?.c === c
              const isMatched = matchedTiles.has(`${r},${c}`)
              const tileStyle = tile.tileBg
                ? { backgroundColor: tile.tileBg, border: `2px solid ${tile.tileBg}` }
                : undefined
              const tileClassName = tile.tileBg
                ? ''
                : 'bg-white border-2 border-gray-200'
              
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => onTileClick(r, c)}
                  onMouseDown={(e) => onDragStart(e, r, c)}
                  onTouchStart={(e) => onDragStart(e, r, c)}
                  onMouseUp={onDragEnd}
                  onTouchEnd={onDragEnd}
                  style={tileStyle}
                  className={`tile-base ${tileClassName} flex items-center justify-center text-2xl shadow-sm overflow-hidden rounded-lg ${
                    isSelected ? 'tile-selected' : ''
                  } ${
                    isMatched ? 'tile-glow tile-matching' : ''
                  }`}
                >
                  {tile.image ? (
                    <img src={tile.image} alt="" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    tile.char
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="text-action-pink font-bold animate-pulse italic">Swipe or tap to match logos.</p>
      </div>
    </div>
  )
}
