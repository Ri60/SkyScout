import type { SkyObject } from './catalogue'

export type ObjectInfo = {
  summary: string
  details: { label: string; value: string }[]
  funFacts: string[]
}

const cache = new Map<string, ObjectInfo>()

export async function fetchObjectInfo(
  object: SkyObject,
  signal?: AbortSignal
): Promise<ObjectInfo> {
  const key = `${object.kind}:${object.name}`
  const cached = cache.get(key)
  if (cached) return cached

  const response = await fetch('/api/object-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: object.name, kind: object.kind }),
    signal
  })
  if (!response.ok) throw new Error('Could not load more info right now.')
  const info = (await response.json()) as ObjectInfo
  cache.set(key, info)
  return info
}