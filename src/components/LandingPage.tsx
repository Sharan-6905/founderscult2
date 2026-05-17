"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Loader2, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { login, signInWithGoogle } from '@/app/auth/login/actions';

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404z"/>
  </svg>
);

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
  </svg>
);

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function LandingPage({ error: initialError, message }: { error?: string, message?: string }) {
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    status: 'Work',
    interests: '',
    building_details: '',
    linkedin: '',
    twitter: '',
    instagram: ''
  });
  
  const error = initialError;
  const { scrollYProgress } = useScroll();
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    // Scroll slightly to the form
    document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    
    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, value);
    });

    try {
      await login(submissionData);
    } catch (err) {
      setIsPending(false);
    }
  };

  const cinematicTransition = { duration: 1.4, ease: [0.16, 1, 0.3, 1] as any };

  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)] font-sans selection:bg-[var(--text-primary)] selection:text-[var(--bg-base)] overflow-hidden relative">
      <div className="absolute inset-0 bg-noise z-0"></div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 pointer-events-none mix-blend-difference">
        <div className="max-w-[1400px] mx-auto flex justify-between items-start">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...cinematicTransition, delay: 0.2 }}
            className="flex items-baseline gap-1 pointer-events-auto"
          >
            <span className="text-xl md:text-2xl text-[var(--text-primary)] tracking-tight">
              <span className="font-[family-name:var(--font-serif)] italic font-light">Founders</span>
              <span className="font-sans font-black uppercase tracking-[0.1em] text-[0.7em] ml-1">Cult</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)] ml-1 mb-1"></span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...cinematicTransition, delay: 0.4 }}
            className="flex items-center gap-6 pointer-events-auto"
          >
            <Link href="/about" className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Manifesto
            </Link>
            <a href="#login" className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-primary)] border-b border-[var(--text-primary)] pb-0.5 hover:opacity-70 transition-opacity">
              Apply
            </a>
          </motion.div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="min-h-[100svh] w-full flex flex-col justify-end px-6 pb-24 md:pb-32 relative z-10">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-12">
          <motion.div style={{ opacity: opacityFade }} className="max-w-4xl space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...cinematicTransition, delay: 0.6 }}
              className="text-5xl md:text-8xl lg:text-[10rem] leading-[0.9] font-medium tracking-tight font-[family-name:var(--font-serif)]"
            >
              Refuse <br/>
              <span className="italic text-[var(--text-secondary)]">average.</span>
            </motion.h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...cinematicTransition, delay: 1 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-t border-[var(--border-color)] pt-8"
          >
            <p className="text-lg md:text-xl text-[var(--text-secondary)] font-light max-w-md">
              An exclusive network for ambitious builders. Startups were never meant to be built alone.
            </p>
            <div className="flex gap-6 items-center pt-2">
               <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#0a66c2] hover:drop-shadow-[0_0_15px_rgba(10,102,194,0.7)] transition-all duration-300">
                 <LinkedinIcon size={24} />
               </a>
               <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] transition-all duration-300">
                 <XIcon size={22} />
               </a>
               <a href="https://discord.com" target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#5865F2] hover:drop-shadow-[0_0_15px_rgba(88,101,242,0.7)] transition-all duration-300">
                 <DiscordIcon size={24} />
               </a>
               <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#25D366] hover:drop-shadow-[0_0_15px_rgba(37,211,102,0.7)] transition-all duration-300">
                 <WhatsAppIcon size={24} />
               </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ONBOARDING SECTION */}
      <section id="login" className="py-32 md:py-48 px-6 relative z-10 border-t border-[var(--border-color)] bg-[var(--bg-elevated-1)] min-h-screen flex items-center">
        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-start">
          
          <div className="space-y-12 sticky top-32">
            <motion.div 
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={cinematicTransition}
              className="space-y-8"
            >
              <h2 className="text-5xl md:text-7xl font-[family-name:var(--font-serif)] leading-[1.1] tracking-tight">
                {step === 1 ? <>The arena <br/><span className="italic text-[var(--text-secondary)]">is yours.</span></> : <>Tell us <br/><span className="italic text-[var(--text-secondary)]">your story.</span></>}
              </h2>
              <p className="text-xl text-[var(--text-secondary)] font-light max-w-sm leading-relaxed">
                {step === 1 
                  ? "Enter the network. We'll start with your basic credentials to secure your node."
                  : "Help us understand your journey. We curate our collective to ensure maximum density of intelligence."}
              </p>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className={`w-12 h-1 rounded-full transition-all duration-700 ${step === 1 ? 'bg-[var(--text-primary)] w-24' : 'bg-[var(--border-color)]'}`}></div>
              <div className={`w-12 h-1 rounded-full transition-all duration-700 ${step === 2 ? 'bg-[var(--text-primary)] w-24' : 'bg-[var(--border-color)]'}`}></div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...cinematicTransition, delay: 0.5 }}
              className="pt-24 max-w-sm"
            >
              <div className="text-4xl text-[var(--text-muted)] font-[family-name:var(--font-serif)] leading-none mb-2">"</div>
              <p className="text-lg md:text-xl text-[var(--text-secondary)] italic font-[family-name:var(--font-serif)] leading-relaxed">
                If you want to walk fast, walk alone.
                <br />
                But if you want to walk far, walk together.
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-6">
                — Ratan Tata
              </p>
            </motion.div>
          </div>

          <div className="w-full max-w-lg ml-auto bg-[var(--bg-base)] border border-[var(--border-color)] rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--text-muted)] to-transparent opacity-20"></div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={cinematicTransition}
                  onSubmit={handleNext} 
                  className="space-y-10"
                >
                  <div className="space-y-8">
                    <div className="relative group">
                      <input 
                        type="email" required placeholder=" " value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="block w-full bg-transparent border-0 border-b border-[var(--border-color)] py-4 text-[var(--text-primary)] focus:ring-0 focus:border-[var(--text-primary)] transition-all peer placeholder-transparent"
                      />
                      <label className="absolute left-0 top-4 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:-top-6 peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[9px]">
                        Email Address
                      </label>
                    </div>

                    <div className="relative group">
                      <input 
                        type="password" required placeholder=" " value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="block w-full bg-transparent border-0 border-b border-[var(--border-color)] py-4 text-[var(--text-primary)] focus:ring-0 focus:border-[var(--text-primary)] transition-all peer placeholder-transparent"
                      />
                      <label className="absolute left-0 top-4 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:-top-6 peer-focus:text-[9px] peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[9px]">
                        Choose Password
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="w-full flex items-center justify-between group py-4 border-t border-[var(--border-color)] mt-12 hover:border-[var(--text-primary)] transition-all">
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Continue to Profile</span>
                    <div className="w-12 h-12 rounded-full border border-[var(--border-color)] flex items-center justify-center group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-base)] transition-all">
                      <ArrowRight size={18} />
                    </div>
                  </button>
                  
                  <div className="pt-6 flex items-center justify-center gap-4">
                    <div className="h-px bg-[var(--border-color)] flex-1"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">OR</span>
                    <div className="h-px bg-[var(--border-color)] flex-1"></div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => signInWithGoogle()}
                    className="w-full flex items-center justify-center gap-4 py-4 border border-[var(--border-color)] rounded-2xl hover:border-[var(--text-primary)] transition-all bg-[var(--bg-elevated-1)] hover:bg-[var(--bg-elevated-2)] group shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform duration-300">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">Continue with Google</span>
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={cinematicTransition}
                  onSubmit={handleFinalSubmit} 
                  className="space-y-10"
                >
                  <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4">
                    <ArrowLeft size={12} /> Back
                  </button>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="relative group col-span-2">
                      <input 
                        type="text" required placeholder=" " value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="block w-full bg-transparent border-0 border-b border-[var(--border-color)] py-4 text-[var(--text-primary)] focus:ring-0 focus:border-[var(--text-primary)] transition-all peer placeholder-transparent"
                      />
                      <label className="absolute left-0 top-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:-top-6 peer-[:not(:placeholder-shown)]:-top-6">
                        Phone Number
                      </label>
                    </div>

                    <div className="relative group">
                      <input 
                        type="number" required placeholder=" " value={formData.age}
                        onChange={e => setFormData({...formData, age: e.target.value})}
                        className="block w-full bg-transparent border-0 border-b border-[var(--border-color)] py-4 text-[var(--text-primary)] focus:ring-0 focus:border-[var(--text-primary)] transition-all peer placeholder-transparent"
                      />
                      <label className="absolute left-0 top-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:-top-6 peer-[:not(:placeholder-shown)]:-top-6">
                        Age
                      </label>
                    </div>

                    <div className="relative group">
                      <select 
                        required value={formData.gender}
                        onChange={e => setFormData({...formData, gender: e.target.value})}
                        className="block w-full bg-transparent border-0 border-b border-[var(--border-color)] py-4 text-[var(--text-primary)] focus:ring-0 focus:border-[var(--text-primary)] transition-all"
                      >
                        <option value="" className="bg-[var(--bg-base)]">Sex</option>
                        <option value="Male" className="bg-[var(--bg-base)]">Male</option>
                        <option value="Female" className="bg-[var(--bg-base)]">Female</option>
                        <option value="Other" className="bg-[var(--bg-base)]">Other</option>
                      </select>
                    </div>

                    <div className="relative group col-span-2">
                      <select 
                        required value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="block w-full bg-transparent border-0 border-b border-[var(--border-color)] py-4 text-[var(--text-primary)] focus:ring-0 focus:border-[var(--text-primary)] transition-all"
                      >
                        <option value="Work" className="bg-[var(--bg-base)]">Work</option>
                        <option value="College" className="bg-[var(--bg-base)]">College</option>
                        <option value="School" className="bg-[var(--bg-base)]">School</option>
                      </select>
                    </div>

                    <div className="relative group col-span-2">
                      <textarea 
                        required placeholder=" " value={formData.interests}
                        onChange={e => setFormData({...formData, interests: e.target.value})}
                        className="block w-full bg-transparent border-0 border-b border-[var(--border-color)] py-4 text-[var(--text-primary)] focus:ring-0 focus:border-[var(--text-primary)] transition-all peer placeholder-transparent resize-none h-20"
                      />
                      <label className="absolute left-0 top-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:-top-6 peer-[:not(:placeholder-shown)]:-top-6">
                        Interests (e.g. AI, SaaS, Web3)
                      </label>
                    </div>

                    <div className="relative group col-span-2">
                      <textarea 
                        required placeholder=" " value={formData.building_details}
                        onChange={e => setFormData({...formData, building_details: e.target.value})}
                        className="block w-full bg-transparent border-0 border-b border-[var(--border-color)] py-4 text-[var(--text-primary)] focus:ring-0 focus:border-[var(--text-primary)] transition-all peer placeholder-transparent resize-none h-24"
                      />
                      <label className="absolute left-0 top-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:-top-6 peer-[:not(:placeholder-shown)]:-top-6">
                        What are you trying to build?
                      </label>
                    </div>

                    <div className="col-span-2 space-y-4 pt-4">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Social Signals</span>
                      <div className="grid grid-cols-3 gap-4">
                         <input placeholder="LinkedIn" className="bg-transparent border border-[var(--border-color)] rounded-xl p-3 text-[10px] focus:border-[var(--text-primary)] outline-none" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
                         <input placeholder="X (Twitter)" className="bg-transparent border border-[var(--border-color)] rounded-xl p-3 text-[10px] focus:border-[var(--text-primary)] outline-none" value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} />
                         <input placeholder="Instagram" className="bg-transparent border border-[var(--border-color)] rounded-xl p-3 text-[10px] focus:border-[var(--text-primary)] outline-none" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <button disabled={isPending} type="submit" className="w-full flex items-center justify-between group py-4 border-t border-[var(--border-color)] mt-12 hover:border-[var(--text-primary)] transition-all">
                    <span className="text-xs font-black uppercase tracking-[0.2em]">
                      {isPending ? 'Syncing Network' : 'Initialize Node'}
                    </span>
                    <div className="w-12 h-12 rounded-full border border-[var(--border-color)] flex items-center justify-center group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-base)] transition-all">
                      {isPending ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    </div>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

    </div>
  );
}
