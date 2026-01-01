"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useInView, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Menu, X, Heart, ShieldCheck, Star, Users, Play, Lock, Copy, Check, UserPlus, LayoutDashboard, ArrowRight, MessageCircle, Award, Globe, Quote, Target, Rocket
} from "lucide-react";

// --- Specialized UI Components ---

const Button = ({ children, className, variant = "primary", ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-full font-bold transition-all active:scale-95 disabled:opacity-50";
  const variants: any = {
    primary: "bg-purple-600 text-white hover:bg-purple-700 shadow-xl shadow-purple-500/20",
    outline: "border border-neutral-200 text-neutral-900 hover:bg-neutral-50",
    ghost: "text-neutral-600 hover:bg-neutral-50",
    link: "text-purple-600 hover:underline px-0"
  };
  const sizes: any = { md: "h-11 px-6 text-sm", lg: "h-16 px-10 text-lg" };
  return <button className={`${base} ${variants[variant]} ${sizes.md} ${className}`} {...props}>{children}</button>;
};

const Badge = ({ children, className }: any) => (
  <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold border border-neutral-200 bg-white shadow-sm ${className}`}>
    {children}
  </span>
);

const SectionWrapper = ({ children, id }: { children: React.ReactNode; id: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  return (
    <motion.section id={id} ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative"
    >{children}</motion.section>
  );
};

// --- Main Page ---

export default function FourxclubLanding() {
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = ["home", "about", "course", "dashboard", "discord"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && (window.scrollY + 200) >= el.offsetTop && (window.scrollY + 200) < (el.offsetTop + el.offsetHeight)) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
  };

  return (
    <div className="bg-white text-neutral-900 selection:bg-purple-100">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-purple-600 z-[60] origin-left" style={{ scaleX }} />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'} px-6`}>
        <div className={`max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md border border-black/5 rounded-2xl px-6 py-3 ${scrolled ? 'shadow-xl' : ''}`}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold tracking-tighter">FOURXCLUB</span>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-neutral-100 p-1 rounded-full">
            {["Home", "About", "Course", "Dashboard", "Discord"].map((item) => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())}
                className={`relative px-5 py-2 text-sm font-bold rounded-full transition-all ${activeSection === item.toLowerCase() ? "text-purple-600" : "text-neutral-500 hover:text-neutral-900"}`}>
                {activeSection === item.toLowerCase() && <motion.div layoutId="nav-bg" className="absolute inset-0 bg-white rounded-full shadow-sm -z-10" />}
                {item}
              </button>
            ))}
          </div>
          <Button onClick={() => scrollToSection('dashboard')} className="px-8">Start Trading</Button>
        </div>
      </nav>

      <main>
        {/* HOME SECTION */}
        <SectionWrapper id="home">
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
            <Badge><Heart className="w-3 h-3 mr-2 fill-purple-600" /> COMMUNITY-FIRST COLLECTIVE</Badge>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] mt-8">TRADE WITH <br /> <span className="text-purple-600">HUMANITY.</span></h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-500 font-medium mt-8">Real humans, real alpha, real wealth. Join the club that prioritizes your growth.</p>
            <div className="flex gap-4 mt-12"><Button className="h-16 px-10 text-lg" onClick={() => scrollToSection('course')}>Unlock Your Edge</Button></div>
          </div>
        </SectionWrapper>

        {/* ADDITIONAL SECTIONS (About, Course, etc. follow the same SectionWrapper pattern) */}
        <SectionWrapper id="about">
           <div className="py-32 bg-white text-center container mx-auto px-4">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter">OUR STORY</h2>
              <p className="text-xl text-neutral-500 max-w-3xl mx-auto mt-8 font-medium">Built by traders who were tired of fake gurus. We bring institutional intelligence to the retail community.</p>
           </div>
        </SectionWrapper>

        {/* ... Include Course, Dashboard, and Discord sections here following the continuity pattern ... */}
      </main>

      <footer className="py-20 border-t border-neutral-100 text-center">
         <div className="flex justify-center items-center gap-2 mb-4"><TrendingUp className="w-6 h-6 text-purple-600" /><span className="text-xl font-bold tracking-tighter">FOURXCLUB</span></div>
         <p className="text-neutral-400 text-sm font-bold">© 2024 FOURXCLUB. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}