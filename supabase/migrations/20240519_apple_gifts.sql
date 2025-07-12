-- Create apple_gifts table
CREATE TABLE IF NOT EXISTS public.apple_gifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    amount INT NOT NULL CHECK (amount > 0),
    price_per_apple DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create apple_redemptions table
CREATE TABLE IF NOT EXISTS public.apple_redemptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    apple_count INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    payout_method TEXT,
    payout_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.apple_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apple_redemptions ENABLE ROW LEVEL SECURITY;

-- Apple gifts policies
CREATE POLICY "Users can view their own sent apple gifts"
    ON public.apple_gifts FOR SELECT
    USING (auth.uid() = sender_id);

CREATE POLICY "Creators can view apple gifts sent to them"
    ON public.apple_gifts FOR SELECT
    USING (auth.uid() = creator_id);

CREATE POLICY "Users can insert their own apple gifts"
    ON public.apple_gifts FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Apple redemptions policies
CREATE POLICY "Creators can view their own redemptions"
    ON public.apple_redemptions FOR SELECT
    USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own redemptions"
    ON public.apple_redemptions FOR INSERT
    WITH CHECK (auth.uid() = creator_id);
