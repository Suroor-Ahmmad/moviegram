import { Link } from 'react-router-dom'
import { imageUrl } from '@/api'
import { useStore } from '@/store'
import type { Movie, TvShow } from '@/types'

interface Props {
  item: Movie | TvShow
}

export default function MovieCard({ item }: Props) {
  const isTv = 'name' in item
  const title = isTv ? (item as TvShow).name : (item as Movie).title
  const year = ((isTv ? (item as TvShow).first_air_date : (item as Movie).release_date) || '').slice(0, 4)
  const poster = imageUrl(item.poster_path, 'w342')
  const link = isTv ? `/tv/${item.id}` : `/movie/${item.id}`
  const store = useStore()
  const inWatchlist = store.isInWatchlist(item.id)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    store.toggleWatchlist({
      movieId: item.id,
      movieTitle: title,
      posterPath: item.poster_path,
      addedAt: new Date().toISOString(),
      watched: false,
      mediaType: isTv ? 'tv' : 'movie',
      year,
      language: '',
    })
  }

  return (
    <Link
      to={link}
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] animate-fade-in"
    >
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 relative">
        {poster ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-sm p-2 text-center">
            No poster
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isTv && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-semibold text-white/70">
            TV
          </div>
        )}

        {/* Watchlist button */}
        <button
          onClick={handleToggle}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110 ${
            inWatchlist
              ? 'bg-[#00e054] text-black shadow-lg shadow-[#00e054]/20'
              : 'bg-black/50 text-white/60 opacity-0 group-hover:opacity-100 hover:bg-[#00e054] hover:text-black'
          }`}
          title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {inWatchlist ? '★' : '☆'}
        </button>
      </div>

      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-white/90 truncate">{title}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          {year && <span className="text-xs text-white/40">{year}</span>}
          <span className="text-xs text-[#00e054]">
            ★ {item.vote_average.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  )
}
