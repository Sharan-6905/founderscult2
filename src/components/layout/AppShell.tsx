"use client";

import { useState } from "react";
import LeftSidebar from "./LeftSidebar";
import TopBar from "./TopBar";
import RightPanel from "./RightPanel";
import ComposeModal from "../feed/ComposeModal";
import { AnimatePresence } from "framer-motion";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState<React.ReactNode | null>(null);

  const openRightPanel = (content: React.ReactNode) => {
    setRightPanelContent(content);
    setIsRightPanelOpen(true);
  };

  const closeRightPanel = () => {
    setIsRightPanelOpen(false);
    setTimeout(() => setRightPanelContent(null), 300); // clear after animation
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      {/* Zone 1: Left Community Sidebar */}
      <LeftSidebar />

      {/* Zone 2: Main Feed Container */}
      <div className="flex-1 flex flex-col relative min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>

      {/* Zone 3: Right Context Panel */}
      <AnimatePresence>
        {isRightPanelOpen && (
          <RightPanel onClose={closeRightPanel}>
            {rightPanelContent}
          </RightPanel>
        )}
      </AnimatePresence>

      {/* Global Compose Modal */}
      <ComposeModal />
    </div>
  );
}
