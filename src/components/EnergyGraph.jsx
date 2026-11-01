// src/components/EnergyGraph.jsx
import React from 'react'

export function EnergyGraph({ setTracks }) {
  if (!setTracks || setTracks.length === 0) {
    return (
      <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl text-center">
        <p className="text-xs text-neutral-500">
          Enerji grafiğini görmek için Aktif Sete parça ekleyin.
        </p>
      </div>
    )
  }

  const width = 400
  const height = 120
  const padding = 20

  const maxEnergy = 10
  const minEnergy = 1

  const points = setTracks.map((track, i) => {
    const x =
      setTracks.length === 1
        ? width / 2
        : padding + (i / (setTracks.length - 1)) * (width - padding * 2)
    const y =
      height -
      padding -
      ((track.energy_level - minEnergy) / (maxEnergy - minEnergy)) *
        (height - padding * 2)
    return { x, y, energy: track.energy_level, title: track.title }
  })

  const pathD = points.reduce((acc, point, index) => {
    return index === 0
      ? `M ${point.x} ${point.y}`
      : `${acc} L ${point.x} ${point.y}`
  }, '')

  const avgEnergy = (
    setTracks.reduce((acc, t) => acc + Number(t.energy_level), 0) /
    setTracks.length
  ).toFixed(1)

  return (
    <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <span className="text-amber-500">📈</span> Enerji Eğrisi
        </h3>
        <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Ort. Enerji: {avgEnergy} / 10
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-32 overflow-visible"
        >
          {/* Arka Plan Kılavuz Çizgileri */}
          {[2, 4, 6, 8, 10].map((val) => {
            const yVal =
              height -
              padding -
              ((val - minEnergy) / (maxEnergy - minEnergy)) *
                (height - padding * 2)
            return (
              <line
                key={val}
                x1={padding}
                y1={yVal}
                x2={width - padding}
                y2={yVal}
                stroke="#262626"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            )
          })}

          {/* Çizgi Grafiği */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Veri Noktaları */}
          {points.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                className="fill-amber-500 stroke-neutral-950 stroke-2 group-hover:r-6 transition-all"
              />
              <text
                x={pt.x}
                y={pt.y - 8}
                textAnchor="middle"
                className="fill-neutral-400 text-[9px] font-mono font-bold"
              >
                ⚡{pt.energy}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}