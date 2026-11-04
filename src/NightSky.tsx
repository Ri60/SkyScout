import { useId, useMemo, useRef, useState } from 'react'
import { getObservationDate } from './timezone'
import type { LocationResult } from './location'
import type { SkyTarget } from './astronomy'
import { buildSky, project, type SkyPoint } from './skyView'

export default function NightSky({ place, date, time, targets }: { place: LocationResult; date: string; time: string; targets: SkyTarget[] }) {
  const [heading, setHeading] = useState(180)
  const [elevation, setElevation] = useState(25)
  const [fov, setFov] = useState(100)
  const [offset, setOffset] = useState(0)
  const [lines, setLines] = useState(true)
  const [labels, setLabels] = useState(true)
  const [limit, setLimit] = useState(5)
  const drag = useRef<{ x: number; heading: number } | null>(null)
  const id = useId().replace(/:/g, '')
  const instant = useMemo(() => new Date(getObservationDate(date, time, place.timezone).getTime() + offset * 60000), [date, time, place.timezone, offset])
  const sky = useMemo(() => buildSky(instant, place.latitude, place.longitude), [instant, place.latitude, place.longitude])
  const p = (point: SkyPoint) => project(point, heading, elevation, fov)
  function inFrame(point: { x: number; y: number } | null) {
    return point && point.x >= -20 && point.x <= 980 && point.y >= -20 && point.y <= 560 ? point : null
  }
  const cardinal = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(heading / 45) % 8]
  function focus(target: SkyTarget) {
    // Use the preview's current positions for moving planets.
    const current = sky.planets.find(body => body.name === target.name) ?? target
    setHeading(current.azimuth)
    setElevation(Math.min(80, Math.max(0, current.altitude)))
  }
  const displayedTime = new Intl.DateTimeFormat('en-CA', { timeZone: place.timezone, dateStyle: 'medium', timeStyle: 'short' }).format(instant)
  return <section className="night-sky panel" aria-labelledby="night-heading">
    <div className="section-header"><div><p className="eyebrow">Look up and explore</p><h2 id="night-heading">Your night sky</h2></div><span className="sky-badge">Facing {cardinal} · {Math.round(heading)}°</span></div>
    <p>{displayedTime} · {place.name}</p>
    <div className="sky-toolbar" aria-label="Sky direction">
      {[['North', 0], ['East', 90], ['South', 180], ['West', 270]].map(([name, angle]) => <button key={name} type="button" onClick={() => setHeading(Number(angle))}>{name}</button>)}
    </div>
    <svg className="night-canvas" viewBox="0 0 960 540" role="img" aria-label={`Simulated sky facing ${cardinal} at ${displayedTime}. Use the controls below to change the view.`}
      onPointerDown={event => { drag.current = { x: event.clientX, heading }; event.currentTarget.setPointerCapture(event.pointerId) }}
      onPointerMove={event => { if (drag.current) setHeading(((drag.current.heading - (event.clientX - drag.current.x) / event.currentTarget.getBoundingClientRect().width * fov) % 360 + 360) % 360) }}
      onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}>
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor={sky.sunAltitude > -6 ? '#3b77a1' : '#030714'} /><stop offset="1" stopColor={sky.sunAltitude > -6 ? '#a4c2cb' : '#182744'} /></linearGradient>
        <radialGradient id={`${id}-glow`}><stop stopColor="#fff1c3" stopOpacity=".8"/><stop offset="1" stopColor="#fff1c3" stopOpacity="0"/></radialGradient>
        <clipPath id={`${id}-clip`}><rect width="960" height="540" rx="16" /></clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="960" height="540" fill={`url(#${id}-sky)`}/>
        {lines && sky.lines.map((line, index) => <g key={index}>{line.slice(1).map((point, j) => {
          const a = inFrame(p(line[j])); const b = inFrame(p(point))
          return a && b && line[j].altitude > 0 && point.altitude > 0 ? <line key={j} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#82a5d3" strokeOpacity=".35" strokeWidth="1"/> : null
        })}</g>)}
        {sky.sunAltitude < -6 && sky.stars.filter(star => star.magnitude <= limit).map((star, index) => {
          const point = inFrame(p(star)); if (!point) return null
          return <circle key={index} cx={point.x} cy={point.y} r={Math.max(.45, 2.8 - star.magnitude * .43)} fill={star.color} opacity={Math.max(.25, 1 - star.magnitude / 8)}/>
        })}
        {sky.planets.filter(body => body.magnitude <= limit || body.name === 'Moon').map(body => {
          const point = inFrame(p(body)); if (!point) return null
          const moon = body.moon !== undefined
          return <g key={body.name}><title>{body.name}: {body.altitude.toFixed(1)}° high, azimuth {body.azimuth.toFixed(1)}°</title>
            <circle cx={point.x} cy={point.y} r={moon ? 26 : 12} fill={`url(#${id}-glow)`}/>
            <circle cx={point.x} cy={point.y} r={moon ? 9 : Math.max(1.5, 4 - body.magnitude * .4)} fill={body.color}/>
            {labels && <text x={point.x + 12} y={point.y - 12} fill="#ffe9b8" fontSize="14">{body.name}{moon ? ` · ${Math.round(body.moon! * 100)}% lit` : ''}</text>}
          </g>
        })}
        {targets.filter(t => !sky.planets.some(body => body.name === t.name)).map(target => {
          // Fixed-star targets are recalculated at the preview time using their catalogue entries below.
          const known: Record<string, number[]> = { Sirius: [101.2875, -16.7161], Vega: [279.234, 38.7837], Arcturus: [213.915, 19.1824] }
          const current = known[target.name] ? sky.namedStars[target.name] : target
          const point = current && current.altitude > 0 ? inFrame(p(current)) : null
          return point && labels ? <text key={target.name} x={point.x + 8} y={point.y - 8} fill="#ffe9b8" fontSize="14">{target.name}</text> : null
        })}
        {Array.from({ length: 360 }, (_, azimuth) => {
          const a = p({ altitude: 0, azimuth }); const b = p({ altitude: 0, azimuth: azimuth + 1 })
          if (!a || !b || Math.abs(a.x - b.x) > 100) return null
          return <path key={azimuth} d={`M${a.x},${a.y} L${b.x},${b.y} L${b.x},20000 L${a.x},20000 Z`} fill="#070f16"/>
        })}
        {[0,45,90,135,180,225,270,315].map((azimuth, index) => {
          const point = inFrame(p({ altitude: 2, azimuth }))
          return point ? <text key={azimuth} x={point.x} y={point.y} textAnchor="middle" fill="#d4e4eb" fontSize="16">{['N','NE','E','SE','S','SW','W','NW'][index]}</text> : null
        })}
      </g>
    </svg>
    {sky.sunAltitude >= -18 && <p className="sky-notice">This preview time is in daylight or twilight; faint objects may not be visible outdoors.</p>}
    <p className="fine-print">Drag left or right to turn, or use the controls. This is a calculated simulation with an ideal flat horizon; weather, buildings, and light pollution are not included. Object sizes are enlarged for identification; the Moon’s illumination is shown as a percentage.</p>
    <div className="sky-controls">
      <label>Direction: {Math.round(heading)}°<input aria-label="Viewing direction" type="range" min="0" max="359" value={heading} onChange={e => setHeading(Number(e.target.value))}/></label>
      <label>Look up: {Math.round(elevation)}°<input aria-label="Viewing elevation" type="range" min="0" max="80" value={elevation} onChange={e => setElevation(Number(e.target.value))}/></label>
      <label>Field of view: {fov}°<input aria-label="Field of view" type="range" min="35" max="120" value={fov} onChange={e => setFov(Number(e.target.value))}/></label>
      <label>Preview time: +{offset} min<input aria-label="Preview minutes" type="range" min="0" max="30" step="5" value={offset} onChange={e => setOffset(Number(e.target.value))}/></label>
      <label>Star detail<select value={limit} onChange={e => setLimit(Number(e.target.value))}><option value="3">Bright stars</option><option value="5">More stars</option><option value="6">Dark-sky detail</option></select></label>
      <div className="sky-toggles"><label><input type="checkbox" checked={lines} onChange={e => setLines(e.target.checked)}/>Constellation lines</label><label><input type="checkbox" checked={labels} onChange={e => setLabels(e.target.checked)}/>Object labels</label></div>
    </div>
    {targets.length > 0 && <div className="sky-toolbar"><span>Find a mission target:</span>{targets.map(target => <button type="button" key={target.name} onClick={() => focus({ ...target, ...(sky.namedStars[target.name] ?? {}) })}>{target.name}</button>)}</div>}
    <p className="fine-print">Star and constellation data: <a href="https://github.com/ofrohn/d3-celestial" target="_blank" rel="noreferrer">D3-Celestial</a>. Positions: Astronomy Engine. The mission checklist remains tied to your original observation time.</p>
  </section>
}
