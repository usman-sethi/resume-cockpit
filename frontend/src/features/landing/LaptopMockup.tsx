import React from "react";
import { motion } from "motion/react";
import { Sparkles, CheckCircle2, ShieldCheck, Mail, Phone, MapPin, Briefcase, GraduationCap } from "lucide-react";
import ShapeGrid from "../../components/ShapeGrid";

export default function LaptopMockup() {
  const skillsList = ["TypeScript", "Go", "Spanner", "Kubernetes", "gRPC", "Kafka"];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 relative">
      {/* LAPTOP PRESENTATION */}
      <div className="relative group/laptop">
        {/* Outer ambient glow behind laptop */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 rounded-3xl blur-2xl opacity-75 group-hover/laptop:opacity-100 transition-opacity duration-1000" />

        {/* The Laptop Container */}
        <div className="relative mx-auto w-full max-w-4xl">
          {/* LAPTOP SCREEN (LID) */}
          <div className="relative bg-slate-950 border-[6px] border-slate-900 rounded-t-2xl shadow-2xl overflow-hidden aspect-[16/10] flex flex-col">
            {/* Top camera bead */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-800 rounded-full z-30 flex items-center justify-center">
              <div className="w-0.5 h-0.5 bg-blue-500 rounded-full" />
            </div>

            {/* Screen Header / Browser Bar (Clean & Mockup) */}
            <div className="bg-slate-900/90 backdrop-blur px-4 py-2 flex items-center justify-between border-b border-slate-800 shrink-0 z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="text-[10px] font-mono text-slate-400 select-none">
                Interactive Resume Blueprint
              </div>
              <div className="w-12"></div>
            </div>

            {/* SCREEN VIEWPORT CONTENT */}
            <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6 bg-slate-950 overflow-hidden text-slate-200">
              {/* ELEGANT ANIMATED GRID BACKGROUND INSIDE THE SCREEN (FULL COVERAGE) */}
              <div className="absolute inset-0 opacity-40 pointer-events-none z-0">
                <ShapeGrid
                  speed={0.3}
                  squareSize={28}
                  direction="diagonal"
                  borderColor="rgba(51, 65, 85, 0.25)"
                  hoverFillColor="rgba(59, 130, 246, 0.15)"
                  shape="square"
                  hoverTrailAmount={4}
                />
              </div>

              {/* CENTERED STUNNING HIGH-FIDELITY RESUME DOCUMENT PREVIEW */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-2xl bg-white text-slate-900 rounded-xl p-4 sm:p-6 shadow-2xl overflow-y-auto max-h-full border border-slate-100 flex flex-col justify-between"
              >
                {/* Resume Header */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">Johnathan Doe</h2>
                      <p className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-widest mt-0.5">Staff Software Engineer</p>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> johnathan.doe@gmail.com</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> +1 (555) 019-2834</span>
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-xs text-slate-600 leading-relaxed italic mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                    "Result-driven engineering practitioner with deep experience crafting resilient distributed microservices, low-latency APIs, and modern automated workflows optimized for enterprise scale."
                  </p>
                </div>

                {/* Resume Body */}
                <div className="space-y-4 flex-1">
                  {/* Experience */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-800 border-b pb-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Professional Experience
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-baseline text-[10px] sm:text-xs font-semibold text-slate-900">
                          <span>Lead Systems Engineer — <span className="font-normal italic text-slate-500">Tech Dynamics</span></span>
                          <span className="font-mono text-[9px] text-slate-400">2023 - Present</span>
                        </div>
                        <ul className="text-[9px] sm:text-[10px] text-slate-600 space-y-1 mt-1 list-disc pl-4 leading-relaxed">
                          <li>
                            Optimized distributed database operations by migrating legacy pipelines onto highly concurrent microservices, improving cluster replication efficiency.
                          </li>
                          <li>
                            Configured automated canary testing models across cloud instances, cutting production regression cycles significantly.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-800 border-b pb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Technical Expertise
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skillsList.map((skill, sIdx) => (
                        <span 
                          key={sIdx} 
                          className="text-[9px] sm:text-[10px] px-2.5 py-1 rounded-md font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/20 transition-all"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer security badge */}
                <div className="border-t mt-4 pt-3 flex justify-between items-center text-[8px] sm:text-[9px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> ATS COMPLIANT & VERIFIED
                  </span>
                  <span>SECURE PDF DIGEST: SHA-256</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* LAPTOP KEYBOARD BASE */}
          <div className="relative bg-slate-800 h-3.5 w-[104%] -ml-[2%] rounded-b-2xl shadow-xl border-t border-slate-700/80 z-20">
            {/* Keyboard hinge connection */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-slate-900" />
            
            {/* Trackpad notch */}
            <div className="w-24 h-1.5 bg-slate-900/60 mx-auto rounded-b border-x border-b border-slate-700/40" />
            
            {/* Bottom rubber foot reflection */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[98%] h-1.5 bg-slate-900/50 rounded-b-full blur-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
