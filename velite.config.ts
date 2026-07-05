import { defineConfig, s } from 'velite'

export default defineConfig({
  root: 'content',
  collections: {
    posts: {
      name: 'Post',
      pattern: 'blog/**/*.mdx',
      schema: s
        .object({
          title: s.string().max(120),
          date: s.isodate(),
          summary: s.string().max(300),
          tags: s.array(s.string()).default([]),
          draft: s.boolean().default(false),
          rev: s.string().default('A'),
          slug: s.path(),
          body: s.mdx(),
        })
        .transform((data) => ({ ...data, slug: data.slug.replace(/^blog\//, '') })),
    },
  },
})
