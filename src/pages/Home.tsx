import { useEffect, useState, useCallback, useRef } from 'react'
import { discoverMedia, fetchTrending, searchMulti } from '@/api'
import MovieCard from '@/components/MovieCard'
import FilterBar, { type Filters } from '@/components/FilterBar'
import type { Movie, TvShow } from '@/types'

type MediaItem = Movie | TvShow

export default function Home() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<Filters>({
    type: 'movie',
    genre: '',
    language: '',
    sortBy: 'popularity.desc',
  })
  const [usingTrending, setUsingTrending] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout>>()

  const fetchItems = useCallback(async (f: Filters, p: number) => {
    setLoading(true)
    const noFilters = !f.genre && !f.language
    if (noFilters && p === 1 && f.sortBy === 'popularity.desc') {
      const data = await fetchTrending(f.type)
      const results = data.results as MediaItem[]
      setItems(results.slice(0, 18))
      setTotalPages(1)
      setUsingTrending(true)
    } else {
      const data = await discoverMedia({ ...f, page: p })
      setItems(data.results as MediaItem[])
      setTotalPages(data.total_pages)
      setUsingTrending(false)
    }
    setPage(p)
    setLoading(false)
  }, [])

  // Debounced filter change
  useEffect(() => {
    if (searchMode) return
    const t = setTimeout(() => fetchItems(filters, 1), 200)
    return () => clearTimeout(t)
  }, [filters, fetchItems, searchMode])

  // Search
  useEffect(() => {
    clearTimeout(debounce.current)
    if (!searchQuery.trim()) {
      setSearchMode(false)
      return
    }

    setSearchMode(true)
    debounce.current = setTimeout(async () => {
      setLoading(true)
      const data = await searchMulti(searchQuery, 1)
      setItems(data.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv'))
      setTotalPages(data.total_pages)
      setPage(1)
      setUsingTrending(false)
      setLoading(false)
    }, 300)

    return () => clearTimeout(debounce.current)
  }, [searchQuery])

  const hasFilters = !!(filters.genre || filters.language || filters.sortBy !== 'popularity.desc')

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white/90">
            {searchMode ? (
              <>
                Results for "<span className="text-[#00e054]">{searchQuery}</span>"
              </>
            ) : hasFilters ? (
              <>
                Browse{' '}
                <span className="text-[#00e054]">{filters.type === 'movie' ? 'Movies' : 'TV Shows'}</span>
              </>
            ) : (
              <>
                What's <span className="text-[#00e054]">trending</span>
              </>
            )}
          </h1>
          <p className="mt-2 text-white/40 text-sm">
            {searchMode ? 'Search results' : usingTrending ? "This week's most popular" : `Page ${page} of ${totalPages}`}
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search movies & TV shows..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#00e054]/40 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter bar (hidden during search) */}
        {!searchMode && (
          <div className="mb-8">
            <FilterBar current={filters} onChange={setFilters} />
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-2/3 rounded-xl bg-white/5" />
                <div className="mt-2 h-4 bg-white/5 rounded w-3/4" />
                <div className="mt-1 h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {items.map(m => (
                <MovieCard key={`${'title' in m ? 'movie' : 'tv'}-${m.id}`} item={m} />
              ))}
            </div>

            {!usingTrending && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    if (searchMode) {
                      setLoading(true)
                      searchMulti(searchQuery, page - 1).then(data => {
                        setItems(data.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv'))
                        setPage(page - 1)
                        setLoading(false)
                      })
                    } else {
                      fetchItems(filters, page - 1)
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>
                <span className="text-sm text-white/30">
                  {page} / {totalPages > 500 ? '500+' : totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => {
                    if (searchMode) {
                      setLoading(true)
                      searchMulti(searchQuery, page + 1).then(data => {
                        setItems(data.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv'))
                        setPage(page + 1)
                        setLoading(false)
                      })
                    } else {
                      fetchItems(filters, page + 1)
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/20 text-lg">No results found</p>
            <p className="text-white/10 text-sm mt-1">Try different filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  )
}
