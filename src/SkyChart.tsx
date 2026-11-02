
import type { SkyTarget } from './astronomy'

type SkyChartProps = {
  targets: SkyTarget[]
}

export default function SkyChart({ targets }: SkyChartProps) {
  const center = 180
  const radius = 140

  function getCoordinates(altitude: number, azimuth: number) {
    const distance = radius * (90 - altitude) / 90
    const angle = (azimuth * Math.PI) / 180

    return {
      x: center + distance * Math.sin(angle),
      y: center - distance * Math.cos(angle)
    }
  }

  return (
    <section className="sky-chart">
      <h2>Your Sky Chart</h2>
      <p>A view of the sky based on your selected observation time.</p>

      <svg
        viewBox="0 0 360 360"
        role="img"
        aria-label="Sky chart with recommended observing targets"
      >
        <circle
          cx="180"
          cy="180"
          r="140"
          fill="#0b1530"
          stroke="#718bff"
          strokeWidth="2"
        />

        <circle
          cx="180"
          cy="180"
          r="70"
          fill="none"
          stroke="#465b85"
          strokeDasharray="4 5"
        />

        <text x="180" y="25" textAnchor="middle" fill="white">N</text>
        <text x="180" y="350" textAnchor="middle" fill="white">S</text>
        <text x="20" y="185" textAnchor="middle" fill="white">W</text>
        <text x="340" y="185" textAnchor="middle" fill="white">E</text>

        {targets.map((target) => {
          const { x, y } = getCoordinates(
            target.altitude,
            target.azimuth
          )

          return (
            <g key={target.name}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="#ffe59a"
                stroke="white"
                strokeWidth="1"
              />
              <text
                x={x}
                y={y - 12}
                fill="white"
                fontSize="12"
                textAnchor="middle"
              >
                {target.name}
              </text>
            </g>
          )
        })}
      </svg>

      <p>
        The outer circle represents the horizon.
        The centre represents directly overhead.
      </p>
    </section>
  )
}
