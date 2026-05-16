"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { supabase } from '@/lib/supabase/client';
import { 
  Bell, Sun, Moon, Search, Hash, TrendingUp, Settings, 
  Heart, MessageSquare, Repeat2, Plus, X, MapPin, Link as LinkIcon, Camera, Loader2, File, Map,
  ArrowBigUp, ArrowBigDown, Users, Rocket, User
} from 'lucide-react';
import { usePosts } from '@/lib/hooks/usePosts';
import { useUserProfile, useCurrentUserProfile } from '@/lib/hooks/useUserProfile';
import { createPost } from '@/lib/actions/posts';

// --- CONSTANTS ---
const STREAMS = [
  { id: 'all', label: 'Global' },
  { id: 'ai-ml', label: 'AI/ML' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'saas', label: 'SaaS' },
  { id: 'finance', label: 'Finance' },
  { id: 'dev-tools', label: 'DevTools' },
  { id: 'fundraising', label: 'Fundraising' },
  { id: 'design', label: 'Design' },
  { id: 'side-projects', label: 'Indie' },
  { id: 'hiring', label: 'Hiring' },
  { id: 'ship-it', label: 'Showcase' },
  { id: 'open-source', label: 'OpenSource' },
];

const TRENDING = [
  { tag: 'ai-ml', count: '1.2k posts' },
  { tag: 'indie-hackers', count: '850 posts' },
  { tag: 'design-systems', count: '430 posts' },
  { tag: 'YC-S26', count: '310 posts' }
];

// --- COMPONENTS ---

