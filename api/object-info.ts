/// <reference types="node" />

const KINDS = ['planet', 'moon', 'star', 'constellation']

// Verify this ID in AI Studio's model list; override with GEMINI_MODEL if renamed.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'

const INSTRUCTIONS = `You are the astronomy guide inside SkyScout, a beginner-friendly stargazing app.
Given the name and type of a sky object, reply with ONLY a JSON object (no markdown, no code fences) in exactly this shape:
{
  "summary": "A friendly 4-5 sentence overview: what it is, why it matters, what makes it special",
  "details": [{ "label": "Distance from Earth", "value": "..." }],
  "howToSpot": "2-3 sentences on how a beginner can find and recognise it, and the best time of year",
  "funFacts": ["...", "...", "...", "...", "..."]
}
Rules:
- "details": 6 to 8 items. Planets: diameter, distance from the Sun, day length, year length, moons, atmosphere, temperature. Moon: distance, diameter, orbit period, phases, surface features. Stars: constellation, distance in light-years, colour/spectral type, brightness, size vs the Sun, age. Constellations: brightest star, best season, area of sky, the myth behind the name, notable deep-sky objects inside it.
- "funFacts": exactly 5 short, surprising, accurate facts.
- Only state facts you are confident are true. Use approximate values ("about 8.6 light-years"). If the object is obscure (for example a star known only by a HIP catalogue number), say so honestly and keep the details general instead of inventing specifics.
- Write for curious beginners. Explain any jargon in a few words.`

function json(body: unknown, status = 200) {
  return Response.json(body, { status })
}

export async function POST(request: Request) {
  let body: { name?: unknown; kind?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const kind = typeof body.kind === 'string' ? body.kind : ''
  if (!name || name.length > 60 || !KINDS.includes(kind)) {
    return json({ error: 'A valid name and kind are required.' }, 400)
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return json({ error: 'Server is missing GEMINI_API_KEY.' }, 500)

  let upstream: Response
  try {
    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: `${INSTRUCTIONS}\n\nName: ${name}\nType: ${kind}` }] }
          ]
        })
      }
    )
  } catch {
    return json({ error: 'Could not reach the AI service. Check your internet connection.' }, 502)
  }

  if (upstream.status === 429) {
    return json({ error: 'The free AI quota is used up for now. Try again later.' }, 429)
  }
  if (!upstream.ok) return json({ error: 'The AI service is unavailable right now.' }, 502)

  const data = (await upstream.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  try {
    const info = JSON.parse(text.slice(start, end + 1))
    if (typeof info.summary !== 'string' || !Array.isArray(info.details) || !Array.isArray(info.funFacts)) {
      throw new Error('Unexpected shape')
    }
    return json(info)
  } catch {
    return json({ error: 'Could not read the AI response.' }, 502)
  }
}