"use client";

import React, { useState, useEffect, useRef } from 'react';
import Masonry from 'react-masonry-css';
import { supabase } from '@/lib/supabase/client';
import { 
  Bell, Sun, Moon, Search, Hash, TrendingUp, Settings, 
  Heart, MessageSquare, Repeat2, Plus, X, MapPin, Link as LinkIcon, Camera, Loader2, File, Map,
  ArrowBigUp, ArrowBigDown
} from 'lucide-react';
import { usePosts } from '@/lib/hooks/usePosts';
import { createPost } from '@/lib/actions/posts';

// --- CONSTANTS ---
const STREAMS = [
  { id: 'all', label: 'Home' },
  { id: 'ai-ml', label: 'ai-ml' },
  { id: 'saas', label: 'saas' },
  { id: 'dev-tools', label: 'dev-tools' },
  { id: 'fundraising', label: 'fundraising' },
  { id: 'design', label: 'design' },
  { id: 'side-projects', label: 'side-projects' },
  { id: 'hiring', label: 'hiring' },
  { id: 'ship-it', label: 'ship-it' },
  { id: 'open-source', label: 'open-source' },
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

  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [activeStream, setActiveStream] = useState('all');
  const [activePanel, setActivePanel] = useState<'none' | 'post' | 'profile' | 'circuit'>('none');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [feedbackPrompt, setFeedbackPrompt] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    startup_name: '',
    bio: ''
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
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Get current user and their profile
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, startup_name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCurrentUserProfile(profile);
          setEditForm({
            full_name: profile.full_name || '',
            username: profile.username || '',
            startup_name: profile.startup_name || '',
            bio: profile.bio || ''
          });
        } else {
          // Fallback to auth metadata if profile doesn't exist yet
          const fallback = {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Founder",
            username: user.user_metadata?.username || user.email?.split('@')[0] || "founder",
            avatar_url: null,
            traction_points: 0
          };
          setCurrentUserProfile(fallback);
          setEditForm({
            full_name: fallback.full_name,
            username: fallback.username,
            startup_name: '',
            bio: ''
          });
        }
      }
    };
    getUserData();
  }, [theme]);

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

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: currentUserId,
        ...editForm,
        updated_at: new Date().toISOString()
      });

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      setCurrentUserProfile((prev: any) => ({ ...prev, ...editForm }));
      setIsEditModalOpen(false);
      // Refresh to sync everything
      window.location.reload(); 
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

      await createPost(composeContent, activeStream, imageUrls);
      
      setComposeContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsSubmitting(false);
      setIsComposeOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to upload image. Please try again.');
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

  const filteredPosts = posts.filter(post => 
    activeStream === 'all' || post.stream_id === activeStream || (post.tags && post.tags.includes(activeStream))
  );

  const activePost = posts.find(p => p.id === selectedPostId);
  
  // Dynamically build profile from any post they've authored or fallback to currentUserProfile
  const targetId = selectedProfileId || (activePanel === 'profile' ? currentUserId : null);
  const profilePost = posts.find(p => p.author_id === targetId);
  const authorData = profilePost?.author || (targetId === currentUserId && currentUserProfile ? {
    name: currentUserProfile.full_name,
    username: currentUserProfile.username,
    avatar: currentUserProfile.avatar_url,
    startup: currentUserProfile.startup_name,
    traction_points: currentUserProfile.traction_points
  } : null);

  const userPostsForTraction = posts.filter(p => p.author_id === targetId);
  const dynamicTraction = userPostsForTraction.reduce((acc, p) => acc + (p.likes_count || 0) + (p.comments_count || 0) * 2, 0);

  // Global my traction for sidebar
  const myTractionPoints = posts
    .filter(p => p.author_id === currentUserId)
    .reduce((acc, p) => acc + (p.likes_count || 0) + (p.comments_count || 0) * 2, 0);

  const activeProfile = authorData ? {
    id: targetId,
    name: authorData.name || 'Unknown Founder',
    handle: `@${authorData.username || 'founder'}`,
    avatar: authorData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorData.name || 'F')}&background=ffaa00&color=fff`,
    coverImage: 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&q=80&w=1000',
    bio: authorData.startup ? `Building ${authorData.startup}` : (authorData.bio || 'Building something awesome.'),
    location: 'Internet',
    website: 'startup.com',
    followers: (Math.floor(Math.random() * 1000)) + (followedUserIds.has(targetId!) ? 1 : 0),
    following: Math.floor(Math.random() * 500),
    isFollowing: followedUserIds.has(targetId!),
    traction_points: (authorData.traction_points !== undefined && authorData.traction_points !== null) 
      ? authorData.traction_points 
      : dynamicTraction
  } : (activePanel === 'profile' && !targetId ? {
    id: 'loading',
    name: 'Loading...',
    handle: '@loading',
    avatar: 'https://i.pravatar.cc/150',
    coverImage: 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&q=80&w=1000',
    bio: 'Loading your details...',
    location: '...',
    website: '...',
    followers: 0,
    following: 0,
    traction_points: 0
  } : null);

  const breakpointColumnsObj = {
    default: 4,
    1536: 3,
    1024: 2,
    640: 1
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] font-[family-name:var(--font-serif)] selection:bg-[var(--accent-amber)] selection:text-white relative">
      
      {/* ================= ZONE 1: LEFT CHANNEL PANEL ================= */}
      <div className="w-16 md:w-64 flex-shrink-0 flex flex-col bg-[var(--bg-elevated-1)] border-r border-[var(--border-color)] z-10 transition-all duration-300">
        
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-[var(--border-color)]">
          <div className="flex items-baseline gap-1 hidden md:flex">
            <span className="font-[family-name:var(--font-logo)] text-2xl text-[var(--text-primary)] tracking-wide">founders</span>
            <span className="font-[family-name:var(--font-sans)] font-bold text-lg text-[var(--accent-amber)]">CULT</span>
          </div>
          <div className="md:hidden font-[family-name:var(--font-logo)] text-2xl text-[var(--accent-amber)]">fC</div>
        </div>

        {/* Navigation / Streams */}
        <div className="flex-1 overflow-y-auto py-4 px-2 md:px-4 hide-scrollbar">
          <div className="mb-6">
            <h3 className="hidden md:block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-2">Streams</h3>
            <div className="space-y-1">
              {STREAMS.map(stream => (
                <button
                  key={stream.id}
                  onClick={() => setActiveStream(stream.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                    activeStream === stream.id 
                      ? 'bg-gradient-to-r from-[var(--accent-amber)] to-[var(--accent-gold)] text-white shadow-lg shadow-[var(--accent-amber)]/20 scale-[1.02]' 
                      : 'hover:bg-[var(--bg-elevated-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Hash size={20} className={activeStream === stream.id ? 'text-white' : 'text-[var(--accent-amber)] group-hover:scale-110 transition-transform'} />
                  <span className="hidden md:block text-sm font-bold tracking-tight">{stream.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 hidden md:block">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
              <TrendingUp size={14} /> Trending
            </h3>
            <div className="space-y-2 px-2">
              {TRENDING.map(trend => (
                <button key={trend.tag} onClick={() => setActiveStream(trend.tag)} className="w-full text-left group">
                  <div className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent-amber)] transition-colors">#{trend.tag}</div>
                  <div className="text-xs text-[var(--text-muted)]">{trend.count}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="h-16 border-t border-[var(--border-color)] flex items-center justify-between px-2 md:px-4">
          <button 
            onClick={() => openProfile(currentUserId)}
            className="flex items-center gap-3 hover:bg-[var(--bg-elevated-2)] p-2 rounded-md transition-colors w-full"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-amber)] to-[var(--accent-gold)] text-white font-bold flex items-center justify-center overflow-hidden">
              {currentUserProfile?.avatar_url ? (
                <img src={currentUserProfile.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <span>{(currentUserProfile?.full_name || 'M').charAt(0)}</span>
              )}
            </div>
            <div className="hidden md:block text-left flex-1 min-w-0">
              <div className="text-sm font-bold truncate">
                {currentUserProfile?.full_name || "My Profile"}
              </div>
              <div className="text-[10px] text-[var(--accent-amber)] font-bold uppercase tracking-wider flex items-center gap-1">
                <TrendingUp size={10} /> {myTractionPoints} Points
              </div>
            </div>
            <Settings size={18} className="hidden md:block text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* ================= ZONE 2: MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-base)] relative">
        
        {/* Top Bar */}
        <div className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-elevated-1)]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3 md:gap-4 flex-1">
            <h1 className="text-xl md:text-2xl font-[family-name:var(--font-logo)] font-black italic tracking-tighter bg-gradient-to-br from-[var(--accent-amber)] via-[var(--accent-gold)] to-[var(--accent-coral)] bg-clip-text text-transparent">
              founders CULT
            </h1>
            <div className="relative flex-1 max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
              <input 
                type="text" 
                placeholder="Search founders, ideas, or streams..." 
                className="w-full bg-[var(--bg-elevated-1)] border border-[var(--border-color)] rounded-2xl py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--accent-amber)] focus:ring-4 focus:ring-[var(--accent-amber)]/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActivePanel('circuit')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                activePanel === 'circuit' 
                  ? 'bg-[var(--accent-amber)] text-white' 
                  : 'bg-[var(--bg-elevated-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
              }`}
            >
              <Map size={16} />
              Founders Circuit
            </button>
            <button onClick={toggleTheme} className="text-[var(--text-secondary)] hover:text-[var(--accent-amber)] transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="text-[var(--text-secondary)] hover:text-[var(--accent-amber)] transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--accent-amber)] rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-4 flex gap-3 overflow-x-auto hide-scrollbar border-b border-[var(--border-color)]">
          {['Latest', 'Hot', 'Most Discussed', 'This Week'].map((filter, i) => (
            <button key={filter} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              i === 0 ? 'bg-[var(--accent-amber)] text-white shadow-sm' : 'bg-[var(--bg-elevated-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-amber)]/50'
            }`}>
              {filter}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && posts.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
            <Loader2 size={32} className="animate-spin mb-4 text-[var(--accent-amber)]" />
            <p className="font-[family-name:var(--font-sans)]">Syncing with database...</p>
          </div>
        )}

        {/* Masonry Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-clip-padding"
          >
            {filteredPosts.map(post => {
              const author = post.author;
              return (
                <div 
                  key={post.id} 
                  onClick={() => openPost(post.id)}
                  className="mb-4 bg-[var(--bg-elevated-1)] rounded-xl p-5 border border-[var(--border-color)] shadow-sm hover:shadow-md hover:border-[var(--accent-amber)]/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                >
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={author?.avatar} 
                      alt={author?.name} 
                      className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-[var(--accent-amber)] transition-all object-cover"
                      onClick={(e) => { e.stopPropagation(); openProfile(post.author_id); }}
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-amber)] transition-colors">{author?.name}</span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-[family-name:var(--font-sans)]">@{author?.username} · {formatTime(post.created_at)}</div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 whitespace-pre-wrap">
                    {post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}
                    {post.content.length > 200 && <span className="text-[var(--accent-amber)] font-medium ml-1">read more</span>}
                  </div>

                  {/* Optional Image */}
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-[var(--border-color)]">
                      <img src={post.media_urls[0]} alt="Post attachment" className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {/* Tags */}
                  {(post.tags || (post.stream_id ? [post.stream_id] : [])).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(post.tags || (post.stream_id ? [post.stream_id] : [])).map((tag: string) => (
                        <span key={tag} className="text-xs font-medium px-2 py-1 rounded-md bg-[var(--bg-elevated-2)] text-[var(--accent-teal)] border border-[var(--border-color)]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Stats */}
                  <div className="flex items-center gap-4 text-[var(--text-muted)] text-xs font-[family-name:var(--font-sans)] pt-2 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-1 bg-[var(--bg-elevated-2)] rounded-full px-2 py-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleVote(post.id, 'up'); }}
                        className={`p-1 hover:text-[var(--accent-amber)] transition-colors ${userVotes[post.id] === 'up' ? 'text-[var(--accent-amber)]' : ''}`}
                      >
                        <ArrowBigUp size={20} fill={userVotes[post.id] === 'up' ? 'currentColor' : 'none'} />
                      </button>
                      <span className="font-bold min-w-[1ch] text-center">
                        {(post.likes_count || 0) + (userVotes[post.id] === 'up' ? 1 : userVotes[post.id] === 'down' ? -1 : 0)}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleVote(post.id, 'down'); }}
                        className={`p-1 hover:text-[var(--accent-coral)] transition-colors ${userVotes[post.id] === 'down' ? 'text-[var(--accent-coral)]' : ''}`}
                      >
                        <ArrowBigDown size={20} fill={userVotes[post.id] === 'down' ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <button className="flex items-center gap-1.5 hover:text-[var(--accent-blue)] transition-colors">
                      <MessageSquare size={16} /> {post.comments_count}
                    </button>
                  </div>
                </div>
              );
            })}
          </Masonry>
        </div>

        {/* Floating Action Button */}
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-amber)] to-[var(--accent-gold)] text-white shadow-xl shadow-[var(--accent-amber)]/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 group"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>

      </div>

      {/* ================= ZONE 3: RIGHT CONTEXT PANEL ================= */}
      <div 
        className={`flex-shrink-0 bg-[var(--bg-elevated-1)] border-l border-[var(--border-color)] transition-all duration-300 ease-in-out z-20 overflow-hidden shadow-2xl md:shadow-none
          ${activePanel !== 'none' ? 'w-full absolute md:relative md:w-[400px] xl:w-[500px]' : 'w-0 border-transparent'} h-full right-0 top-0`}
      >
        <div className="w-full md:w-[400px] xl:w-[500px] h-full flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)] bg-[var(--bg-elevated-1)] sticky top-0 z-10">
            <span className="font-bold text-lg text-[var(--text-primary)]">
              {activePanel === 'post' ? 'Thread' : activePanel === 'profile' ? 'Profile' : activePanel === 'circuit' ? 'Founders Circuit' : ''}
            </span>
            <button onClick={closePanel} className="p-2 hover:bg-[var(--bg-elevated-2)] rounded-full text-[var(--text-secondary)] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activePanel === 'circuit' && (
              <div className="p-6 space-y-8">
                <div className="bg-gradient-to-br from-[var(--accent-amber)]/20 to-transparent p-6 rounded-2xl border border-[var(--accent-amber)]/20 mb-6">
                  <h3 className="text-2xl font-bold mb-2">Local Chapters</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Connect with founders in your city and attend exclusive IRL events.</p>
                </div>

                {[
                  {
                    city: "Bangalore Chapter",
                    events: [
                      { name: "SaaS Founders Mixer", date: "Oct 25, 6:00 PM", venue: "Indiranagar" },
                      { name: "Demo Day: AI Tools", date: "Nov 02, 11:00 AM", venue: "HSR Layout" }
                    ]
                  },
                  {
                    city: "Mumbai Chapter",
                    events: [
                      { name: "Fintech Circle Meetup", date: "Oct 28, 7:00 PM", venue: "BKC" },
                      { name: "Investor Speed Dating", date: "Nov 05, 4:00 PM", venue: "Worli" }
                    ]
                  },
                  {
                    city: "Chennai Chapter",
                    events: [
                      { name: "D2C Brands Workshop", date: "Oct 30, 5:30 PM", venue: "Adyar" },
                      { name: "Late Night Code & Coffee", date: "Nov 08, 9:00 PM", venue: "OMR" }
                    ]
                  },
                  {
                    city: "Hyderabad Chapter",
                    events: [
                      { name: "Web3 Builders Meet", date: "Nov 01, 6:30 PM", venue: "Gachibowli" },
                      { name: "Founder's Breakfast", date: "Nov 12, 9:00 AM", venue: "Jubilee Hills" }
                    ]
                  }
                ].map((chapter) => (
                  <div key={chapter.city} className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-bold text-[var(--accent-amber)]">
                      <MapPin size={20} />
                      {chapter.city}
                    </div>
                    <div className="grid gap-3">
                      {chapter.events.map((event) => (
                        <div key={event.name} className="p-4 bg-[var(--bg-elevated-2)] rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-amber)]/50 transition-all cursor-pointer group">
                          <div className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-amber)] transition-colors">{event.name}</div>
                          <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)] font-[family-name:var(--font-sans)]">
                            <span>{event.date}</span>
                            <span>{event.venue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activePanel === 'post' && activePost && (
              <div className="p-6">
                {/* Full Post */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={activePost.author?.avatar} 
                      alt="Author" 
                      className="w-12 h-12 rounded-full cursor-pointer hover:ring-2 ring-[var(--accent-amber)] transition-all object-cover"
                      onClick={() => openProfile(activePost.author_id)}
                    />
                    <div>
                      <div className="font-bold text-base text-[var(--text-primary)]">{activePost.author?.name}</div>
                      <div className="text-sm text-[var(--text-muted)] font-[family-name:var(--font-sans)]">@{activePost.author?.username}</div>
                    </div>
                  </div>
                  
                  <div className="text-base text-[var(--text-primary)] leading-relaxed mb-6 whitespace-pre-wrap">
                    {activePost.content}
                  </div>

                  {activePost.media_urls && activePost.media_urls.length > 0 && (
                    <div className="mb-6 rounded-xl overflow-hidden border border-[var(--border-color)]">
                      <img src={activePost.media_urls[0]} alt="Attachment" className="w-full h-auto object-cover" />
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-[var(--text-secondary)] text-sm font-[family-name:var(--font-sans)] py-4 border-y border-[var(--border-color)] mb-6">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleVote(activePost.id, 'up')}
                        className={`p-1 rounded hover:bg-[var(--bg-elevated-2)] ${userVotes[activePost.id] === 'up' ? 'text-[var(--accent-amber)]' : ''}`}
                      >
                        <ArrowBigUp size={24} fill={userVotes[activePost.id] === 'up' ? 'currentColor' : 'none'} />
                      </button>
                      <span className="font-bold text-lg">
                        {(activePost.likes_count || 0) + (userVotes[activePost.id] === 'up' ? 1 : userVotes[activePost.id] === 'down' ? -1 : 0)}
                      </span>
                      <button 
                        onClick={() => handleVote(activePost.id, 'down')}
                        className={`p-1 rounded hover:bg-[var(--bg-elevated-2)] ${userVotes[activePost.id] === 'down' ? 'text-[var(--accent-coral)]' : ''}`}
                      >
                        <ArrowBigDown size={24} fill={userVotes[activePost.id] === 'down' ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <span className="flex items-center gap-2"><MessageSquare size={18} className="text-[var(--text-muted)]"/> {activePost.comments_count} Replies</span>
                  </div>
                </div>

                {/* Reply Composer */}
                <div className="flex flex-col gap-3 mb-8">
                  {feedbackPrompt && (
                    <div className="text-xs font-bold text-[var(--accent-coral)] uppercase tracking-wide flex items-center gap-2 animate-bounce">
                      <ArrowBigDown size={14} fill="currentColor" /> {feedbackPrompt}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-amber)] text-white flex items-center justify-center font-bold text-sm">Me</div>
                    <div className="flex-1 bg-[var(--bg-elevated-2)] border border-[var(--border-color)] rounded-xl p-3 focus-within:border-[var(--accent-amber)] transition-colors">
                      <textarea 
                        ref={replyInputRef}
                        placeholder={feedbackPrompt ? "What could be improved?" : "Post a reply..."} 
                        className="w-full bg-transparent resize-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] font-[family-name:var(--font-sans)]"
                        rows={2}
                      ></textarea>
                      <div className="flex justify-between items-center mt-2">
                        <button className="text-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/10 p-1.5 rounded-md transition-colors"><Camera size={18}/></button>
                        <button 
                          onClick={() => setFeedbackPrompt(null)}
                          className="bg-[var(--accent-amber)] hover:bg-[var(--accent-gold)] text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
                        >
                          {feedbackPrompt ? 'Send Feedback' : 'Reply'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dummy Replies */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Replies</h4>
                  {activePost.comments_count === 0 && <p className="text-[var(--text-muted)] text-sm italic">No replies yet. Be the first to comment!</p>}
                </div>
              </div>
            )}

            {activePanel === 'profile' && !activeProfile && (
              <div className="flex flex-col items-center justify-center h-full p-6 text-[var(--text-muted)] font-[family-name:var(--font-sans)]">
                <Loader2 size={32} className="animate-spin mb-4 text-[var(--accent-amber)]" />
                <p>Syncing profile data...</p>
              </div>
            )}

            {activePanel === 'profile' && activeProfile && (
              <div className="pb-8">
                {/* Hero Cover */}
                <div className="h-40 w-full relative">
                  <img src={activeProfile.coverImage} className="w-full h-full object-cover" alt="Cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-elevated-1)] to-transparent"></div>
                </div>
                
                {/* Profile Info */}
                <div className="px-6 relative -top-12">
                  <div className="flex justify-between items-end mb-4">
                    <img src={activeProfile.avatar} className="w-24 h-24 rounded-full border-4 border-[var(--bg-elevated-1)] object-cover bg-[var(--bg-base)]" alt="Avatar" />
                    {activeProfile.id === currentUserId ? (
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-[var(--bg-elevated-2)] text-[var(--text-primary)] hover:bg-[var(--accent-amber)] hover:text-white px-6 py-2 rounded-full font-bold text-sm transition-all border border-[var(--border-color)]"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <button 
                        onClick={() => toggleFollow(activeProfile.id)}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
                          activeProfile.isFollowing 
                            ? 'bg-[var(--bg-elevated-2)] text-[var(--text-primary)] border border-[var(--border-color)]' 
                            : 'bg-[var(--text-primary)] text-[var(--bg-base)] hover:bg-[var(--accent-amber)] hover:text-white'
                        }`}
                      >
                        {activeProfile.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{activeProfile.name}</h2>
                  <div className="text-sm text-[var(--text-muted)] font-[family-name:var(--font-sans)] mb-4">{activeProfile.handle}</div>
                  
                  <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">{activeProfile.bio}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)] font-[family-name:var(--font-sans)] mb-6">
                    <span className="flex items-center gap-1.5"><MapPin size={14}/> {activeProfile.location}</span>
                    <span className="flex items-center gap-1.5 text-[var(--accent-teal)] hover:underline cursor-pointer"><LinkIcon size={14}/> {activeProfile.website}</span>
                  </div>
                  
                  <div className="flex gap-4 text-sm font-[family-name:var(--font-sans)] border-b border-[var(--border-color)] pb-6 mb-2">
                    <span className="text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">{activeProfile.traction_points}</strong> Traction Points</span>
                    <span className="text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">{activeProfile.following}</strong> Following</span>
                    <span className="text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">{activeProfile.followers}</strong> Followers</span>
                  </div>

                  {/* Profile Tabs */}
                  <div className="flex gap-6 border-b border-[var(--border-color)] mb-4">
                    {['Posts', 'Replies', 'Likes', 'Media'].map((tab, i) => (
                      <button key={tab} className={`pb-3 text-sm font-medium transition-colors border-b-2 ${i === 0 ? 'text-[var(--text-primary)] border-[var(--accent-amber)]' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Profile Posts */}
                  <div className="space-y-4">
                    {posts.filter(p => p.author_id === activeProfile.id).map(post => (
                      <div key={post.id} className="p-4 bg-[var(--bg-elevated-2)] rounded-xl border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-amber)]/50 transition-colors" onClick={() => openPost(post.id)}>
                        <div className="text-sm text-[var(--text-secondary)] mb-3">{post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}</div>
                        <div className="flex gap-4 text-xs text-[var(--text-muted)] font-[family-name:var(--font-sans)]">
                          <span className="flex items-center gap-1"><Heart size={12}/> {post.likes_count}</span>
                          <span className="flex items-center gap-1"><MessageSquare size={12}/> {post.comments_count}</span>
                        </div>
                      </div>
                    ))}
                    {posts.filter(p => p.author_id === activeProfile.id).length === 0 && (
                      <div className="text-center text-[var(--text-muted)] py-8 text-sm">No posts yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
    </div>
  );
}
