"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Loader2, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { login } from '@/app/auth/login/actions';

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
            <div className="flex gap-4">
               <LinkedinIcon />
               <XIcon />
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
