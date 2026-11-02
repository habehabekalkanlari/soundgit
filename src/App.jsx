import React, { useState, useEffect, useRef } from 'react'
import {
  Disc,
  Music,
  Plus,
  Trash2,
  Zap,
  ArrowRight,
  RefreshCcw,
  Play,
  Pause,
  Upload,
  Download,
  Sparkles,
  Activity,
  Bot,
  X,
  Send,
  Volume2,
  Clock,
  Flame,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sliders,
  Radio
} from 'lucide-react'

// --- CAMELOT KEY MAPPING ---
const CAMELOT_KEY_MAP = {
  '1A': ['1A', '12A', '2A', '1B'],
  '1B': ['1B', '12B', '2B', '1A'],
  '2A': ['2A', '1A', '3A', '2B'],
  '2B': ['2B', '1B', '3B', '2A'],
  '3A': ['3A', '2A', '4A', '3B'],
  '3B': ['3B', '2B', '4B', '3A'],
  '4A': ['4A', '3A', '5A', '4B'],
  '4B': ['4B', '3B', '5B', '4A'],
  '5A': ['5A', '4A', '6A', '5B'],
  '5B': ['5B', '4B', '6B', '5A'],
  '6A': ['6A', '5A', '7A', '6B'],
  '6B': ['6B', '5B', '7B', '6A'],
  '7A': ['7A', '6A', '8A', '7B'],
  '7B': ['7B', '6B', '8B', '7A'],
  '8A': ['8A', '7A', '9A', '8B'],
  '8B': ['8B', '7B', '9B', '8A'],
  '9A': ['9A', '8A', '10A', '9B'],
  '9B': ['9B', '8B', '10B', '9A'],
  '10A': ['10A', '9A', '11A', '10B'],
  '10B': ['10B', '9B', '11B', '10A'],
  '11A': ['11A', '10A', '12A', '11B'],
  '11B': ['11B', '10B', '12B', '11A'],
  '12A': ['12A', '11A', '1A', '12B'],
  '12B': ['12B', '11B', '1B', '12A']
}

function getCompatibleKeys(key) {
  return CAMELOT_KEY_MAP[key] || []
}

function calculateTransitionScore(trackA, trackB) {
  if (!trackA || !trackB) return null

  const notes = []
  let score = 100

  const compatible = getCompatibleKeys(trackA.camelot_key)
  if (trackA.camelot_key === trackB.camelot_key) {
    notes.push('Exact Key Match')
  } else if (compatible.includes(trackB.camelot_key)) {
    notes.push('Harmonic Transition')
  } else {
    score -= 30
    notes.push('Key Clash')
  }

  const bpmDiff = Math.abs(trackA.bpm - trackB.bpm)
  if (bpmDiff === 0) {
    notes.push('BPM Synced')
  } else if (bpmDiff <= 3) {
    notes.push(`BPM Δ ${bpmDiff.toFixed(1)}`)
  } else {
    score -= Math.min(40, Math.round(bpmDiff * 5))
    notes.push(`BPM Δ ${bpmDiff.toFixed(1)}`)
  }

  const energyDiff = trackB.energy_level - trackA.energy_level
  if (energyDiff > 0) {
    notes.push(`Energy +${energyDiff}`)
  } else if (energyDiff < 0) {
    notes.push(`Energy ${energyDiff}`)
  } else {
    notes.push('Energy Maintained')
  }

  const finalScore = Math.max(10, score)
  let status = 'PERFECT'
  if (finalScore < 60) status = 'RISKY'
  else if (finalScore < 85) status = 'GOOD'

  return { score: finalScore, status, notes }
}

const INITIAL_TRACKS = [
  { id: '1', title: 'Domino', artist: 'Oxia', bpm: 128, camelot_key: '8A', energy_level: 7, duration: 7 },
  { id: '2', title: 'Adama Twins', artist: 'Adana Twins', bpm: 124, camelot_key: '8A', energy_level: 8, duration: 6 },
  { id: '3', title: 'Opus', artist: 'Eric Prydz', bpm: 126, camelot_key: '9A', energy_level: 9, duration: 9 },
  { id: '4', title: 'Finder', artist: 'Ninetoes', bpm: 120, camelot_key: '8B', energy_level: 6, duration: 5 }
]

