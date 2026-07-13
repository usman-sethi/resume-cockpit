import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  BarChart3, 
  Wand2, 
  Send, 
  Terminal, 
  ArrowRight,
  TrendingUp,
  Sliders,
  FileText,
  ShieldCheck,
  Briefcase,
  Layers,
  Search
} from "lucide-react";
import ShapeGrid from "../../components/ShapeGrid";

export default function LaptopMockup() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "editor">("dashboard");
  const [promptText, setPromptText] = useState("");
  const [aiLogs, setAiLogs] = useState<string[]>([
    "System ready. Awaiting prompt optimization request...",
  ]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [atsScore, setAtsScore] = useState(72);
  const [skillsList, setSkillsList] = useState<string[]>([
    "TypeScript", "Go", "Spanner", "Kubernetes", "gRPC", "Kafka"
  ]);
  const [addedSkills, setAddedSkills] = useState<string[]>([]);
  const [currentOptimizedRole, setCurrentOptimizedRole] = useState("Software Engineer");

  // Prevent scroll when fullscreen is active
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullScreen]);

  const handleSimulateAiOptimize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isAiProcessing) return;

    setIsAiProcessing(true);
    setAiLogs(prev => [...prev, `> Querying Gemini-3.5-Flash: "Optimize for ${promptText}"...`]);

    // Simulate stepping of AI processing for premium UX
    setTimeout(() => {
      setAiLogs(prev => [...prev, `> Parsing skills gap from target job description...`]);
    }, 800);

    setTimeout(() => {
      setAiLogs(prev => [...prev, `> Recommended skills found: TypeScript, Go, Spanner, Kubernetes, gRPC, Kafka`]);
    }, 1600);

    setTimeout(() => {
      setAiLogs(prev => [...prev, `> Restructuring career accomplishments with STAR method...`]);
      setAddedSkills(["TypeScript", "Go", "Spanner", "Kubernetes", "gRPC", "Kafka"]);
      setAtsScore(98);
      setCurrentOptimizedRole(promptText);
    }, 2400);

    setTimeout(() => {
      setAiLogs(prev => [...prev, `🎉 Optimization complete! ATS match score boosted to 98%.`]);
      setIsAiProcessing(false);
      setPromptText("");
    }, 3200);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 relative">
      {/* LAPTOP PRESENTATION */}
      <div className="relative group/laptop">
        {/* Outer ambient glow behind laptop */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-75 group-hover/laptop:opacity-100 transition-opacity duration-1000" />

        {/* The Laptop Container */}
        <div className="relative mx-auto w-full max-w-4xl">
          {/* LAPTOP SCREEN (LID) */}
          <div className="relative bg-slate-950 border-[6px] border-slate-900 rounded-t-2xl shadow-2xl overflow-hidden aspect-[16/10] flex flex-col">
            {/* Top camera bead */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-800 rounded-full z-30 flex items-center justify-center">
              <div className="w-0.5 h-0.5 bg-blue-500 rounded-full" />
            </div>

            {/* Screen Header / Browser Bar */}
            <div className="bg-slate-900/90 backdrop-blur px-4 py-2 flex items-center justify-between border-b border-slate-800 shrink-0 z-10">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>

              {/* Address bar mockup */}
              <div className="bg-slate-950/60 text-[10px] text-slate-400 font-mono px-6 py-0.5 rounded-md border border-slate-800/80 w-1/2 text-center truncate">
                https://ai.resume.architect/cockpit
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setIsFullScreen(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors bg-slate-800 px-2 py-0.5 rounded border border-slate-700/80 cursor-pointer"
                title="Enter Immersive POV Full Screen"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Full Screen</span>
              </button>
            </div>

            {/* SCREEN VIEWPORT CONTENT */}
            <div className="flex-1 relative flex overflow-hidden bg-slate-950 text-slate-200">
              {/* ELEGANT ANIMATED GRID BACKGROUND INSIDE THE SCREEN */}
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

              {/* Sidebar Navigation inside Laptop */}
              <div className="w-40 border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col justify-between p-3 shrink-0 text-[11px] font-medium text-slate-400">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1 text-white">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="font-bold tracking-tight text-[11px]">Cockpit Console</span>
                  </div>
                  
                  <div className="space-y-1">
                    <button 
                      onClick={() => setActiveTab("dashboard")}
                      className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-left transition-all ${activeTab === "dashboard" ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "hover:bg-slate-900"}`}
                    >
                      <Sliders className="w-3.5 h-3.5" /> Dashboard
                    </button>
                    <button 
                      onClick={() => setActiveTab("editor")}
                      className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-left transition-all ${activeTab === "editor" ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "hover:bg-slate-900"}`}
                    >
                      <FileText className="w-3.5 h-3.5" /> Resume Editor
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-xl text-[9px] text-slate-500">
                  <span className="font-bold text-slate-400 block mb-0.5">STATUS</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Gemini Connected</span>
                  </div>
                </div>
              </div>

              {/* Workspace display area */}
              <div className="flex-1 overflow-hidden z-10 flex flex-col p-4 relative">
                <AnimatePresence mode="wait">
                  {activeTab === "dashboard" ? (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 flex flex-col gap-3 overflow-y-auto"
                    >
                      {/* Dashboard Mockup Grid */}
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="bg-slate-900/75 border border-slate-800/80 p-2.5 rounded-xl backdrop-blur-md">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Resumes</span>
                          <span className="block text-lg font-black text-white mt-0.5">3 Drafts</span>
                        </div>
                        <div className="bg-slate-900/75 border border-slate-800/80 p-2.5 rounded-xl backdrop-blur-md">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Avg ATS Score</span>
                          <span className="block text-lg font-black text-emerald-400 mt-0.5">92%</span>
                        </div>
                        <div className="bg-slate-900/75 border border-slate-800/80 p-2.5 rounded-xl backdrop-blur-md">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Integrations</span>
                          <span className="block text-lg font-black text-blue-400 mt-0.5">Active</span>
                        </div>
                      </div>

                      {/* Main Chart and Checklist mockup */}
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        {/* Interactive prompt optimizer block */}
                        <div className="bg-slate-900/75 border border-slate-800/80 p-3 rounded-xl backdrop-blur-md flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-blue-400 font-bold tracking-wider uppercase block">AI Job Aligner</span>
                            <h4 className="text-[11px] font-black text-white">Target Dream Tech Companies</h4>
                            <p className="text-[9px] text-slate-400 leading-relaxed">
                              Simulate entering a target role below to watch the resume optimize live inside this mockup viewport.
                            </p>
                          </div>

                          <form onSubmit={handleSimulateAiOptimize} className="mt-3 flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                            <input
                              type="text"
                              value={promptText}
                              onChange={(e) => setPromptText(e.target.value)}
                              placeholder="e.g. Stripe Engineer"
                              className="flex-1 bg-transparent px-2 py-1 text-[9px] text-white placeholder-slate-600 focus:outline-none"
                            />
                            <button
                              type="submit"
                              disabled={isAiProcessing}
                              className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded transition-colors cursor-pointer"
                            >
                              <Wand2 className="w-3 h-3" />
                            </button>
                          </form>
                        </div>

                        {/* Live telemetry/output logs inside laptop mockup */}
                        <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl font-mono text-[8px] text-slate-300 space-y-1 overflow-y-auto flex flex-col">
                          <span className="text-[9px] font-bold text-purple-400 border-b border-slate-800 pb-1 mb-1 block">ENGINE LOGS</span>
                          <div className="flex-1 space-y-1">
                            {aiLogs.slice(-4).map((log, i) => (
                              <p key={i} className="leading-tight text-slate-300">
                                {log}
                              </p>
                            ))}
                            {isAiProcessing && (
                              <div className="flex items-center gap-1.5 text-blue-400 mt-1">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                                <span>Generating resume layout...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="editor"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 flex gap-3 overflow-hidden"
                    >
                      {/* Left: resume sections simulator */}
                      <div className="w-1/2 bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl space-y-2 overflow-y-auto">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase">Resume Sections</span>
                        <div className="space-y-1.5">
                          <div className="p-1.5 bg-slate-950/80 border border-slate-800/80 rounded-lg text-[9px]">
                            <span className="font-extrabold text-white block">Profile Summary</span>
                            <span className="text-[8px] text-slate-400 line-clamp-2">Experienced {currentOptimizedRole} focusing on backend pipelines...</span>
                          </div>
                          <div className="p-1.5 bg-slate-950/80 border border-slate-800/80 rounded-lg text-[9px] flex justify-between items-center">
                            <div>
                              <span className="font-extrabold text-white block">Key Technologies</span>
                              <span className="text-[8px] text-slate-400">TypeScript, Go, Spanner...</span>
                            </div>
                            <span className="text-[8px] bg-blue-900/50 text-blue-300 px-1 rounded font-bold">STAR</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Preview Page mockup with matching indicators */}
                      <div className="flex-1 bg-white text-slate-900 p-3 rounded-xl flex flex-col justify-between overflow-hidden shadow-inner">
                        <div className="space-y-2">
                          <div className="border-b pb-1.5">
                            <span className="text-[12px] font-black block tracking-tight leading-tight text-slate-800">Johnathan Doe</span>
                            <span className="text-[8px] font-medium text-slate-500 uppercase tracking-widest">{currentOptimizedRole}</span>
                          </div>

                          <div className="space-y-1 text-[7px] text-slate-600">
                            <span className="font-bold text-slate-900 block text-[8px]">Work Experience</span>
                            <p className="leading-tight">
                              • Managed distributed gRPC architectures using Go to streamline transactional databases.
                            </p>
                            <p className="leading-tight">
                              • Deployed high-throughput event streaming via Kafka onto Kubernetes microservices.
                            </p>
                          </div>

                          {/* Dynamic Skills Grid Mockup */}
                          <div className="space-y-1 pt-1 border-t">
                            <span className="font-bold text-slate-900 block text-[7px]">Technical Competencies</span>
                            <div className="flex flex-wrap gap-1">
                              {skillsList.map((skill, sIdx) => {
                                const isAdded = addedSkills.includes(skill);
                                return (
                                  <span 
                                    key={sIdx} 
                                    className={`text-[6.5px] px-1 rounded font-bold transition-all duration-500 ${
                                      isAdded 
                                        ? "bg-emerald-100 text-emerald-800 scale-105 border border-emerald-300" 
                                        : "bg-slate-100 text-slate-700 border border-slate-200"
                                    }`}
                                  >
                                    {skill}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Quick dynamic score meter inside mockup */}
                        <div className="bg-slate-50 border p-1.5 rounded-lg flex items-center justify-between text-[8px] font-bold">
                          <span className="text-slate-600 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> ATS Audit Status
                          </span>
                          <span className={`px-1.5 py-0.5 rounded ${atsScore >= 90 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                            {atsScore}% Match
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

      {/* IMMERSIVE CINEMATIC FULL SCREEN OVERLAY */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-slate-950 z-50 overflow-hidden flex flex-col p-6 font-sans selection:bg-blue-600 text-white"
          >
            {/* Full Screen drifting background */}
            <div className="absolute inset-0 opacity-25 pointer-events-none z-0">
              <ShapeGrid
                speed={0.25}
                squareSize={45}
                direction="diagonal"
                borderColor="rgba(255, 255, 255, 0.08)"
                hoverFillColor="rgba(59, 130, 246, 0.25)"
                shape="square"
                hoverTrailAmount={6}
              />
            </div>

            {/* Immersive overlay header bar */}
            <div className="relative z-10 flex justify-between items-center border-b border-slate-800/80 pb-4 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                    AI Resume Architect <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">Immersive POV</span>
                  </h3>
                  <p className="text-xs text-slate-400">Cinematic playground visualizing real-time Spanner & Gemini-3.5 telemetry</p>
                </div>
              </div>

              <button
                onClick={() => setIsFullScreen(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-all bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-800"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Exit POV Mode</span>
              </button>
            </div>

            {/* Immersive Workspace splits */}
            <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
              
              {/* Left Column: Gemini Prompt controller (3 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
                {/* Introduction info */}
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                    <Zap className="w-3 h-3" /> Real-time Simulation
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Dynamic AI Alignment</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Type a dream target role (like <strong>"Stripe Engineer"</strong>, <strong>"Vercel PM"</strong>, or <strong>"Apple Designer"</strong>). 
                    Watch how Gemini maps required skills gaps, adjusts text scores, and restructures bullet formatting on the fly.
                  </p>
                </div>

                {/* Simulated Form */}
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md space-y-4">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Target Job Optimizer</span>
                  
                  <form onSubmit={handleSimulateAiOptimize} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-bold block">Desired Job Title</label>
                      <input
                        type="text"
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="e.g. Stripe Backend Engineer"
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isAiProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Wand2 className="w-4 h-4" />
                      {isAiProcessing ? "Optimizing Layout..." : "Align and Build"}
                    </button>
                  </form>
                </div>

                {/* Live engine logs feedback */}
                <div className="flex-1 bg-slate-950 border border-slate-800/80 p-4 rounded-2xl font-mono text-[10px] text-slate-300 flex flex-col overflow-hidden min-h-[150px]">
                  <span className="text-[11px] font-extrabold text-purple-400 pb-2 border-b border-slate-800/80 mb-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> telemetry_logs.sh
                  </span>
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {aiLogs.map((log, i) => (
                      <p key={i} className="leading-relaxed">
                        {log}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle Column: Resume Live Preview (6 cols) */}
              <div className="lg:col-span-6 bg-white text-slate-900 rounded-3xl p-8 flex flex-col justify-between overflow-y-auto shadow-2xl relative">
                {/* Resume Header */}
                <div className="space-y-4 border-b pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight text-slate-900">Johnathan Doe</h1>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{currentOptimizedRole}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-mono space-y-0.5">
                      <p>johnathan.doe@gmail.com</p>
                      <p>+1 (555) 019-2834</p>
                      <p>linkedin.com/in/johnathan-doe</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "A result-driven technical practitioner with deep experience crafting resilient distributed backend frameworks, highly responsive full-stack interfaces, and modern workflow automation pipelines optimized for enterprise scale."
                  </p>
                </div>

                {/* Resume Body sections */}
                <div className="flex-1 py-6 space-y-6">
                  {/* Experience Section */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b pb-1">Professional Accomplishments</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-baseline text-xs">
                          <strong className="text-slate-800">Lead Systems Engineer at Tech Dynamics</strong>
                          <span className="text-slate-500 font-mono text-[10px]">2023 - Present</span>
                        </div>
                        <ul className="text-xs text-slate-600 space-y-1.5 mt-2 list-disc pl-4 leading-relaxed">
                          <li>
                            Optimized distributed database operations by migrating transaction managers onto a unified <span className="font-semibold text-slate-800">Go</span> microservice, improving cluster replication efficiency.
                          </li>
                          <li>
                            Engineered transactional state recovery mechanisms using a multi-node <span className="font-semibold text-slate-800">Spanner</span> deployment to prevent multi-region sync failures.
                          </li>
                          <li>
                            Configured automated canary testing models across <span className="font-semibold text-slate-800">Kubernetes</span> pods, cutting production regression cycles significantly.
                          </li>
                        </ul>
                      </div>

                      <div>
                        <div className="flex justify-between items-baseline text-xs">
                          <strong className="text-slate-800">Software Developer at Stripe</strong>
                          <span className="text-slate-500 font-mono text-[10px]">2021 - 2023</span>
                        </div>
                        <ul className="text-xs text-slate-600 space-y-1.5 mt-2 list-disc pl-4 leading-relaxed">
                          <li>
                            Designed responsive and clean web modules using <span className="font-semibold text-slate-800">TypeScript</span>, strictly enforcing type compliance.
                          </li>
                          <li>
                            Streamlined cross-service communications with low-latency <span className="font-semibold text-slate-800">gRPC</span> message serialization, replacing expensive REST calls.
                          </li>
                          <li>
                            Wrote highly concurrent event-driven processing consumers backed by <span className="font-semibold text-slate-800">Kafka</span> streaming clusters to catalog transaction ledgers.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b pb-1">Technical Skillsets</h2>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {skillsList.map((skill, sIdx) => {
                        const isAdded = addedSkills.includes(skill);
                        return (
                          <span 
                            key={sIdx} 
                            className={`text-xs px-3 py-1 rounded-lg font-bold transition-all duration-700 ${
                              isAdded 
                                ? "bg-emerald-100 text-emerald-800 scale-105 border border-emerald-300 ring-4 ring-emerald-500/10" 
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer note */}
                <div className="border-t pt-4 text-center text-[9px] font-mono text-slate-400">
                  SECURE PDF DIGEST: SHA-256 ATS OPTIMIZED & VERIFIED
                </div>
              </div>

              {/* Right Column: ATS Optimization Diagnostics (3 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
                {/* Matching score radial */}
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center text-center space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ATS Score Diagnostics</span>
                  
                  {/* Gauge Ring */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="58"
                        className="stroke-slate-800 fill-none"
                        strokeWidth="10"
                      />
                      <motion.circle
                        cx="72"
                        cy="72"
                        r="58"
                        className="stroke-blue-500 fill-none"
                        strokeWidth="10"
                        strokeDasharray="364.4"
                        initial={{ strokeDashoffset: 364.4 }}
                        animate={{ strokeDashoffset: 364.4 - (364.4 * atsScore) / 100 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-white">{atsScore}%</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Match Index</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {atsScore >= 90 
                      ? "Outstanding! Resume covers 100% of high-impact action keywords." 
                      : "Action required. Add key technologies (Go, Spanner, Kubernetes) to bypass enterprise ATS algorithms."}
                  </p>
                </div>

                {/* Skills analysis gap check */}
                <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md space-y-4 flex-1">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Required Keyword Gap Analysis</span>
                  
                  <div className="space-y-2.5">
                    {skillsList.map((skill, i) => {
                      const isAdded = addedSkills.includes(skill);
                      return (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="font-mono text-slate-300">{skill}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            isAdded ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {isAdded ? "Detected" : "Missing Gap"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
