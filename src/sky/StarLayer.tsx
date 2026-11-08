import type { ProjectPoint, SkyScene } from './types'

type StarLayerProps = {
  stars: SkyScene['stars']
  magnitudeLimit: number
  sunAltitude: number
  projectVisible: ProjectPoint
}

export default function StarLayer({
  stars,
  magnitudeLimit,
  sunAltitude,
  projectVisible
}: StarLayerProps) {
  if (sunAltitude >= -6) return null

  return (
    <>
      {stars
        .filter((star) => star.magnitude <= magnitudeLimit)
        .map((star, index) => {
          const point = projectVisible(star)
          if (!point) return null

          return (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={Math.max(0.45, 2.8 - star.magnitude * 0.43)}
              fill={star.color}
              opacity={Math.max(0.25, 1 - star.magnitude / 8)}
            />
          )
        })}
    </>
  )
}
