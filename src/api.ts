import type { Movie, TvShow, MovieDetails, TvDetails, DiscoverParams } from '@/types'

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY as string
const BASE = 'https://api.themoviedb.org/3'

if (!TMDB_KEY) {
  throw new Error('Missing VITE_TMDB_KEY environment variable')
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return res.json()
}

// --- Trending ---

export function fetchTrending(type: 'movie' | 'tv' = 'movie'): Promise<{ results: (Movie | TvShow)[] }> {
  return fetchJson(`${BASE}/trending/${type}/week?api_key=${TMDB_KEY}&language=en-US`)
}

// --- Discover (filtered browsing) ---

export function discoverMedia(params: DiscoverParams): Promise<{ results: (Movie | TvShow)[]; total_pages: number }> {
  const p = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US', page: String(params.page || 1) })

  if (params.sortBy) p.set('sort_by', params.sortBy)
  else p.set('sort_by', 'popularity.desc')

  if (params.genre) p.set('with_genres', params.genre)
  if (params.language) p.set('with_original_language', params.language)
  if (params.type === 'tv') {
    p.set('sort_by', params.sortBy || 'popularity.desc')
  }

  // Ensure adult content is excluded
  p.set('include_adult', 'false')

  return fetchJson(`${BASE}/discover/${params.type}?${p}`)
}

// --- Search ---

export function searchMulti(query: string, page = 1): Promise<{ results: any[]; total_pages: number; total_results: number }> {
  return fetchJson(`${BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}&include_adult=false`)
}

// --- Details ---

export function getMovieDetails(id: number): Promise<MovieDetails> {
  return fetchJson(`${BASE}/movie/${id}?api_key=${TMDB_KEY}&language=en-US&append_to_response=credits`)
}

export function getTvDetails(id: number): Promise<TvDetails> {
  return fetchJson(`${BASE}/tv/${id}?api_key=${TMDB_KEY}&language=en-US&append_to_response=credits`)
}

// --- Images ---

export const imageUrl = (path: string | null, size = 'w500') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null