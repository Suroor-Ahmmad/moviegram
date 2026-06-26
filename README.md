# MovieGram

A personal movie and TV show tracker built with React, Supabase, and Tailwind CSS. Browse trending content, manage your watchlist, and log your viewing history — all in a sleek dark-themed interface.

---

## 📋 Table of Contents

- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Setup](#-setup)
  - [1. Clone and Install](#1-clone-and-install)
  - [2. Environment Variables](#2-environment-variables)
  - [3. Supabase Setup](#3-supabase-setup)
  - [4. Run](#4-run)
- [Scripts](#-scripts)
- [API Data Source](#-api-data-source)
- [Database Schema](#-database-schema)

---

## 📷 Screenshots

> _Screenshots coming soon._

---

## ✅ Features

### Content Discovery
- **Trending feed** — browse the most popular movies and TV shows of the week, updated daily
- **Full-text search** — search across movies and TV shows with debounced input
- **Genre filtering** — filter by any of 18 genres (Action, Drama, Horror, etc.)
- **Language filtering** — filter by original language (English, French, Japanese, Korean, etc.)
- **Sort options** — sort by popularity, highest rated, newest, oldest, or top grossing
- **Movies & TV toggle** — switch between browsing movies and TV shows

### Detail Pages
- **Movie detail page** (`/movie/:id`) — synopsis, runtime, genres, tagline, cast, and TMDB rating
- **TV show detail page** (`/tv/:id`) — synopsis, season count, episode count, genres, cast, and TMDB rating
- **Cast carousel** — scrollable horizontal cast strip with profile photos and character names

### Personal Tracking
- **Watchlist** — save any movie or TV show to your personal watchlist with one click
- **Mark as watched** — mark watchlist items as watched; entries fade out to show progress
- **Diary / Activity log** — log entries with a 1–5 star rating and optional written review
- **Update & delete logs** — edit past ratings/reviews or remove them entirely

### Watchlist Management
- **Filter by status** — show all, to-watch, or watched items
- **Sort** — by date added, title (A–Z / Z–A), or rating
- **Group by** — status (To Watch / Watched), media type (Movie / TV), release year, or language
- **Search within watchlist** — filter by title

### User Account
- **Email + password authentication** via Supabase Auth
- **Protected routes** — all pages require a signed-in session; unauthenticated users are redirected to `/auth`
- **Sign out** — accessible from the top navigation bar

### Notifications
- **Telegram integration** — "Download" button on detail pages sends a message to a configured Telegram chat with the movie/show title and year (useful for bot-driven auto-download pipelines)

### UI/UX
- **Dark theme** — near-black base (`#0a0a0b`) with a vibrant green accent (`#00e054`)
- **Responsive design** — adapts from mobile (2-column grid) to desktop (6-column grid)
- **Skeleton loading states** — pulsing placeholder cards while content loads
- **Lazy-loaded images** — poster images use native `loading="lazy"`
- **Smooth animations** — hover zoom on cards, scale-in modals, fade-in entries

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2 |
| Language | TypeScript | 6.0 (strict mode) |
| Bundler | Vite | 8.0 |
| Styling | Tailwind CSS | 4.3 |
| Routing | React Router DOM | 7.15 |
| Backend | Supabase | SDK 2.106 |
| Auth | Supabase Auth | (email/password) |
| Database | Supabase PostgreSQL | — |
| Local caching | `idb` (IndexedDB wrapper) | 8.0 |

---

## 📁 Project Structure

```
passenger/
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                  # Root: providers, routing, protected-route logic
│   ├── auth.tsx                 # AuthProvider + useAuth hook
│   ├── store.tsx                # StoreProvider + useStore (diary + watchlist state)
│   ├── api.ts                   # TMDB API client (fetch functions)
│   ├── db.ts                    # Supabase DB client (CRUD for diary & watchlist)
│   ├── supabase.ts              # Supabase client initialization
│   ├── telegram.ts              # Telegram bot notification helper
│   ├── types.ts                 # Shared TypeScript interfaces + constants
│   ├── components/
│   │   ├── Navbar.tsx           # Fixed top navigation bar
│   │   ├── FilterBar.tsx       # Genre / language / sort / type filter bar
│   │   ├── MovieCard.tsx        # Poster card with watchlist toggle
│   │   └── LogModal.tsx        # Rating + review modal overlay
│   └── pages/
│       ├── Home.tsx             # Trending / browse / search page
│       ├── MovieDetail.tsx      # Movie detail + log + download
│       ├── TvDetail.tsx         # TV show detail + download
│       ├── Diary.tsx            # Personal diary / activity feed
│       ├── Watchlist.tsx        # Watchlist with filter/sort/group
│       └── Auth.tsx             # Login / sign-up form
├── public/
├── supabase/                    # Supabase config/migrations (if any)
├── .env                         # Local environment variables (gitignored)
├── .env.example                 # Template for .env (safe to commit)
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📌 Prerequisites

Before running the project, you need:

1. **Node.js** ≥ 18 installed
2. A free [Supabase](https://supabase.com) account (project URL + anon key)
3. A free [TMDB](https://www.themoviedb.org/settings/api) API key
4. (Optional) A [Telegram Bot](https://core.telegram.org/bots#creating-a-new-bot) token and chat ID

---

## 🔧 Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd passenger
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# TMDB
VITE_TMDB_KEY=your-tmdb-api-key

# Telegram (optional — delete if not using)
VITE_TELEGRAM_BOT_TOKEN=your-bot-token
VITE_TELEGRAM_CHAT_ID=your-chat-id
```

> **Note:** All environment variables must be prefixed with `VITE_` to be accessible in the browser-side code.

### 3. Supabase Setup

#### Create the project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the **SQL Editor**, run the following to create the required tables:

```sql
-- Diary table: stores user ratings and reviews
create table if not exists public.diary (
  id          bigint generated by default as identity primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  movie_id    bigint not null,
  movie_title text,
  poster_path text,
  rating      smallint not null check (rating between 1 and 5),
  review      text,
  date        text,
  likes       bigint not null default 0,
  created_at  timestamptz not null default now(),
  unique (user_id, movie_id)
);

-- Watchlist table: stores user's saved movies and TV shows
create table if not exists public.watchlist (
  id           bigint generated by default as identity primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  movie_id     bigint not null,
  movie_title  text,
  poster_path  text,
  added_at     text,
  watched      boolean not null default false,
  media_type   text not null default 'movie',
  year         text,
  language     text,
  created_at   timestamptz not null default now(),
  unique (user_id, movie_id)
);

-- Enable Row Level Security (RLS)
alter table public.diary enable row level security;
alter table public.watchlist enable row level security;

-- Diary policies: users can only access their own entries
create policy "Users can view own diary"
  on public.diary for select using (auth.uid() = user_id);

create policy "Users can insert own diary"
  on public.diary for insert with check (auth.uid() = user_id);

create policy "Users can update own diary"
  on public.diary for update using (auth.uid() = user_id);

create policy "Users can delete own diary"
  on public.diary for delete using (auth.uid() = user_id);

-- Watchlist policies: users can only access their own entries
create policy "Users can view own watchlist"
  on public.watchlist for select using (auth.uid() = user_id);

create policy "Users can insert own watchlist"
  on public.watchlist for insert with check (auth.uid() = user_id);

create policy "Users can update own watchlist"
  on public.watchlist for update using (auth.uid() = user_id);

create policy "Users can delete own watchlist"
  on public.watchlist for delete using (auth.uid() = user_id);
```

#### Get your credentials

- **Project URL**: Supabase Dashboard → Settings → API → Project URL
- **Anon Key**: Supabase Dashboard → Settings → API → `anon` public key

#### (Optional) Enable email auth

Supabase Auth with email/password is enabled by default in new projects. To confirm:
1. Go to **Authentication** → **Providers** → **Email**
2. Make sure **Enable Email** is checked

#### Telegram setup

1. Create a bot via [@BotFather](https://t.me/BotFather) and copy the bot token
2. Create a channel/group and add the bot as an admin
3. Get your chat ID using [@userinfobot](https://t.me/userinfobot) or the API:
   ```bash
   curl https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
4. Add the bot token and chat ID to `.env`

### 4. Run

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Build for production (TypeScript check + Vite build) |
| `npm run preview` | Preview the production build locally |

---

## 🌐 API Data Source

All movie and TV show data (trending, search, details, cast, images) is sourced from **The Movie Database (TMDB)** via their free public API:

- **Base URL**: `https://api.themoviedb.org/3`
- **API Key**: Required in `VITE_TMDB_KEY` (free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api))
- **Image CDN**: `https://image.tmdb.org/t/p/{size}{path}`

Image credits: This product uses the TMDb API but is not endorsed or certified by TMDb.

---

## 🗄️ Database Schema

### `diary`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `bigint` | Auto-increment primary key |
| `user_id` | `uuid` | FK → `auth.users.id`, required |
| `movie_id` | `bigint` | TMDB content ID |
| `movie_title` | `text` | Title for display |
| `poster_path` | `text` | TMDB poster path |
| `rating` | `smallint` | 1–5 stars |
| `review` | `text` | Optional written review |
| `date` | `text` | Date string (YYYY-MM-DD) |
| `likes` | `bigint` | Like count (for future social features) |
| `created_at` | `timestamptz` | Auto-set on insert |

**Unique constraint**: `(user_id, movie_id)` — one log entry per item per user.

### `watchlist`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `bigint` | Auto-increment primary key |
| `user_id` | `uuid` | FK → `auth.users.id`, required |
| `movie_id` | `bigint` | TMDB content ID |
| `movie_title` | `text` | Title for display |
| `poster_path` | `text` | TMDB poster path |
| `added_at` | `text` | ISO timestamp when added |
| `watched` | `boolean` | `true` if marked as watched |
| `media_type` | `text` | `'movie'` or `'tv'` |
| `year` | `text` | Release year |
| `language` | `text` | Original language code |
| `created_at` | `timestamptz` | Auto-set on insert |

**Unique constraint**: `(user_id, movie_id)` — one watchlist entry per item per user.

Both tables have **Row Level Security (RLS)** policies so users can only read/write their own data.

---

## 📄 License

This project is personal and not currently licensed for public use. All rights reserved.