/**
 * One-shot script to backfill media_type, year, and language
 * for existing watchlist entries that are missing these fields.
 *
 * Usage: npx tsx scripts/backfill-watchlist.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wbyozgwmiroufouxijoh.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
)

const TMDB_KEY = 'ac216a8c81a91b36d72b8b01dfee219e'
const TMDB_BASE = 'https://api.themoviedb.org/3'

async function getMovieDetails(id: number) {
  const res = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&language=en-US`)
  if (!res.ok) return null
  return res.json()
}

async function getTvDetails(id: number) {
  const res = await fetch(`${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}&language=en-US`)
  if (!res.ok) return null
  return res.json()
}

async function main() {
  // Get all watchlist entries
  const { data: entries, error } = await supabase
    .from('watchlist')
    .select('*')
    .or('media_type.is.null,media_type.eq.,year.is.null,year.eq.,language.is.null,language.eq.')

  if (error) {
    console.error('Failed to fetch watchlist:', error.message)
    process.exit(1)
  }

  console.log(`Found ${entries.length} entries to backfill`)

  for (const entry of entries) {
    // Skip if already has all fields
    if (entry.media_type && entry.year && entry.language) continue

    process.stdout.write(`Processing ${entry.movie_id} (${entry.movie_title})... `)

    // Try movie first, then TV
    let details: any = await getMovieDetails(entry.movie_id)
    let mediaType = 'movie'

    if (!details || details.success === false) {
      details = await getTvDetails(entry.movie_id)
      mediaType = 'tv'
    }

    if (!details || details.success === false) {
      console.log('SKIPPED (not found on TMDB)')
      continue
    }

    const year = (details.release_date || details.first_air_date || '').slice(0, 4)
    const language = (details.original_language || '').toLowerCase()

    const { error: updateError } = await supabase
      .from('watchlist')
      .update({
        media_type: mediaType,
        year,
        language,
      })
      .eq('id', entry.id)

    if (updateError) {
      console.log(`FAILED: ${updateError.message}`)
    } else {
      console.log(`✓ ${mediaType} · ${year} · ${language}`)
    }

    // Rate limit: 40 req/10s for TMDB free tier
    await new Promise(r => setTimeout(r, 300))
  }

  console.log('\nDone!')
}

main().catch(console.error)
