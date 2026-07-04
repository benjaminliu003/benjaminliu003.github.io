import { allPosts } from '@/lib/content'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-static'

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)

export function GET() {
  const items = allPosts
    .map(
      (p) => `<item>
  <title>${escapeXml(p.title)}</title>
  <link>${SITE.url}/blog/${p.slug}/</link>
  <guid>${SITE.url}/blog/${p.slug}/</guid>
  <pubDate>${new Date(p.date).toUTCString()}</pubDate>
  <description>${escapeXml(p.summary)}</description>
</item>`,
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${escapeXml(SITE.title)} — Lab Notes</title>
<link>${SITE.url}</link>
<description>${escapeXml(SITE.description)}</description>
${items}
</channel></rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml' } })
}
