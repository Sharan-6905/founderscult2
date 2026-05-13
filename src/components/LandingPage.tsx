"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, Rocket } from 'lucide-react';
import { login } from '@/app/auth/login/actions';

export default function LandingPage({ error, message }: { error?: string, message?: string }) {
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
  };

  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-amber)] selection:text-white overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center z-10"
        >
          <div className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-logo)] text-6xl md:text-8xl text-[var(--text-primary)] tracking-tight">founders</span>
            <span className="font-[family-name:var(--font-sans)] font-bold text-4xl md:text-6xl text-[var(--accent-amber)]">CULT</span>
          </div>
          <p className="mt-6 text-lg md:text-2xl text-[var(--text-secondary)] font-[family-name:var(--font-serif)] italic text-center px-4">
            The premium network for builders.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 flex flex-col items-center gap-4"
        >
          <span className="text-sm font-medium uppercase tracking-widest font-[family-name:var(--font-sans)] text-[var(--text-muted)]">Scroll to Explore</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-[1px] h-16 bg-gradient-to-b from-[var(--text-muted)] to-transparent"
          />
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="min-h-screen w-full flex items-center justify-center py-24 px-6 relative">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full z-10"
        >
          {[
            { icon: Users, title: 'Find Co-Founders', desc: 'Connect with driven builders who complement your skills.' },
            { icon: Zap, title: 'Ship Faster', desc: 'Get immediate feedback on your MVPs from a premium audience.' },
            { icon: Rocket, title: 'Raise Capital', desc: 'Network directly with indie-friendly angels and VCs.' }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-[var(--bg-elevated-1)] p-8 rounded-3xl border border-[var(--border-color)] shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-amber)]/5 rounded-full blur-3xl group-hover:bg-[var(--accent-amber)]/20 transition-colors duration-500 pointer-events-none"></div>
              
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated-2)] border border-[var(--border-color)] flex items-center justify-center mb-8 group-hover:border-[var(--accent-amber)]/50 transition-colors">
                <feature.icon className="text-[var(--accent-amber)]" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-[family-name:var(--font-serif)] text-[var(--text-primary)]">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed font-[family-name:var(--font-sans)] text-base">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* LOGIN SECTION */}
      <section className="min-h-screen w-full flex items-center justify-center py-24 px-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 100, rotateX: -10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 40, damping: 20 }}
          className="w-full max-w-md bg-[var(--bg-elevated-1)] p-10 rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl relative"
        >
          {/* Decorative background blur inside card */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--accent-amber)] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
          
          <div className="flex items-baseline gap-1 justify-center mb-10 relative z-10">
            <span className="font-[family-name:var(--font-logo)] text-4xl text-[var(--text-primary)]">founders</span>
            <span className="font-[family-name:var(--font-sans)] font-bold text-xl text-[var(--accent-amber)]">CULT</span>
          </div>

          <form action={login} className="space-y-6 relative z-10 font-[family-name:var(--font-sans)]">
            
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error === 'true' ? 'Invalid email or password' : decodeURIComponent(error)}
              </motion.div>
            )}

            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm text-center">
                {decodeURIComponent(message)}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 ml-1">Email Address</label>
              <input 
                name="email"
                type="email" 
                placeholder="founder@startup.com" 
                required
                className="w-full bg-[var(--bg-elevated-2)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-amber)] focus:ring-1 focus:ring-[var(--accent-amber)] transition-all placeholder:text-[var(--text-muted)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 ml-1">Password</label>
              <input 
                name="password"
                type="password" 
                placeholder="••••••••" 
                required
                className="w-full bg-[var(--bg-elevated-2)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-amber)] focus:ring-1 focus:ring-[var(--accent-amber)] transition-all placeholder:text-[var(--text-muted)]"
              />
            </div>
            
            <div className="flex flex-col gap-3 mt-8">
              <button 
                formAction={login}
                className="w-full bg-[var(--accent-amber)] hover:bg-[var(--accent-gold)] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-[var(--accent-amber)]/20"
              >
                Continue to Cult
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-8 font-[family-name:var(--font-sans)]">
            Don't have an invite? <a href="#" className="text-[var(--accent-teal)] hover:text-[var(--accent-amber)] transition-colors underline underline-offset-4 decoration-[var(--accent-teal)]/30 hover:decoration-[var(--accent-amber)]">Apply here</a>.
          </p>
        </motion.div>
      </section>

    </div>
  );
}