export default function FoundersCultApp() {
  // Supabase Live Data Hook
  const { posts, loading } = usePosts();

  const { 
    profile: currentUserProfile, 
    userId: currentUserId, 
    loading: userLoading, 
    refetch: refetchCurrentUser 
  } = useCurrentUserProfile();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeStream, setActiveStream] = useState('all');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'none' | 'post' | 'profile' | 'circuit'>('none');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
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
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Compose State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeContent, setComposeContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup theme & User
  // Setup theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle setting edit form when current user profile is available
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

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

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

  const handleVote = (postId: string, type: 'up' | 'down') => {
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
    }, 300); // wait for animation
  };

  const toggleFollow = (userId: string) => {
    setFollowedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    try {
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
      if (targetId === currentUserId) {
        // Force refetch of target profile if it's the same
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `post-images/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

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

  // Format relative timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filteredPosts = posts.filter(post => {
    // Check slug, tags, and even content for keywords if it's AI or Finance
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
  const myTractionPoints = currentUserProfile?.traction_points || 0;

  const activeProfile = targetProfile ? {
    id: targetId,
    name: targetProfile.full_name || 'Unknown Founder',
    handle: `@${targetProfile.username || 'founder'}`,
    avatar: targetProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetProfile.full_name || 'F')}&background=ffaa00&color=fff`,
    coverImage: targetProfile.cover_url || 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&q=80&w=1000',
    bio: targetProfile.startup_name ? `Building ${targetProfile.startup_name}` : (targetProfile.bio || 'Building something awesome.'),
    location: targetProfile.location || 'Internet',
    website: targetProfile.website || 'startup.com',
    followers: targetProfile.followers_count,
    following: targetProfile.following_count,
    isFollowing: followedUserIds.has(targetId!),
    traction_points: targetProfile.traction_points
  } : null;

  const breakpointColumnsObj = {
    default: 4,
    1536: 3,
    1024: 2,
    640: 1
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden font-[family-name:var(--font-sans)] transition-colors duration-500 ${theme === 'dark' ? 'dark bg-[var(--bg-base)]' : 'bg-[var(--bg-base)]'}`}>
      
      {/* ================= ZONE 1: PREMIUM SIDEBAR ================= */}
      <div className="hidden md:flex w-72 flex-shrink-0 flex-col bg-[var(--bg-base)]/50 backdrop-blur-xl border-r border-[var(--border-color)] z-10 transition-all duration-500 relative">
        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
        
        {/* Profile Header (Futuristic Club Aesthetic) */}
        <div className="pt-12 pb-8 flex flex-col items-center px-6 relative">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative mb-6 cursor-pointer"
            onClick={() => openProfile(currentUserId)}
          >
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-[#7b2ff7] via-[#00e5ff] to-[#bef321] p-0.5 shadow-[0_0_30px_rgba(190,243,33,0.2)] group">
              <div className="w-full h-full rounded-[2.4rem] bg-[var(--bg-base)] overflow-hidden flex items-center justify-center border border-[var(--border-color)]">
                {currentUserProfile?.avatar_url ? (
                  <img src={currentUserProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-3xl font-black bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-muted)] bg-clip-text text-transparent">
                    {(currentUserProfile?.full_name || 'F').charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-[var(--bg-base)] rounded-full shadow-lg"></div>
          </motion.div>
          
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight leading-tight mb-1">{currentUserProfile?.full_name || "Founder"}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bef321]/80">Alpha Member</span>
              <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">@{currentUserProfile?.username || "founder"}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu (Linear-inspired) */}
        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-1">
          {[
            { id: 'all', label: 'Global Feed', icon: Hash },
            { id: 'messages', label: 'Encrypted DM', icon: MessageSquare, badge: 2 },
            { id: 'forums', label: 'Strategy Lab', icon: TrendingUp },
            { id: 'friends', label: 'Builders Guild', icon: Users, badge: 3 },
          ].map((item) => {
            const isActive = activeStream === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                onClick={() => setActiveStream(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group
                  ${isActive 
                    ? 'bg-[var(--bg-elevated-2)] text-[var(--text-primary)] shadow-[0_0_20px_rgba(255,255,255,0.02)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated-1)]'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-gradient-to-b from-[#bef321] to-[#7b2ff7] rounded-r-full"
                  />
                )}
                <item.icon size={20} className={isActive ? 'text-[#bef321]' : 'group-hover:text-[var(--text-primary)] transition-colors'} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto flex h-5 px-1.5 items-center justify-center bg-[#bef321]/10 text-[#bef321] text-[9px] font-black rounded-lg border border-[#bef321]/30 shadow-[0_0_10px_rgba(190,243,33,0.1)]">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
          
          <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={toggleTheme}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated-1)] group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-elevated-1)] group-hover:bg-[var(--bg-elevated-2)] transition-colors border border-[var(--border-color)]">
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-400" />}
              </div>
              <span className="font-bold text-xs tracking-widest uppercase">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ================= ZONE 2: PREMIUM FEED ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-base)] relative overflow-y-auto hide-scrollbar scroll-smooth">
        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
        
        {/* Floating Futuristic Header */}
        <div className="sticky top-0 z-40 bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-[var(--border-color)] pt-8 md:pt-12 pb-6 px-4 md:px-8 flex flex-col gap-6 transition-all">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] tracking-tighter" style={{ fontFamily: "'Fraunces', serif" }}>
              {activeRegion ? `${activeRegion} Node` : 'Founders Cult'}
            </h1>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActivePanel('circuit')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[var(--bg-elevated-1)] border border-[var(--border-color)] hover:border-[#00e5ff]/40 transition-all group"
              >
                <div className="w-2 h-2 rounded-full bg-[#bef321] group-hover:animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">Circuit</span>
              </button>
              
              <div className="md:hidden">
                <button 
                  onClick={() => openProfile(currentUserId)}
                  className="w-10 h-10 rounded-xl bg-[var(--bg-elevated-2)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center text-[var(--text-primary)]"
                >
                  {currentUserProfile?.avatar_url ? (
                    <img src={currentUserProfile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <User size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Domain Navigation Header (Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {STREAMS.map((stream) => {
              const isActive = activeStream === stream.id;
              return (
                  <button
                    key={stream.id}
                    onClick={() => setActiveStream(stream.id)}
                    className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border
                      ${isActive 
                        ? 'bg-neon-gradient text-white border-transparent shadow-[0_0_15px_rgba(190,243,33,0.3)]' 
                        : 'bg-[var(--bg-elevated-1)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-neon-blue/30'}`}
                  >
                    {stream.label}
                  </button>
              );
            })}
          </div>
        </div>


        {/* Cinematic Feed Cards */}
        <div className="px-8 space-y-12 pb-32">
          {activeStream === 'messages' ? (
            <div className="space-y-6">
              {[
                { name: 'Aryan Sharma', msg: 'Hey, saw your post about the multi-cloud migration. Would love to chat about the latency issues you faced.', time: '2m ago' },
                { name: 'Ishani Iyer', msg: 'The Large Action Model research is fascinating! Are you open to a collab on the next phase?', time: '1h ago' },
                { name: 'Rohan Malhotra', msg: 'Just checked out your Fintech API. The settlement speed is impressive. Let\'s talk partnership.', time: '3h ago' },
              ].map((dm, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="bg-[var(--bg-elevated-1)] p-6 rounded-[2rem] border border-[var(--border-color)] flex items-center justify-between hover:border-purple-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neon-gradient/20 flex items-center justify-center text-[#bef321] font-black">
                      {dm.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-[var(--text-primary)] text-sm">{dm.name}</h4>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1">{dm.msg}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">{dm.time}</span>
                </motion.div>
              ))}
            </div>
          ) : activeStream === 'forums' ? (
            <div className="space-y-8">
              <div className="bg-neon-gradient/5 p-8 rounded-[3rem] border border-[#bef321]/20 mb-12">
                <h2 className="text-2xl font-black text-neon-gradient mb-2 tracking-tight">Strategy Lab</h2>
                <p className="text-sm text-[var(--text-secondary)]">High-signal tactics, market deep-dives, and growth playbooks from the top 1%.</p>
              </div>
              
              {[
                { title: 'The 2026 SaaS GTM Playbook', author: 'Vikram Singh', reads: '1.2k', signal: 'High' },
                { title: 'Mastering Multi-Cloud Latency for AI Agents', author: 'Aryan Sharma', reads: '850', signal: 'Critical' },
                { title: 'Decoding the Indian Fintech Regulatory Maze', author: 'Rohan Malhotra', reads: '2.1k', signal: 'Verified' },
              ].map((lab, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="bg-[var(--bg-elevated-1)] p-8 rounded-[2.5rem] border border-[var(--border-color)] hover:border-[#00e5ff]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black bg-[#bef321]/20 text-[#bef321] px-3 py-1 rounded-full border border-[#bef321]/20 uppercase tracking-widest">
                      {lab.signal} Signal
                    </span>
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{lab.reads} Founders Reading</span>
                  </div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-4 group-hover:text-neon-gradient transition-colors">{lab.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] font-bold">Analysis by {lab.author}</span>
                    <button className="text-xs font-black uppercase tracking-[0.2em] text-[#00e5ff] group-hover:underline">Enter Lab</button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredPosts.map((post, idx) => {
            const author = post.author;
            const hasVote = userVotes[post.id];
            
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={post.id}
                onClick={() => openPost(post.id)}
                className="group relative bg-[var(--bg-elevated-1)] rounded-[3rem] border border-[var(--border-color)] overflow-hidden cursor-pointer hover:border-purple-500/30 transition-all duration-700 shadow-2xl"
              >
                {/* Cinematic Media Section */}
                {post.media_urls && post.media_urls[0] && (
                  <div className="relative h-[450px] w-full overflow-hidden">
                    <img 
                      src={post.media_urls[0]} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      alt="Post Media"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-elevated-1)] via-transparent to-transparent"></div>
                    
                    {/* Hover Overlay Intelligence */}
                    <div className="absolute inset-0 bg-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="px-8 py-3 bg-[var(--bg-base)]/80 rounded-full border border-white/20 text-xs font-black uppercase tracking-[0.4em] text-[var(--text-primary)]">
                        Analyze Signal
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-10 relative">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <img 
                        src={post.author?.avatar} 
                        className="w-14 h-14 rounded-2xl ring-1 ring-[var(--border-color)] shadow-xl object-cover" 
                        alt={post.author?.name} 
                      />
                      <div>
                        <h3 className="font-black text-lg text-[var(--text-primary)] tracking-tight leading-tight">{post.author?.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">@{post.author?.username}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-[#bef321] bg-[#bef321]/10 px-3 py-1 rounded-full border border-[#bef321]/20 uppercase tracking-widest">
                        {formatTime(post.created_at)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[17px] text-[var(--text-secondary)] leading-[1.6] mb-10 font-medium whitespace-pre-wrap">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-8 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3 bg-[var(--bg-elevated-2)] p-1 rounded-2xl border border-[var(--border-color)]">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleVote(post.id, 'up'); }}
                          className={`p-2 rounded-xl transition-all ${userVotes[post.id] === 'up' ? 'text-[#bef321] bg-[#bef321]/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated-3)]'}`}
                        >
                          <ArrowBigUp size={24} fill={userVotes[post.id] === 'up' ? 'currentColor' : 'none'} />
                        </button>
                        <span className="font-black text-[var(--text-primary)] text-lg">
                          {(post.likes_count || 0) + (userVotes[post.id] === 'up' ? 1 : userVotes[post.id] === 'down' ? -1 : 0)}
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleVote(post.id, 'down'); }}
                          className={`p-2 rounded-xl transition-all ${userVotes[post.id] === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated-3)]'}`}
                        >
                          <ArrowBigDown size={24} fill={userVotes[post.id] === 'down' ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                        <MessageSquare size={16} /> {post.comments_count} Signals
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-3">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-xl border-2 border-[var(--bg-base)] bg-[var(--bg-elevated-3)] flex items-center justify-center text-[10px] font-black text-[var(--text-primary)]">
                            {String.fromCharCode(64+i)}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tighter ml-2">+12 Others</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

        {/* Floating Action Button */}
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-amber)] to-[var(--accent-gold)] text-white shadow-xl shadow-[var(--accent-amber)]/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 group"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>


      {/* ================= ZONE 3: PREMIUM NEXUS PANEL ================= */}
      <div 
        className={`flex-shrink-0 bg-[var(--bg-base)]/80 backdrop-blur-3xl border-l border-[var(--border-color)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20 overflow-hidden shadow-2xl md:shadow-none relative
          ${activePanel !== 'none' ? 'w-full absolute md:relative md:w-[380px] xl:w-[450px]' : 'w-0 border-transparent'} h-full right-0 top-0 overflow-y-auto hide-scrollbar`}
      >
        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>

        {activePanel !== 'none' && (
          <div className="sticky top-0 z-30 flex items-center justify-between p-8 bg-[var(--bg-base)]/40 backdrop-blur-md border-b border-[var(--border-color)]">
            <div className="flex flex-col">
              <span className="font-black text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] mb-1">Nexus Node</span>
              <span className="font-black text-sm uppercase tracking-widest text-[var(--text-primary)]">
                {activePanel === 'circuit' ? 'Circuit Map' : activePanel === 'post' ? 'Intelligence Thread' : 'Founder Profile'}
              </span>
            </div>
            <motion.button 
              whileHover={{ rotate: 90, scale: 1.1 }}
              onClick={closePanel} 
              className="p-3 hover:bg-[var(--bg-elevated-1)] rounded-2xl transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
            >
              <X size={20} />
            </motion.button>
          </div>
        )}

        <div className="p-8 space-y-12 relative z-10">
          {activePanel === 'circuit' ? (
            <div className="space-y-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0a0510] p-8 rounded-[2.5rem] border border-[#bef321]/30 relative overflow-hidden group shadow-[0_20px_50px_rgba(190,243,33,0.1)]"
              >
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Rocket size={48} className="text-[#00e5ff]" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Active Nodes</h3>
                <p className="text-xs text-[#bef321] font-bold uppercase tracking-widest">Connect with regional founders</p>
              </motion.div>

              {/* Live Circuit Visualization */}
              <div className="relative h-48 bg-[var(--bg-elevated-1)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden p-6 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 400 200" className="opacity-40">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Circuit Lines */}
                  <path d="M 50,100 L 150,100 L 200,50 L 300,50 L 350,100" stroke="var(--text-muted)" strokeWidth="1" fill="none" opacity="0.3" />
                  <path d="M 150,100 L 200,150 L 300,150 L 350,100" stroke="var(--text-muted)" strokeWidth="1" fill="none" opacity="0.3" />
                  
                  {/* Nodes */}
                  {[
                    { x: 50, y: 100, label: 'BLR', active: activeRegion === 'Bangalore' },
                    { x: 200, y: 50, label: 'HYD', active: activeRegion === 'Hyderabad' },
                    { x: 200, y: 150, label: 'MAA', active: activeRegion === 'Chennai' },
                    { x: 350, y: 100, label: 'BOM', active: activeRegion === 'Mumbai' }
                  ].map((node, idx) => (
                    <g key={idx}>
                      <motion.circle 
                        cx={node.x} cy={node.y} r={node.active ? 6 : 4} 
                        fill={node.active ? '#bef321' : 'var(--text-muted)'}
                        filter={node.active ? 'url(#glow)' : ''}
                        animate={node.active ? { r: [6, 10, 6], opacity: [1, 0.5, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                      <text x={node.x} y={node.y + 20} textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--text-muted)" className="uppercase tracking-widest">{node.label}</text>
                    </g>
                  ))}
                </svg>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-elevated-1)]"></div>
              </div>

              {[
                { name: 'Bangalore', members: 420, active: true, color: 'bg-emerald-400' },
                { name: 'Chennai', members: 215, active: false, color: 'bg-blue-400' },
                { name: 'Hyderabad', members: 180, active: true, color: 'bg-cyan-400' },
                { name: 'Mumbai', members: 310, active: true, color: 'bg-lime-400' },
              ].map((chapter, i) => (
                <motion.div 
                  key={chapter.name} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveRegion(activeRegion === chapter.name ? null : chapter.name);
                    // if (window.innerWidth < 768) closePanel();
                  }}
                  className={`group cursor-pointer relative p-4 rounded-3xl border transition-all ${
                    activeRegion === chapter.name 
                      ? 'bg-neon-gradient/10 border-[#bef321]/50 shadow-[0_0_20px_rgba(190,243,33,0.15)]' 
                      : 'bg-[var(--bg-elevated-1)] border-[var(--border-color)] hover:border-[#bef321]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${chapter.color} ${chapter.active ? 'animate-pulse shadow-[0_0_10px_currentColor]' : 'opacity-20'}`}></div>
                      <h4 className="text-lg font-black text-[var(--text-primary)] group-hover:text-purple-400 transition-colors tracking-tight">{chapter.name}</h4>
                    </div>
                    <span className="text-[10px] font-black bg-[var(--bg-elevated-2)] text-[var(--text-muted)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] uppercase tracking-widest">{chapter.members} Founders</span>
                  </div>
                  <div className="space-y-3 pl-5 border-l border-[var(--border-color)] ml-1">
                    {['Strategic SaaS Gathering', 'Indie Network Sync'].map(event => (
                      <div key={event} className="flex items-center gap-4 p-4 bg-[var(--bg-elevated-1)] rounded-2xl border border-[var(--border-color)] hover:bg-[var(--bg-elevated-2)] hover:border-purple-500/20 transition-all">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]"></div>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest group-hover:text-[var(--text-secondary)] transition-colors">{event}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : activePanel === 'none' ? (
            <div className="space-y-12">
              {/* Suggestions Section */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Suggested Connections</h3>
                  <button className="text-[10px] font-black text-purple-400 uppercase tracking-widest hover:text-purple-300">View All</button>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Nick Shelburne', username: 'nickshel', avatar: 'NS', color: 'bg-blue-500' },
                    { name: 'Sarah Drasner', username: 'sdras', avatar: 'SD', color: 'bg-purple-500' }
                  ].map((user) => (
                    <motion.div 
                      key={user.username} 
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-4 bg-[var(--bg-elevated-1)] rounded-3xl border border-[var(--border-color)] hover:bg-[var(--bg-elevated-2)] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${user.color} flex items-center justify-center font-black text-white shadow-xl`}>
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-black text-sm text-[var(--text-primary)]">{user.name}</div>
                          <div className="text-[10px] text-[var(--text-muted)] font-bold tracking-tight">@{user.username}</div>
                        </div>
                      </div>
                      <button className="px-5 py-2 bg-[var(--text-primary)] text-[var(--bg-base)] text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all">Follow</button>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Discovery Guilds */}
              <section>
                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mb-8">Founders Cult Hubs</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'AI/ML', icon: '🤖', count: '1.2k' },
                    { label: 'SaaS', icon: '☁️', count: '850' },
                    { label: 'DevOps', icon: '⚡', count: '430' },
                    { label: 'Design', icon: '🎨', count: '310' }
                  ].map((cat) => (
                    <div key={cat.label} className="p-6 bg-[var(--bg-elevated-1)] rounded-[2rem] border border-[var(--border-color)] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all cursor-pointer group flex flex-col items-center text-center">
                      <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-500">{cat.icon}</div>
                      <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest mb-1">{cat.label}</span>
                      <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tighter">{cat.count} Active</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </div>
            {activePanel === 'post' && activePost && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Main Node Post */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={activePost.author?.avatar} 
                      alt="Author" 
                      className="w-14 h-14 rounded-2xl cursor-pointer ring-1 ring-[var(--border-color)] shadow-2xl object-cover"
                      onClick={() => openProfile(activePost.author_id)}
                    />
                    <div>
                      <h4 className="font-black text-lg text-[var(--text-primary)] leading-tight">{activePost.author?.name}</h4>
                      <div className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest">@{activePost.author?.username}</div>
                    </div>
                    <div className="ml-auto text-[9px] font-black text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 uppercase tracking-widest">
                      {formatTime(activePost.created_at)}
                    </div>
                  </div>
                  
                  <div className="text-[17px] font-medium text-[var(--text-primary)] leading-[1.6] mb-8 whitespace-pre-wrap">
                    {activePost.content}
                  </div>

                  {activePost.media_urls && activePost.media_urls.length > 0 && (
                    <div className="mb-8 rounded-[2rem] overflow-hidden border border-[var(--border-color)] shadow-2xl group">
                      <img src={activePost.media_urls[0]} alt="Attachment" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}

                  <div className="flex items-center gap-8 py-6 border-y border-[var(--border-color)] mb-8">
                    <div className="flex items-center gap-3 bg-[var(--bg-elevated-1)] p-1 rounded-2xl border border-[var(--border-color)]">
                      <button 
                        onClick={() => handleVote(activePost.id, 'up')}
                        className={`p-2 rounded-xl transition-all ${userVotes[activePost.id] === 'up' ? 'text-purple-400 bg-purple-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated-2)]'}`}
                      >
                        <ArrowBigUp size={24} fill={userVotes[activePost.id] === 'up' ? 'currentColor' : 'none'} />
                      </button>
                      <span className="font-black text-[var(--text-primary)] text-lg">
                        {(activePost.likes_count || 0) + (userVotes[activePost.id] === 'up' ? 1 : userVotes[activePost.id] === 'down' ? -1 : 0)}
                      </span>
                      <button 
                        onClick={() => handleVote(activePost.id, 'down')}
                        className={`p-2 rounded-xl transition-all ${userVotes[activePost.id] === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated-2)]'}`}
                      >
                        <ArrowBigDown size={24} fill={userVotes[activePost.id] === 'down' ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                      <MessageSquare size={16} /> {activePost.comments_count} Active Signals
                    </div>
                  </div>
                </div>

                {/* Glassmorphic Reply Input */}
                <div className="relative p-6 bg-[var(--bg-elevated-1)] rounded-[2.5rem] border border-[var(--border-color)] shadow-inner focus-within:border-purple-500/30 transition-all">
                  {feedbackPrompt && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></div>
                      Feedback Optimization Required: {feedbackPrompt}
                    </motion.div>
                  )}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-[1px] flex-shrink-0">
                      <div className="w-full h-full rounded-[0.9rem] bg-[var(--bg-base)] flex items-center justify-center font-black text-[10px] text-[var(--text-primary)]">Me</div>
                    </div>
                    <div className="flex-1">
                      <textarea 
                        ref={replyInputRef}
                        placeholder={feedbackPrompt ? "Provide constructive intelligence..." : "Broadcast your signal..."} 
                        className="w-full bg-transparent resize-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium"
                        rows={2}
                      ></textarea>
                      <div className="flex justify-between items-center mt-4">
                        <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 hover:bg-[var(--bg-elevated-2)] rounded-xl"><Camera size={18}/></button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFeedbackPrompt(null)}
                          className="bg-[var(--text-primary)] text-[var(--bg-base)] text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl"
                        >
                          {feedbackPrompt ? 'Send Intelligence' : 'Signal'}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Threaded Activity */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-[var(--border-color)]"></div>
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Historical Signals</span>
                    <div className="h-[1px] flex-1 bg-[var(--border-color)]"></div>
                  </div>
                  {activePost.comments_count === 0 && (
                    <div className="text-center py-10">
                      <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">No signals detected in this sector.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
                  {activePanel === 'profile' && activeProfile && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12 pb-20"
              >
                {/* Hero Header */}
                <div className="relative h-64 rounded-[3rem] overflow-hidden border border-[var(--border-color)] group">
                  <img src={activeProfile.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/20 to-transparent"></div>
                  
                  <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                    <div className="flex items-center gap-6">
                      <motion.img 
                        whileHover={{ scale: 1.05 }}
                        src={activeProfile.avatar} 
                        className="w-28 h-28 rounded-[2.5rem] border-4 border-[var(--bg-base)] shadow-2xl object-cover bg-[var(--bg-base)]" 
                        alt="Avatar" 
                      />
                      <div className="mb-2">
                        <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter mb-1">{activeProfile.name}</h2>
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">@{activeProfile.handle.replace('@', '')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Profile Controls & Stats */}
                <div className="px-4 space-y-8">
                  <div className="flex items-center gap-4">
                    {activeProfile.id === currentUserId ? (
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex-1 bg-[var(--text-primary)] text-[var(--bg-base)] hover:bg-purple-500 hover:text-white px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3"
                      >
                        <Settings size={16} />
                        Sync Profile
                      </button>
                    ) : (
                      <button 
                        onClick={() => activeProfile.id && toggleFollow(activeProfile.id)}
                        className={`flex-1 px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl
                          ${activeProfile.isFollowing 
                            ? 'bg-[var(--bg-elevated-1)] text-[var(--text-secondary)] border border-[var(--border-color)]' 
                            : 'bg-[var(--text-primary)] text-[var(--bg-base)] hover:bg-purple-500 hover:text-white'}`}
                      >
                        {activeProfile.isFollowing ? 'Node Connected' : 'Connect Node'}
                      </button>
                    )}
                    <button className="w-14 h-14 rounded-[1.5rem] bg-[var(--bg-elevated-1)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] border border-[var(--border-color)] transition-all">
                      <LinkIcon size={20} />
                    </button>
                  </div>

                  {/* High-End Stats Grid */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--bg-elevated-1)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden">
                    {[
                      { label: 'Traction', value: (activeProfile.traction_points || 0) + 1250, color: 'text-purple-400' },
                      { label: 'Following', value: activeProfile.following, color: 'text-blue-400' },
                      { label: 'Followers', value: activeProfile.followers, color: 'text-cyan-400' }
                    ].map(stat => (
                      <div key={stat.label} className="bg-[var(--bg-base)] py-6 px-4 flex flex-col items-center justify-center text-center">
                        <span className={`text-xl font-black ${stat.color} mb-1`}>{stat.value}</span>
                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bio */}
                  <div className="bg-[var(--bg-elevated-1)] p-8 rounded-[2.5rem] border border-[var(--border-color)] relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Rocket size={48} className="text-[var(--text-primary)]" />
                    </div>
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mb-4">Founder Intelligence</div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                      {activeProfile.bio || "No intelligence data broadcasted yet. This founder is operating in stealth."}
                    </p>
                  </div>
                                {/* Profile Tabs & Posts */}
                  <div className="px-4 space-y-8">
                    <div className="flex gap-6 border-b border-[var(--border-color)] mb-4">
                      {['Posts', 'Replies', 'Likes', 'Media'].map((tab, i) => (
                        <button key={tab} className={`pb-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${i === 0 ? 'text-[var(--text-primary)] border-purple-500' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'}`}>
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {profilePostsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 size={24} className="animate-spin text-purple-400" />
                        </div>
                      ) : (
                        <>
                          {profilePosts.map(post => (
                            <div key={post.id} className="p-6 bg-[var(--bg-elevated-1)] rounded-[2rem] border border-[var(--border-color)] cursor-pointer hover:border-purple-500/30 transition-all" onClick={() => openPost(post.id)}>
                              <div className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}</div>
                              <div className="flex gap-6 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Heart size={14}/> {post.likes_count} Signals</span>
                                <span className="flex items-center gap-2"><MessageSquare size={14}/> {post.comments_count} Intelligence</span>
                              </div>
                            </div>
                          ))}
                          {profilePosts.length === 0 && (
                            <div className="text-center py-12">
                              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">No transmissions found.</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>


      {/* ================= MODAL: COMPOSE POST ================= */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-elevated-1)] w-full max-w-lg rounded-2xl border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <h3 className="font-bold text-lg text-[var(--text-primary)]">
                {activeStream === 'all' ? 'Share an Idea' : `Post to #${activeStream}`}
              </h3>
              <button 
                onClick={() => setIsComposeOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated-2)] p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <textarea
                autoFocus
                placeholder="What are you building or thinking about?"
                value={composeContent}
                onChange={(e) => setComposeContent(e.target.value)}
                className="w-full h-32 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none outline-none font-[family-name:var(--font-sans)]"
              />
              
              {previewUrl && (
                <div className="relative mt-4 rounded-xl overflow-hidden border border-[var(--border-color)]">
                  <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover max-h-64" />
                  <button 
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-elevated-2)]/50 flex justify-between items-center">
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
                  className="text-[var(--accent-teal)] p-2 hover:bg-[var(--accent-teal)]/10 rounded-full transition-colors"
                >
                  <File size={20} />
                </button>
              </div>
              <button 
                onClick={handleSubmitPost}
                disabled={(!composeContent.trim() && !selectedFile) || isSubmitting}
                className="bg-[var(--accent-amber)] hover:bg-[var(--accent-gold)] text-white font-bold py-2 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[var(--bg-elevated-1)] w-full max-w-md rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-gradient-to-r from-[var(--bg-elevated-1)] to-[var(--bg-elevated-2)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-[var(--bg-elevated-3)] rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.full_name}
                  onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                  className="w-full bg-[var(--bg-elevated-2)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-sm outline-none focus:border-[var(--accent-amber)] transition-all"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Username</label>
                <input 
                  type="text" 
                  value={editForm.username}
                  onChange={e => setEditForm({...editForm, username: e.target.value})}
                  className="w-full bg-[var(--bg-elevated-2)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-sm outline-none focus:border-[var(--accent-amber)] transition-all"
                  placeholder="username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Startup Name</label>
                <input 
                  type="text" 
                  value={editForm.startup_name}
                  onChange={e => setEditForm({...editForm, startup_name: e.target.value})}
                  className="w-full bg-[var(--bg-elevated-2)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-sm outline-none focus:border-[var(--accent-amber)] transition-all"
                  placeholder="What are you building?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Bio</label>
                <textarea 
                  value={editForm.bio}
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full bg-[var(--bg-elevated-2)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-sm outline-none focus:border-[var(--accent-amber)] transition-all h-24 resize-none"
                  placeholder="Tell your story..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Website</label>
                  <input 
                    type="text" 
                    value={editForm.website}
                    onChange={e => setEditForm({...editForm, website: e.target.value})}
                    className="w-full bg-[var(--bg-elevated-2)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-sm outline-none focus:border-[var(--accent-amber)] transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Location</label>
                  <input 
                    type="text" 
                    value={editForm.location}
                    onChange={e => setEditForm({...editForm, location: e.target.value})}
                    className="w-full bg-[var(--bg-elevated-2)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-sm outline-none focus:border-[var(--accent-amber)] transition-all"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-[var(--text-primary)] bg-[var(--bg-elevated-2)] hover:bg-[var(--bg-elevated-3)] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[var(--accent-amber)] to-[var(--accent-gold)] shadow-lg shadow-[var(--accent-amber)]/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= ZONE 4: MOBILE BOTTOM NAV ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-base)]/80 backdrop-blur-2xl border-t border-[var(--border-color)] z-50 flex items-center justify-around px-4 pb-4">
        {[
          { id: 'all', label: 'Feed', icon: Hash },
          { id: 'messages', label: 'DMs', icon: MessageSquare, badge: 2 },
          { id: 'forums', label: 'Lab', icon: TrendingUp },
          { id: 'profile', label: 'You', icon: User },
        ].map((item) => {
          const isActive = (item.id === 'profile' && activePanel === 'profile') || (item.id !== 'profile' && activeStream === item.id && activePanel === 'feed');
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'profile') {
                  openProfile(currentUserId);
                } else {
                  setActiveStream(item.id);
                  setActivePanel('feed');
                }
              }}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-[#bef321]' : 'text-[var(--text-muted)]'}`}
            >
              <item.icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(190,243,33,0.5)]' : ''} />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
              {isActive && (
                <motion.div layoutId="mobile-nav-dot" className="w-1 h-1 rounded-full bg-[#bef321]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
