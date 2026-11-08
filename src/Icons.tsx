import type { CSSProperties, ReactNode } from 'react'
export function Icon({
  name,
  size = 20,
  className = '',
  style
}: {
  name: string
  size?: number
  className?: string
  style?: CSSProperties
}) {
  const paths: Record<string, ReactNode> = {
    star: (
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
    ),
    spark: (
      <>
        <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z" />
        <path d="M20 2v4M18 4h4" />
      </>
    ),
    moon: <path d="M20.6 13.7A9 9 0 0 1 10.3 3.4a9 9 0 1 0 10.3 10.3Z" />,
    planet: (
      <>
        <circle cx="12" cy="12" r="6" />
        <ellipse
          cx="12"
          cy="12"
          rx="11"
          ry="3.5"
          transform="rotate(-30 12 12)"
        />
      </>
    ),
    constellation: (
      <>
        <path d="m4 17 4-12 7 6 5-7-2 15-10-3Z" />
        {[
          [4, 17],
          [8, 5],
          [15, 11],
          [20, 4],
          [18, 19]
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="1.5" fill="currentColor" />
        ))}
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h15m-6-6 6 6-6 6" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m16 8-2 6-6 2 2-6Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="9" cy="6" r="2" fill="#151820" />
        <circle cx="15" cy="12" r="2" fill="#151820" />
        <circle cx="8" cy="18" r="2" fill="#151820" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    )
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths[name] ?? paths.star}
    </svg>
  )
}
