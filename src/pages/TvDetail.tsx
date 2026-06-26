import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTvDetails, imageUrl } from '@/api'
import { sendMovieRequest } from '@/telegram'
import type { TvDetails } from '@/types'

export default function TvDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [show, setShow] = useState<TvDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [dlStatus, setDlStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const dlTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getTvDetails(Number(id))
      .then(setShow)
      .finally(() => setLoading(false))
    window.scrollTo(0, 0)
  }, [id])

  if (loading) {
    return (
      <div className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded w-1/2" />
          <div className="h-4 bg-white/5 rounded w-1/3" />
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="pt-24 pb-16 text-center text-white/40">
        Show not found.
      </div>
    )
  }

  const backdrop = imageUrl(show.backdrop_path, 'original')
  const poster = imageUrl(show.poster_path, 'w342')
  const year = show.first_air_date?.slice(0, 4)

  return (
    <>
      {/* Hero */}
      <div className="relative">
        {backdrop && (
          <div className="absolute inset-0 h-[60vh] overflow-hidden">
            <img src={backdrop} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/60 via-[#0a0a0b]/40 to-[#0a0a0b]" />
          </div>
        )}
        <div className="relative pt-24 pb-8 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Poster */}
            <div className="flex-shrink-0 w-[200px] sm:w-[220px] mx-auto sm:mx-0">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 shadow-2xl">
                {poster ? (
                  <img src={poster} alt={show.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">No poster</div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white/90">{show.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/50">
                {year && <span>{year}</span>}
                {show.number_of_seasons && <span>{show.number_of_seasons} seasons</span>}
                {show.number_of_episodes && <span>{show.number_of_episodes} episodes</span>}
                {show.genres?.map(g => (
                  <span key={g.id} className="px-2 py-0.5 rounded-full bg-white/5 text-xs">{g.name}</span>
                ))}
              </div>

              {show.tagline && (
                <p className="mt-3 text-sm italic text-white/30">"{show.tagline}"</p>
              )}

              <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xl">{show.overview}</p>

              <div className="flex items-center gap-3 mt-6">
                <span className="text-[#00e054] text-lg font-bold">
                  ★ {show.vote_average.toFixed(1)}
                </span>
                <span className="text-white/30 text-sm">TMDB rating</span>
                <button
                  onClick={async () => {
                    clearTimeout(dlTimer.current)
                    setDlStatus('sending')
                    const { ok } = await sendMovieRequest(show.name, year)
                    setDlStatus(ok ? 'sent' : 'error')
                    dlTimer.current = setTimeout(() => setDlStatus('idle'), 3000)
                  }}
                  disabled={dlStatus === 'sending'}
                  className={`ml-auto px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    dlStatus === 'sent'
                      ? 'bg-[#00e054]/20 text-[#00e054]'
                      : dlStatus === 'error'
                      ? 'bg-red-400/20 text-red-400'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {dlStatus === 'sending' ? 'Sending...' : dlStatus === 'sent' ? '✓ Sent to Telegram' : dlStatus === 'error' ? '✗ Failed' : '⬇ Download'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast */}
      {show.credits?.cast && show.credits.cast.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-lg font-semibold text-white/70 mb-4">Cast</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {show.credits.cast.slice(0, 12).map(c => (
              <div key={c.id} className="flex-shrink-0 w-[100px] text-center">
                <div className="w-[80px] h-[80px] mx-auto rounded-full overflow-hidden bg-white/5">
                  {c.profile_path ? (
                    <img src={imageUrl(c.profile_path, 'w185')!} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">N/A</div>
                  )}
                </div>
                <p className="mt-2 text-xs font-medium text-white/70 truncate">{c.name}</p>
                <p className="text-xs text-white/40 truncate">{c.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <Link to="/" className="text-sm text-white/30 hover:text-white/50 transition-colors">← Back to Home</Link>
      </div>
    </>
  )
}
