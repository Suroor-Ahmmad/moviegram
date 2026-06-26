import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getDiary, upsertLog, removeLogDb, getWatchlist, toggleWatchlist as toggleWatchlistDb, markAsWatched as markAsWatchedDb } from './db'
import { useAuth } from './auth'
import type { LogEntry, WatchlistEntry } from '@/types'

interface Store {
  ready: boolean
  diary: LogEntry[]
  watchlist: WatchlistEntry[]
  addLog: (entry: LogEntry) => void
  removeLog: (movieId: number) => void
  toggleWatchlist: (entry: WatchlistEntry) => void
  markAsWatched: (movieId: number) => void
  isInWatchlist: (movieId: number) => boolean
  isLogged: (movieId: number) => boolean
  getLog: (movieId: number) => LogEntry | undefined
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [ready, setReady] = useState(false)
  const [diary, setDiary] = useState<LogEntry[]>([])
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  // Load data when user changes or refresh key increments
  useEffect(() => {
    setReady(false)
    if (!user) {
      setDiary([])
      setWatchlist([])
      setReady(true)
      return
    }

    Promise.all([getDiary(), getWatchlist()]).then(([d, w]) => {
      setDiary(d)
      setWatchlist(w.map(e => ({
        ...e,
        mediaType: e.mediaType || 'movie',
        year: e.year || '',
        language: e.language || '',
      })))
      setReady(true)
    })
  }, [user, refreshKey])

  const addLog = useCallback((entry: LogEntry) => {
    upsertLog(entry).then(refresh)
  }, [refresh])

  const removeLog = useCallback((movieId: number) => {
    removeLogDb(movieId).then(refresh)
  }, [refresh])

  const toggleWatchlist = useCallback((entry: WatchlistEntry) => {
    toggleWatchlistDb(entry).then(refresh)
  }, [refresh])

  const markAsWatched = useCallback((movieId: number) => {
    markAsWatchedDb(movieId).then(refresh)
  }, [refresh])

  const isInWatchlistFn = useCallback(
    (movieId: number) => watchlist.some(e => e.movieId === movieId),
    [watchlist]
  )

  const isLoggedFn = useCallback(
    (movieId: number) => diary.some(e => e.movieId === movieId),
    [diary]
  )

  const getLogFn = useCallback(
    (movieId: number) => diary.find(e => e.movieId === movieId),
    [diary]
  )

  return (
    <Ctx.Provider value={{
      ready, diary, watchlist,
      addLog, removeLog,
      toggleWatchlist, markAsWatched,
      isInWatchlist: isInWatchlistFn,
      isLogged: isLoggedFn,
      getLog: getLogFn,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}
