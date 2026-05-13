"use client";

import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated-2)] animate-pulse" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-9 h-9 rounded-full bg-[var(--color-bg-elevated-2)] hover:bg-[var(--color-bg-elevated-3)] flex items-center justify-center transition-colors border border-[var(--color-bg-elevated-3)] overflow-hidden group"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          opacity: isDark ? 1 : 0,
          rotate: isDark ? 0 : -90,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center text-[var(--color-accent-amber)]"
      >
        <Moon className="w-4 h-4 fill-current" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: !isDark ? 1 : 0,
          opacity: !isDark ? 1 : 0,
          rotate: !isDark ? 0 : 90,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center text-[var(--color-accent-gold)]"
      >
        <Sun className="w-4 h-4 fill-current" />
      </motion.div>
    </button>
  );
}
