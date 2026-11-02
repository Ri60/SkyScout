
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

vi.mock('./location', () => ({
  searchLocations: vi.fn(async () => [
    {
      id: 1,
      name: 'London, England, United Kingdom',
      latitude: 51.5,
      longitude: -0.12,
      timezone: 'Europe/London'
    },
    {
      id: 2,
      name: 'London, Ontario, Canada',
      latitude: 42.98,
      longitude: -81.25,
      timezone: 'America/Toronto'
    }
  ])
}))

vi.mock('./timezone', () => ({
  getObservationDate: vi.fn(
    () => new Date('2026-11-04T02:00:00Z')
  )
}))

vi.mock('./astronomy', () => ({
  getVisibleObjects: vi.fn(() => [
    {
      name: 'Vega',
      altitude: 35.4,
      azimuth: 292.5,
      magnitude: 0.03
    }
  ])
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('SkyScout interface', () => {
  it('displays the observation form', () => {
    render(<App />)

    expect(screen.getByLabelText('Your Location')).toBeInTheDocument()
    expect(screen.getByLabelText('Observation Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Observation Time')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Find Locations' }))
      .toBeInTheDocument()
  })

  it('allows users to choose between matching cities', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Your Location'), {
      target: { value: 'London' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Find Locations' }))

    await waitFor(() => {
      expect(screen.getByRole('option', {
        name: 'London, Ontario, Canada'
      })).toBeInTheDocument()
    })

    expect(screen.getByRole('option', {
      name: 'London, England, United Kingdom'
    })).toBeInTheDocument()
  })

  it('clears old results when the location changes', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Find Locations' }))

    const city = await screen.findByLabelText('Choose Your City')

    fireEvent.change(city, {
      target: { value: '2' }
    })

    fireEvent.change(screen.getByLabelText('Observation Date'), {
      target: { value: '2026-11-03' }
    })

    fireEvent.change(screen.getByLabelText('Observation Time'), {
      target: { value: '21:00' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Plan My Mission' }))

    expect(screen.getByText('Your SkyScout Results')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Your Location'), {
      target: { value: 'Toronto' }
    })

    expect(screen.queryByText('Your SkyScout Results'))
      .not.toBeInTheDocument()
  })

  it('requires a selected location before planning', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Observation Date'), {
      target: { value: '2026-11-03' }
    })

    fireEvent.change(screen.getByLabelText('Observation Time'), {
      target: { value: '21:00' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Plan My Mission' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Search for a city and select the correct location first.'
    )
  })
})
