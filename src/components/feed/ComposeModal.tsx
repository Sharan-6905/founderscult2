"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Image as ImageIcon, Smile, Hash, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createGuestPost } from "@/lib/actions/posts";

export default function ComposeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    
    // Use the guest post action which bypasses the need for a login session
    const { error } = await createGuestPost(content.trim());

    setIsSubmitting(false);

    if (error) {
      console.error("Error creating post:", error);
      alert(`Failed to create post: ${error}`);
      return;
    }

    setContent("");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 lg:bottom-10 lg:right-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--color-accent-amber)] to-[var(--color-accent-gold)] text-white shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow group relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-inherit blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
          <Plus className="w-6 h-6 relative z-10" />
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--color-bg-elevated-1)] w-full max-w-lg rounded-2xl shadow-2xl border border-[var(--color-bg-elevated-2)] overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-bg-elevated-2)]">
                  <h2 className="font-semibold text-lg text-[var(--color-text-primary)]">Create Post</h2>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1.5 rounded-full hover:bg-[var(--color-bg-elevated-2)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
                  <div className="p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated-3)] flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-[var(--color-accent-teal)] to-[var(--color-accent-blue)] opacity-80" />
                    </div>
                    
                    <div className="flex-1">
                      <textarea
                        autoFocus
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What are you building? Share your progress..."
                        className="w-full min-h-[120px] bg-transparent resize-none outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-lg leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Footer / Actions */}
                  <div className="px-6 py-4 border-t border-[var(--color-bg-elevated-2)] bg-[var(--color-bg-elevated-2)]/50 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button type="button" className="text-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/10 p-2 rounded-full transition-colors flex items-center gap-1">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-xs hidden sm:inline-block font-medium">Media</span>
                      </button>
                      <button type="button" className="text-[var(--color-accent-amber)] hover:bg-[var(--color-accent-amber)]/10 p-2 rounded-full transition-colors flex items-center gap-1">
                        <Hash className="w-5 h-5" />
                        <span className="text-xs hidden sm:inline-block font-medium">Stream</span>
                      </button>
                      <button type="button" className="text-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold)]/10 p-2 rounded-full transition-colors hidden sm:flex items-center gap-1">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!content.trim() || isSubmitting}
                      className="px-6 py-2 rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg-base)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all flex items-center justify-center min-w-[80px]"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
