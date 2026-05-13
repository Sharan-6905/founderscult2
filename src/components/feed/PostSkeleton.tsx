"use client";

export default function PostSkeleton() {
  return (
    <article className="bg-[var(--color-bg-elevated-1)] rounded-2xl p-4 sm:p-5 border border-[var(--color-bg-elevated-2)] overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated-2)] animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-[var(--color-bg-elevated-2)] rounded animate-pulse" />
            <div className="h-3 w-20 bg-[var(--color-bg-elevated-2)] rounded animate-pulse" />
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-[var(--color-bg-elevated-2)] rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-[var(--color-bg-elevated-2)] rounded animate-pulse" />
        <div className="h-3 w-4/6 bg-[var(--color-bg-elevated-2)] rounded animate-pulse" />
      </div>
      
      {/* Media skeleton */}
      <div className="h-40 w-full bg-[var(--color-bg-elevated-2)] rounded-xl animate-pulse mb-4" />
      
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-12 bg-[var(--color-bg-elevated-2)] rounded-full animate-pulse" />
        <div className="h-4 w-16 bg-[var(--color-bg-elevated-2)] rounded-full animate-pulse" />
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-bg-elevated-2)]">
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated-2)] animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated-2)] animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated-2)] animate-pulse" />
        </div>
      </div>
    </article>
  );
}
