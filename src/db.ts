import { supabase } from './supabase'

// --- Diary ---

export interface DiaryRow {
  movieId: number
  movieTitle: string
  posterPath: string | null
  rating: number
  review: string
  date: string
  likes: number
}

export async function getDiary(): Promise<DiaryRow[]> {
  const { data, error } = await supabase
    .from('diary')
    .select('movie_id, movie_title, poster_path, rating, review, date, likes')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[supabase] getDiary:', error.message)
    return []
  }

  return (data || []).map((r: any) => ({
    movieId: r.movie_id,
    movieTitle: r.movie_title,
    posterPath: r.poster_path,
    rating: r.rating,
    review: r.review,
    date: r.date,
    likes: r.likes,
  }))
}

export async function getLog(movieId: number): Promise<DiaryRow | undefined> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return undefined

  const { data } = await supabase
    .from('diary')
    .select('movie_id, movie_title, poster_path, rating, review, date, likes')
    .eq('user_id', user.id)
    .eq('movie_id', movieId)
    .single()

  if (!data) return undefined
  return {
    movieId: data.movie_id,
    movieTitle: data.movie_title,
    posterPath: data.poster_path,
    rating: data.rating,
    review: data.review,
    date: data.date,
    likes: data.likes,
  }
}

export async function upsertLog(entry: DiaryRow): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return

  const { error } = await supabase.from('diary').upsert({
    user_id: user.id,
    movie_id: entry.movieId,
    movie_title: entry.movieTitle,
    poster_path: entry.posterPath,
    rating: entry.rating,
    review: entry.review,
    date: entry.date,
    likes: entry.likes,
  }, { onConflict: 'user_id,movie_id' })

  if (error) console.error('[supabase] upsertLog:', error.message)
}

export async function removeLogDb(movieId: number): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return

  const { error } = await supabase
    .from('diary')
    .delete()
    .eq('user_id', user.id)
    .eq('movie_id', movieId)

  if (error) console.error('[supabase] removeLog:', error.message)
}

// --- Watchlist ---

export interface WatchlistRow {
  movieId: number
  movieTitle: string
  posterPath: string | null
  addedAt: string
  watched: boolean
  mediaType: 'movie' | 'tv'
  year: string
  language: string
}

export async function getWatchlist(): Promise<WatchlistRow[]> {
  const { data, error } = await supabase
    .from('watchlist')
    .select('movie_id, movie_title, poster_path, added_at, watched, media_type, year, language')
    .order('added_at', { ascending: false })

  if (error) {
    console.error('[supabase] getWatchlist:', error.message)
    return []
  }

  return (data || []).map((r: any) => ({
    movieId: r.movie_id,
    movieTitle: r.movie_title,
    posterPath: r.poster_path,
    addedAt: r.added_at,
    watched: r.watched,
    mediaType: r.media_type || 'movie',
    year: r.year || '',
    language: r.language || '',
  }))
}

export async function toggleWatchlist(entry: { movieId: number; movieTitle: string; posterPath: string | null; addedAt: string; watched: boolean; mediaType: 'movie' | 'tv'; year: string; language: string }): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return

  const existing = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('movie_id', entry.movieId)
    .maybeSingle()

  if (existing.data) {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('movie_id', entry.movieId)
    if (error) console.error('[supabase] remove watchlist:', error.message)
  } else {
    const { error } = await supabase.from('watchlist').insert({
      user_id: user.id,
      movie_id: entry.movieId,
      movie_title: entry.movieTitle,
      poster_path: entry.posterPath,
      added_at: entry.addedAt,
      watched: entry.watched,
      media_type: entry.mediaType,
      year: entry.year,
      language: entry.language,
    })
    if (error) console.error('[supabase] add watchlist:', error.message)
  }
}

export async function markAsWatched(movieId: number): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return

  const { error } = await supabase
    .from('watchlist')
    .update({ watched: true })
    .eq('user_id', user.id)
    .eq('movie_id', movieId)

  if (error) console.error('[supabase] markAsWatched:', error.message)
}

export async function isInWatchlist(movieId: number): Promise<boolean> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return false

  const { data } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('movie_id', movieId)
    .maybeSingle()

  return !!data
}

export async function isLogged(movieId: number): Promise<boolean> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return false

  const { data } = await supabase
    .from('diary')
    .select('id')
    .eq('user_id', user.id)
    .eq('movie_id', movieId)
    .maybeSingle()

  return !!data
}
