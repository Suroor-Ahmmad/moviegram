import { useStore } from '@/store'
import { imageUrl } from '@/api'
import { Link } from 'react-router-dom'

export default function DiaryPage() {
  const { diary, removeLog } = useStore()

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-white/90 mb-8">My Diary</h1>

        {diary.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/20 text-lg mb-2">No entries yet</p>
            <p className="text-white/10 text-sm">Search for a movie and log it</p>
          </div>
        ) : (
          <div className="space-y-3">
            {diary.map(e => (
              <div
                key={e.movieId}
                className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all animate-fade-in"
              >
                <Link to={`/movie/${e.movieId}`} className="flex-shrink-0">
                  <div className="w-[48px] h-[72px] rounded-lg overflow-hidden bg-white/5">
                    {e.posterPath ? (
                      <img src={imageUrl(e.posterPath, 'w185')!} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">N/A</div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/movie/${e.movieId}`} className="font-medium text-white/80 hover:text-white transition-colors">
                    {e.movieTitle}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[#00e054] text-sm">{'★'.repeat(e.rating)}{'☆'.repeat(5 - e.rating)}</span>
                    <span className="text-xs text-white/30">{e.date}</span>
                  </div>
                  {e.review && <p className="mt-2 text-sm text-white/50 line-clamp-2">{e.review}</p>}
                </div>

                <button
                  onClick={() => removeLog(e.movieId)}
                  className="self-start text-white/20 hover:text-red-400 transition-colors p-1"
                  title="Remove entry"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
