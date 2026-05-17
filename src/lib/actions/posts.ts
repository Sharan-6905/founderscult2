'use server'

import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// We use the service role key to allow "Guest" posts for the demo
// without requiring authentication / login.
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// A hardcoded dummy ID for the demo "Founder" user
// In a real app, this would be a real user ID.
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function createGuestPost(content: string) {
  if (!content.trim()) return { error: 'Content is empty' };

  try {
    // 1. Ensure a demo profile exists
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: DEMO_USER_ID,
      username: 'guest_founder',
      full_name: 'Guest Founder',
      avatar_url: 'https://i.pravatar.cc/150?u=guest',
      startup_name: 'Stealth Startup'
    });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      return { error: `Profile setup failed: ${profileError.message}` };
    }

    // 2. Insert the post
    const { data, error } = await supabaseAdmin.from('posts').insert({
      content: content.trim(),
      author_id: DEMO_USER_ID,
    }).select().single();

    if (error) {
      console.error('Guest post error:', error);
      return { error: error.message };
    }

    revalidatePath('/');
    return { data };
  } catch (err: any) {
    console.error('Unexpected post error:', err);
    return { error: err.message || 'An unexpected error occurred' };
  }
}

export async function createPost(content: string, slug: string = 'all', media_urls: string[] = []) {
  if (!content.trim()) return { error: 'Content is empty' };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be logged in to post.' };
    }

    let stream_id: string | null = null;
    if (slug !== 'all') {
      const { data: streamData } = await supabase
        .from('streams')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (streamData) {
        stream_id = streamData.id;
      }
    }

    const { data, error } = await supabase.from('posts').insert({
      content: content.trim(),
      author_id: user.id,
      stream_id: stream_id,
      tags: slug !== 'all' ? [slug] : [],
      media_urls: media_urls
    }).select().single();

    if (error) {
      console.error('Post error:', error);
      return { error: `Failed to create post: ${error.message}` };
    }

    revalidatePath('/feed');
    return { data };
  } catch (err: any) {
    console.error('Unexpected post error:', err);
    return { error: err.message || 'An unexpected error occurred' };
  }
}

export async function votePost(postId: string, type: 'up' | 'down') {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Auth required' };

    // Update the post count
    const { data: post } = await supabase.from('posts').select('likes_count').eq('id', postId).single();
    if (!post) return { error: 'Post not found' };

    const newCount = type === 'up' ? (post.likes_count || 0) + 1 : (post.likes_count || 0) - 1;

    await supabase.from('posts').update({ likes_count: newCount }).eq('id', postId);
    
    // We could also store individual votes in a votes table to prevent double voting
    // For now we keep it simple as requested
    
    revalidatePath('/feed');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function submitFeedback(postId: string, suggestion: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Auth required' };

    const { error } = await supabase.from('post_feedback').insert({
      post_id: postId,
      user_id: user.id,
      suggestion: suggestion.trim()
    });

    if (error) throw error;

    revalidatePath('/feed');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
