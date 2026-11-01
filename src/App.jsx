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
  Send
} from 'lucide-react'

// --- HELPER LOGIC & CONSTANTS ---
const INITIAL_TRACKS = [
  { id: '1', title: 'Domino', artist: 'Oxia', bpm: 128, camelot_key: '8A', energy_level: 7 },
  { id: '2', title: 'Adama Twins', artist: 'Adana Twins', bpm: 124, camelot_key: '8A', energy_level: 8 },
  { id: '3', title: 'Opus', artist: 'Eric Prydz', bpm: 126, camelot_key: '9A', energy_level: 9 },
  { id: '4', title: 'Finder', artist: 'Ninetoes', bpm: 120, camelot_key: '8B', energy_level: 6 }
]

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
    notes.push('Energy Flow Maintained')
  }

  const finalScore = Math.max(10, score)
  let status = 'PERFECT'
  if (finalScore < 60) status = 'RISKY'
  else if (finalScore < 85) status = 'GOOD'

  return { score: finalScore, status, notes }
}

// --- MONOCHROME ENERGY GRAPH COMPONENT ---
function EnergyGraph({ setTracks = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const width = 320
  const height = 130
  const padding = 24

  const points = (setTracks || []).map((track, idx) => {
    const x =
      setTracks.length === 1
        ? width / 2
        : padding + (idx / (setTracks.length - 1)) * (width - padding * 2)
    const energy = track.energy_level || 5
    const y = height - padding - (energy / 10) * (height - padding * 2)
    return { x, y, energy, title: track.title, artist: track.artist, key: track.camelot_key, idx }
  })

  const avgEnergy = setTracks.length > 0 
    ? (setTracks.reduce((acc, t) => acc + (t.energy_level || 5), 0) / setTracks.length).toFixed(1)
    : 0

  let flowTag = 'Dengeli'
  if (setTracks.length > 1) {
    const firstHalf = setTracks.slice(0, Math.ceil(setTracks.length / 2))
    const secondHalf = setTracks.slice(Math.ceil(setTracks.length / 2))
    const avgFirst = firstHalf.reduce((a, b) => a + (b.energy_level || 5), 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((a, b) => a + (b.energy_level || 5), 0) / secondHalf.length
    
    if (avgSecond - avgFirst >= 1.5) flowTag = 'Build-up 📈'
    else if (avgFirst - avgSecond >= 1.5) flowTag = 'Cool-down 📉'
    else if (parseFloat(avgEnergy) >= 7.5) flowTag = 'Peak Time 🔥'
  }

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
  }, '')

  const areaD = points.length > 1 
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : ''

  if (!setTracks || setTracks.length === 0) {
    return (
      <div className="h-36 flex flex-col items-center justify-center border border-dashed border-neutral-900 rounded-xl p-4 text-center bg-[#050505]">
        <Activity className="w-5 h-5 text-neutral-600 mb-2" />
        <span className="text-[11px] font-mono text-neutral-400 font-bold">FONKSİYONEL ENERJİ ANALİZİ</span>
        <span className="text-[10px] text-neutral-600 mt-1">Sete parçalar eklendikçe enerji akışı ve geçiş ipuçları burada hesaplanır</span>
      </div>
    )
  }

  return (
    <div className="bg-[#050505] border border-neutral-900 rounded-xl p-3.5 space-y-2 relative">
      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
        <span className="flex items-center gap-1.5 font-bold text-neutral-200">
          <Activity className="w-3.5 h-3.5 text-white animate-pulse" /> SET AKIŞ EĞRİSİ
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-neutral-900 text-neutral-300 border border-neutral-800 px-2 py-0.5 rounded text-[10px]">
            {flowTag}
          </span>
          <span className="text-white font-bold">Ort: {avgEnergy}/10</span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
          <defs>
            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <rect x={padding} y={padding} width={width - padding * 2} height={(height - padding * 2) * 0.3} fill="#ffffff" fillOpacity="0.02" />
          <text x={width - padding - 4} y={padding + 10} textAnchor="end" className="fill-neutral-700 text-[8px] font-mono">PEAK (8-10)</text>

          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#171717" strokeDasharray="2 2" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#171717" strokeDasharray="2 2" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#171717" strokeDasharray="2 2" />

          {points.length > 1 && (
            <path d={areaD} fill="url(#energyGradient)" />
          )}

          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            />
          )}

          {points.map((pt) => {
            const isHovered = hoveredPoint?.idx === pt.idx
            return (
              <g 
                key={pt.idx} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {isHovered && (
                  <circle cx={pt.x} cy={pt.y} r="8" className="fill-white/20 animate-ping" />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "5.5" : "4"}
                  className={`${isHovered ? 'fill-white stroke-neutral-950' : 'fill-white stroke-neutral-900'} stroke-2 transition-all`}
                />
                <text
                  x={pt.x}
                  y={pt.y - 8}
                  textAnchor="middle"
                  className={`text-[9px] font-mono font-bold ${isHovered ? 'fill-white' : 'fill-neutral-400'}`}
                >
                  {pt.energy}
                </text>
              </g>
            )
          })}
        </svg>

        {hoveredPoint && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-neutral-900/95 border border-neutral-700 text-white text-[10px] px-2.5 py-1 rounded-lg font-mono shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-none">
            <span className="font-bold text-white">#{hoveredPoint.idx + 1} {hoveredPoint.title}</span>
            <span className="text-neutral-400">({hoveredPoint.key})</span>
            <span className="bg-white text-neutral-950 font-bold px-1 rounded text-[9px]">E:{hoveredPoint.energy}</span>
          </div>
        )}
      </div>

      <div className="text-[10px] text-neutral-500 font-mono flex items-center justify-between border-t border-neutral-900/80 pt-1.5">
        <span>Görselleştirme: Traktor / Rekordbox Akışı</span>
        <span className="text-neutral-400">Noktaların üzerine gelerek detay görün</span>
      </div>
    </div>
  )
}

