import { getCompatibleKeys } from './camelot'

export function calculateTransitionScore(trackA, trackB) {
  if (!trackA || !trackB) return null

  let score = 100
  const notes = []

  // 1. Camelot Key Analizi
  const compatibleKeys = getCompatibleKeys(trackA.camelot_key)
  const isKeyMatch = compatibleKeys.includes(trackB.camelot_key)
  
  if (trackA.camelot_key === trackB.camelot_key) {
    notes.push('Same Key (Tam Ton Uyum)')
  } else if (isKeyMatch) {
    notes.push('Harmonic Transition (Harmonik Geçiş)')
  } else {
    score -= 35
    notes.push('Key Clash (Ton Uyumsuzluğu)')
  }

  // 2. BPM Farkı Analizi
  const bpmDiff = Math.abs(trackA.bpm - trackB.bpm)
  const bpmPercentDiff = (bpmDiff / trackA.bpm) * 100

  if (bpmDiff === 0) {
    notes.push('Exact BPM Match')
  } else if (bpmPercentDiff <= 3) {
    notes.push(`Smooth Tempo Change (±${bpmDiff.toFixed(1)} BPM)`)
  } else if (bpmPercentDiff <= 6) {
    score -= 15
    notes.push(`Noticeable Tempo Shift (±${bpmDiff.toFixed(1)} BPM)`)
  } else {
    score -= 35
    notes.push(`Extreme BPM Jump (±${bpmDiff.toFixed(1)} BPM)`)
  }

  // 3. Enerji Seviyesi Değişimi
  const energyDiff = trackB.energy_level - trackA.energy_level
  if (Math.abs(energyDiff) <= 2) {
    notes.push('Steady Energy Flow')
  } else if (energyDiff > 2) {
    notes.push(`Energy Boost (+${energyDiff})`)
  } else {
    notes.push(`Energy Drop (${energyDiff})`)
  }

  const finalScore = Math.max(0, score)
  let status = 'PERFECT'
  let color = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'

  if (finalScore < 65) {
    status = 'RISKY'
    color = 'text-rose-400 border-rose-500/30 bg-rose-500/10'
  } else if (finalScore < 85) {
    status = 'GOOD'
    color = 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  }

  return { score: finalScore, status, color, notes }
}