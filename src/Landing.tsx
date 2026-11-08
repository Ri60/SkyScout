import type { ReactNode } from 'react'
import { Icon } from './Icons'

function OrbitArtwork() {
  return (
    <div className="orbit-art" aria-hidden="true">
      <div className="orbit-ring orbit-one" />
      <div className="orbit-ring orbit-two" />
      <div className="orbit-ring orbit-three" />
      <span className="orbit-star os-one">✦</span>
      <span className="orbit-star os-two">✧</span>
      <span className="orbit-star os-three">✦</span>
      <span className="orbit-dot od-one" />
      <span className="orbit-dot od-two" />
      <span className="orbit-caption">
        A whole universe.
        <br />
        Your point of view.
      </span>
    </div>
  )
}

export default function Landing({ form }: { form: ReactNode }) {
  return (
    <>
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /> A little curiosity. An entire
            universe.
          </span>
          <h1>
            Your next adventure
            <br />
            is <em>above you.</em>
          </h1>
          <p className="hero-intro">
            Meet the stars, planets, and constellations in your corner of the
            sky. Pick a place and a time. We’ll help you find your way.
          </p>
          <div className="hero-chips">
            <span>
              <Icon name="eye" size={15} /> No telescope required
            </span>
            <span>
              <Icon name="clock" size={15} /> Explore at your pace
            </span>
          </div>
          <OrbitArtwork />
        </div>
        <div className="planner-card" id="planner">
          <div className="planner-heading">
            <span className="icon-tile">
              <Icon name="compass" size={23} />
            </span>
            <span className="small-label">YOUR PERSONAL OBSERVATORY</span>
          </div>
          <h2>Where will you look up?</h2>
          <p>A sky that’s yours, wherever you are.</p>
          {form}
          <div className="planner-footnote">
            <Icon name="spark" size={15} />
            <span>Real positions. Your local time. A fresh perspective.</span>
          </div>
        </div>
      </section>
      <section
        className="how-section"
        id="how-it-works"
        aria-labelledby="how-heading"
      >
        <div>
          <p className="eyebrow">LESS GUESSWORK. MORE WONDER.</p>
          <h2 id="how-heading">From your doorstep to the stars.</h2>
        </div>
        <div className="how-grid">
          {[
            [
              '01',
              'pin',
              'Make it local',
              'Choose your city and when you’ll be outside. Your sky is calculated for that exact moment.'
            ],
            [
              '02',
              'sliders',
              'Find your kind of wonder',
              'Browse everything above your horizon. Filter for planets, stars, the Moon, or constellations.'
            ],
            [
              '03',
              'bookmark',
              'Make a little mission',
              'Save a few things to look for, head outside, and check them off as you discover them.'
            ]
          ].map(([number, icon, title, copy]) => (
            <article key={number}>
              <div className="how-top">
                <Icon name={icon} size={22} />
                <span>{number}</span>
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
