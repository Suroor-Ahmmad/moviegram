import { useState } from 'react'
import { GENRES, SORT_OPTIONS, LANGUAGES } from '@/types'

export interface Filters {
  type: 'movie' | 'tv'
  genre: string
  language: string
  sortBy: string
}

interface Props {
  current: Filters
  onChange: (f: Filters) => void
}

export default function FilterBar({ current, onChange }: Props) {
  const [open, setOpen] = useState<string | null>(null)

  const update = (patch: Partial<Filters>) => onChange({ ...current, ...patch })

  const btn = (label: string, isActive: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${
      isActive
        ? 'bg-[#00e054]/10 border-[#00e054]/30 text-[#00e054]'
        : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/70'
    }`

  const dropdown = (key: string, children: React.ReactNode) => (
    <div className="relative">
      <button onClick={() => setOpen(open === key ? null : key)} className={btn(key, open === key)}>
        {key === 'type' ? (current.type === 'movie' ? 'Movies' : 'TV Shows') : null}
        {key === 'genre' ? (current.genre ? GENRES.find(g => String(g.id) === current.genre)?.name || 'Genre' : 'Genre') : null}
        {key === 'language' ? (current.language ? LANGUAGES.find(l => l.code === current.language)?.name || 'Language' : 'Language') : null}
        {key === 'sort' ? SORT_OPTIONS.find(s => s.value === current.sortBy)?.label || 'Sort' : null}
        <svg className={`inline ml-1 w-3 h-3 transition-transform ${open === key ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open === key && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(null)} />
          <div className="absolute top-full mt-1 left-0 z-20 bg-[#1a1a1e] border border-white/10 rounded-xl p-1.5 min-w-[160px] shadow-2xl animate-scale-in">
            {children}
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="flex flex-wrap items-center gap-2 pb-1">
      {/* Type toggle */}
      <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
        <button
          onClick={() => update({ type: 'movie', genre: '', sortBy: current.type === 'tv' ? 'popularity.desc' : current.sortBy })}
          className={`px-3 py-1.5 text-sm font-medium transition-all ${
            current.type === 'movie'
              ? 'bg-[#00e054] text-black'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          Movies
        </button>
        <button
          onClick={() => update({ type: 'tv', genre: '', sortBy: current.type === 'movie' ? 'popularity.desc' : current.sortBy })}
          className={`px-3 py-1.5 text-sm font-medium transition-all ${
            current.type === 'tv'
              ? 'bg-[#00e054] text-black'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          TV Shows
        </button>
      </div>

      {/* Genre */}
      {dropdown('genre', (
        <div className="max-h-[260px] overflow-y-auto space-y-0.5">
          <button
            onClick={() => { update({ genre: '' }); setOpen(null) }}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !current.genre ? 'text-[#00e054] bg-[#00e054]/10' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            All Genres
          </button>
          {GENRES.map(g => (
            <button
              key={g.id}
              onClick={() => { update({ genre: String(g.id) }); setOpen(null) }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                current.genre === String(g.id) ? 'text-[#00e054] bg-[#00e054]/10' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      ))}

      {/* Language */}
      {dropdown('language', (
        <div className="space-y-0.5">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { update({ language: l.code }); setOpen(null) }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                current.language === l.code ? 'text-[#00e054] bg-[#00e054]/10' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      ))}

      {/* Sort */}
      {dropdown('sort', (
        <div className="space-y-0.5">
          {SORT_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => { update({ sortBy: s.value }); setOpen(null) }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                current.sortBy === s.value ? 'text-[#00e054] bg-[#00e054]/10' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      ))}

      {/* Active pill summary */}
      {(current.genre || current.language) && (
        <button
          onClick={() => update({ genre: '', language: '' })}
          className="ml-auto px-2 py-1 rounded text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
