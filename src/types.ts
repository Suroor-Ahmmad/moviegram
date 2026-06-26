export interface Movie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date: string
  vote_average: number
  genre_ids: number[]
}

export interface TvShow {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  first_air_date: string
  vote_average: number
  genre_ids: number[]
}

export type MediaItem = Movie | TvShow

export interface MovieDetails extends Movie {
  runtime: number | null
  genres: { id: number; name: string }[]
  tagline: string | null
  credits: { cast: CastMember[] }
}

export interface TvDetails extends TvShow {
  genres: { id: number; name: string }[]
  tagline: string | null
  number_of_seasons: number
  number_of_episodes: number
  credits: { cast: CastMember[] }
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export interface SearchResult {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface DiscoverParams {
  type: 'movie' | 'tv'
  genre?: string
  language?: string
  sortBy?: string
  page?: number
}

export const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
]

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest First' },
  { value: 'primary_release_date.asc', label: 'Oldest First' },
  { value: 'revenue.desc', label: 'Top Grossing' },
]

export const LANGUAGES = [
  { code: '', name: 'All' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ta', name: 'Tamil' },
  { code: 'fa', name: 'Persian' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
]

export type WatchStatus = 'watchlist' | 'watched' | 'watching'

export interface LogEntry {
  movieId: number
  movieTitle: string
  posterPath: string | null
  rating: number
  review: string
  date: string
  likes: number
}

export interface WatchlistEntry {
  movieId: number
  movieTitle: string
  posterPath: string | null
  addedAt: string
  watched: boolean
  mediaType: 'movie' | 'tv'
  year: string
  language: string
}
