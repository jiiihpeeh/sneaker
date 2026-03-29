import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import './Header.css'

export default function Header() {
  return (
    <header class="site-header">
      <nav class="page-wrap nav-shell">
        <h2 class="site-title">
          <a href="/" class="brand-pill">
            <span class="brand-dot" />
            Sneaker
          </a>
        </h2>

        <div class="header-actions">
          <BetterAuthHeader />
        </div>

        <div class="header-nav">
          <a href="/" class="nav-link">Home</a>
          <a href="/about" class="nav-link">About</a>
          <a
            href="https://tanstack.com/start/latest/docs/framework/solid/overview"
            target="_blank"
            rel="noreferrer"
            class="nav-link"
          >
            Docs
          </a>
        </div>
      </nav>
    </header>
  )
}