// --- 3D PARTICLE WAVE CANVAS BACKGROUND (DRIBBBLE STYLE) ---
function ParticleWaveCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const rows = 45
    const cols = 90
    let stepX = width / cols
    let stepY = height / rows
    let count = 0

    const render = () => {
      count += 0.025
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, width, height)

      ctx.save()
      ctx.translate(width / 2, height / 1.7)
      ctx.rotate(-0.15)

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const posX = (x - cols / 2) * (stepX * 1.1)
          const posY = (y - rows / 2) * (stepY * 0.75)

          const dist = Math.sqrt(posX * posX + posY * posY)
          const waveZ = Math.sin(dist * 0.008 - count) * 35 + Math.cos(posX * 0.01 + count) * 20

          const perspective = 500 / (500 + posY)
          const renderX = posX * perspective
          const renderY = (posY + waveZ) * perspective
          const particleSize = Math.max(0.6, ((waveZ + 50) / 45) * perspective)
          const alpha = Math.min(0.85, Math.max(0.08, ((waveZ + 40) / 80) * perspective))

          ctx.beginPath()
          ctx.arc(renderX, renderY, particleSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.fill()
        }
      }

      ctx.restore()
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
    />
  )
}

function App() {
  const [tracks, setTracks] = useState(() => {
    const saved = localStorage.getItem('setflow_tracks')
    return saved ? JSON.parse(saved) : INITIAL_TRACKS
  })
  const [activeSet, setActiveSet] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState(null)

  const [playingTrackId, setPlayingTrackId] = useState(null)
  const [audioSrc, setAudioSrc] = useState(null)
  const audioRef = useRef(null)

  // AI Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [inputMsg, setInputMsg] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Selam DJ! Ben SoundGit Asistan. Harmonik geçişler, BPM uyumu veya sıradaki parça önerisi için bana danışabilirsin.'
    }
  ])
  const chatBottomRef = useRef(null)

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isChatOpen])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMsg.trim()) return

    const userText = inputMsg
    setMessages((prev) => [...prev, { sender: 'user', text: userText }])
    setInputMsg('')

    setTimeout(() => {
      let responseText = 'Harmonik geçiş için Camelot tekerleğindeki aynı sayı grubunu veya 1 adım yanındaki key değerini seçebilirsin.'
      const lower = userText.toLowerCase()

      if (lower.includes('öner') || lower.includes('sıradaki') || lower.includes('tavsiye')) {
        if (activeSet.length > 0) {
          const lastTrack = activeSet[activeSet.length - 1]
          const compatible = getCompatibleKeys(lastTrack.camelot_key)
          const match = tracks.find(
            (t) => compatible.includes(t.camelot_key) && !activeSet.some((s) => s.id === t.id)
          )
          if (match) {
            responseText = `Son parçan "${lastTrack.title}" (${lastTrack.camelot_key}) ile uyumlu mükemmel aday: "${match.title} - ${match.artist}" (${match.camelot_key}, ${match.bpm} BPM).`
          } else {
            responseText = `Son parçan "${lastTrack.title}" (${lastTrack.camelot_key}) için kütüphanede birebir uyumlu başka parça kalmadı. ${compatible.join(', ')} key grubunda yeni parça ekleyebilirsin.`
          }
        } else {
          responseText = 'Aktif setinde henüz parça yok. Parça havuzundan ilk parçanı eklediğinde sana bir sonraki en iyi geçişi önereceğim!'
        }
      } else if (lower.includes('bpm') || lower.includes('tempo')) {
        responseText = 'Geçişlerde BPM farkının ±3 BPM civarında kalması ritim hissini pürüzsüz tutar.'
      } else if (lower.includes('key') || lower.includes('harmonik') || lower.includes('camelot')) {
        responseText = 'Camelot Wheel kuralı: 8A çalıyorsan 8A (birebir), 7A veya 9A (harmonik geçiş), ya da 8B (majör/minör dönüşümü) parçalara sorunsuz geçebilirsin.'
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: responseText }])
    }, 400)
  }

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    bpm: '',
    camelot_key: '8A',
    energy_level: 6
  })

  useEffect(() => {
    localStorage.setItem('setflow_tracks', JSON.stringify(tracks))
  }, [tracks])

  const fetchTracks = async () => {
    setLoading(true)
    setTimeout(() => {
      const saved = localStorage.getItem('setflow_tracks')
      if (saved) setTracks(JSON.parse(saved))
      setLoading(false)
    }, 200)
  }

  const handleAddTrack = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.artist || !formData.bpm) return

    const newTrack = {
      id: Date.now().toString(),
      title: formData.title,
      artist: formData.artist,
      bpm: parseFloat(formData.bpm),
      camelot_key: formData.camelot_key,
      energy_level: parseInt(formData.energy_level)
    }

    setTracks((prev) => [newTrack, ...prev])
    setFormData({ title: '', artist: '', bpm: '', camelot_key: '8A', energy_level: 6 })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const fileUrl = URL.createObjectURL(file)
      setAudioSrc(fileUrl)
      setPlayingTrackId('local-file')
      if (audioRef.current) {
        audioRef.current.src = fileUrl
        audioRef.current.play()
      }
    }
  }

  const togglePlay = (track) => {
    const mockAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

    if (playingTrackId === track.id) {
      if (audioRef.current) audioRef.current.pause()
      setPlayingTrackId(null)
    } else {
      setAudioSrc(mockAudioUrl)
      setPlayingTrackId(track.id)
      if (audioRef.current) {
        audioRef.current.src = mockAudioUrl
        audioRef.current.play()
      }
    }
  }

  const addToSet = (track) => {
    setActiveSet((prev) => [...prev, track])
  }

  const removeFromSet = (index) => {
    setActiveSet((prev) => prev.filter((_, i) => i !== index))
  }

  const exportActiveSet = () => {
    if (activeSet.length === 0) return

    let content = "========================================\n"
    content += "      SOUNDGIT - PARTICLE WAVE DJ SET   \n"
    content += "========================================\n\n"

    activeSet.forEach((track, index) => {
      const prevTrack = index > 0 ? activeSet[index - 1] : null
      const transition = calculateTransitionScore(prevTrack, track)

      if (transition) {
        content += `  ↳ [GEÇİŞ #${index}] %${transition.score} ${transition.status} (${transition.notes.join(' • ')})\n`
      }

      content += `${index + 1}. ${track.title} - ${track.artist}\n`
      content += `   Key: ${track.camelot_key} | BPM: ${track.bpm} | Enerji: ${track.energy_level}/10\n`
      content += `----------------------------------------\n`
    })

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SoundGit-ParticleWave-${new Date().toISOString().slice(0, 10)}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportRekordboxXML = () => {
    if (activeSet.length === 0) return

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<DJ_PLAYLISTS Version="1.0.0">\n`
    xml += `  <PRODUCT Name="SoundGit" Version="2.0" Company="SoundGit Online"/>\n`
    xml += `  <COLLECTION Entries="${activeSet.length}">\n`

    activeSet.forEach((track, idx) => {
      xml += `    <TRACK TrackID="${idx + 1}" Name="${track.title}" Artist="${track.artist}" AverageBpm="${track.bpm}" Tonality="${track.camelot_key}" Comments="Energy:${track.energy_level}/10"/>\n`
    })

    xml += `  </COLLECTION>\n`
    xml += `  <PLAYLISTS>\n`
    xml += `    <NODE Type="0" Name="ROOT">\n`
    xml += `      <NODE Type="1" Name="SoundGit Rekordbox Set">\n`
    
    activeSet.forEach((_, idx) => {
      xml += `        <TRACK Key="${idx + 1}"/>\n`
    })

    xml += `      </NODE>\n`
    xml += `    </NODE>\n`
    xml += `  </PLAYLISTS>\n`
    xml += `</DJ_PLAYLISTS>`

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SoundGit-Rekordbox-${new Date().toISOString().slice(0, 10)}.xml`
    link.click()
    URL.revokeObjectURL(url)
  }

  const compatibleKeys = selectedTrack ? getCompatibleKeys(selectedTrack.camelot_key) : []

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 p-6 font-sans relative overflow-x-hidden">
      <ParticleWaveCanvas />
      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} />

      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-wrap items-center justify-between pb-6 border-b border-neutral-900 relative z-10 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl shadow-2xl backdrop-blur-md">
            <Disc className="w-5 h-5 animate-spin text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white flex items-center gap-2">
              SOUNDGIT <span className="text-[10px] bg-white text-neutral-950 font-mono font-bold px-2 py-0.5 rounded-full tracking-normal shadow-sm">ONLINE v2.0</span>
            </h1>
            <p className="text-xs text-neutral-500 font-mono tracking-wide">Harmonic Set Engine & Immersive Wave UI</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 hover:border-neutral-600 text-neutral-300 px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer backdrop-blur-md shadow-sm">
            <Upload className="w-3.5 h-3.5 text-white" /> Yerel MP3 Çal
            <input type="file" accept="audio/mp3,audio/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={fetchTracks}
            className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 hover:border-neutral-600 text-neutral-300 px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer backdrop-blur-md shadow-sm"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-neutral-400" /> Yenile
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Sol Kolon: Parça Ekleme Formu */}
        <section className="lg:col-span-3 bg-[#0a0a0c]/90 border border-neutral-900/90 p-5 rounded-2xl h-fit backdrop-blur-xl shadow-2xl space-y-4">
          <h2 className="text-xs font-bold text-neutral-300 flex items-center gap-2 uppercase tracking-widest font-mono border-b border-neutral-900 pb-3">
            <Music className="w-4 h-4 text-white" /> Yeni Parça Ekle
          </h2>
          <form onSubmit={handleAddTrack} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-mono font-medium text-neutral-400 mb-1">PARÇA ADI</label>
              <input
                type="text"
                placeholder="Örn: Domino"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-medium text-neutral-400 mb-1">SANATÇI</label>
              <input
                type="text"
                placeholder="Örn: Oxia"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-medium text-neutral-400 mb-1">BPM</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="128"
                  value={formData.bpm}
                  onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-white transition-colors font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-medium text-neutral-400 mb-1">KEY</label>
                <select
                  value={formData.camelot_key}
                  onChange={(e) => setFormData({ ...formData, camelot_key: e.target.value })}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-white transition-colors font-mono"
                >
                  {['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B','7A','7B','8A','8B','9A','9B','10A','10B','11A','11B','12A','12B'].map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                <span>ENERJİ SEVİYESİ</span>
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
              className="w-full bg-white hover:bg-neutral-200 text-neutral-950 font-bold py-2.5 px-4 rounded-xl transition-all text-xs mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/5"
            >
              <Plus className="w-4 h-4" /> Havuza Ekle
            </button>
          </form>
        </section>

        {/* Orta Kolon: Parça Havuzu */}
        <section className="lg:col-span-5 bg-[#0a0a0c]/90 border border-neutral-900/90 p-5 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-900">
              <div>
                <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono">Parça Havuzu</h2>
                {selectedTrack && (
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Filtrelenen Key: <strong className="text-white font-mono">{selectedTrack.camelot_key}</strong>
                  </p>
                )}
              </div>
              {selectedTrack && (
                <button
                  onClick={() => setSelectedTrack(null)}
                  className="text-[10px] text-neutral-500 hover:text-white underline cursor-pointer font-mono"
                >
                  Filtreyi Kaldır
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-xs text-neutral-600 font-mono">Parçalar yükleniyor...</p>
            ) : tracks.length === 0 ? (
              <p className="text-xs text-neutral-600 font-mono">Henüz parça yok.</p>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {tracks.map((track) => {
                  const isSelected = selectedTrack?.id === track.id
                  const isCompatible = selectedTrack && compatibleKeys.includes(track.camelot_key)
                  const isPlaying = playingTrackId === track.id

                  return (
                    <div
                      key={track.id}
                      onClick={() => setSelectedTrack(isSelected ? null : track)}
                      className={`cursor-pointer p-3 rounded-xl flex items-center justify-between border transition-all ${
                        isSelected
                          ? 'bg-white/10 border-white text-white shadow-lg'
                          : isCompatible
                          ? 'bg-neutral-900/80 border-neutral-700 hover:border-neutral-500'
                          : selectedTrack
                          ? 'bg-[#050505]/40 border-neutral-900 opacity-30'
                          : 'bg-[#050505] border-neutral-900 hover:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePlay(track)
                          }}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            isPlaying ? 'bg-white text-neutral-950' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
                          }`}
                          title="Ön Dinleme"
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>

                        <div>
                          <h3 className="font-semibold text-neutral-200 text-xs flex items-center gap-1.5">
                            {track.title}
                            {isCompatible && !isSelected && (
                              <span className="text-[9px] bg-white text-neutral-950 font-bold px-1.5 py-0.2 rounded font-mono">
                                MATCH
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] text-neutral-500">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg">
                          {track.camelot_key}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900/50 px-2 py-0.5 rounded-lg">
                          {track.bpm}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addToSet(track)
                          }}
                          className="bg-neutral-900 hover:bg-white hover:text-neutral-950 text-neutral-300 text-xs p-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-neutral-800"
                          title="Sete Ekle"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Sağ Kolon: Aktif Set Builder */}
        <section className="lg:col-span-4 bg-[#0a0a0c]/90 border border-neutral-900/90 p-5 rounded-2xl space-y-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
            <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-2 font-mono">
              <Zap className="w-4 h-4 text-white" /> Aktif Set Akışı
            </h2>
            <div className="flex items-center gap-2">
              {activeSet.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={exportRekordboxXML}
                    className="bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-[10px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-mono shadow-sm"
                    title="Rekordbox XML Olarak İndir"
                  >
                    <Download className="w-3 h-3 text-neutral-950" /> Rekordbox XML
                  </button>
                  <button
                    onClick={exportActiveSet}
                    className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[10px] px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-mono"
                    title="TXT Rapor İndir"
                  >
                    TXT
                  </button>
                </div>
              )}
              <span className="text-[11px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded-lg font-mono font-bold">
                {activeSet.length}
              </span>
            </div>
          </div>

          {activeSet.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-neutral-900 rounded-xl p-4 space-y-2">
              <Sparkles className="w-5 h-5 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-500 font-mono">
                Set listesi boş. Havuzdan parçalar ekleyerek akışı başlatın.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {activeSet.map((track, index) => {
                const prevTrack = index > 0 ? activeSet[index - 1] : null
                const transition = calculateTransitionScore(prevTrack, track)

                return (
                  <div key={`${track.id}-${index}`}>
                    {transition && (
                      <div className="my-1.5 py-1 px-2.5 rounded-lg text-[10px] font-mono flex items-center justify-between border bg-[#050505] border-neutral-900 text-neutral-400">
                        <span className="flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-white" /> Geçiş #{index}:
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{transition.notes.join(' • ')}</span>
                          <span className="px-1.5 py-0.2 rounded bg-white text-neutral-950 font-bold">
                            %{transition.score}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="bg-[#050505] border border-neutral-900 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
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
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {track.bpm}
                        </span>
                        <button
                          onClick={() => removeFromSet(index)}
                          className="text-neutral-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                          title="Setten Çıkar"
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

          <div className="pt-2 border-t border-neutral-900">
            <EnergyGraph setTracks={activeSet} />
          </div>
        </section>

      </main>

      {/* SOUNDGIT ASİSTAN (FLOATING WIDGET) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2.5 bg-white hover:bg-neutral-200 text-neutral-950 font-bold px-4 py-3 rounded-full shadow-2xl transition-all hover:scale-105 cursor-pointer font-mono text-xs border border-neutral-300"
          >
            <Bot className="w-4 h-4 text-neutral-950 animate-bounce" />
            <span>SOUNDGİT ASİSTAN</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-[#0a0a0c]/95 border border-neutral-800 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden font-mono text-xs transition-all">
            <div className="bg-neutral-900/90 border-b border-neutral-800 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">SoundGit Asistan</h3>
                  <p className="text-[9px] text-neutral-400">Canlı Kabin & Miks Tavsiyeleri</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-neutral-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 space-y-3 h-72 overflow-y-auto bg-[#050505]/50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-2.5 rounded-xl max-w-[80%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-white text-neutral-950 font-semibold rounded-tr-none'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none'
                    }`}
                  >
                    {typeof msg.text === 'string' ? msg.text : String(msg.text)}
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-2.5 bg-neutral-900/90 border-t border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Örn: Sıradaki parçayı öner..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 bg-[#050505] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
              />
              <button
                type="submit"
                className="bg-white hover:bg-neutral-200 text-neutral-950 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default App