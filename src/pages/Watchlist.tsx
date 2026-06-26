import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { imageUrl } from '@/api'
import { Link } from 'react-router-dom'
import { GENRES, LANGUAGES } from '@/types'

type SortKey = 'added-desc' | 'added-asc' | 'title-asc' | 'title-desc' | 'rating-desc'
type GroupBy = 'status' | 'media-type' | 'year' | 'language' | 'none'
type FilterType = 'all' | 'to-watch' | 'watched'

export default function WatchlistPage() {
  const { watchlist, toggleWatchlist, markAsWatched, diary } = useStore()
  const [sortKey, setSortKey] = useState<SortKey>('added-desc')
  const [groupBy, setGroupBy] = useState<GroupBy>('status')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  // Rating map from diary
  const ratingMap = useMemo(() => {
    const m = new Map<number, number>()
    for (const e of diary) m.set(e.movieId, e.rating)
    return m
  }, [diary])

  // Filter
  const filtered = useMemo(() => {
    let list = [...watchlist]
    if (filterType === 'to-watch') list = list.filter(e => !e.watched)
    else if (filterType === 'watched') list = list.filter(e => e.watched)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e => e.movieTitle.toLowerCase().includes(q))
    }
    return list
  }, [watchlist, filterType, search])

  // Sort
  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sortKey) {
      case 'added-asc': return list.sort((a, b) => a.addedAt.localeCompare(b.addedAt))
      case 'added-desc': return list.sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      case 'title-asc': return list.sort((a, b) => a.movieTitle.localeCompare(b.movieTitle))
      case 'title-desc': return list.sort((a, b) => b.movieTitle.localeCompare(a.movieTitle))
      case 'rating-desc': return list.sort((a, b) => (ratingMap.get(b.movieId) || 0) - (ratingMap.get(a.movieId) || 0))
      default: return list
    }
  }, [filtered, sortKey, ratingMap])

  // Group
  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ label: 'All', items: sorted }]

    if (groupBy === 'status') {
      const toWatch = sorted.filter(e => !e.watched)
      const watched = sorted.filter(e => e.watched)
      return [
        { label: 'To Watch', items: toWatch },
        { label: 'Watched', items: watched },
      ].filter(g => g.items.length > 0)
    }

    if (groupBy === 'media-type') {
      const movies = sorted.filter(e => e.mediaType === 'movie')
      const tv = sorted.filter(e => e.mediaType === 'tv')
      return [
        { label: 'Movies', items: movies },
        { label: 'TV Shows', items: tv },
      ].filter(g => g.items.length > 0)
    }

    if (groupBy === 'language') {
      const map = new Map<string, typeof sorted>()
      for (const e of sorted) {
        const lang = e.language || 'unknown'
        if (!map.has(lang)) map.set(lang, [])
        map.get(lang)!.push(e)
      }
      return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([lang, items]) => ({
          label: LANGUAGES.find(l => l.code === lang)?.name || lang || 'Unknown',
          items,
        }))
    }

    if (groupBy === 'year') {
      const map = new Map<string, typeof sorted>()
      for (const e of sorted) {
        const y = e.year || 'Unknown'
        if (!map.has(y)) map.set(y, [])
        map.get(y)!.push(e)
      }
      return Array.from(map.entries())
        .sort(([a], [b]) => (b === 'Unknown' ? -1 : a === 'Unknown' ? 1 : b.localeCompare(a)))
        .map(([year, items]) => ({
          label: year === 'Unknown' ? 'Unknown Year' : year,
          items,
        }))
    }

    return [{ label: 'All', items: sorted }]
  }, [sorted, groupBy])

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'added-desc', label: 'Newest Added' },
    { value: 'added-asc', label: 'Oldest Added' },
    { value: 'title-asc', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
    { value: 'rating-desc', label: 'Highest Rated' },
  ]

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'to-watch', label: 'To Watch' },
    { value: 'watched', label: 'Watched' },
  ]

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-white/90 mb-2">My Watchlist</h1>
        <p className="text-sm text-white/40 mb-6">
          {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'}
        </p>

        {watchlist.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/20 text-lg mb-2">Your watchlist is empty</p>
            <p className="text-white/10 text-sm">Search for movies to add</p>
          </div>
        ) : (
          <>
            {/* Controls bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-white/5">
              {/* Search */}
              <div className="relative flex-1 min-w-40 max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter by title..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#00e054]/40 transition-colors"
                />
              </div>

              {/* Filter pills */}
              <div className="flex rounded-lg border border-white/8 overflow-hidden">
                {filters.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilterType(f.value)}
                    className={`px-3 py-1.5 text-xs font-medium transition-all ${
                      filterType === f.value
                        ? 'bg-[#00e054] text-black'
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/4 border border-white/8 text-white/50 hover:border-white/20 hover:text-white/70 transition-all whitespace-nowrap"
                >
                  {sortOptions.find(o => o.value === sortKey)?.label || 'Sort'}
                  <svg className={`inline ml-1 w-3 h-3 transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'sort' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute top-full mt-1 right-0 z-20 bg-[#1a1a1e] border border-white/10 rounded-xl p-1.5 min-w-42.5 shadow-2xl animate-scale-in">
                      {sortOptions.map(o => (
                        <button
                          key={o.value}
                          onClick={() => { setSortKey(o.value); setOpenDropdown(null) }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            sortKey === o.value ? 'text-[#00e054] bg-[#00e054]/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Group dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'group' ? null : 'group')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/4 border border-white/8 text-white/50 hover:border-white/20 hover:text-white/70 transition-all whitespace-nowrap"
                >
                  {groupBy === 'status' ? 'Group: Status' : groupBy === 'media-type' ? 'Group: Type' : groupBy === 'year' ? 'Group: Year' : groupBy === 'language' ? 'Group: Language' : 'No Grouping'}
                  <svg className={`inline ml-1 w-3 h-3 transition-transform ${openDropdown === 'group' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === 'group' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute top-full mt-1 right-0 z-20 bg-[#1a1a1e] border border-white/10 rounded-xl p-1.5 min-w-47.5 shadow-2xl animate-scale-in">
                      {[
                        { value: 'status' as const, label: 'By Status' },
                        { value: 'media-type' as const, label: 'By Type (Movie/TV)' },
                        { value: 'year' as const, label: 'By Release Year' },
                        { value: 'language' as const, label: 'By Language' },
                        { value: 'none' as const, label: 'No Grouping' },
                      ].map(o => (
                        <button
                          key={o.value}
                          onClick={() => { setGroupBy(o.value); setOpenDropdown(null) }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            groupBy === o.value ? 'text-[#00e054] bg-[#00e054]/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Groups */}
            <div className="space-y-10">
              {groups.map(group => (
                <section key={group.label}>
                  <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e054]" />
                    {group.label}
                    <span className="text-white/20 font-normal">({group.items.length})</span>
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {group.items.map(e => {
                      const rating = ratingMap.get(e.movieId)
                      return (
                        <div key={e.movieId} className="group relative animate-fade-in">
                          <Link to={`/movie/${e.movieId}`}>
                            <div className="aspect-2/3 rounded-xl overflow-hidden bg-white/5 relative">
                              {e.posterPath ? (
                                <img
                                  src={imageUrl(e.posterPath, 'w342')!}
                                  alt={e.movieTitle}
                                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${e.watched ? 'opacity-60' : ''}`}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20 text-sm p-2 text-center">No poster</div>
                              )}

                              {/* Badges */}
                              {e.watched && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#00e054]/20 text-[#00e054] text-[10px] font-semibold">
                                  Watched
                                </div>
                              )}
                              {e.mediaType === 'tv' && (
                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-semibold text-white/70">
                                  TV
                                </div>
                              )}
                              {rating && (
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[#00e054] text-[10px] font-semibold">
                                  ★ {rating}/5
                                </div>
                              )}
                              {e.language && groupBy !== 'language' && (
                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white/50">
                                  {e.language.toUpperCase()}
                                </div>
                              )}

                              {/* Hover actions */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-xl">
                                {!e.watched && (
                                  <button
                                    onClick={(ev) => { ev.preventDefault(); markAsWatched(e.movieId) }}
                                    className="px-3 py-1.5 rounded-lg bg-[#00e054] text-black text-xs font-semibold hover:bg-[#00e054]/90 transition-all"
                                  >
                                    ✓ Watched
                                  </button>
                                )}
                                <button
                                  onClick={(ev) => { ev.preventDefault(); toggleWatchlist(e) }}
                                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-xs hover:bg-white/20 transition-all"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </Link>

                          <Link to={`/movie/${e.movieId}`}>
                            <h3 className={`mt-2 text-sm font-medium truncate ${e.watched ? 'text-white/50' : 'text-white/80'}`}>
                              {e.movieTitle}
                            </h3>
                            <p className="text-xs text-white/30">{e.year}{e.year && e.language ? ' · ' : ''}{e.language.toUpperCase()}</p>
                          </Link>
                        </div>
                      )
                    })}
                  </div>

                  {group.items.length === 0 && (
                    <p className="text-white/20 text-sm py-8 text-center">
                      {group.label === 'To Watch' ? 'All caught up!' : 'Nothing here yet'}
                    </p>
                  )}
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
