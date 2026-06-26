CREATE TABLE IF NOT EXISTS public.diary (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  poster_path TEXT,
  rating INTEGER NOT NULL DEFAULT 0,
  review TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

CREATE TABLE IF NOT EXISTS public.watchlist (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  poster_path TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  watched BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, movie_id)
);

ALTER TABLE public.diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Diary policies
CREATE POLICY "Users can read own diary" ON public.diary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary" ON public.diary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary" ON public.diary
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary" ON public.diary
  FOR DELETE USING (auth.uid() = user_id);

-- Watchlist policies
CREATE POLICY "Users can read own watchlist" ON public.watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist" ON public.watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist" ON public.watchlist
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist" ON public.watchlist
  FOR DELETE USING (auth.uid() = user_id);
