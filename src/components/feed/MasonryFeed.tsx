"use client";

import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import PostCard from "./PostCard";
import PostSkeleton from "./PostSkeleton";
import { motion } from "framer-motion";
import { usePosts } from "@/lib/hooks/usePosts";

const breakpointColumnsObj = {
  default: 3,
  1280: 3, // xl
  1024: 2, // lg
  768: 2,  // md
  640: 1   // sm
};

export default function MasonryFeed() {
  const { posts, loading } = usePosts();

  if (loading) {
    return (
      <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </Masonry>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto pb-24">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {posts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-[var(--color-bg-elevated-2)] flex items-center justify-center text-[var(--color-accent-amber)] font-serif text-2xl font-bold">!</div>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">No posts found</h3>
            <p className="text-[var(--color-text-muted)] max-w-md">
              It looks like there are no posts yet or you need to add your Supabase credentials in `.env.local` and run the `seed.sql` script.
            </p>
          </div>
        ) : (
          posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
            >
              <PostCard post={post} />
            </motion.div>
          ))
        )}
      </Masonry>
    </div>
  );
}
