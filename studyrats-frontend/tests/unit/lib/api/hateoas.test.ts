import { unwrapEntity, unwrapCollection, addPosition } from '@/lib/api/hateoas'
import type { HateoasEntity, HateoasCollection, RankingEntry } from '@/types'

describe('unwrapEntity', () => {
  it('strips _links and returns a typed object', () => {
    const raw: HateoasEntity<{ id: string; name: string }> = {
      id: 'abc',
      name: 'Test',
      _links: { self: { href: '/groups/abc' } },
    }
    const result = unwrapEntity<{ id: string; name: string }>(raw)
    expect(result).toEqual({ id: 'abc', name: 'Test' })
    expect(result).not.toHaveProperty('_links')
  })

  it('returns the object unchanged when _links is absent', () => {
    const raw: HateoasEntity<{ id: string }> = { id: '1' }
    expect(unwrapEntity<{ id: string }>(raw)).toEqual({ id: '1' })
  })
})

describe('unwrapCollection', () => {
  it('extracts the first _embedded key and returns typed array', () => {
    const raw: HateoasCollection<{ id: string }> = {
      _embedded: {
        groupList: [
          { id: 'a', _links: { self: { href: '/groups/a' } } },
          { id: 'b' },
        ],
      },
    }
    const result = unwrapCollection<{ id: string }>(raw)
    expect(result).toHaveLength(2)
    expect(result[0]).not.toHaveProperty('_links')
    expect(result[0].id).toBe('a')
  })

  it('returns [] when _embedded is absent', () => {
    const raw: HateoasCollection<{ id: string }> = { _links: { self: { href: '/groups' } } }
    expect(unwrapCollection<{ id: string }>(raw)).toEqual([])
  })

  it('returns [] when _embedded is empty object', () => {
    const raw: HateoasCollection<{ id: string }> = { _embedded: {} }
    expect(unwrapCollection<{ id: string }>(raw)).toEqual([])
  })
})

describe('addPosition', () => {
  it('adds a 1-based position field to each entry', () => {
    const entries: Omit<RankingEntry, 'position'>[] = [
      { userId: 'u1', firstName: 'Ana', totalCheckins: 10 },
      { userId: 'u2', firstName: 'Bob', totalCheckins: 5 },
    ]
    const result = addPosition(entries)
    expect(result[0].position).toBe(1)
    expect(result[1].position).toBe(2)
  })

  it('returns [] for empty input', () => {
    expect(addPosition([])).toEqual([])
  })
})
