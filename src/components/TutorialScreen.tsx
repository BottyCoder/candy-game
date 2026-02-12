interface TutorialScreenProps {
  onStart: () => void
}

export default function TutorialScreen({ onStart }: TutorialScreenProps) {
  return (
    <div className="flex-1 flex flex-col justify-start text-center space-y-4 pt-0 animate-fade-in">
      <div className="space-y-3">
        <h2 className="text-3xl font-black text-action-pink">How to Play</h2>
        <div className="bg-white rounded-3xl p-5 shadow-lg text-left">
          <ul className="space-y-2.5 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-2">
              <span className="text-action-pink shrink-0">❤️</span>
              <span>Match 3 or more tenant logos by simply tapping or swiping the tiles.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-action-pink shrink-0">❤️</span>
              <span>You will have <span className="font-bold text-action-pink">45 secs</span> to match tenant logos. Remember, the quicker & more precise you are, the better your score & chance of winning.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-action-pink shrink-0">❤️</span>
              <span>You will score 10 points per store logo matched & cleared.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-action-pink shrink-0">❤️</span>
              <span>Good luck!</span>
            </li>
          </ul>
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full bg-action-pink py-4 rounded-xl text-white font-bold uppercase tracking-widest shadow-lg"
      >
        Let&apos;s Play!
      </button>
    </div>
  )
}
