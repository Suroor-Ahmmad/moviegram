import { useState } from 'react'
import type { Movie } from '@/types'
import { imageUrl } from '@/api'

interface Props {
  movie: Movie
  onLog: (rating: number, review: string) => void
  onToggleWatchlist: () => void
  inWatchlist: boolean
  isLogged: boolean
  initialRating?: number
  initialReview?: string
}

export default function LogModal({ movie, onLog, onToggleWatchlist, inWatchlist, isLogged, initialRating, initialReview }: Props) {
  const [rating, setRating] = useState(initialRating ?? 0)
  const [review, setReview] = useState(initialReview ?? '')

  const poster = imageUrl(movie.poster_path, 'w185')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={e => { if (e.target === e.currentTarget) onLog(-1, '') }}>
      <div className="bg-[#141416] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="flex gap-4 p-5">
          {poster && (
            <img src={poster} alt="" className="w-[70px] h-[105px] rounded-lg object-cover flex-shrink-0" />
          )}
          <div className="min-w-0">
            <h2 className="font-semibold text-white/90 text-lg leading-tight">{movie.title}</h2>
            <p className="text-sm text-white/40 mt-0.5">{movie.release_date?.slice(0, 4)}</p>
          </div>
        </div>

        <div className="px-5 pb-4 space-y-4">
          {/* Rating */}
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Rating</label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`w-10 h-10 rounded-lg text-lg transition-all ${
                    n <= rating
                      ? 'bg-[#00e054] text-black font-bold'
                      : 'bg-white/5 text-white/30 hover:bg-white/10'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Review */}
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Review</label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="What did you think?"
              rows={3}
              className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-[#00e054]/40 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (rating > 0) onLog(rating, review)
              }}
              disabled={rating === 0}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                rating > 0
                  ? 'bg-[#00e054] text-black hover:bg-[#00e054]/90'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              {isLogged ? 'Update Log' : 'Log It'}
            </button>
            <button
              onClick={onToggleWatchlist}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                inWatchlist
                  ? 'border-[#00e054]/30 text-[#00e054] bg-[#00e054]/10'
                  : 'border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              {inWatchlist ? '★ In List' : '☆ Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
