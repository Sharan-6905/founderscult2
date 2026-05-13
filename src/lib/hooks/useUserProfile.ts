import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export type UserProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  startup_name: string | null;
  startup_desc: string | null;
  traction_points: number;
  followers_count: number;
  following_count: number;
  created_at: string;
};

export function useUserProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }

    fetchProfile();
  }, [userId]);

  async function fetchProfile() {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Fetch counts (followers/following)
      const [followersRes, followingRes] = await Promise.all([
        supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', userId)
      ]);

      if (profileData) {
        setProfile({
          ...profileData,
          followers_count: followersRes.count || 0,
          following_count: followingRes.count || 0,
          traction_points: profileData.traction_points || 0
        });
      } else {
        setProfile(null);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { profile, loading, error, refetch: fetchProfile };
}

export function useCurrentUserProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const { profile, loading, error, refetch } = useUserProfile(userId);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Auto-create profile if missing
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
          
        if (!existingProfile) {
          const defaultUsername = (user.email?.split('@')[0] || 'user') + '_' + Math.random().toString(36).substring(2, 6);
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: defaultUsername,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Founder',
              avatar_url: user.user_metadata?.avatar_url || null,
              bio: 'Building something new.',
              traction_points: 0
            });
            
          if (!createError) {
            refetch();
          }
        }
      }
      setIsInitializing(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { 
    profile, 
    loading: loading || isInitializing, 
    error, 
    userId,
    refetch 
  };
}
