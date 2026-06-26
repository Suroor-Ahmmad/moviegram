import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'

const links = [
  { to: '/', label: 'Home' },
  { to: '/diary', label: 'Diary' },
  { to: '/watchlist', label: 'Watchlist' },
]

export default function Navbar() {
  const loc = useLocation()
  const { user, signOut } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[#00e054]">◉</span>{' '}
            <span className="text-white/90">MovieGram</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {links.map(l => {
            const active = loc.pathname === l.to
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#00e054]/10 text-[#00e054]'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            )
          })}

          {user && (
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-white/10">
              <span className="text-xs text-white/30 hidden sm:block truncate max-w-[120px]">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white/60 hover:bg-white/5 transition-all"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
