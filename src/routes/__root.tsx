import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/solid-router'

import { HydrationScript } from 'solid-js/web'
import { Suspense } from 'solid-js'

// import Header from '../components/Header'

import styleCss from '../styles.css?url'

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [
      { rel: 'stylesheet', href: styleCss },
      { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' },
      { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' },
    ],
  }),
  shellComponent: RootComponent,
  errorComponent: ErrorComponent,
})

function ErrorComponent({ error }: { error: Error }) {
  return (
    <div class="min-h-screen flex items-center justify-center bg-[var(--sea-surface)] p-4">
      <div class="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 class="mb-2 text-xl font-bold text-red-700">Something went wrong</h2>
        <p class="text-sm text-red-600">{error.message}</p>
      </div>
    </div>
  );
}

function RootComponent() {
  return (
    <html>
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        <Suspense>
          {/* <Header /> */}
          <Outlet />
        </Suspense>
        <Scripts />
      </body>
    </html>
  )
}
