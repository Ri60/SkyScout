import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import NightSky from './NightSky'
import LocationMap from './LocationMap'

const place = { id: 1, name: 'Oshawa, Ontario, Canada', latitude: 43.8971, longitude: -78.8658, timezone: 'America/Toronto' }
afterEach(cleanup)
describe('map and night-sky controls', () => {
  it('embeds the selected city coordinates and provides a larger-map fallback', () => {
    render(<LocationMap place={place} />)
    const source = new URL(screen.getByTitle(`Location map of ${place.name}`).getAttribute('src')!)
    expect(source.hostname).toBe('www.openstreetmap.org')
    expect(source.searchParams.get('marker')).toBe('43.8971,-78.8658')
    expect(screen.getByRole('link', { name: /Open larger map/ })).toHaveAttribute('href', expect.stringContaining('mlat=43.8971'))
  })
  it('turns the view, focuses a target, advances preview time, and toggles overlays', () => {
    render(<NightSky place={place} date="2026-11-25" time="02:40" targets={[{name:'Jupiter', altitude:38.7, azimuth:110.9}]} />)
    fireEvent.click(screen.getByRole('button', { name: /^North$/ }))
    expect(screen.getByRole('slider', { name: 'Viewing direction' })).toHaveValue('0')
    fireEvent.click(screen.getByRole('button', { name: /^Jupiter$/ }))
    expect(Number((screen.getByRole('slider', { name: 'Viewing direction' }) as HTMLInputElement).value)).toBeGreaterThan(90)
    fireEvent.change(screen.getByRole('slider', { name: 'Preview minutes' }), { target: { value: '30' } })
    expect(screen.getByText(/Nov 25, 2026, 3:10/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Constellation lines' }))
    expect(screen.getByRole('checkbox', { name: 'Constellation lines' })).not.toBeChecked()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Object labels' }))
    expect(screen.getByRole('checkbox', { name: 'Object labels' })).not.toBeChecked()
  })
})
