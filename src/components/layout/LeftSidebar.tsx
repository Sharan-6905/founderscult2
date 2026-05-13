"use client";

import { useState } from "react";
import { Hash, Settings, Search, Users, Activity, Briefcase, Code, Paintbrush, Rocket, Wrench, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const streams = [
  { name: "ai-ml", icon: Activity },
  { name: "saas", icon: Briefcase },
  { name: "fundraising", icon: Users },
  { name: "open-source", icon: Code },
  { name: "design", icon: Paintbrush },
  { name: "ship-it", icon: Rocket },
  { name: "hiring", icon: Users },
  { name: "growth", icon: Activity },
  { name: "dev-tools", icon: Wrench },
  { name: "side-projects", icon: Zap },
];

export default function LeftSidebar() {
  const [activeStream, setActiveStream] = useState<string>("ship-it");

  return (
    <aside className="w-[240px] flex-shrink-0 border-r border-[var(--color-bg-elevated-2)] flex flex-col glass-panel hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-bg-elevated-2)]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--color-accent-amber)] to-[#fbbf24] flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
            F
          </div>
          <span className="text-2xl tracking-wide flex items-center">
            <span className="font-[family-name:var(--font-logo)] font-normal text-[var(--color-accent-amber)] lowercase tracking-normal -mt-1 pr-1">founders</span>
            <span className="font-sans font-black tracking-tight text-[var(--color-text-primary)]">CULT</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6">
        <div>
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
            Streams
          </h3>
          <div className="flex flex-col gap-1">
            {streams.map((stream) => (
              <button
                key={stream.name}
                onClick={() => setActiveStream(stream.name)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
                  activeStream === stream.name
                    ? "bg-[var(--color-bg-elevated-2)] text-[var(--color-accent-amber)] border-l-2 border-[var(--color-accent-amber)] shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated-1)] hover:text-[var(--color-text-primary)] border-l-2 border-transparent"
                )}
              >
                <stream.icon className={cn("w-4 h-4", activeStream === stream.name ? "text-[var(--color-accent-amber)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]")} />
                <span>{stream.name}</span>
                {activeStream === stream.name && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent-amber)]"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--color-bg-elevated-2)]">
        <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-[var(--color-bg-elevated-2)] transition-colors text-left group">
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated-3)] flex items-center justify-center flex-shrink-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-accent-amber)] to-[#fbbf24] flex items-center justify-center text-white" >
               <span className="text-xs font-bold">D</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">Demo Founder</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">Guest Session</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
