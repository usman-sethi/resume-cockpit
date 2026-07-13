import { useState, useRef, useEffect, MouseEvent } from "react";
import { Sparkles, FileText, CheckCircle2, Award, Zap, Download, ShieldCheck, ArrowRight, Star, Layers, HelpCircle, BarChart3, ArrowUpRight, Menu, X } from "lucide-react";
import { motion } from "motion/react";
import gsap from "gsap";
import ShapeGrid from "../../components/ShapeGrid";
import Lightfall from "./Lightfall";
import Orb from "./Orb";
import LaptopMockup from "./LaptopMockup";
import { CustomUserButton, CustomSignInButton, useCustomUser, IS_CLERK_ENABLED } from "../../components/ClerkAuthWrapper";



interface LandingPageProps {
  onStart: () => void;
  onSelectTemplate: (templateId: any) => void;
}

export default function LandingPage({ onStart, onSelectTemplate }: LandingPageProps) {
  const { isSignedIn } = useCustomUser();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!testimonialsRef.current) return;

    const cards = testimonialsRef.current.querySelectorAll(".testimonial-card");

    // 1. Entrance animation (Scroll Trigger via IntersectionObserver)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              cards,
              { opacity: 0, y: 50, scale: 0.95 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
                overwrite: "auto",
              }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(testimonialsRef.current);

    // 2. Interactive 3D tilt + hover effect for each card (Desktop only for touch safety)
    const listeners: Array<{ card: HTMLElement; move: any; leave: any }> = [];

    if (window.innerWidth >= 768) {
      cards.forEach((cardElement) => {
        const card = cardElement as HTMLElement;
        
        const moveHandler = (e: globalThis.MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((centerY - y) / centerY) * 8;
          const rotateY = ((x - centerX) / centerX) * 8;

          gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            scale: 1.03,
            boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
            borderColor: "rgba(59, 130, 246, 0.4)",
            backgroundColor: "rgba(30, 41, 59, 0.8)",
            duration: 0.3,
            ease: "power2.out",
          });
        };

        const leaveHandler = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            boxShadow: "none",
            borderColor: "rgba(51, 65, 85, 0.5)",
            backgroundColor: "rgba(30, 41, 59, 0.5)",
            duration: 0.5,
            ease: "power2.out",
          });
        };

        card.addEventListener("mousemove", moveHandler);
        card.addEventListener("mouseleave", leaveHandler);
        listeners.push({ card, move: moveHandler, leave: leaveHandler });
      });
    }

    return () => {
      observer.disconnect();
      listeners.forEach(({ card, move, leave }) => {
        card.removeEventListener("mousemove", move);
        card.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  const handleApplyPromo = () => {
    if (promoInput.trim().toLowerCase() === "sethi is best") {
      setIsPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid secret code.");
      setIsPromoApplied(false);
    }
  };

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Lead Product Designer at Apple",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
      quote: "The interface feels like it was designed by Apple. I filled out the smart form, and the AI generated high-impact bullet points in standard STAR format. I got a job offer at Stripe 3 weeks later!",
      rating: 5,
    },
    {
      name: "Marcus Chen",
      role: "Senior Engineering Manager at Google",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
      quote: "As a hiring manager, I see hundreds of resumes. The templates produced by this builder are strictly ATS-optimized and extremely polished. It completely eliminates unnecessary clutter.",
      rating: 5,
    },
    {
      name: "Eléna Rostova",
      role: "VP of Product at Linear",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
      quote: "It's like having a premium career coach in your browser. The job-matching analytics helped me custom-tailor my resume keywords with absolute precision.",
      rating: 5,
    },
  ];

  const templates = [
    { id: "modern", name: "Modern Professional", desc: "Left sidebar with elegant visual timeline accents.", tag: "Most Popular" },
    { id: "harvard", name: "Harvard Elite", desc: "Classic serif formatting used by top global institutions.", tag: "Executive" },
    { id: "minimal", name: "Cosmic Slate", desc: "Ultra-clean layout utilizing generous negative space.", tag: "ATS-Safe" },
    { id: "google", name: "Google Tech", desc: "Crisp grid system designed for engineers and PMs.", tag: "Developer" },
  ];

  const faqs = [
    {
      q: "What makes this builder different from typical editors?",
      a: "Traditional tools force you to manually format, align, and write every single sentence. Our AI-first platform guides you through an intelligent step-by-step form and generates fully complete, high-impact bullet points and profiles customized exactly to your target job role.",
    },
    {
      q: "Is it strictly ATS-optimized?",
      a: "Yes. All of our 12 premium templates are built using single-column, highly scannable grid layouts with standard section headings. They bypass complex columns, non-standard visual bars, and text boxes that fail typical ATS parsers.",
    },
    {
      q: "Can I customize the generated resume?",
      a: "Absolutely. Once generated, you can use our responsive dual-panel live editor to modify any section, add custom items, change templates instantly, and use real-time AI tools to shorten, expand, or adjust tones.",
    },
    {
      q: "How does the Job Matching feature work?",
      a: "Simply paste the target job description into the matching panel. Our server-side Gemini API instantly analyzes key matches, flags missing technologies, highlights grammar scores, and calculates a percentage readiness score.",
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* HEADER NAVIGATION */}
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/assets/image.jpg" 
              alt="AI Resume Builder Logo" 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl object-cover shadow-md shadow-slate-200"
              referrerPolicy="no-referrer"
            />
            <span className="font-extrabold text-sm sm:text-base md:text-lg bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight truncate max-w-[140px] sm:max-w-none">
              AI Resume Builder
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#templates" className="hover:text-blue-600 transition-colors">Templates</a>
            <a href="#ats" className="hover:text-blue-600 transition-colors">ATS Checker</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          </nav>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Only Buttons */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              {!isSignedIn && (
                <CustomSignInButton>
                  <button className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer px-2.5 sm:px-3.5 py-2 rounded-lg hover:bg-slate-50">
                    Sign In
                  </button>
                </CustomSignInButton>
              )}

              <button
                onClick={onStart}
                className="group flex items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-md shadow-slate-950/10 hover:shadow-blue-600/25 cursor-pointer"
              >
                Create Resume
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {isSignedIn && (
              <CustomUserButton />
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 md:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-6 py-5 flex flex-col gap-4 shadow-xl"
          >
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-2 px-3 rounded-xl transition-all"
            >
              Features
            </a>
            <a 
              href="#templates" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-2 px-3 rounded-xl transition-all"
            >
              Templates
            </a>
            <a 
              href="#ats" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-2 px-3 rounded-xl transition-all"
            >
              ATS Checker
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-2 px-3 rounded-xl transition-all"
            >
              Pricing
            </a>
            
            <div className="h-[1px] bg-slate-100 my-1"></div>

            {/* Small screen sign in and CTA */}
            <div className="flex flex-col gap-3 pt-1">
              {!isSignedIn ? (
                <>
                  <CustomSignInButton>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer py-3 rounded-xl"
                    >
                      Sign In
                    </button>
                  </CustomSignInButton>
                  <button
                    onClick={() => { onStart(); setMobileMenuOpen(false); }}
                    className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> Create Resume Free
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { onStart(); setMobileMenuOpen(false); }}
                  className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Go to Cockpit Dashboard
                </button>
              )}
            </div>
          </motion.div>
        )}
      </header>

      {/* HERO SECTION */}
      <section
        className="relative pt-20 pb-24 overflow-hidden group/hero"
      >
        {/* Animated Background Grid & Gradients */}
        <div className="absolute inset-0 flex items-center justify-center opacity-65 pointer-events-none overflow-hidden z-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.93, filter: "blur(2px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ width: '1080px', height: '1080px', position: 'relative' }}
            className="flex-shrink-0"
          >
            <ShapeGrid
              speed={0.4}
              squareSize={40}
              direction="diagonal"
              borderColor="#cbd5e1"
              hoverFillColor="#7C3AED"
              shape="square"
              hoverTrailAmount={6}
            />
          </motion.div>
        </div>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-400 to-indigo-300 rounded-full blur-[120px] opacity-20 z-0 animate-pulse"></div>

        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10 transition-transform duration-700 ease-out group-hover/hero:scale-[1.005]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold tracking-wider uppercase shadow-sm transition-all duration-300 hover:scale-105 hover:bg-blue-100 hover:border-blue-200">
            <Zap className="w-3.5 h-3.5 animate-bounce" /> Next-Gen Resume Architect
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] max-w-4xl mx-auto transition-transform duration-500 hover:scale-[1.01]">
            Build Resumes that Get You Interviewed at{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-xs">
              Stripe, Linear & Vercel
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed transition-colors duration-500 group-hover/hero:text-slate-700">
            Stop struggling with spacing and layout. Our enterprise-grade AI-first Resume Builder generates ATS-optimized, high-impact profiles in seconds.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={onStart}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-102"
            >
              <Sparkles className="w-5 h-5" /> Start Generating for Free
            </button>
            <a
              href="#templates"
              className="w-full sm:w-auto border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:border-slate-400 hover:-translate-y-0.5 hover:scale-102"
            >
              Explore 12 Templates
            </a>
          </div>

          {/* Premium Laptop POV interactive presentation */}
          <LaptopMockup />

          {/* Social Proof */}
          <div className="pt-12 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors duration-500 group-hover/hero:text-slate-500">TRUSTED BY ALUMNI FROM TOP GLOBAL COMPANIES</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40 grayscale contrast-200 transition-all duration-500 group-hover/hero:opacity-60 group-hover/hero:contrast-150">
              <span className="text-sm font-extrabold tracking-tight hover:scale-110 hover:text-slate-900 transition-all duration-300 cursor-pointer">STRIPE</span>
              <span className="text-sm font-extrabold tracking-tight hover:scale-110 hover:text-slate-900 transition-all duration-300 cursor-pointer">LINEAR</span>
              <span className="text-sm font-extrabold tracking-tight hover:scale-110 hover:text-slate-900 transition-all duration-300 cursor-pointer">VERCEL</span>
              <span className="text-sm font-extrabold tracking-tight hover:scale-110 hover:text-slate-900 transition-all duration-300 cursor-pointer">NOTION</span>
              <span className="text-sm font-extrabold tracking-tight hover:scale-110 hover:text-slate-900 transition-all duration-300 cursor-pointer">APPLE</span>
            </div>
          </div>
        </div>
      </section>

      {/* THREE-CARD HERO HIGHLIGHT */}
      <section className="py-12 bg-white border-y border-slate-200/60" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:border-blue-400/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 ease-out space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">AI-First Smart Wizard</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Skip the complicated forms. Fill out a beautiful, responsive 12-step questionnaire. AI parses, analyzes, and drafts cohesive professional outlines instantly.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:border-indigo-400/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 ease-out space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Real-Time Scoring & Charts</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive instant structural diagnostics. Get a comprehensive score breakdown spanning content impact, design metrics, keyword density, and grammar accuracy.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:border-purple-400/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500 ease-out space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">ATS Matching Optimizer</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Paste any target job description. AI analyzes keyword density, flags missing technical skills, and optimizes bullet points with high-impact action verbs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEMPLATE SHOWCASE */}
      <section className="py-24" id="templates">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">12 Premium ATS-Compliant Templates</h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Designed according to recruiting industry standards. Instant style switching with zero impact on underlying resume content.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl.id)}
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-500 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      {tmpl.tag}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{tmpl.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tmpl.desc}</p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-600">
                  <span className="group-hover:underline font-semibold">Select Design</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Single Page</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-70 z-0">
          <div className="w-[600px] h-[600px] md:w-[750px] md:h-[750px] relative">
            <Orb
              hoverIntensity={2}
              rotateOnHover={true}
              hue={0}
              forceHoverState={false}
              backgroundColor="#000000"
            />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 space-y-16 relative z-10" ref={testimonialsRef}>
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Elite Approval</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Approved by Elite Professionals
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Discover why top engineers, product leaders, and designers trust our automated architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ perspective: "1500px" }}>
            {testimonials.map((test, idx) => (
              <div 
                key={idx} 
                className="testimonial-card bg-slate-900/60 border border-slate-800/40 rounded-2xl p-8 space-y-6 flex flex-col justify-between transition-all relative overflow-hidden backdrop-blur-md cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Ambient glow decoration behind card content */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-4 relative z-10">
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(test.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                  </div>
                  <p className="text-slate-200 text-sm md:text-base leading-relaxed italic font-light">
                    "{test.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t border-slate-800/80 pt-5 relative z-10">
                  <img src={test.image} alt={test.name} className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/30 shadow-md" />
                  <div>
                    <h4 className="font-bold text-sm text-white leading-tight">{test.name}</h4>
                    <p className="text-xs text-indigo-400 font-medium mt-0.5">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION (Dummy but fully formed SaaS layout) */}
      <section className="py-24 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              No hidden contracts. Access complete professional generation features, unlimited templates, and deep ATS matching.
            </p>

            {/* Secret Code Input */}
            <div className="pt-4 max-w-md mx-auto">
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl border focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <input
                  type="text"
                  placeholder="Enter secret code (e.g. sethi is best)..."
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-slate-800"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black rounded-lg transition-all cursor-pointer"
                >
                  Apply Code
                </button>
              </div>
              {isPromoApplied && (
                <p className="text-xs text-emerald-600 font-extrabold mt-2 animate-bounce">
                  🎉 Code Applied! "sethi is best" active. Enjoy 100% lifetime premium discount!
                </p>
              )}
              {promoError && (
                <p className="text-xs text-rose-500 font-medium mt-2">
                  ❌ {promoError}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="border border-slate-200 rounded-2xl p-8 bg-slate-50/50 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800">Basic Draft</h3>
                  <p className="text-xs text-slate-500 mt-1">For immediate, quick resume outline</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-slate-900">$0</span>
                  <span className="text-xs text-slate-500 ml-1">forever</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 border-t pt-4">
                  <li className="flex items-center gap-2">✔️ 1 Active Resume Draft</li>
                  <li className="flex items-center gap-2">✔️ Access to Minimalist Template</li>
                  <li className="flex items-center gap-2">✔️ Basic Section Formatting</li>
                  <li className="flex items-center gap-2 text-slate-400">❌ Live AI Suggestions</li>
                  <li className="flex items-center gap-2 text-slate-400">❌ Complete Cover Letters</li>
                </ul>
              </div>
              <button onClick={onStart} className="w-full mt-8 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
                Start for Free
              </button>
            </div>

            {/* Pro */}
            <div className="border-2 border-blue-600 rounded-2xl p-8 bg-white relative flex flex-col justify-between shadow-lg shadow-blue-100">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800">Pro Professional</h3>
                  <p className="text-xs text-slate-500 mt-1">Complete suite for serious applicants</p>
                </div>
                <div className="flex items-baseline">
                  {isPromoApplied ? (
                    <>
                      <span className="text-4xl font-black text-emerald-600">$0</span>
                      <span className="text-xs text-slate-400 line-through ml-2">$19</span>
                      <span className="text-[10px] text-emerald-600 font-bold ml-2">Lifetime Free</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-slate-900">$19</span>
                      <span className="text-xs text-slate-500 ml-1">/ month</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 text-xs text-slate-600 border-t pt-4">
                  <li className="flex items-center gap-2">✔️ Unlimited Resumes</li>
                  <li className="flex items-center gap-2">✔️ Access to all 12 Premium Templates</li>
                  <li className="flex items-center gap-2">✔️ Unlimited AI Generated Profiles</li>
                  <li className="flex items-center gap-2">✔️ Direct ATS Checker scoring & feedback</li>
                  <li className="flex items-center gap-2">✔️ Customized Cover Letter drafting</li>
                </ul>
              </div>
              <button onClick={onStart} className={`w-full mt-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                isPromoApplied 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
              }`}>
                {isPromoApplied ? "Claim Sethi Premium Free Access" : "Unlock Pro Access"}
              </button>
            </div>

            {/* Enterprise */}
            <div className="border border-slate-200 rounded-2xl p-8 bg-slate-50/50 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800">Enterprise Elite</h3>
                  <p className="text-xs text-slate-500 mt-1">For corporate teams and agencies</p>
                </div>
                <div className="flex items-baseline">
                  {isPromoApplied ? (
                    <>
                      <span className="text-4xl font-black text-emerald-600">$0</span>
                      <span className="text-xs text-slate-400 line-through ml-2">$49</span>
                      <span className="text-[10px] text-emerald-600 font-bold ml-2">Lifetime Free</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-slate-900">$49</span>
                      <span className="text-xs text-slate-500 ml-1">/ month</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 text-xs text-slate-600 border-t pt-4">
                  <li className="flex items-center gap-2">✔️ Everything in Pro plan</li>
                  <li className="flex items-center gap-2">✔️ Team collaboration seats</li>
                  <li className="flex items-center gap-2">✔️ Custom corporate templates</li>
                  <li className="flex items-center gap-2">✔️ Dedicated Account Manager</li>
                  <li className="flex items-center gap-2">✔️ Higher token caps</li>
                </ul>
              </div>
              <button onClick={onStart} className={`w-full mt-8 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isPromoApplied
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-800 hover:bg-slate-900 text-white"
              }`}>
                {isPromoApplied ? "Claim Sethi Enterprise Free Access" : "Contact Enterprise"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-sm">Everything you need to know about our resume platform.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left font-bold text-sm md:text-base text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <HelpCircle className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-slate-950 text-white text-center relative overflow-hidden border-t border-slate-900">
        <div style={{ width: '100%', height: '600px', position: 'relative' }}>
          <Lightfall
            colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
            backgroundColor="#0A29FF"
            speed={0.5}
            streakCount={2}
            streakWidth={1}
            streakLength={1}
            glow={1}
            density={0.6}
            twinkle={1}
            zoom={3}
            backgroundGlow={0.5}
            opacity={1}
            mouseInteraction
            mouseStrength={0.5}
            mouseRadius={1}
            color1="#A6C8FF"
            color2="#5227FF"
            color3="#FF9FFC"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] z-0"></div>
          
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="max-w-5xl mx-auto px-6 space-y-12">
              <div className="space-y-6 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-350">
                  Ready to Land Your Dream Tech Job?
                </h2>
                <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                  Create an outstanding, premium resume backed by our expert system and advanced server-side Gemini intelligence.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onStart}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 cursor-pointer"
                  >
                    Start Building My Resume
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/image.jpg" 
              alt="AI Resume Builder Logo" 
              className="w-8 h-8 rounded-lg object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="text-white font-bold tracking-tight">AI Resume Builder</span>
          </div>
          <p className="text-xs">© 2026 AI Resume Builder. All rights reserved. Built with pure craftsmanship.</p>
          <div className="flex gap-6 text-xs font-semibold">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
