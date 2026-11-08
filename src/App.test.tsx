import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
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
beforeEach(() => {
  window.scrollTo = vi.fn()
})
afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
})
async function plan() {
  fireEvent.click(screen.getByRole('button', { name: 'Find Locations' }))
  const city = await screen.findByLabelText('Choose Your City')
  fireEvent.change(city, { target: { value: '2' } })
  fireEvent.change(screen.getByLabelText('Observation Date'), {
    target: { value: '2026-11-25' }
  })
  fireEvent.change(screen.getByLabelText('Observation Time'), {
    target: { value: '02:40' }
  })
  fireEvent.click(screen.getByRole('button', { name: 'Explore my sky' }))
  await screen.findByRole('heading', { name: 'What’s up there?' })
}
describe('SkyScout planning and observation', () => {
  it('shows the new landing page and an accessible observation form', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /Your next adventure/ })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Your Location')).toHaveValue('Oshawa')
    expect(screen.getByLabelText('Observation Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Observation Time')).toHaveValue('21:00')
  })
  it('lets the user distinguish cities and requires a selected result', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Explore my sky' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Search for a city and select the correct location first.'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Find Locations' }))
    expect(
      await screen.findByRole('option', { name: 'London, Ontario, Canada' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'London, England, United Kingdom' })
    ).toBeInTheDocument()
  })
  it('opens the sky before the catalogue, restores the session, and preserves editable details', async () => {
    const { unmount } = render(<App />)
    await plan()
    const sky = screen.getByRole('heading', { name: 'Your night sky' })
    const catalogue = screen.getByRole('heading', { name: 'What’s up there?' })
    expect(
      sky.compareDocumentPosition(catalogue) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(screen.queryByTitle(/Location map of/)).not.toBeInTheDocument()
    expect(window.location.hash).toBe('#/mission')
    unmount()
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'What’s up there?' })
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Observing location' }))
    expect(screen.getByTitle(/Location map of/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }))
    expect(screen.getByLabelText('Observation Time')).toHaveValue('02:40')
    fireEvent.change(screen.getByLabelText('Your Location'), {
      target: { value: 'Toronto' }
    })
    expect(
      screen.queryByRole('heading', { name: 'What’s up there?' })
    ).not.toBeInTheDocument()
  })
  it('filters discoveries and saves a custom target to a persistent mission checklist', async () => {
    const { container, unmount } = render(<App />)
    await plan()
    const filters = screen.getByRole('complementary', {
      name: 'Observation filters'
    })
    fireEvent.click(within(filters).getByRole('button', { name: /^Stars/ }))
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Search sky objects' }),
      { target: { value: 'Capella' } }
    )
    expect(container.querySelectorAll('.object-card')).toHaveLength(1)
    fireEvent.click(
      screen.getByRole('button', { name: 'Save Capella to mission' })
    )
    fireEvent.click(screen.getByRole('tab', { name: /My mission/ }))
    const observed = screen.getByRole('checkbox', {
      name: 'I observed Capella'
    })
    fireEvent.click(observed)
    expect(observed).toBeChecked()
    unmount()
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: /My mission/ }))
    expect(
      screen.getByRole('checkbox', { name: 'I observed Capella' })
    ).toBeChecked()
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Capella from mission' })
    )
    await waitFor(() =>
      expect(
        screen.queryByRole('checkbox', { name: 'I observed Capella' })
      ).not.toBeInTheDocument()
    )
  })
})
