import Link from 'next/link'
import { allPosts } from '@/lib/content'

export const metadata = { title: 'Lab Notes' }

export default function BlogIndex() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl uppercase tracking-widest">Lab Notes</h1>
      <ol className="mt-8 space-y-6">
        {allPosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}/`} className="underline text-copper">
              {post.title}
            </Link>
            <p className="text-sm opacity-70">
              <time dateTime={post.date}>{post.date.slice(0, 10)}</time> · Rev {post.rev}
            </p>
            <p className="mt-1">{post.summary}</p>
          </li>
        ))}
      </ol>
    </main>
  )
}
