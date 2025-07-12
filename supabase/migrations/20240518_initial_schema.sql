-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    account_type TEXT NOT NULL CHECK (account_type IN ('creator', 'fan')),
    subscription_price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    file_url TEXT,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscriber_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due')),
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(subscriber_id, creator_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed')),
    payment_method TEXT,
    subscriber_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Creators can insert their own posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = creator_id);

CREATE POLICY "Preview posts are viewable by everyone"
    ON public.posts FOR SELECT
    USING (is_preview = true);

CREATE POLICY "Subscribers can view creator posts"
    ON public.posts FOR SELECT
    USING (
        auth.uid() = creator_id OR
        EXISTS (
            SELECT 1 FROM public.subscriptions
            WHERE subscriber_id = auth.uid()
            AND creator_id = posts.creator_id
            AND status = 'active'
            AND current_period_end > NOW()
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = subscriber_id OR auth.uid() = creator_id);

CREATE POLICY "Users can create their own subscriptions"
    ON public.subscriptions FOR INSERT
    WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can update their own subscriptions"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = subscriber_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = subscriber_id OR auth.uid() = creator_id);

-- Messages policies
CREATE POLICY "Users can view their own messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own sent messages"
    ON public.messages FOR UPDATE
    USING (auth.uid() = sender_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', false);

-- Set up storage policies
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Content is accessible by creator and subscribers"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'content' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            EXISTS (
                SELECT 1 FROM public.subscriptions
                WHERE subscriber_id = auth.uid()
                AND creator_id = (storage.foldername(name))[1]::uuid
                AND status = 'active'
                AND current_period_end > NOW()
            )
        )
    );

CREATE POLICY "Creators can upload content"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can update their own content"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators can delete their own content"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create functions for handling user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'creator')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
