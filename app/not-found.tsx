import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl">DRC Error: net not found</h1>
      <p className="mt-2">
        This route is unrouted.{' '}
        <Link className="underline text-copper" href="/">
          Back to the board
        </Link>
        .
      </p>
    </main>
  )
}
