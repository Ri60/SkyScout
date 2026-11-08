import { useId, useRef, type PointerEvent } from 'react'
import type { SkyTarget } from '../astronomy'
import { project, type SkyPoint } from '../skyView'
import ConstellationLayer from './ConstellationLayer'
import HorizonLayer from './HorizonLayer'
import PlanetLayer from './PlanetLayer'
import SkyGradients from './SkyGradients'
import StarLayer from './StarLayer'
import TargetLabels from './TargetLabels'
import { SKY_HEIGHT, SKY_WIDTH, type SkyScene } from './types'

type NightSkyCanvasProps = {
  sky: SkyScene
  targets: SkyTarget[]
  heading: number
  elevation: number
  fieldOfView: number
  magnitudeLimit: number
  showConstellations: boolean
  showLabels: boolean
  description: string
  onHeadingChange: (heading: number) => void
  highlightedTarget?: SkyTarget
}

/** Composes drawing layers; observation calculations and controls live in NightSky. */
export default function NightSkyCanvas({
  sky,
  targets,
  heading,
  elevation,
  fieldOfView,
  magnitudeLimit,
  showConstellations,
  showLabels,
  description,
  onHeadingChange,
  highlightedTarget
}: NightSkyCanvasProps) {
  const id = useId().replace(/:/g, '')
  const drag = useRef<{ x: number; heading: number } | null>(null)
  const projectPoint = (point: SkyPoint) =>
    project(point, heading, elevation, fieldOfView)

  function projectVisible(point: SkyPoint) {
    const projected = projectPoint(point)
    const margin = 20
    if (
      !projected ||
      projected.x < -margin ||
      projected.x > SKY_WIDTH + margin ||
      projected.y < -margin ||
      projected.y > SKY_HEIGHT + margin
    )
      return null
    return projected
  }

  const highlight = highlightedTarget ? projectVisible(highlightedTarget) : null

  function startDrag(event: PointerEvent<SVGSVGElement>) {
    drag.current = { x: event.clientX, heading }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: PointerEvent<SVGSVGElement>) {
    if (!drag.current) return
    const width = event.currentTarget.getBoundingClientRect().width
    const turn = ((event.clientX - drag.current.x) / width) * fieldOfView
    onHeadingChange((((drag.current.heading - turn) % 360) + 360) % 360)
  }

  function endDrag() {
    drag.current = null
  }

  return (
    <svg
      className="night-canvas"
      viewBox={`0 0 ${SKY_WIDTH} ${SKY_HEIGHT}`}
      role="img"
      aria-label={description}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <SkyGradients idPrefix={id} sunAltitude={sky.sunAltitude} />
      <g clipPath={`url(#${id}-clip)`}>
        <rect width={SKY_WIDTH} height={SKY_HEIGHT} fill={`url(#${id}-sky)`} />
        {showConstellations && (
          <ConstellationLayer
            lines={sky.lines}
            projectVisible={projectVisible}
          />
        )}
        <StarLayer
          stars={sky.stars}
          sunAltitude={sky.sunAltitude}
          magnitudeLimit={magnitudeLimit}
          projectVisible={projectVisible}
        />
        <PlanetLayer
          planets={sky.planets}
          magnitudeLimit={magnitudeLimit}
          showLabels={showLabels}
          glowId={`${id}-glow`}
          projectVisible={projectVisible}
        />
        {showLabels && (
          <TargetLabels
            targets={targets}
            sky={sky}
            projectVisible={projectVisible}
          />
        )}
        {highlight && highlightedTarget && (
          <g>
            <circle
              cx={highlight.x}
              cy={highlight.y}
              r="17"
              fill="none"
              stroke="#ceb4fa"
              strokeWidth="1.5"
              strokeDasharray="3 4"
            />
            <text
              x={highlight.x + 22}
              y={highlight.y + 5}
              fill="#e6d7ff"
              fontSize="15"
            >
              {highlightedTarget.name}
            </text>
          </g>
        )}
        <HorizonLayer
          projectPoint={projectPoint}
          projectVisible={projectVisible}
        />
      </g>
    </svg>
  )
}
