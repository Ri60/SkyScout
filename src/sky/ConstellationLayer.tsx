import type { ProjectPoint, SkyScene } from './types'

type ConstellationLayerProps = {
  lines: SkyScene['lines']
  projectVisible: ProjectPoint
}

export default function ConstellationLayer({
  lines,
  projectVisible
}: ConstellationLayerProps) {
  return (
    <>
      {lines.map((line, index) => (
        <g key={index}>
          {line.slice(1).map((point, segmentIndex) => {
            const previous = line[segmentIndex]
            const start = projectVisible(previous)
            const end = projectVisible(point)
            if (!start || !end || previous.altitude <= 0 || point.altitude <= 0)
              return null

            return (
              <line
                key={segmentIndex}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#82a5d3"
                strokeOpacity=".35"
                strokeWidth="1"
              />
            )
          })}
        </g>
      ))}
    </>
  )
}