// --- NEON PARTICLE RIBBON WAVEFORM CANVAS COMPONENT ---
function RealtimeWaveform({ isPlaying = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId

    const numRibbons = 7
    const pointsPerRibbon = 120

    let time = 0

    const render = () => {
      const width = (canvas.width = canvas.parentElement.clientWidth || 320)
      const height = (canvas.height = 160)

      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, width, height)

      time += isPlaying ? 0.04 : 0.015

      for (let r = 0; r < numRibbons; r++) {
        const offset = (r - numRibbons / 2) * 4
        const ribbonPhase = r * 0.45

        for (let i = 0; i < pointsPerRibbon; i++) {
          const progress = i / (pointsPerRibbon - 1)
          const x = progress * width

          const envelope = Math.sin(progress * Math.PI)

          const baseWave = Math.sin(progress * 7 + time + ribbonPhase) * 22
          const harmonicWave = Math.sin(progress * 14 - time * 1.4) * 12
          const microWave = Math.cos(progress * 22 + time * 2) * 6

          const amplitudeMultiplier = isPlaying ? 1.5 : 0.8
          const y = (height / 2) + offset + (baseWave + harmonicWave + microWave) * envelope * amplitudeMultiplier

          let rCol = 255, gCol = 255, bCol = 255
          if (progress < 0.25) {
            const t = progress / 0.25
            rCol = Math.round(140 + (220 - 140) * t)
            gCol = Math.round(80 + (40 - 80) * t)
            bCol = Math.round(255 + (220 - 255) * t)
          } else if (progress < 0.55) {
            const t = (progress - 0.25) / 0.30
            rCol = Math.round(220 + (255 - 220) * t)
            gCol = Math.round(40 + (60 - 40) * t)
            bCol = Math.round(220 + (120 - 220) * t)
          } else if (progress < 0.8) {
            const t = (progress - 0.55) / 0.25
            rCol = Math.round(255 + (240 - 255) * t)
            gCol = Math.round(60 + (180 - 60) * t)
            bCol = Math.round(120 + (50 - 120) * t)
          } else {
            const t = (progress - 0.8) / 0.2
            rCol = Math.round(240 + (120 - 240) * t)
            gCol = Math.round(180 + (230 - 180) * t)
            bCol = Math.round(50 + (140 - 50) * t)
          }

          const alpha = Math.max(0.15, envelope * (1 - Math.abs(r - numRibbons / 2) * 0.12))

          ctx.beginPath()
          const dotRadius = Math.max(0.6, 1.4 * envelope * (1 - Math.abs(r - numRibbons / 2) * 0.08))
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${alpha})`
          ctx.fill()
        }
      }

      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isPlaying])

  return (
    <div className="bg-[#050505] border border-neutral-900 rounded-2xl p-3 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-2">
          <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
          <span className="text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-widest">
            {isPlaying ? 'CANLI WAVAFORM AKIŞI' : 'BEKLEMEDE'}
          </span>
        </div>
        <span className="text-[9px] font-mono text-neutral-500">PARTICLE RIBBON</span>
      </div>
      <canvas ref={canvasRef} className="w-full h-40 rounded-xl" />
    </div>
  )
}

// --- TIMECODE PLANNER COMPONENT ---
function SetTimecodePlanner({ setTracks = [] }) {
  const [startTime, setStartTime] = useState('23:00')

  const calculateTimecodes = () => {
    let currentMinutes = 0
    const [startH, startM] = startTime.split(':').map(Number)
    const baseMinutes = (startH || 23) * 60 + (startM || 0)

    let peakTrackIndex = -1
    let maxEnergy = -1

    setTracks.forEach((t, i) => {
      if ((t.energy_level || 5) > maxEnergy) {
        maxEnergy = t.energy_level || 5
        peakTrackIndex = i
      }
    })

    const schedule = setTracks.map((track, idx) => {
      const trackMinutes = track.duration || 6
      const startTotal = baseMinutes + currentMinutes
      currentMinutes += trackMinutes

      const h = Math.floor(startTotal / 60) % 24
      const m = startTotal % 60
      const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

      return {
        ...track,
        timecode: formattedTime,
        durationMinutes: trackMinutes,
        isPeak: idx === peakTrackIndex && setTracks.length > 0
      }
    })

    const totalHours = Math.floor(currentMinutes / 60)
    const remainingMins = currentMinutes % 60
    const totalDurationText = totalHours > 0 ? `${totalHours}s ${remainingMins}dk` : `${currentMinutes}dk`

    return { schedule, totalDurationText, peakTrackIndex }
  }

  const { schedule, totalDurationText } = calculateTimecodes()

  return (
    <div className="bg-[#050505] border border-neutral-900 rounded-2xl p-4 font-mono space-y-3 shadow-2xl">
      <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">
            TIMECODE ZAMANLAYICI
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-400">BAŞLANGIÇ:</span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-white text-[10px] px-2 py-0.5 rounded focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] bg-neutral-900/60 p-2 rounded-xl border border-neutral-900">
        <span className="text-neutral-400">TOPLAM SÜRE: <strong className="text-white">{totalDurationText}</strong></span>
        <span className="text-neutral-400">PARÇA SAYISI: <strong className="text-white">{setTracks.length}</strong></span>
      </div>

      {schedule.length === 0 ? (
        <p className="text-[10px] text-neutral-600 text-center py-3">Zaman tablosu için sete parça ekleyin.</p>
      ) : (
        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
          {schedule.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className={`flex items-center justify-between text-[10px] p-2 rounded-lg border transition-all ${
                item.isPeak
                  ? 'bg-gradient-to-r from-orange-950/40 to-neutral-900 border-orange-500/50 text-white'
                  : 'bg-neutral-900/40 border-neutral-900 text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-white bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                  {item.timecode}
                </span>
                <span className="truncate max-w-[130px] font-medium">{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.isPeak && (
                  <span className="flex items-center gap-1 text-[9px] bg-orange-500 text-black font-bold px-1.5 py-0.2 rounded">
                    <Flame className="w-2.5 h-2.5" /> PEAK
                  </span>
                )}
                <span className="text-neutral-500">{item.durationMinutes}dk</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- DUAL DECK CROSSFADER SIMULATOR COMPONENT ---
function DualDeckSimulator({ tracks = [], onAddToSet }) {
  const [deckA, setDeckA] = useState(tracks[0] || null)
  const [deckB, setDeckB] = useState(tracks[1] || null)
  const [crossfader, setCrossfader] = useState(50)
  const [deckABpm, setDeckABpm] = useState(tracks[0]?.bpm || 128)
  const [deckBBpm, setDeckBBpm] = useState(tracks[1]?.bpm || 124)
  const [isPlayingA, setIsPlayingA] = useState(false)
  const [isPlayingB, setIsPlayingB] = useState(false)

  const syncBpm = () => {
    if (deckA) setDeckBBpm(deckABpm)
  }

  const transitionData = calculateTransitionScore(
    deckA ? { ...deckA, bpm: deckABpm } : null,
    deckB ? { ...deckB, bpm: deckBBpm } : null
  )

  return (
    <div className="bg-[#050505] border border-neutral-900 rounded-2xl p-4 font-mono space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-white" />
          <h2 className="text-xs font-bold text-white uppercase tracking-widest">
            DUAL-DECK CROSSFADER SİMÜLATÖRÜ
          </h2>
        </div>
        <span className="text-[10px] bg-neutral-900 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded">
          DECK MİKS İSTASYONU
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* DECK A */}
        <div className="bg-[#0a0a0c] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-xs font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              DECK A
            </span>
            <select
              value={deckA?.id || ''}
              onChange={(e) => {
                const found = tracks.find(t => t.id === e.target.value)
                setDeckA(found || null)
                if (found) setDeckABpm(found.bpm)
              }}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-[11px] px-2 py-1 rounded focus:outline-none max-w-[140px] truncate"
            >
              <option value="">Parça Seç...</option>
              {tracks.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.camelot_key})</option>
              ))}
            </select>
          </div>

          {deckA ? (
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-white truncate max-w-[130px]">{deckA.title}</h3>
                  <p className="text-[10px] text-neutral-400">{deckA.artist}</p>
                </div>
                <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-200 font-bold px-1.5 py-0.5 rounded">
                  {deckA.camelot_key}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] bg-neutral-900/60 p-2 rounded border border-neutral-900">
                <span>BPM: <strong className="text-white">{deckABpm}</strong></span>
                <input
                  type="range"
                  min={deckA.bpm - 10}
                  max={deckA.bpm + 10}
                  step="0.5"
                  value={deckABpm}
                  onChange={(e) => setDeckABpm(Number(e.target.value))}
                  className="w-20 accent-white h-1 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingA(!isPlayingA)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                    isPlayingA ? 'bg-white text-neutral-950' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {isPlayingA ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isPlayingA ? 'PAUSE' : 'PLAY'}
                </button>
                {onAddToSet && (
                  <button
                    onClick={() => onAddToSet(deckA)}
                    className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 p-1 rounded text-[9px]"
                  >
                    +Set
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-[10px] text-neutral-600">Deck A Boş</div>
          )}
        </div>

        {/* DECK B */}
        <div className="bg-[#0a0a0c] border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-xs font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              DECK B
            </span>
            <select
              value={deckB?.id || ''}
              onChange={(e) => {
                const found = tracks.find(t => t.id === e.target.value)
                setDeckB(found || null)
                if (found) setDeckBBpm(found.bpm)
              }}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-[11px] px-2 py-1 rounded focus:outline-none max-w-[140px] truncate"
            >
              <option value="">Parça Seç...</option>
              {tracks.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.camelot_key})</option>
              ))}
            </select>
          </div>

          {deckB ? (
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-white truncate max-w-[130px]">{deckB.title}</h3>
                  <p className="text-[10px] text-neutral-400">{deckB.artist}</p>
                </div>
                <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-200 font-bold px-1.5 py-0.5 rounded">
                  {deckB.camelot_key}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] bg-neutral-900/60 p-2 rounded border border-neutral-900">
                <div className="flex items-center gap-1">
                  <span>BPM: <strong className="text-white">{deckBBpm}</strong></span>
                  <button
                    onClick={syncBpm}
                    className="bg-white text-neutral-950 font-bold text-[8px] px-1 rounded hover:bg-neutral-200"
                  >
                    SYNC
                  </button>
                </div>
                <input
                  type="range"
                  min={deckB.bpm - 10}
                  max={deckB.bpm + 10}
                  step="0.5"
                  value={deckBBpm}
                  onChange={(e) => setDeckBBpm(Number(e.target.value))}
                  className="w-16 accent-white h-1 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingB(!isPlayingB)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                    isPlayingB ? 'bg-white text-neutral-950' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {isPlayingB ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isPlayingB ? 'PAUSE' : 'PLAY'}
                </button>
                {onAddToSet && (
                  <button
                    onClick={() => onAddToSet(deckB)}
                    className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 p-1 rounded text-[9px]"
                  >
                    +Set
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-[10px] text-neutral-600">Deck B Boş</div>
          )}
        </div>
      </div>

      {/* Crossfader */}
      <div className="bg-[#0a0a0c] border border-neutral-900 p-3 rounded-xl space-y-2">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-bold text-white">DECK A ({100 - crossfader}%)</span>
          <span className="text-neutral-500 font-bold">CROSSFADER</span>
          <span className="font-bold text-white">DECK B ({crossfader}%)</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={crossfader}
          onChange={(e) => setCrossfader(Number(e.target.value))}
          className="w-full accent-white h-2 bg-neutral-900 rounded-lg cursor-pointer"
        />

        {transitionData && (
          <div className="flex items-center justify-between text-[10px] bg-neutral-900/60 p-2 rounded border border-neutral-800/80">
            <span className="text-neutral-400">SKOR: <strong className="text-white">%{transitionData.score} ({transitionData.status})</strong></span>
            <span className="text-neutral-400 truncate max-w-[170px]">{transitionData.notes.join(' • ')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// --- GOOGLE GEMINI AI ASSISTANT COMPONENT ---
function GeminiKabinAssistant({ activeSet = [], tracks = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Selam DJ! Kabin asistanın Gemini burada. Sıradaki parça seçimi veya geçiş tüyosu lazım mı?' }
  ])
  const [isThinking, setIsThinking] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const askGemini = async (userPrompt) => {
    setIsThinking(true)
    const context = `
Sen kabindeki profesyonel bir DJ asistanısın.
Şu anki aktif set listesi (${activeSet.length} parça): ${activeSet.map(t => `${t.title} (${t.camelot_key}, ${t.bpm} BPM)`).join(', ')}.
Parça havuzu (${tracks.length} parça): ${tracks.map(t => `${t.title} (${t.camelot_key})`).join(', ')}.
Kullanıcıya öz ve profesyonel DJ geçiş tüyoları, BPM eşleme ve harmonik tavsiyeler ver.
`
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${import.meta.env?.VITE_GEMINI_API_KEY || ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${context}\n\nKullanıcı Sorusus: ${userPrompt}` }] }]
        })
      })

      const data = await response.json()
      const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Mümkün olan en uygun harmonik geçiş için 8A ve 9A tonlarındaki parçaları tercih edebilirsin!"
      setMessages(prev => [...prev, { role: 'assistant', text: aiReply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Geçiş için BPM farkı 3'ten az olan ve aynı Key tonuna sahip parçaları tercih etmeni öneririm!" }])
    } finally {
      setIsThinking(false)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    const userMsg = inputMessage
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInputMessage('')
    askGemini(userMsg)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-mono">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white hover:bg-neutral-200 text-neutral-950 font-bold p-3.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer transition-all border border-neutral-300"
        >
          <Bot className="w-5 h-5 text-neutral-950" />
          <span className="text-xs tracking-wider">GEMINI KABİN AI</span>
        </button>
      ) : (
        <div className="bg-[#050505] border border-neutral-800 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[420px]">
          <div className="bg-neutral-900/90 p-3 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">GEMINI AI ASİSTAN</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-[11px]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-white text-neutral-950 font-semibold ml-auto'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                }`}
              >
                {m.text}
              </div>
            ))}
            {isThinking && (
              <div className="bg-neutral-900 border border-neutral-800 p-2 rounded-xl text-neutral-400 text-[10px] flex items-center gap-2">
                <Sparkles className="w-3 h-3 animate-spin text-white" /> Gemini yanıt hazırlıyor...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-2 border-t border-neutral-800 flex gap-2 bg-[#050505]">
            <input
              type="text"
              placeholder="Geçiş veya parça önerisi iste..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            />
            <button type="submit" className="bg-white text-neutral-950 font-bold p-2 rounded-xl">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [tracks, setTracks] = useState(INITIAL_TRACKS)
  const [activeSet, setActiveSet] = useState([])
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [playingTrackId, setPlayingTrackId] = useState(null)

  // Multi-Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [minBpm, setMinBpm] = useState(100)
  const [maxBpm, setMaxBpm] = useState(160)
  const [minEnergy, setMinEnergy] = useState(1)
  const [selectedKeyFilter, setSelectedKeyFilter] = useState('ALL')
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    bpm: '',
    camelot_key: '8A',
    energy_level: 6,
    duration: 6
  })

  const handleAddTrack = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.artist || !formData.bpm) return

    const newTrack = {
      id: Date.now().toString(),
      title: formData.title,
      artist: formData.artist,
      bpm: parseFloat(formData.bpm),
      camelot_key: formData.camelot_key,
      energy_level: parseInt(formData.energy_level),
      duration: parseInt(formData.duration) || 6
    }

    setTracks(prev => [newTrack, ...prev])
    setFormData({ title: '', artist: '', bpm: '', camelot_key: '8A', energy_level: 6, duration: 6 })
  }

  const togglePlay = (track) => {
    setPlayingTrackId(prev => (prev === track.id ? null : track.id))
  }

  const addToSet = (track) => {
    setActiveSet(prev => [...prev, track])
  }

  const removeFromSet = (index) => {
    setActiveSet(prev => prev.filter((_, i) => i !== index))
  }

  const resetFilters = () => {
    setSearchQuery('')
    setMinBpm(100)
    setMaxBpm(160)
    setMinEnergy(1)
    setSelectedKeyFilter('ALL')
    setSelectedTrack(null)
  }

  // Filter Logic
  const filteredTracks = tracks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.artist.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBpm = t.bpm >= minBpm && t.bpm <= maxBpm
    const matchesEnergy = t.energy_level >= minEnergy
    const matchesKey = selectedKeyFilter === 'ALL' || t.camelot_key === selectedKeyFilter

    return matchesSearch && matchesBpm && matchesEnergy && matchesKey
  })

  const compatibleKeys = selectedTrack ? getCompatibleKeys(selectedTrack.camelot_key) : []

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 p-6 font-sans relative overflow-x-hidden">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex items-center justify-between pb-6 border-b border-neutral-900 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl">
            <Disc className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white flex items-center gap-2 font-mono">
              SOUNDGIT <span className="text-[10px] bg-white text-neutral-950 font-mono font-bold px-2 py-0.5 rounded-full">STUDIO</span>
            </h1>
            <p className="text-xs text-neutral-500 font-mono">Harmonic DJ Suite & Real-time Waveform Engine</p>
          </div>
        </div>
      </header>

      {/* Grid Layout */}
      <main className="max-w-7xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Sol Kolon: Parça Ekleme & Waveform Visualizer */}
        <section className="lg:col-span-3 space-y-4">
          <div className="bg-[#0a0a0c]/90 border border-neutral-900 p-5 rounded-2xl backdrop-blur-xl shadow-2xl space-y-4">
            <h2 className="text-xs font-bold text-neutral-300 flex items-center gap-2 uppercase tracking-widest font-mono border-b border-neutral-900 pb-3">
              <Music className="w-4 h-4 text-white" /> Yeni Parça Ekle
            </h2>
            <form onSubmit={handleAddTrack} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 mb-1">PARÇA ADI</label>
                <input
                  type="text"
                  placeholder="Örn: Domino"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-400 mb-1">SANATÇI</label>
                <input
                  type="text"
                  placeholder="Örn: Oxia"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 mb-1">BPM</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="128"
                    value={formData.bpm}
                    onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-2 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 mb-1">KEY</label>
                  <select
                    value={formData.camelot_key}
                    onChange={(e) => setFormData({ ...formData, camelot_key: e.target.value })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-1.5 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-white"
                  >
                    {['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B','7A','7B','8A','8B','9A','9B','10A','10B','11A','11B','12A','12B'].map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 mb-1">SÜRE(DK)</label>
                  <input
                    type="number"
                    placeholder="6"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-2 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                  <span>ENERJİ</span>
                  <span className="text-white font-bold">{formData.energy_level} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energy_level}
                  onChange={(e) => setFormData({ ...formData, energy_level: e.target.value })}
                  className="w-full accent-white cursor-pointer bg-neutral-800 rounded-lg h-1.5"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-neutral-200 text-neutral-950 font-bold py-2.5 px-4 rounded-xl transition-all text-xs mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-lg font-mono"
              >
                <Plus className="w-4 h-4" /> Havuza Ekle
              </button>
            </form>
          </div>

          <RealtimeWaveform isPlaying={Boolean(playingTrackId)} />
        </section>

        {/* Orta Kolon: Dual-Deck & Parça Havuzu */}
        <section className="lg:col-span-5 space-y-4">
          <DualDeckSimulator tracks={tracks} onAddToSet={addToSet} />

          <div className="bg-[#0a0a0c]/90 border border-neutral-900 p-5 rounded-2xl backdrop-blur-xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono">Parça Havuzu</h2>
                <span className="text-[10px] bg-neutral-900 text-neutral-400 border border-neutral-800 font-mono px-2 py-0.5 rounded-full">
                  {filteredTracks.length} / {tracks.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                    isFilterPanelOpen || searchQuery || minBpm > 100 || maxBpm < 160 || minEnergy > 1 || selectedKeyFilter !== 'ALL'
                      ? 'bg-white text-neutral-950 font-bold border-white'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" /> FİLTRE
                </button>
                {(searchQuery || minBpm > 100 || maxBpm < 160 || minEnergy > 1 || selectedKeyFilter !== 'ALL' || selectedTrack) && (
                  <button
                    onClick={resetFilters}
                    className="text-[10px] font-mono text-neutral-500 hover:text-white flex items-center gap-1 underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Arama Inputu */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Parça adı veya sanatçı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050505] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-white font-mono"
              />
            </div>

            {/* Parça Listesi */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {filteredTracks.map((track) => {
                const isSelected = selectedTrack?.id === track.id
                const isCompatible = selectedTrack && compatibleKeys.includes(track.camelot_key)
                const isPlaying = playingTrackId === track.id

                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrack(isSelected ? null : track)}
                    className={`cursor-pointer p-2.5 rounded-xl flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-white/10 border-white text-white'
                        : isCompatible
                        ? 'bg-neutral-900/80 border-neutral-700'
                        : 'bg-[#050505] border-neutral-900 hover:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePlay(track)
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isPlaying ? 'bg-white text-neutral-950' : 'bg-neutral-900 text-neutral-300'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                      <div>
                        <h3 className="font-semibold text-neutral-200 text-xs">{track.title}</h3>
                        <p className="text-[10px] text-neutral-500">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                        {track.camelot_key}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900/50 px-1.5 py-0.5 rounded">
                        {track.bpm}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToSet(track)
                        }}
                        className="bg-neutral-900 hover:bg-white hover:text-neutral-950 text-neutral-300 text-xs p-1.5 rounded-lg transition-colors border border-neutral-800"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Sağ Kolon: Aktif Set Akışı & Timecode Planner */}
        <section className="lg:col-span-4 bg-[#0a0a0c]/90 border border-neutral-900 p-5 rounded-2xl space-y-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
            <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-2 font-mono">
              <Zap className="w-4 h-4 text-white" /> Aktif Set Akışı
            </h2>
            <span className="text-[11px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded-lg font-mono font-bold">
              {activeSet.length}
            </span>
          </div>

          <SetTimecodePlanner setTracks={activeSet} />

          {activeSet.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-neutral-900 rounded-xl p-4 space-y-2">
              <Sparkles className="w-5 h-5 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-500 font-mono">
                Set listesi boş. Havuzdan parçalar ekleyerek akışı başlatın.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {activeSet.map((track, index) => {
                const prevTrack = index > 0 ? activeSet[index - 1] : null
                const transition = calculateTransitionScore(prevTrack, track)

                return (
                  <div key={`${track.id}-${index}`}>
                    {transition && (
                      <div className="my-1 py-1 px-2 rounded text-[9px] font-mono flex items-center justify-between border bg-[#050505] border-neutral-900 text-neutral-400">
                        <span className="flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-white" /> Geçiş #{index}:
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{transition.notes.join(' • ')}</span>
                          <span className="px-1 py-0.2 rounded bg-white text-neutral-950 font-bold">
                            %{transition.score}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="bg-[#050505] border border-neutral-900 p-2.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-neutral-600 font-bold w-4">
                          {index + 1}.
                        </span>
                        <div>
                          <h4 className="text-xs font-medium text-neutral-200">{track.title}</h4>
                          <p className="text-[10px] text-neutral-500">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono font-bold px-1.5 py-0.5 rounded">
                          {track.camelot_key}
                        </span>
                        <button
                          onClick={() => removeFromSet(index)}
                          className="text-neutral-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* Floating Gemini AI Assistant */}
      <GeminiKabinAssistant activeSet={activeSet} tracks={tracks} />
    </div>
  )
}