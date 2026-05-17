"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Search, Hash, TrendingUp, Settings, 
  Heart, MessageSquare, Repeat2, Plus, X, MapPin, Link as LinkIcon, Camera, Loader2, File, Map,
  ArrowBigUp, ArrowBigDown, Users, Rocket, User, Share2,
  Globe, Lock, Shield, Zap, Menu
} from 'lucide-react';
import { usePosts } from '@/lib/hooks/usePosts';
import { useUserProfile, useCurrentUserProfile } from '@/lib/hooks/useUserProfile';
import { createPost, votePost, submitFeedback } from '@/lib/actions/posts';
import { signOut } from '@/app/auth/login/actions';

// --- CONSTANTS ---
const STREAMS = [
  { id: 'all', label: 'Global' },
  { id: 'saas', label: 'SaaS' },
];

export default function FoundersCultApp() {
  // Supabase Live Data Hook
  const { posts, loading } = usePosts();

  const { 
    profile: currentUserProfile, 
    userId: currentUserId, 
    authUser,
    loading: userLoading, 
    refetch: refetchCurrentUser 
  } = useCurrentUserProfile();

  const getDisplayName = () => {
    if (currentUserProfile?.full_name && currentUserProfile.full_name !== 'Founder') return currentUserProfile.full_name;
    if (authUser?.user_metadata?.full_name) return authUser.user_metadata.full_name;
    if (authUser?.email) return authUser.email.split('@')[0];
    return "Founder";
  };

  const getDisplayUsername = () => {
    if (currentUserProfile?.username && currentUserProfile.username !== 'founder') return currentUserProfile.username;
    if (authUser?.email) return authUser.email.split('@')[0];
    return "founder";
  };

  const [activeStream, setActiveStream] = useState('all');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'none' | 'post' | 'profile' | 'circuit'>('none');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [feedbackPrompt, setFeedbackPrompt] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    startup_name: '',
    bio: '',
    website: '',
    location: ''
  });
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Compose State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeContent, setComposeContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle setting edit form
  useEffect(() => {
    if (currentUserProfile) {
      setEditForm({
        full_name: currentUserProfile.full_name || '',
        username: currentUserProfile.username || '',
        startup_name: currentUserProfile.startup_name || '',
        bio: currentUserProfile.bio || '',
        website: currentUserProfile.website || '',
        location: currentUserProfile.location || ''
      });
    }
  }, [currentUserProfile]);

  const openPost = (id: string, isDownvote: boolean = false) => {
    setSelectedPostId(id);
    setActivePanel('post');
    if (isDownvote) {
      setFeedbackPrompt("Please provide some feedback on why you're downvoting:");
      setTimeout(() => {
        replyInputRef.current?.focus();
      }, 500);
    } else {
      setFeedbackPrompt(null);
    }
  };

  const handleVote = async (postId: string, type: 'up' | 'down') => {
    // Optimistic UI update
    setUserVotes(prev => {
      const current = prev[postId];
      const next = { ...prev };
      if (current === type) {
        next[postId] = null;
      } else {
        next[postId] = type;
        if (type === 'down') {
          openPost(postId, true);
        }
      }
      return next;
    });

    // Server update
    await votePost(postId, type);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedPostId || !feedbackText.trim()) return;
    setIsFeedbackSubmitting(true);
    
    const res = await submitFeedback(selectedPostId, feedbackText);
    
    if (res.success) {
      setFeedbackText('');
      setFeedbackPrompt(null);
      // Maybe close panel or show success
      closePanel();
    }
    setIsFeedbackSubmitting(false);
  };

  const openProfile = (id: string | null) => {
    setSelectedProfileId(id);
    setActivePanel('profile');
    setSelectedPostId(null);
  };

  const closePanel = () => {
    setActivePanel('none');
    setTimeout(() => {
      setSelectedPostId(null);
      setSelectedProfileId(null);
    }, 300);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    try {
      // Need a direct import or custom update logic
      // For now, using supabase directly
      const { supabase } = await import('@/lib/supabase/client');
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUserId,
          full_name: editForm.full_name,
          username: editForm.username,
          startup_name: editForm.startup_name,
          bio: editForm.bio,
          website: editForm.website,
          location: editForm.location,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setIsEditModalOpen(false);
      refetchCurrentUser();
      if (selectedProfileId === currentUserId) {
        refetchTargetProfile();
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async (file: File) => {
    const { supabase } = await import('@/lib/supabase/client');
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `post-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmitPost = async () => {
    if (!composeContent.trim() && !selectedFile) return;
    setIsSubmitting(true);
    
    try {
      let imageUrls: string[] = [];
      if (selectedFile) {
        const url = await uploadImage(selectedFile);
        imageUrls.push(url);
      }

      const result = await createPost(composeContent, activeStream, imageUrls);
      
      if (result?.error) {
        alert(result.error);
        setIsSubmitting(false);
        return;
      }
      
      setComposeContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsSubmitting(false);
      setIsComposeOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const filteredPosts = posts.filter(post => {
    const slugMatch = post.stream_slug === activeStream;
    const tagMatch = post.tags && post.tags.includes(activeStream);
    const contentMatch = (activeStream === 'ai-ml' && post.content.toLowerCase().includes('ai')) || 
                        (activeStream === 'finance' && post.content.toLowerCase().includes('finance'));
    
    const matchesStream = activeStream === 'all' || slugMatch || tagMatch || contentMatch;
    const matchesRegion = !activeRegion || post.author?.location === activeRegion;
    return matchesStream && matchesRegion;
  });

  const activePost = posts.find(p => p.id === selectedPostId);
  const targetId = selectedProfileId || (activePanel === 'profile' ? currentUserId : null);
  const { profile: targetProfile, loading: profileLoading, refetch: refetchTargetProfile } = useUserProfile(targetId);
  const { posts: profilePosts, loading: profilePostsLoading } = usePosts(targetId);

  const activeProfile = targetProfile ? {
    id: targetId,
    name: targetProfile.full_name || 'Unknown Founder',
    handle: `@${targetProfile.username || 'founder'}`,
    avatar: targetProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetProfile.full_name || 'F')}&background=050505&color=fff`,
    coverImage: targetProfile.cover_url || 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&q=80&w=1000',
    bio: targetProfile.startup_name ? `Building ${targetProfile.startup_name}` : (targetProfile.bio || 'Building something awesome.'),
    location: targetProfile.location || 'Internet',
    website: targetProfile.website || 'startup.com',
    followers: targetProfile.followers_count || 0,
    following: targetProfile.following_count || 0,
    traction_points: targetProfile.traction_points || 0
  } : (targetId === currentUserId && authUser) ? {
    id: currentUserId,
    name: getDisplayName(),
    handle: `@${getDisplayUsername()}`,
    avatar: authUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=050505&color=fff`,
    coverImage: 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&q=80&w=1000',
    bio: 'Building something awesome.',
    location: 'Internet',
    website: '',
    followers: 0,
    following: 0,
    traction_points: 0
  } : null;

  const cinematicTransition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <Loader2 className="animate-spin text-[var(--text-primary)]" size={32} />
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-500 bg-[var(--bg-base)] text-[var(--text-primary)] relative`}>
      <div className="absolute inset-0 bg-noise z-0 opacity-[0.03] pointer-events-none"></div>

      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-[var(--border-color)] z-[60] flex items-center justify-between px-6">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 text-[var(--text-primary)]"
        >
          <Menu size={24} />
        </button>
        <div className="text-lg tracking-tight">
          <span className="font-[family-name:var(--font-serif)] italic font-light">Founders</span>
          <span className="font-sans font-black uppercase tracking-[0.1em] text-[0.7em] ml-1">Cult</span>
        </div>
        <button 
          onClick={() => setActivePanel('profile')}
          className="w-10 h-10 rounded-full overflow-hidden border border-[var(--border-color)]"
        >
          {currentUserProfile?.avatar_url || authUser?.user_metadata?.avatar_url ? (
            <img src={currentUserProfile?.avatar_url || authUser?.user_metadata?.avatar_url} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full bg-[var(--bg-elevated-1)] flex items-center justify-center">
              <span className="text-xs font-medium text-[var(--text-primary)]">
                {getDisplayName().charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* ================= SIDEBAR (DESKTOP & MOBILE OVERLAY) ================= */}
      <AnimatePresence>
        {(isSidebarOpen || (mounted && window.innerWidth >= 768)) && (
          <motion.aside 
            initial={mounted && window.innerWidth < 768 ? { x: '-100%' } : false}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={cinematicTransition}
            className={`fixed md:relative inset-y-0 left-0 w-72 flex-shrink-0 flex flex-col bg-[var(--bg-base)] border-r border-[var(--border-color)] z-[100] md:z-10`}
          >
            {/* Close button for mobile */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden absolute top-6 right-6 p-2 text-[var(--text-muted)]"
            >
              <X size={24} />
            </button>
        <div className="p-8 pb-4 flex flex-col items-center">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative mb-6 cursor-pointer group"
            onClick={() => openProfile(currentUserId)}
          >
            <div className="w-24 h-24 rounded-full p-[1.5px] bg-gradient-to-tr from-[var(--border-color)] via-[var(--text-primary)] to-[var(--border-color)] shadow-2xl transition-all duration-500 group-hover:p-[2px]">
              <div className="w-full h-full rounded-full bg-[var(--bg-base)] overflow-hidden flex items-center justify-center border border-[var(--border-color)]">
                {currentUserProfile?.avatar_url || authUser?.user_metadata?.avatar_url ? (
                  <img src={currentUserProfile?.avatar_url || authUser?.user_metadata?.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-3xl font-[family-name:var(--font-serif)] italic text-[var(--text-primary)]">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-[var(--text-primary)] border-2 border-[var(--bg-base)] rounded-full"></div>
          </motion.div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight mb-1">{getDisplayName()}</h2>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-black">Alpha Member</span>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">@{getDisplayUsername()}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1">
          {[
            { id: 'all', label: 'Global Feed', icon: Globe, emoji: '🌍' },
            { id: 'messages', label: 'Encrypted DM', icon: Lock, badge: 2, emoji: '🔒' },
            { id: 'forums', label: 'Strategy Lab', icon: Zap, emoji: '⚡' },
            { id: 'friends', label: 'Builders Guild', icon: Shield, badge: 3, emoji: '🛡️' },
          ].map((item) => {
            const isActive = activeStream === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveStream(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-500 relative group
                  ${isActive 
                    ? 'bg-[var(--bg-elevated-1)] text-[var(--text-primary)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated-1)]'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-5 bg-[var(--text-primary)] rounded-r-full"
                  />
                )}
                <item.icon size={18} className={isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors'} />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                  <span className="text-[10px] grayscale group-hover:grayscale-0 transition-all">{item.emoji}</span>
                </div>
                {item.badge && (
                  <span className="ml-auto text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg-base)]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[var(--border-color)] space-y-4">
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-[var(--text-muted)] hover:text-red-500"
          >
            <Lock size={18} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Terminate Session</span>
          </button>
        </div>
      </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      {/* ================= MAIN FEED ================= */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-base)] relative overflow-y-auto hide-scrollbar pt-20 md:pt-0">
        <header className="sticky top-0 md:top-0 z-40 bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-[var(--border-color)] px-6 md:px-8 py-8 md:py-10 flex flex-col gap-6 md:gap-8 transition-all">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
              {activeRegion ? `${activeRegion}` : (
                <div className="hidden md:block">
                  <span className="font-[family-name:var(--font-serif)] italic font-light">Founders</span>
                  <span className="font-sans font-black uppercase tracking-[0.1em] text-[0.8em] ml-2">Cult</span>
                </div>
              )}
              <span className="md:hidden">{activeRegion || 'Global'}</span>
            </h1>
            
            <button 
              onClick={() => setActivePanel('circuit')}
              className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-[var(--bg-elevated-1)] border border-[var(--border-color)] hover:border-[var(--text-primary)] transition-all group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Circuit</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {STREAMS.map((stream) => {
              const isActive = activeStream === stream.id;
              return (
                <button
                  key={stream.id}
                  onClick={() => setActiveStream(stream.id)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border
                    ${isActive 
                      ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-transparent' 
                      : 'bg-[var(--bg-elevated-1)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]'}`}
                >
                  {stream.label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8 md:space-y-12 max-w-4xl mx-auto w-full pb-32">
          {filteredPosts.map((post, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ ...cinematicTransition, delay: idx * 0.05 }}
              key={post.id}
              onClick={() => openPost(post.id)}
              className="group bg-[var(--bg-elevated-1)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden cursor-pointer hover:border-[var(--text-primary)]/30 transition-all duration-700 shadow-sm"
            >
              {post.media_urls?.[0] && (
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={post.media_urls[0]} 
                    className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105" 
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-elevated-1)] via-transparent to-transparent opacity-60"></div>
                </div>
              )}
              
              <div className="p-5 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={post.author?.avatar} 
                      className="w-12 h-12 rounded-2xl grayscale object-cover border border-[var(--border-color)]" 
                      alt="" 
                    />
                    <div>
                      <h3 className="font-bold text-sm tracking-tight">{post.author?.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">@{post.author?.username}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    {formatTime(post.created_at)}
                  </span>
                </div>

                <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-8 font-light whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border-color)]">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleVote(post.id, 'up'); }}
                        className={`p-2 rounded-lg transition-all ${userVotes[post.id] === 'up' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                      >
                        <ArrowBigUp size={20} fill={userVotes[post.id] === 'up' ? 'currentColor' : 'none'} />
                      </button>
                      <span className="font-bold text-xs">{(post.likes_count || 0) + (userVotes[post.id] === 'up' ? 1 : userVotes[post.id] === 'down' ? -1 : 0)}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleVote(post.id, 'down'); }}
                        className={`p-2 rounded-lg transition-all ${userVotes[post.id] === 'down' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                      >
                        <ArrowBigDown size={20} fill={userVotes[post.id] === 'down' ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      <MessageSquare size={14} /> {post.comments_count} Signals
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3 grayscale opacity-50">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-[var(--bg-elevated-1)] bg-[var(--bg-elevated-2)] flex items-center justify-center text-[8px] font-bold">
                          {i}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Compose Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsComposeOpen(true)}
          className="md:hidden fixed bottom-8 right-6 w-16 h-16 rounded-full bg-[var(--text-primary)] text-[var(--bg-base)] flex items-center justify-center shadow-2xl z-40"
        >
          <Plus size={28} />
        </motion.button>
      </main>

      {/* ================= NEXUS PANEL ================= */}
      <AnimatePresence>
        {activePanel !== 'none' && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={cinematicTransition}
            className="fixed inset-0 md:left-auto md:right-0 md:w-[400px] xl:w-[450px] h-full bg-[var(--bg-base)] border-l border-[var(--border-color)] z-[110] flex flex-col"
          >
            <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-base)]/80 backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-1">Nexus Node</span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  {activePanel === 'circuit' ? 'Circuit Map' : activePanel === 'post' ? 'Intelligence' : 'Profile'}
                </span>
              </div>
              <button 
                onClick={closePanel} 
                className="p-2 hover:bg-[var(--bg-elevated-1)] rounded-full transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12 hide-scrollbar">
              {activePanel === 'circuit' && (
                <div className="space-y-12">
                  <div className="p-8 rounded-[2rem] border border-[var(--text-primary)]/10 bg-[var(--bg-elevated-1)] relative overflow-hidden group">
                    <Rocket size={40} className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity" />
                    <h3 className="text-xl font-bold mb-2 tracking-tight">Active Chapters</h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Regional Builder Networks</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Bangalore', members: 420, active: true },
                      { name: 'Hyderabad', members: 180, active: false, comingSoon: true },
                      { name: 'Mumbai', members: 310, active: false, comingSoon: true },
                      { name: 'Chennai', members: 215, active: false, comingSoon: true },
                    ].map((chapter) => (
                      <div
                        key={chapter.name}
                        onClick={() => !chapter.comingSoon && setActiveRegion(activeRegion === chapter.name ? null : chapter.name)}
                        className={`w-full p-6 rounded-3xl border text-left transition-all group relative overflow-hidden
                          ${activeRegion === chapter.name 
                            ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-transparent' 
                            : 'bg-[var(--bg-elevated-1)] border-[var(--border-color)] hover:border-[var(--text-primary)]'}
                          ${chapter.comingSoon ? 'opacity-40 grayscale blur-[1px] cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {chapter.comingSoon && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 backdrop-blur-[2px]">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)] bg-[var(--bg-base)] px-4 py-1.5 rounded-full border border-[var(--border-color)] shadow-2xl">
                              Coming Soon
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${chapter.active ? 'bg-current animate-pulse' : 'bg-[var(--text-muted)]'}`}></div>
                            <h4 className="text-lg font-bold tracking-tight">{chapter.name}</h4>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-current opacity-60`}>
                            {chapter.members} Members
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-1 h-auto bg-current opacity-20 rounded-full"></div>
                          <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-medium opacity-70 uppercase tracking-wider">
                              {chapter.comingSoon ? 'Expanding the collective' : 'Strategic Network Sync Scheduled'}
                            </p>
                            {chapter.name === 'Bangalore' && activeRegion === 'Bangalore' && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 pt-4 border-t border-current/10 space-y-3"
                              >
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Next Ritual</span>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <MapPin size={10} />
                                    <span className="text-[11px] font-bold">Cubbon Park</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <LinkIcon size={10} />
                                    <span className="text-[11px] font-bold">Third Wave Coffee</span>
                                  </div>
                                </div>
                                <button className="w-full mt-2 py-2 rounded-xl bg-[var(--bg-base)] text-[var(--text-primary)] text-[9px] font-black uppercase tracking-widest border border-[var(--border-color)] hover:border-[var(--text-primary)] transition-all">
                                  Request Invite
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'post' && activePost && (
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <img 
                      src={activePost.author?.avatar} 
                      className="w-14 h-14 rounded-2xl grayscale object-cover border border-[var(--border-color)]" 
                      alt="" 
                    />
                    <div>
                      <h4 className="font-bold text-base">{activePost.author?.name}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">@{activePost.author?.username}</p>
                    </div>
                  </div>
                  
                  <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-light whitespace-pre-wrap">
                    {activePost.content}
                  </p>

                  <div className="flex items-center gap-8 py-6 border-y border-[var(--border-color)]">
                    <div className="flex items-center gap-4">
                       <ArrowBigUp size={24} className="text-[var(--text-primary)]" />
                       <span className="font-bold text-lg">{activePost.likes_count}</span>
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleVote(activePost.id, 'up'); }}
                       >
                         <ArrowBigUp size={24} className={userVotes[activePost.id] === 'up' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'} />
                       </button>
                       <span className="font-bold text-lg">{(activePost.likes_count || 0) + (userVotes[activePost.id] === 'up' ? 1 : userVotes[activePost.id] === 'down' ? -1 : 0)}</span>
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleVote(activePost.id, 'down'); }}
                       >
                         <ArrowBigDown size={24} className={userVotes[activePost.id] === 'down' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'} />
                       </button>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      {activePost.comments_count} Signals Detected
                    </div>
                  </div>

                  <div className="p-6 bg-[var(--bg-elevated-1)] rounded-[2rem] border border-[var(--border-color)]">
                    <textarea 
                      ref={replyInputRef}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder={feedbackPrompt || "Broadcast your signal..."} 
                      className="w-full bg-transparent resize-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium"
                      rows={3}
                    ></textarea>
                    <div className="flex justify-end mt-4">
                      <button 
                        disabled={isFeedbackSubmitting}
                        onClick={handleSubmitFeedback}
                        className="px-6 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-base)] text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all disabled:opacity-50"
                      >
                        {isFeedbackSubmitting ? 'Syncing...' : feedbackPrompt ? 'Submit Feedback' : 'Broadcast'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'profile' && activeProfile && (
                <div className="space-y-10 pb-20">
                  <div className="relative h-48 rounded-[2.5rem] overflow-hidden border border-[var(--border-color)]">
                    <img src={activeProfile.coverImage} className="w-full h-full object-cover grayscale opacity-40" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] to-transparent"></div>
                    <div className="absolute -bottom-8 left-8">
                       <img src={activeProfile.avatar} className="w-24 h-24 rounded-[2rem] border-4 border-[var(--bg-base)] shadow-2xl grayscale object-cover" alt="" />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">{activeProfile.name}</h2>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{activeProfile.handle}</p>
                      </div>
                      {activeProfile.id === currentUserId ? (
                        <button 
                          onClick={() => setIsEditModalOpen(true)}
                          className="p-3 bg-[var(--bg-elevated-1)] border border-[var(--border-color)] rounded-2xl hover:text-[var(--text-primary)] transition-all"
                        >
                          <Settings size={18} />
                        </button>
                      ) : (
                        <button className="bg-[var(--text-primary)] text-[var(--bg-base)] px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all">
                          Connect
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-light mb-8 italic">
                      "{activeProfile.bio}"
                    </p>

                    <div className="grid grid-cols-1 bg-[var(--border-color)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
                      {[
                        { label: 'Traction', value: activeProfile.traction_points },
                      ].map(stat => (
                        <div key={stat.label} className="bg-[var(--bg-base)] p-4 flex flex-col items-center">
                          <span className="text-xl font-bold">{stat.value}</span>
                          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-6 border-b border-[var(--border-color)]">
                      <button className="pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 border-[var(--text-primary)]">Transmissions</button>
                      <button className="pb-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Signals</button>
                    </div>
                    
                    <div className="space-y-3">
                      {profilePosts.map(post => (
                        <div key={post.id} className="p-5 bg-[var(--bg-elevated-1)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--text-primary)]/20 transition-all">
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">{post.content}</p>
                          <div className="flex gap-4 text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            <span>{post.likes_count} Signals</span>
                            <span>{post.comments_count} Intelligent Signals</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= EVENT MODAL ================= */}
      <AnimatePresence>
        {activeRegion === 'Bangalore' && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setActiveRegion(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg max-h-[90vh] bg-[var(--bg-elevated-1)] rounded-[3rem] border border-[var(--border-color)] overflow-y-auto shadow-2xl hide-scrollbar"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=1000" 
                  className="w-full h-full object-cover grayscale opacity-50" 
                  alt="Bangalore Event" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-elevated-1)] to-transparent"></div>
                <button 
                  onClick={() => setActiveRegion(null)}
                  className="absolute top-6 right-6 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">Upcoming Ritual</span>
                  <h2 className="text-4xl font-bold tracking-tighter font-[family-name:var(--font-serif)] italic">The Bangalore Sync</h2>
                </div>

                <div className="space-y-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">Upcoming Events</span>
                  
                  <div className="grid grid-cols-1 gap-12">
                    {/* Event 1 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)]">
                          <MapPin size={18} />
                        </div>
                        <p className="text-xl font-light text-[var(--text-secondary)]">Cubbon Park, Bangalore</p>
                      </div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl overflow-hidden border border-[var(--border-color)] grayscale shadow-lg"
                      >
                        <img 
                          src="/events/cubbon_park.png" 
                          className="w-full h-56 object-cover hover:scale-105 transition-transform duration-700" 
                          alt="Cubbon Park" 
                        />
                      </motion.div>
                    </div>

                    {/* Event 2 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)]">
                          <LinkIcon size={18} />
                        </div>
                        <p className="text-xl font-light text-[var(--text-secondary)]">Third Wave Coffee</p>
                      </div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl overflow-hidden border border-[var(--border-color)] grayscale shadow-lg"
                      >
                        <img 
                          src="/events/third_wave.png" 
                          className="w-full h-56 object-cover hover:scale-105 transition-transform duration-700" 
                          alt="Third Wave Coffee" 
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex flex-col gap-4">
                  <a 
                    href="https://chat.whatsapp.com/FrGV76OPyerGMw5MtOVQaB?mode=gi_t"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-base)] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:opacity-80 transition-all text-center"
                  >
                    Join the Ritual
                  </a>
                  <p className="text-[10px] text-center font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    Invitation only • 12 Slots remaining
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODALS & FAB ================= */}
      <button 
        onClick={() => setIsComposeOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[var(--text-primary)] text-[var(--bg-base)] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 group"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {isComposeOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-base)]/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-elevated-1)] w-full max-w-lg rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">New Transmission</h3>
              <button onClick={() => setIsComposeOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={20} /></button>
            </div>
            
            <div className="p-8">
              <textarea
                autoFocus
                placeholder="What are you building?"
                value={composeContent}
                onChange={(e) => setComposeContent(e.target.value)}
                className="w-full h-40 bg-transparent text-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none outline-none font-light"
              />
              
              {previewUrl && (
                <div className="relative mt-4 rounded-2xl overflow-hidden border border-[var(--border-color)]">
                  <img src={previewUrl} alt="" className="w-full h-auto object-cover max-h-64" />
                  <button 
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 bg-[var(--bg-base)]/80 text-[var(--text-primary)] p-1.5 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-base)]/30">
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[var(--text-muted)] p-3 hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] rounded-full transition-all"
                >
                  <Camera size={20} />
                </button>
              </div>
              <button 
                onClick={handleSubmitPost}
                disabled={(!composeContent.trim() && !selectedFile) || isSubmitting}
                className="bg-[var(--text-primary)] text-[var(--bg-base)] font-black text-[10px] uppercase tracking-widest py-3 px-10 rounded-full transition-all disabled:opacity-20 flex items-center gap-2 shadow-lg"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Transmit
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-base)]/90 backdrop-blur-xl flex items-center justify-center z-[110] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-elevated-1)] w-full max-w-md rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Sync Node Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-[var(--bg-elevated-2)] rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
              {[
                { label: 'Full Name', key: 'full_name' },
                { label: 'Username', key: 'username' },
                { label: 'Startup Name', key: 'startup_name' },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{field.label}</label>
                  <input 
                    type="text" 
                    value={(editForm as any)[field.key]}
                    onChange={e => setEditForm({...editForm, [field.key]: e.target.value})}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl py-4 px-5 text-sm outline-none focus:border-[var(--text-primary)] transition-all"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Bio</label>
                <textarea 
                  value={editForm.bio}
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl py-4 px-5 text-sm outline-none focus:border-[var(--text-primary)] transition-all h-24 resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-[var(--text-primary)] text-[var(--bg-base)] py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:opacity-80 transition-all"
                >
                  Sync Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-base)]/80 backdrop-blur-2xl border-t border-[var(--border-color)] z-50 flex items-center justify-around px-4 pb-4">
        {[
          { id: 'all', label: 'Feed', icon: Hash },
          { id: 'messages', label: 'DMs', icon: MessageSquare },
          { id: 'profile', label: 'You', icon: User },
        ].map((item) => {
          const isActive = (item.id === 'profile' && activePanel === 'profile') || (item.id !== 'profile' && activeStream === item.id && activePanel === 'none');
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'profile') openProfile(currentUserId);
                else { setActiveStream(item.id); setActivePanel('none'); }
              }}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
            >
              <item.icon size={20} />
              <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
              {isActive && <motion.div layoutId="mobile-dot" className="w-1 h-1 rounded-full bg-current mt-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
