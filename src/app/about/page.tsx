"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen selection:bg-[var(--accent-amber)] selection:text-white overflow-x-hidden relative">
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-start">
          <Link href="/">
            <motion.button 
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[#bef321] transition-colors"
            >
              <ArrowLeft size={14} />
              Home
            </motion.button>
          </Link>
        </div>
      </header>

      {/* STORYTELLING SECTION */}
      <section className="relative px-6 py-32 md:py-64 max-w-5xl mx-auto space-y-48">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7b2ff7]/5 to-transparent pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center text-center space-y-8 relative"
        >
          {/* Stats in Whitespace */}
          <div className="hidden lg:block absolute -left-48 top-0 text-left space-y-2 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#bef321]">Node Count</p>
            <p className="text-2xl font-black">420</p>
            <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Verified Builders</p>
          </div>
          
          <div className="hidden lg:block absolute -right-48 bottom-0 text-right space-y-2 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#00e5ff]">Capital Signal</p>
            <p className="text-2xl font-black">₹1.5 Cr+</p>
            <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Collective Velocity</p>
          </div>

          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#bef321]">Our Story</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.1] font-[family-name:var(--font-serif)]" style={{ fontFamily: "'Fraunces', serif" }}>
            Startups were never meant <br />
            <span className="text-[var(--text-muted)]">to be built alone.</span>
          </h1>
          <div className="w-px h-24 bg-gradient-to-b from-[#bef321] to-transparent"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-2xl md:text-4xl text-[var(--text-secondary)] leading-relaxed font-[family-name:var(--font-serif)] italic text-center">
            "We built FoundersCult for ambitious people creating something real."
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 pt-24 border-t border-[var(--border-color)]/30">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-black">The Vision</p>
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
              In a world of noise, we curate the signal. FoundersCult is where high-growth intelligence meets true builder camaraderie.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-black">The Node</p>
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
              Every node in our network is a human first. A bridge between code and capital, between vision and velocity.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-48 text-center"
        >
          <h3 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)]" style={{ fontFamily: "'Fraunces', serif" }}>
            The arena is yours. <br />
            <span className="text-[#00e5ff]">The cult is waiting.</span>
          </h3>
          
          <div className="mt-24">
            <Link href="/#login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#bef321] text-black font-black px-12 py-5 rounded-full text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(190,243,33,0.3)] transition-all"
              >
                Join the Network
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="py-12 border-t border-[var(--border-color)]/20 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">© 2026 Founders Cult • High Signal Intelligence</p>
      </footer>
    </div>
  );
}
