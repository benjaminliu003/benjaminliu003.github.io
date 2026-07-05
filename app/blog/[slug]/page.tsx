import { notFound } from 'next/navigation'
import { allPosts, getPost } from '@/lib/content'
import { MDXContent } from '@/lib/mdx'

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  return post ? { title: post.title, description: post.summary } : {}
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl">{post.title}</h1>
      <p className="text-sm opacity-70">
        <time dateTime={post.date}>{post.date.slice(0, 10)}</time> · Rev {post.rev}
      </p>
      <article className="mt-8">
        <MDXContent code={post.body} />
      </article>
    </main>
  )
}
