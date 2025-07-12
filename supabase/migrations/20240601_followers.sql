-- Followers table for social following
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- the follower
  followed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- the followed creator
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, followed_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_followers_user_id ON public.followers(user_id);
CREATE INDEX IF NOT EXISTS idx_followers_followed_id ON public.followers(followed_id); 