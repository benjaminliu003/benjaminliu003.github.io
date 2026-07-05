import { describe, expect, it } from 'vitest'
import { allPosts, getPost } from './content'

describe('content collection', () => {
  it('exposes the fixture post, newest first, drafts excluded', () => {
    expect(allPosts.length).toBeGreaterThan(0)
    expect(allPosts.every((p) => !p.draft)).toBe(true)
    const sorted = [...allPosts].sort((a, b) => b.date.localeCompare(a.date))
    expect(allPosts).toEqual(sorted)
  })

  it('getPost round-trips a slug', () => {
    const first = allPosts[0]
    expect(getPost(first.slug)?.title).toBe(first.title)
  })
})
