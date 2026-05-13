"use client";

import { Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";

export default function PostCard({ post }: { post: any }) {
  return (
    <div className="bg-[var(--color-bg-elevated-2)] rounded-xl border border-[var(--color-bg-elevated-2)] overflow-hidden mb-4 hover:border-[var(--color-accent-amber)] transition-colors group">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent-amber)] flex items-center justify-center text-white font-bold text-xs">
              {post.author?.full_name?.[0] || '?'}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{post.author?.full_name || 'Founder'}</h4>
              <p className="text-[10px] text-[var(--color-text-muted)]">@{post.author?.username || 'builder'}</p>
            </div>
          </div>
          <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4 whitespace-pre-wrap">
          {post.content}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-bg-elevated-1)]">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-coral)] transition-colors">
              <Heart className="w-4 h-4" />
              <span>{post.likes_count || 0}</span>
            </button>
            <button className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>{post.comments_count || 0}</span>
            </button>
          </div>
          <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
