import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: {
        text?: string
      }[]
    }
  }[]
}

function objectInfoApi(apiKey: string) {
  return {
    name: 'object-info-api',

    configureServer(server: any) {
      server.middlewares.use('/api/object-info', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        try {
          let rawBody = ''

          for await (const chunk of req) {
            rawBody += chunk
          }

          const body = JSON.parse(rawBody)
          const name = typeof body.name === 'string' ? body.name.trim() : ''
          const kind = typeof body.kind === 'string' ? body.kind : ''

          const validKinds = [
            'planet',
            'moon',
            'star',
            'constellation',
          ]

          if (!name || name.length > 60 || !validKinds.includes(kind)) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid object name or type' }))
            return
          }

          const prompt = `
You are the astronomy guide inside SkyScout, a beginner-friendly stargazing app.

Given the name and type of a sky object, reply ONLY with a JSON object:
{
  "summary": "A friendly 4-5 sentence overview",
  "details": [{"label": "Distance from Earth", "value": "..."}],
  "funFacts": ["...", "...", "...", "...", "..."]
}

Provide 6-8 accurate details and exactly 5 fun facts.
Write for curious beginners. Explain jargon briefly.
Only state facts you are confident are true.
If the object is obscure, be honest and don't invent information.

Name: ${name}
Type: ${kind}
`

          const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [{ text: prompt }],
                  },
                ],
              }),
            }
          )

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Gemini error:', response.status, errorText)

            res.statusCode = 502
            res.end(JSON.stringify({ error: 'Gemini API request failed' }))
            return
          }

          const data = (await response.json()) as GeminiResponse
          const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

          const start = text.indexOf('{')
          const end = text.lastIndexOf('}')

          const info = JSON.parse(text.slice(start, end + 1))

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(info))
        } catch (error) {
          console.error('Object info API error:', error)

          res.statusCode = 500
          res.end(
            JSON.stringify({ error: 'Could not generate object information' })
          )
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.GEMINI_API_KEY

  return {
    plugins: [
      react(),
      objectInfoApi(apiKey),
    ],
  }
})


