import type { HateoasEntity, HateoasCollection, RankingEntry } from '@/types'

export function unwrapEntity<T>(raw: HateoasEntity<T>): T {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _links, ...rest } = raw
  return rest as T
}

export function unwrapCollection<T>(raw: HateoasCollection<T>): T[] {
  if (!raw._embedded) return []
  const keys = Object.keys(raw._embedded)
  if (keys.length === 0) return []
  const items = raw._embedded[keys[0]]
  return items.map(({ _links: _l, ...rest }) => rest as T)
}

export function addPosition(entries: Omit<RankingEntry, 'position'>[]): RankingEntry[] {
  return entries.map((entry, i) => ({ ...entry, position: i + 1 }))
}
