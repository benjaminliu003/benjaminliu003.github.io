import type { MetadataRoute } from 'next'
import { allPosts } from '@/lib/content'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, lastModified: new Date() },
    { url: `${SITE.url}/blog/`, lastModified: new Date() },
    ...allPosts.map((p) => ({ url: `${SITE.url}/blog/${p.slug}/`, lastModified: new Date(p.date) })),
  ]
}
