import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMovieDetails, imageUrl } from '@/api'
import { useStore } from '@/store'
import LogModal from '@/components/LogModal'
import { sendMovieRequest } from '@/telegram'
import type { MovieDetails } from '@/types'

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [dlStatus, setDlStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const dlTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const store = useStore()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getMovieDetails(Number(id))
      .then(setMovie)
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

  if (!movie) {
    return (
      <div className="pt-24 pb-16 text-center text-white/40">
        Movie not found.
      </div>
    )
  }

  const backdrop = imageUrl(movie.backdrop_path, 'original')
  const poster = imageUrl(movie.poster_path, 'w342')
  const year = movie.release_date?.slice(0, 4)
  const log = store.getLog(movie.id)
  const inWatchlist = store.isInWatchlist(movie.id)

  const handleLog = (rating: number, review: string) => {
    if (rating < 0) { setShowModal(false); return }
    store.addLog({
      movieId: movie.id,
      movieTitle: movie.title,
      posterPath: movie.poster_path,
      rating,
      review,
      date: new Date().toISOString().slice(0, 10),
      likes: 0,
    })
    setShowModal(false)
  }

  const handleDownload = async () => {
    clearTimeout(dlTimer.current)
    setDlStatus('sending')
    const { ok, error } = await sendMovieRequest(movie.title, year)
    setDlStatus(ok ? 'sent' : 'error')
    if (!ok) console.error('[download]', error)
    dlTimer.current = setTimeout(() => setDlStatus('idle'), 3000)
  }

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
                  <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">No poster</div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white/90">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/50">
                {year && <span>{year}</span>}
                {movie.runtime && <span>{movie.runtime} min</span>}
                {movie.genres?.map(g => (
                  <span key={g.id} className="px-2 py-0.5 rounded-full bg-white/5 text-xs">{g.name}</span>
                ))}
              </div>

              {movie.tagline && (
                <p className="mt-3 text-sm italic text-white/30">"{movie.tagline}"</p>
              )}

              <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xl">{movie.overview}</p>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#00e054] text-black text-sm font-semibold hover:bg-[#00e054]/90 transition-all"
                >
                  {log ? '✏️ Update Log' : '★ Log It'}
                </button>
                <button
                  onClick={() =>
                    store.toggleWatchlist({
                      movieId: movie.id,
                      movieTitle: movie.title,
                      posterPath: movie.poster_path,
                      addedAt: new Date().toISOString(),
                      watched: false,
                      mediaType: 'movie',
                      year: year || '',
                      language: '',
                    })
                  }
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    inWatchlist
                      ? 'border-[#00e054]/30 text-[#00e054] bg-[#00e054]/10'
                      : 'border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  {inWatchlist ? '★ In Watchlist' : '☆ Add to Watchlist'}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={dlStatus === 'sending'}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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

              {/* Existing log */}
              {log && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#00e054] font-bold">{'★'.repeat(log.rating)}{'☆'.repeat(5 - log.rating)}</span>
                    <span className="text-xs text-white/30">— {log.date}</span>
                  </div>
                  {log.review && <p className="text-sm text-white/60">{log.review}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cast */}
      {movie.credits?.cast && movie.credits.cast.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-lg font-semibold text-white/70 mb-4">Cast</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {movie.credits.cast.slice(0, 12).map(c => (
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

      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <Link to="/" className="text-sm text-white/30 hover:text-white/50 transition-colors">← Back to Home</Link>
      </div>

      {showModal && (
        <LogModal
          movie={{ ...movie, genre_ids: [] }}
          onLog={handleLog}
          onToggleWatchlist={() =>
            store.toggleWatchlist({
              movieId: movie.id,
              movieTitle: movie.title,
              posterPath: movie.poster_path,
              addedAt: new Date().toISOString(),
              watched: false,
              mediaType: 'movie',
              year: year || '',
              language: '',
            })
          }
          inWatchlist={inWatchlist}
          isLogged={!!log}
          initialRating={log?.rating}
          initialReview={log?.review}
        />
      )}
    </>
  )
}
