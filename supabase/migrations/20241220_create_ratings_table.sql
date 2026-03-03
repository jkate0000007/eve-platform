-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, creator_id)
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Users can view ratings for any creator"
    ON public.ratings FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own ratings"
    ON public.ratings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
    ON public.ratings FOR UPDATE
    USING (auth.uid() = user_id);

-- Create function to get leaderboard ranking
CREATE OR REPLACE FUNCTION get_leaderboard_ranking()
RETURNS TABLE (
    creator_id UUID,
    username TEXT,
    avatar_url TEXT,
    country TEXT,
    average_rating DECIMAL,
    total_ratings BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as creator_id,
        p.username,
        p.avatar_url,
        p.country,
        COALESCE(AVG(r.rating), 0)::DECIMAL(3,1) as average_rating,
        COUNT(r.rating) as total_ratings
    FROM public.profiles p
    LEFT JOIN public.ratings r ON p.id = r.creator_id
    WHERE p.account_type = 'creator'
    GROUP BY p.id, p.username, p.avatar_url, p.country
    HAVING COUNT(r.rating) > 0
    ORDER BY AVG(r.rating) DESC, COUNT(r.rating) DESC;
END;
$$;