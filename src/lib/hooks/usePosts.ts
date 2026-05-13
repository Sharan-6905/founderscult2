import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export type Post = {
  id: string;
  author_id: string;
  stream_id: string | null;
  content: string;
  media_urls: string[] | null;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: {
    name: string;
    username: string;
    avatar: string;
    startup: string | null;
    traction_points: number;
  };
};

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        console.log('New post received!', payload.new);
        // In a real app, we would fetch the author details for this new post, 
        // but for now we'll just refetch or optimistically prepend if we have the data.
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      // Fetch posts with their author profiles
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url,
            startup_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', JSON.stringify(error, null, 2));
        return;
      }

      if (data) {
        // Map the database schema to our frontend Post type
        const formattedPosts = data.map((post: any) => ({
          id: post.id,
          author_id: post.author_id,
          stream_id: post.stream_id,
          content: post.content,
          media_urls: post.media_urls,
          tags: post.tags,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          created_at: post.created_at,
          author: post.profiles ? (Array.isArray(post.profiles) ? {
            name: post.profiles[0]?.full_name,
            username: post.profiles[0]?.username,
            avatar: post.profiles[0]?.avatar_url || `https://i.pravatar.cc/150?u=${post.author_id}`,
            startup: post.profiles[0]?.startup_name,
            traction_points: post.profiles[0]?.traction_points || 0,
          } : {
            name: post.profiles.full_name,
            username: post.profiles.username,
            avatar: post.profiles.avatar_url || `https://i.pravatar.cc/150?u=${post.author_id}`,
            startup: post.profiles.startup_name,
            traction_points: post.profiles.traction_points || 0,
          }) : {
            name: 'Unknown User',
            username: 'unknown',
            avatar: 'https://i.pravatar.cc/150',
            startup: null,
            traction_points: 0,
          }
        }));
        
        setPosts(formattedPosts);
      }
    } catch (err) {
      console.error('Unexpected error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }

  return { posts, loading, refetch: fetchPosts };
}
