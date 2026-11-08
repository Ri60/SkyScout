import { SKY_HEIGHT, SKY_WIDTH } from './types'

type SkyGradientsProps = {
  idPrefix: string
  sunAltitude: number
}

/** SVG definitions shared by the background, object glows, and viewport. */
export default function SkyGradients({
  idPrefix,
  sunAltitude
}: SkyGradientsProps) {
  const isDaylight = sunAltitude > -6

  return (
    <defs>
      <linearGradient id={`${idPrefix}-sky`} x2="0" y2="1">
        <stop stopColor={isDaylight ? '#3b77a1' : '#030714'} />
        <stop offset="1" stopColor={isDaylight ? '#a4c2cb' : '#182744'} />
      </linearGradient>
      <radialGradient id={`${idPrefix}-glow`}>
        <stop stopColor="#fff1c3" stopOpacity=".8" />
        <stop offset="1" stopColor="#fff1c3" stopOpacity="0" />
      </radialGradient>
      <clipPath id={`${idPrefix}-clip`}>
        <rect width={SKY_WIDTH} height={SKY_HEIGHT} rx="16" />
      </clipPath>
    </defs>
  )
}
