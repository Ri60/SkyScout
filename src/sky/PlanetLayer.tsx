import type { ProjectPoint, SkyScene } from './types'

type PlanetLayerProps = {
  planets: SkyScene['planets']
  magnitudeLimit: number
  showLabels: boolean
  glowId: string
  projectVisible: ProjectPoint
}

export default function PlanetLayer({
  planets,
  magnitudeLimit,
  showLabels,
  glowId,
  projectVisible
}: PlanetLayerProps) {
  return (
    <>
      {planets
        .filter(
          (body) => body.magnitude <= magnitudeLimit || body.name === 'Moon'
        )
        .map((body) => {
          const point = projectVisible(body)
          if (!point) return null
          const isMoon = body.moon !== undefined
          const illuminationLabel = isMoon
            ? ` · ${Math.round(body.moon! * 100)}% lit`
            : ''

          return (
            <g key={body.name}>
              <title>
                {body.name}: {body.altitude.toFixed(1)}° high, azimuth{' '}
                {body.azimuth.toFixed(1)}°
              </title>
              <circle
                cx={point.x}
                cy={point.y}
                r={isMoon ? 26 : 12}
                fill={`url(#${glowId})`}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={isMoon ? 9 : Math.max(1.5, 4 - body.magnitude * 0.4)}
                fill={body.color}
              />
              {showLabels && (
                <text
                  x={point.x + 12}
                  y={point.y - 12}
                  fill="#ffe9b8"
                  fontSize="14"
                >
                  {body.name}
                  {illuminationLabel}
                </text>
              )}
            </g>
          )
        })}
    </>
  )
}
