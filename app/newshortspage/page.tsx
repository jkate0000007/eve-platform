'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Database } from '@/lib/database.types';
import { LikeButton } from '@/components/like-button';
import { AppleGiftButton } from '@/components/apple-gift-button';
import { ShareButton } from '@/components/share-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"; // Assuming you have a toast system

type Post = Database['public']['Tables']['posts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ShortsPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [posts, setPosts] = useState<(Post & { profiles: Profile | null })[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(null); // cursor
  const limit = 10;

  // Get current user (only once on mount)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth error:", error.message);
        return;
      }
      setUserId(user?.id || null);
    };
    getUser();
  }, [supabase]);

  // Fetch posts with profile join (cursor pagination)
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const query = supabase
      .from('posts')
      .select('*, profiles(*)')
      .eq('is_preview', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (lastCreatedAt) {
      query.lt('created_at', lastCreatedAt); // cursor
    }

    const { data: newPosts, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Failed to load shorts",
        description: "Something went wrong while fetching posts.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!newPosts || newPosts.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    setPosts(prev => [...prev, ...newPosts]);
    setLastCreatedAt(newPosts[newPosts.length - 1].created_at);
    if (newPosts.length < limit) setHasMore(false);

    setLoading(false);
  }, [supabase, lastCreatedAt, hasMore, loading]);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, []);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPosts();
        }
      },
      { threshold: 1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [fetchPosts, hasMore]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div className="w-full h-screen overflow-y-scroll snap-y snap-mandatory bg-black text-white">
      {posts.length === 0 && !loading && (
        <div className="flex flex-col justify-center items-center h-full">
          <p className="text-lg text-gray-300">No shorts available yet 📭</p>
        </div>
      )}

      {posts.map(post => {
        const creator = post.profiles;
        const filePath = post.file_url?.startsWith('http')
          ? post.file_url
          : `${supabaseUrl}/storage/v1/object/public/content/${post.file_url}`;

        return (
          <div
            key={post.id}
            className="relative h-screen w-full snap-start bg-black text-white"
          >
            <video
              className="object-cover w-full h-full"
              src={filePath}
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              preload="metadata"
              aria-label={post.title || "Short video"}
              onError={() => console.warn(`Video failed to load: ${filePath}`)}
            />

            {/* Post Info */}
            <div className="absolute bottom-20 left-4 z-10 space-y-2">
              <h2 className="text-xl font-bold">{post.title}</h2>
              {creator && (
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={creator.avatar_url || ''} />
                    <AvatarFallback>{creator.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">@{creator.username}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-4">
              <LikeButton postId={post.id} />
              <AppleGiftButton
                postId={post.id}
                creatorId={post.creator_id}
                creatorUsername={creator?.username || "Creator"}
                currentUserId={userId || undefined}
                variant="shorts"
              />
              <ShareButton url={`/post/${post.id}`} variant="shorts" />
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="flex justify-center items-center py-8 text-white">
          <Loader className="animate-spin w-6 h-6" />
        </div>
      )}

      {/* Trigger element for infinite scroll */}
      <div ref={observerRef} className="h-1" />
    </div>
  );
}
