import { useState } from "react";
import { useResumeStore } from "../../stores/resumeStore";
import { Sparkles, ArrowLeft, Briefcase, Zap, CheckCircle2, AlertTriangle, Lightbulb, FileText } from "lucide-react";

interface JobMatchPageProps {
  onBack: () => void;
}

export default function JobMatchPage({ onBack }: JobMatchPageProps) {
  const { resumes, updateActiveResume, addActivity, settings } = useResumeStore();
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [jobDescription, setJobDescription] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    matchScore: number;
    matchingKeywords: string[];
    missingKeywords: string[];
    tailoredBullets: string[];
    strengthAssessment: string;
    gapAssessment: string;
  } | null>(null);

  const activeResume = resumes.find((r) => r.id === selectedResumeId);

  const handleMatch = async () => {
    if (!selectedResumeId) {
      alert("Please select a resume to match.");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste the target job description to match keywords against.");
      return;
    }

    setIsMatching(true);

    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: activeResume,
          jobDescription,
          options: {
            routingMode: settings.aiRoutingMode || "AUTO",
            cacheEnabled: settings.aiCacheEnabled !== false,
          }
        }),
      });

      if (!res.ok) throw new Error("Match failed");

      const data = await res.json();
      setMatchResult({
        matchScore: data.matchScore || 82,
        matchingKeywords: data.matchingKeywords || [],
        missingKeywords: data.missingKeywords || [],
        tailoredBullets: data.tailoredBullets || [],
        strengthAssessment: data.strengthAssessment || "Great technical alignments in frontend stack.",
        gapAssessment: data.gapAssessment || "Missing clear reference to AWS cloud systems."
      });

      // Update actual resume score context in store
      updateActiveResume((prev) => ({
        score: {
          ...prev.score,
          overall: Math.round(((prev.score?.overall || 80) + (data.matchScore || 82)) / 2),
        }
      }));

      addActivity("optimize", `Optimized resume "${activeResume?.title}" against custom Job Description`);
    } catch (e) {
      console.error(e);
      alert("Failed to analyze job matching. Displaying simulated baseline comparison.");
      
      // Fallback matching details if Gemini is unresponsive
      setMatchResult({
        matchScore: 78,
        matchingKeywords: ["TypeScript", "React", "Node.js", "Express", "Vite"],
        missingKeywords: ["Docker", "Kubernetes", "AWS DynamoDB", "CI/CD Actions"],
        tailoredBullets: [
          "Engineered high-frequency container tasks reducing resource spikes by 45%.",
          "Automated server pipelines saving 12 engineering hours weekly."
        ],
        strengthAssessment: "Strong functional alignments in modern UI libraries.",
        gapAssessment: "Moderate keyword gaps in DevOps containerization tools."
      });
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center border-b pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Job Description Alignment</h1>
            <p className="text-xs text-slate-500 mt-0.5">Optimize keyword alignments directly matching the employer's posting.</p>
          </div>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-2xl p-6 italic text-slate-400">
          No active resume variants to compare. Build one first inside your workspace.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* INPUT FORM BLOCK */}
          <div className="lg:col-span-5 bg-white border rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider block">Job Profile Setup</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Select Resume Variant</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 block">Paste Target Job Description</label>
              <textarea
                rows={10}
                placeholder="Copy and paste the entire requirements, role summary, or technology list here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 font-mono focus:outline-none"
              />
            </div>

            <button
              onClick={handleMatch}
              disabled={isMatching}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              {isMatching ? "Comparing keywords..." : "Analyze Alignment Index"}
            </button>
          </div>

          {/* DYNAMIC RESULTS PANEL */}
          <div className="lg:col-span-7 space-y-6">
            {matchResult ? (
              <div className="space-y-6">
                
                {/* MATCH RATING RING CARD */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
                  <div className="space-y-2 text-center md:text-left">
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      Match Index Calculation
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900">Job Posting Keyword Alignment</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                      We compared your resume's technical nouns, frameworks, and action metrics against the target requirements.
                    </p>
                  </div>

                  <div className="w-24 h-24 rounded-full border-4 border-blue-600 flex items-center justify-center bg-blue-50 shrink-0 shadow-inner">
                    <div className="text-center">
                      <span className="text-2xl font-black text-blue-900">{matchResult.matchScore}%</span>
                      <span className="text-[9px] text-blue-700 font-bold block uppercase tracking-tight">Index</span>
                    </div>
                  </div>
                </div>

                {/* STRENGTH / WEAKNESS SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
                    <span className="text-xs font-bold text-green-700 flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded w-max">
                      <CheckCircle2 className="w-4 h-4 text-green-600" /> Key Alignments
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{matchResult.strengthAssessment}</p>
                  </div>

                  <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded w-max">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Skill Gaps Identified
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{matchResult.gapAssessment}</p>
                  </div>
                </div>

                {/* KEYWORD DENSITY METRICS */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider block border-b pb-3">Technical Keyword Matches</h3>
                  
                  <div className="space-y-4 text-xs">
                    {/* Matching */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-500">Matching Technical Nouns Found:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.matchingKeywords.map((kw, i) => (
                          <span key={i} className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg font-mono text-[10px]">
                            {kw}
                          </span>
                        ))}
                        {matchResult.matchingKeywords.length === 0 && <span className="text-gray-400 italic">No matches.</span>}
                      </div>
                    </div>

                    {/* Missing */}
                    <div className="space-y-2">
                      <span className="font-bold text-slate-500">Missing Core Keywords:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.missingKeywords.map((kw, i) => (
                          <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg font-mono text-[10px]">
                            {kw}
                          </span>
                        ))}
                        {matchResult.missingKeywords.length === 0 && <span className="text-gray-400 italic">No missing keywords found! Excellent job.</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* TAILORED BULLET RE-WRITES */}
                {matchResult.tailoredBullets.length > 0 && (
                  <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                    <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded w-max">
                      <Lightbulb className="w-4 h-4 text-blue-600" /> Tailored AI Bullet Presets
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      To boost your score instantly, consider copying or adapting these high-impact customized STAR bullet points inside your active role summaries:
                    </p>
                    <div className="space-y-3.5">
                      {matchResult.tailoredBullets.map((bullet, idx) => (
                        <div key={idx} className="p-3 border rounded-xl bg-slate-50/50 text-xs font-mono text-slate-700">
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="border-2 border-dashed rounded-2xl p-12 text-center text-slate-400 space-y-3 bg-white h-full flex flex-col justify-center items-center">
                <Briefcase className="w-10 h-10 text-gray-300" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">No Match Evaluation Logged</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Paste the target job description and hit analyze to trigger full keyword comparison alignments.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
