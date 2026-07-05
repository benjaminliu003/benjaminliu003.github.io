import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5">
      <p className="designator">DRC · Unrouted Net</p>
      <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl">
        Error: net not found
      </h1>
      <p className="mt-4 max-w-md text-muted">
        This route has no copper to it. The trace you followed doesn&rsquo;t connect to anything on
        the board.
      </p>
      <Link href="/" className="pad-btn mt-8 w-fit px-5 py-2.5 text-sm">
        ← Back to the board
      </Link>
    </main>
  )
}
