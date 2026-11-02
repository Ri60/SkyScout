
import { useState } from 'react'
import './App.css'

function App() {
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    alert(`Location: ${location}\nDate: ${date}\nTime: ${time}`)
  }

  return (
    <main className="app">
      <h1>✨ SkyScout</h1>
      <p>Your personal guide to the night sky.</p>

      <h2>Plan Your Stargazing Mission</h2>
      <p>Discover the night sky with a guided 30-minute mission.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="location">Your Location</label>
        <input
          id="location"
          type="text"
          placeholder="e.g. Oshawa, Ontario"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <label htmlFor="date">Observation Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label htmlFor="time">Observation Time</label>
        <input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />

        <button type="submit">Plan My Mission</button>
      </form>
    </main>
  )
}

export default App
