import { posts } from '#velite'

export type Post = (typeof posts)[number]

export const allPosts: Post[] = [...posts]
  .filter((p) => !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date))

export const getPost = (slug: string): Post | undefined => allPosts.find((p) => p.slug === slug)
