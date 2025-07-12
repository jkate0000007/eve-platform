-- Make file_url required for posts
ALTER TABLE public.posts ALTER COLUMN file_url SET NOT NULL;

-- Add a check constraint to ensure file_url is not empty
ALTER TABLE public.posts ADD CONSTRAINT posts_file_url_not_empty CHECK (file_url != '');

-- Update the posts insert policy to require file_url
DROP POLICY IF EXISTS "Creators can insert their own posts" ON public.posts;

CREATE POLICY "Creators can insert their own posts"
    ON public.posts FOR INSERT
    WITH CHECK (
        auth.uid() = creator_id 
        AND file_url IS NOT NULL 
        AND file_url != ''
    ); 