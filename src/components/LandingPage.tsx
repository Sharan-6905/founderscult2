"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, Rocket, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { login } from '@/app/auth/login/actions';

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const WhatsappIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.553 4.189 1.606 6.06L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.631 0 12.026-5.396 12.029-12.03.002-3.218-1.252-6.244-3.528-8.52z"/>
  </svg>
);

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6533-.2455-1.2743-.5415-1.8749-.8836a.0776.0776 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2914a.077.077 0 01-.0066.1277 12.2986 12.2986 0 01-1.8749.8836.0761.0761 0 00-.0416.1057c.36.699.7715 1.3638 1.226 1.9942a.0775.0775 0 00.0842.0276c1.9593-.6066 3.9479-1.5218 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
  </svg>
);

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404z"/>
  </svg>
);

export default function LandingPage({ error: initialError, message }: { error?: string, message?: string }) {
  const [isPending, setIsPending] = React.useState(false);
  const error = initialError;

  const handleLogin = async (formData: FormData) => {
    setIsPending(true);
    try {
      await login(formData);
    } catch (err) {
      // Next.js redirect throws an error, which is caught here
      // If it's not a redirect, we'd handle it, but login() always redirects
      setIsPending(false);
    }
  };

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
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50, damping: 20 } }
  };

  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-amber)] selection:text-white overflow-hidden relative bg-grid-dots">
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
      
      {/* GLOBAL GLOWS */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#7b2ff7]/5 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-[#bef321]/5 rounded-full blur-[150px] animate-pulse-slow pointer-events-none"></div>
      
      {/* SOCIAL HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-end">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-[var(--bg-elevated-1)]/40 backdrop-blur-md border border-[var(--border-color)] px-4 py-3 rounded-2xl pointer-events-auto shadow-2xl"
          >
            {[
              { icon: LinkedinIcon, href: 'https://www.linkedin.com/company/founderscult/', label: 'LinkedIn', color: 'hover:text-[#0077b5]' },
              { icon: DiscordIcon, href: 'https://discord.gg/yRVjHHJX3', label: 'Discord', color: 'hover:text-[#5865F2]' },
              { icon: WhatsappIcon, href: 'https://chat.whatsapp.com/FrGV76OPyerGMw5MtOVQaB?mode=gi_t', label: 'WhatsApp', color: 'hover:text-[#25D366]' },
              { icon: XIcon, href: '#', label: 'X', color: 'hover:text-white' },
            ].map((social, idx) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`text-[var(--text-muted)] transition-colors ${social.color}`}
                aria-label={social.label}
              >
                <social.icon size={20} />
              </motion.a>
            ))}
            <div className="w-px h-4 bg-[var(--border-color)] mx-2" />
            <Link href="/about" className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[#bef321] transition-colors">
              About
            </Link>
          </motion.div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center z-10"
        >
          <div className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-logo)] text-6xl md:text-9xl text-[var(--text-primary)] tracking-tight">founders</span>
            <span className="font-[family-name:var(--font-sans)] font-black text-4xl md:text-7xl bg-gradient-to-r from-[#bef321] via-[#00e5ff] to-[#7b2ff7] bg-clip-text text-transparent italic">CULT</span>
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
            className="w-[1px] h-32 bg-gradient-to-b from-[var(--text-muted)] via-[#bef321] to-transparent"
          />
        </motion.div>
      </section>

      {/* STORYTELLING SECTION */}
      <section id="our-story" className="relative px-6 py-24 md:py-32 max-w-5xl mx-auto space-y-48">
        {/* Connective Thread */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#bef321] via-[var(--border-color)] to-[#7b2ff7] opacity-20 -z-10"></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7b2ff7]/5 to-transparent pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
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
          <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1] font-[family-name:var(--font-serif)]" style={{ fontFamily: "'Fraunces', serif" }}>
            Startups were never meant <br />
            <span className="text-[var(--text-muted)]">to be built alone.</span>
          </h2>
          <div className="w-px h-24 bg-gradient-to-b from-[#bef321] to-transparent"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <p className="text-xl md:text-3xl text-[var(--text-secondary)] leading-relaxed font-[family-name:var(--font-serif)] italic text-center">
            "We built FoundersCult for ambitious people creating something real."
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 pt-24 border-t border-[var(--border-color)]/30">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-sm uppercase tracking-widest text-[var(--text-muted)] font-black">The Vision</p>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              In a world of noise, we curate the signal. FoundersCult is where high-growth intelligence meets true builder camaraderie.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-sm uppercase tracking-widest text-[var(--text-muted)] font-black">The Node</p>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              Every node in our network is a human first. A bridge between code and capital, between vision and velocity.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-32 text-center"
        >
          <h3 className="text-2xl md:text-4xl font-black tracking-tight text-[var(--text-primary)]" style={{ fontFamily: "'Fraunces', serif" }}>
            The arena is yours. <br />
            <span className="text-[#00e5ff]">The cult is waiting.</span>
          </h3>
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
            { icon: Users, title: 'Find Co-Founders', desc: 'Connect with driven builders who complement your skills.', pos: '0%' },
            { icon: Zap, title: 'Ship Faster', desc: 'Get immediate feedback on your MVPs from a premium audience.', pos: '50%' },
            { icon: Rocket, title: 'Raise Capital', desc: 'Network directly with indie-friendly angels and VCs.', pos: '100%' }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-[var(--bg-elevated-1)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl relative overflow-hidden group flex flex-col h-full"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-amber)]/5 rounded-full blur-3xl group-hover:bg-[var(--accent-amber)]/20 transition-colors duration-500 pointer-events-none"></div>
              
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated-2)] border border-[var(--border-color)] flex items-center justify-center mb-8 group-hover:border-[var(--accent-amber)]/50 transition-colors">
                <feature.icon className="text-[var(--accent-amber)]" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-[family-name:var(--font-serif)] text-[var(--text-primary)]">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed font-[family-name:var(--font-sans)] text-base mb-8">{feature.desc}</p>
              
              <div className="mt-auto relative overflow-hidden rounded-2xl border border-[var(--border-color)] aspect-[16/10]">
                <img 
                  src="/feature-strip.png" 
                  alt={feature.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  style={{ objectPosition: `${feature.pos} center` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* LOGIN SECTION */}
      <section id="login" className="min-h-screen w-full flex items-center justify-center py-24 px-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 100, rotateX: -10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring" as const, stiffness: 40, damping: 20 }}
          className="w-full max-w-md bg-[var(--bg-elevated-1)] p-10 rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl relative"
        >
          {/* Decorative background blur inside card */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--accent-amber)] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
          
          <div className="flex items-baseline gap-1 justify-center mb-10 relative z-10">
            <span className="font-[family-name:var(--font-logo)] text-4xl text-[var(--text-primary)]">founders</span>
            <span className="font-[family-name:var(--font-sans)] font-black text-xl bg-gradient-to-r from-[#bef321] via-[#00e5ff] to-[#7b2ff7] bg-clip-text text-transparent italic">CULT</span>
          </div>

          <form action={handleLogin} className="space-y-6 relative z-10 font-[family-name:var(--font-sans)]">
            
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

            <div className={isPending ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
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
              <div className="mt-6">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 ml-1">Password</label>
                <input 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  required
                  className="w-full bg-[var(--bg-elevated-2)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-amber)] focus:ring-1 focus:ring-[var(--accent-amber)] transition-all placeholder:text-[var(--text-muted)]"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-8">
              <button 
                disabled={isPending}
                className="w-full bg-[var(--accent-amber)] hover:bg-[var(--accent-gold)] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-lg shadow-[var(--accent-amber)]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Connecting to Node...
                  </>
                ) : (
                  <>
                    Continue to Cult
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
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

