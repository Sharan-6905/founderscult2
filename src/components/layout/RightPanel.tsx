"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

interface RightPanelProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function RightPanel({ children, onClose }: RightPanelProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
      />
      
      {/* Panel */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] lg:relative lg:w-[400px] xl:w-[450px] bg-[var(--color-bg-elevated-1)] border-l border-[var(--color-bg-elevated-2)] shadow-2xl flex flex-col"
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-bg-elevated-2)]">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Context</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated-2)] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {children || (
            <div className="p-8 text-center text-[var(--color-text-muted)]">
              Select a post or profile to view details
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
