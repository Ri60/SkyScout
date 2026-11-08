import type { SkyTarget } from '../astronomy'
import type { ProjectPoint, SkyScene } from './types'

type TargetLabelsProps = {
  targets: SkyTarget[]
  sky: SkyScene
  projectVisible: ProjectPoint
}

export default function TargetLabels({
  targets,
  sky,
  projectVisible
}: TargetLabelsProps) {
  // Planet labels are rendered by PlanetLayer. Fixed stars use the preview time.
  return (
    <>
      {targets
        .filter(
          (target) => !sky.planets.some((body) => body.name === target.name)
        )
        .map((target) => {
          const current = sky.namedStars[target.name] ?? target
          const point = current.altitude > 0 ? projectVisible(current) : null
          return point ? (
            <text
              key={target.name}
              x={point.x + 8}
              y={point.y - 8}
              fill="#ffe9b8"
              fontSize="14"
            >
              {target.name}
            </text>
          ) : null
        })}
    </>
  )
}
