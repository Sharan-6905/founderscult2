"use client";

import { Bell, Search, Menu, LogIn, LogOut, User } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // For the demo/guest mode, we just show a static Demo user
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-[var(--color-bg-elevated-2)] glass-panel z-10 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated-2)] rounded-md transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Current Context/Stream Title */}
        <div className="hidden sm:flex flex-col">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] leading-none">
            #ship-it
          </h2>
          <span className="text-xs text-[var(--color-text-muted)] mt-1">
            Share what you just launched or built
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input 
            type="text" 
            placeholder="Search founders, streams, posts..." 
            className="w-64 lg:w-80 h-9 pl-9 pr-4 rounded-full bg-[var(--color-bg-elevated-2)] border border-transparent focus:border-[var(--color-accent-blue)] focus:bg-[var(--color-bg-elevated-1)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none transition-all shadow-inner"
          />
        </div>

        {/* Mobile Search Button */}
        <button className="md:hidden p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated-2)] rounded-full transition-colors">
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-full bg-[var(--color-bg-elevated-2)] hover:bg-[var(--color-bg-elevated-3)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors border border-[var(--color-bg-elevated-3)] group">
          <Bell className="w-4 h-4 group-hover:animate-swing" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[var(--color-accent-coral)] rounded-full border-2 border-[var(--color-bg-base)]"></span>
        </button>

        {/* Demo User Section */}
        {mounted && (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">Demo Founder</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">Guest Session</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated-3)] flex items-center justify-center overflow-hidden border-2 border-[var(--color-accent-amber)] cursor-default">
              <div className="w-full h-full bg-gradient-to-br from-[var(--color-accent-amber)] to-[var(--color-accent-gold)] flex items-center justify-center text-white text-xs font-bold uppercase">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
