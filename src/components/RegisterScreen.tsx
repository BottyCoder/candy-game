import { useState } from 'react'
import { Player } from '../types/game'
import { SUBURBS, AGE_GROUPS } from '../constants/game'

interface RegisterScreenProps {
  onSubmit: (player: Player) => Promise<void>
  isRegistering?: boolean
  error?: string | null
}

export default function RegisterScreen({ onSubmit, isRegistering = false, error }: RegisterScreenProps) {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [suburb, setSuburb] = useState('')

  const handleSubmit = () => {
    if (!name || !mobile || !ageGroup || !suburb) {
      alert("Please fill in all fields to enter!")
      return
    }
    onSubmit({ name, mobile, ageGroup, suburb })
  }

  return (
    <div className="flex-1 flex flex-col justify-start min-h-0 animate-fade-in py-4">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <img 
            src="/images/candy-game-logo.png" 
            alt="Candy Game" 
            className="h-20 object-contain"
          />
        </div>
        <h1 className="text-2xl font-black text-action-cyan leading-none mb-2 uppercase tracking-tight">
          <span className="text-action-pink">Match made</span> in Candy Game!
        </h1>
        <p className="text-xs font-bold text-gray-500 mb-2 italic">#CandyGame</p>
        <div className="bg-white/80 rounded-xl p-3 shadow-sm border border-pink-100 mb-2">
          <p className="text-[11px] text-pink-600 font-bold leading-tight uppercase">
            Play, score, and climb the leaderboard!
          </p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl shadow-xl">
        <div className="space-y-4">
          <div>
            <label className="data-label block mb-1">Full Name</label>
            <input
              id="input-name"
              type="text"
              placeholder="e.g. Sipho Zulu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full text-sm focus:ring-2 focus:ring-action-cyan outline-none transition-all"
            />
          </div>
          <div>
            <label className="data-label block mb-1">Mobile Number</label>
            <input
              id="input-mobile"
              type="tel"
              placeholder="081 234 5678"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="glass-input w-full text-sm focus:ring-2 focus:ring-action-cyan outline-none transition-all"
            />
          </div>
          <div>
            <label className="data-label block mb-1">Age Group</label>
            <select
              id="input-age"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="glass-input w-full text-sm focus:ring-2 focus:ring-action-cyan outline-none transition-all"
            >
              <option value="">Select age group</option>
              {AGE_GROUPS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="data-label block mb-1">Residential Suburb</label>
            <select
              id="input-suburb"
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              className="glass-input w-full text-sm focus:ring-2 focus:ring-action-cyan outline-none transition-all"
            >
              <option value="">Select your suburb</option>
              {SUBURBS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isRegistering}
            className="btn-gradient w-full py-4 uppercase tracking-widest shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? 'Registering...' : 'ENTER NOW'}
          </button>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 text-center mt-4 mb-8 pb-4 px-4">
        Please enter your details and tap Enter Now to play. By entering, you agree to our{' '}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Terms &amp; Conditions
        </a>
        .
      </p>
    </div>
  )
}
