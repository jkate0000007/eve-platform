-- Add foreign key constraints to apple_gifts table
ALTER TABLE IF EXISTS public.apple_gifts
ADD CONSTRAINT apple_gifts_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.apple_gifts
ADD CONSTRAINT apple_gifts_creator_id_fkey
FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.apple_gifts
ADD CONSTRAINT apple_gifts_post_id_fkey
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- Add foreign key constraints to apple_redemptions table
ALTER TABLE IF EXISTS public.apple_redemptions
ADD CONSTRAINT apple_redemptions_creator_id_fkey
FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
