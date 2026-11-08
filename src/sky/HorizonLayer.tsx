import { COMPASS_DIRECTIONS, type ProjectPoint } from './types'

type HorizonLayerProps = {
  projectPoint: ProjectPoint
  projectVisible: ProjectPoint
}

export default function HorizonLayer({
  projectPoint,
  projectVisible
}: HorizonLayerProps) {
  return (
    <>
      {Array.from({ length: 360 }, (_, azimuth) => {
        const start = projectPoint({ altitude: 0, azimuth })
        const end = projectPoint({ altitude: 0, azimuth: azimuth + 1 })
        // Skip edges behind the camera or crossing the projection discontinuity.
        if (!start || !end || Math.abs(start.x - end.x) > 100) return null
        const ground = `M${start.x},${start.y} L${end.x},${end.y} L${end.x},20000 L${start.x},20000 Z`
        return <path key={azimuth} d={ground} fill="#070f16" />
      })}
      {COMPASS_DIRECTIONS.map((direction, index) => {
        const point = projectVisible({ altitude: 2, azimuth: index * 45 })
        return point ? (
          <text
            key={direction}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            fill="#d4e4eb"
            fontSize="16"
          >
            {direction}
          </text>
        ) : null
      })}
    </>
  )
}
