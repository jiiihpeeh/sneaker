import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main class="page-wrap px-4 py-12">
      <section class="island-shell rounded-2xl p-6 sm:p-8">
        <p class="island-kicker mb-2">About</p>
        <h1 class="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Privacy-first web search.
        </h1>
        <p class="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          Sneaker aggregates results from multiple search engines to give you
          the best of the web without tracking. No ads, no profiling, just search.
        </p>
      </section>
    </main>
  )
}
