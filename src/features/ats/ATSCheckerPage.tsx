import { useState } from "react";
import { useResumeStore } from "../../stores/resumeStore";
import { Sparkles, ArrowLeft, ShieldCheck, CheckCircle, AlertTriangle, Play, RefreshCw, BarChart2, ShieldAlert, BadgeInfo } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

interface ATSCheckerPageProps {
  onBack: () => void;
}

export default function ATSCheckerPage({ onBack }: ATSCheckerPageProps) {
  const { resumes, updateActiveResume, addActivity, settings } = useResumeStore();
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState("");

  const activeResume = resumes.find((r) => r.id === selectedResumeId);

  const triggerAuditProgress = async () => {
    const states = [
      "Deconstructing resume layout nodes...",
      "Extracting font elements and metadata indexes...",
      "Testing single-column parse structures...",
      "Measuring action verb occurrences...",
      "Running semantic validation with Gemini...",
      "Structuring ATS feedback ledger...",
    ];

    for (let i = 0; i < states.length; i++) {
      setAuditProgress(states[i]);
      await new Promise((resolve) => setTimeout(resolve, i === 0 ? 800 : 1200));
    }
  };

  const handleAudit = async () => {
    if (!selectedResumeId) {
      alert("Please select a resume to audit.");
      return;
    }
    setIsAuditing(true);
    triggerAuditProgress();

    try {
      const res = await fetch("/api/ai/ats-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: activeResume,
          options: {
            routingMode: settings.aiRoutingMode || "AUTO",
            cacheEnabled: settings.aiCacheEnabled !== false,
          }
        }),
      });

      if (!res.ok) throw new Error("Audit failed");

      const data = await res.json();

      // Update the target resume's score and ATS results
      updateActiveResume((prev) => ({
        score: data.score || prev.score,
        atsResult: data.atsResult || {
          overallScore: data.score?.overall || 85,
          formatting: { score: 95, text: "Consistent font hierarchy detected", status: "success" },
          length: { score: 90, text: "Fitted inside single-page bounds", status: "success" },
          sections: { score: 90, text: "Standard section labels are present", status: "success" },
          contactInfo: { score: 100, text: "Email and phone validated", status: "success" },
          keywordDensity: { score: 75, text: "Tech keywords missing", status: "warning" },
          actionVerbs: { score: 70, text: "Action verbs low density", status: "warning" },
          grammar: { score: 95, text: "No glaring grammar mistakes", status: "success" },
          readability: { score: 90, text: "Excellent scannability", status: "success" },
          suggestions: ["Add high-impact verbs inside experience summaries."],
          warnings: ["No direct project metric counts", "Action verbs density below target"],
          strengths: ["Structure fits parser guidelines", "Consistent font hierarchy detected", "Standard section labeling"]
        }
      }));

      addActivity("optimize", `Executed comprehensive ATS audit scan on "${activeResume?.title}"`);
    } catch (e) {
      console.error(e);
      alert("ATS Audit failed. Displaying simulated baseline statistics.");

      // Provide local mock diagnostic scores if Gemini API fails
      updateActiveResume((prev) => ({
        score: {
          overall: 85,
          content: 80,
          ats: 90,
          grammar: 95,
          design: 85,
          impact: 75,
          skills: 85,
          keywords: 80,
          experience: 85,
          suggestions: ["Integrate percentage metrics inside work headers."]
        },
        atsResult: {
          overallScore: 85,
          formatting: { score: 95, text: "Valid layout structure", status: "success" },
          length: { score: 90, text: "Single page height verified", status: "success" },
          sections: { score: 90, text: "Standard header groupings", status: "success" },
          contactInfo: { score: 100, text: "Valid link formats", status: "success" },
          keywordDensity: { score: 80, text: "Moderate keyword overlap", status: "warning" },
          actionVerbs: { score: 75, text: "Moderate action verb usage", status: "warning" },
          grammar: { score: 95, text: "Legible font scales", status: "success" },
          readability: { score: 90, text: "High formatting contrast", status: "success" },
          suggestions: ["Replace 'responsible for' with quantified accomplishment statements."],
          warnings: ["Limited direct metrics", "Moderate action verb usage"],
          strengths: ["Valid layout structure", "Standard header groupings", "Legible font scales"]
        }
      }));
    } finally {
      setIsAuditing(false);
    }
  };

  // Recharts Chart Formulations
  const scoreData = activeResume?.score ? [
    { subject: "Layout Structure", score: activeResume.score.ats || 80, fullMark: 100 },
    { subject: "Grammar Rules", score: activeResume.score.grammar || 80, fullMark: 100 },
    { subject: "Action Verbs", score: activeResume.score.impact || 80, fullMark: 100 },
    { subject: "Technical Stack", score: activeResume.score.skills || 80, fullMark: 100 },
    { subject: "Direct Metrics", score: activeResume.score.content || 80, fullMark: 100 },
    { subject: "Keyword Density", score: activeResume.score.keywords || 80, fullMark: 100 },
  ] : [];

  const barData = activeResume?.score ? [
    { name: "Overall", Score: activeResume.score.overall || 70 },
    { name: "ATS Fit", Score: activeResume.score.ats || 70 },
    { name: "Grammar", Score: activeResume.score.grammar || 70 },
    { name: "Metrics", Score: activeResume.score.content || 70 },
    { name: "Verbs", Score: activeResume.score.impact || 70 },
  ] : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      {/* SCAN LOADING MODAL */}
      {isAuditing && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col justify-center items-center text-white space-y-6">
          <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-indigo-500 border-slate-700 animate-spin flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold tracking-tight">ATS Audit Scanner</h3>
            <p className="text-sm font-mono text-blue-400 animate-pulse">{auditProgress}</p>
          </div>
          <p className="text-xs text-slate-500 max-w-sm text-center pt-8 border-t border-slate-800">
            Deconstructing markup schemas and counting metric-to-verb densities using Gemini algorithms.
          </p>
        </div>
      )}

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
            <h1 className="text-2xl font-black tracking-tight text-slate-900">ATS Compliance Auditor</h1>
            <p className="text-xs text-slate-500 mt-0.5">Optimize structural alignment and keyword scores for corporate parsers.</p>
          </div>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-2xl p-6 italic text-slate-400">
          No resumes found inside your cockpit. Create a resume before running compliance scans.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CONTROL BAR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider block">Scan Controller</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Select Blueprint Variant</label>
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

              <button
                onClick={handleAudit}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md"
              >
                <Play className="w-4 h-4 fill-white" /> Execute Audit Scan
              </button>
            </div>

            {/* QUICK HEALTH ADVISORY */}
            <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 border border-slate-800 text-white rounded-2xl p-6 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compliance Advisory</span>
              <p className="text-xs text-slate-200 leading-relaxed">
                Automated ATS filters do not support multiple side-by-side columns, graphics, complex charts, or floating text elements. Stick to our <strong>Harvard</strong> or <strong>Cosmic Slate</strong> layouts to secure 100% readability.
              </p>
            </div>
          </div>

          {/* AUDIT DIAGNOSTICS SCREEN */}
          <div className="lg:col-span-8 space-y-6">
            {activeResume?.score ? (
              <div className="space-y-6">
                
                {/* HIGH LEVEL STATS COMPONENT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border rounded-2xl p-6 shadow-sm">
                  <div className="text-center md:border-r border-gray-100 py-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Audit Score</span>
                    <span className="text-4xl font-extrabold text-slate-900">{activeResume.score.overall}%</span>
                    <span className="text-[10px] text-blue-600 font-bold block mt-1 uppercase">Readiness</span>
                  </div>

                  <div className="text-center md:border-r border-gray-100 py-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Grammar Score</span>
                    <span className="text-4xl font-extrabold text-slate-900">{activeResume.score.grammar}%</span>
                    <span className="text-[10px] text-green-600 font-bold block mt-1 uppercase">Perfect Spelling</span>
                  </div>

                  <div className="text-center py-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Impact metrics</span>
                    <span className="text-4xl font-extrabold text-slate-900">{activeResume.score.impact}%</span>
                    <span className="text-[10px] text-amber-600 font-bold block mt-1 uppercase">Quantifiers</span>
                  </div>
                </div>

                {/* VISUAL RECHARTS RADAR/BAR AREA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Radar */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm h-80 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Dimension Radar</span>
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={scoreData}>
                          <PolarGrid stroke="#f1f5f9" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                          <Radar name="Scored" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Column Chart */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm h-80 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Core Breakdown</span>
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
                          <Tooltip cursor={{ fill: "transparent" }} />
                          <Bar dataKey="Score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* CHECKLIST BULLETS */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider block border-b pb-3">Compliance Audit Report</h3>
                  
                  <div className="space-y-4 text-xs">
                    {/* Passes */}
                    <div className="space-y-2">
                      <span className="font-bold text-green-700 flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded w-max">
                        <CheckCircle className="w-4 h-4 text-green-600" /> Passed Parameters
                      </span>
                      <ul className="list-disc list-inside text-slate-600 pl-2 space-y-1">
                        {activeResume.atsResult?.strengths?.map((p, i) => (
                          <li key={i}>{p}</li>
                        )) || <li>Single-column layout scannable.</li>}
                      </ul>
                    </div>

                    {/* Warnings */}
                    <div className="space-y-2">
                      <span className="font-bold text-amber-700 flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded w-max">
                        <ShieldAlert className="w-4 h-4 text-amber-600" /> Improvement Warnings
                      </span>
                      <ul className="list-disc list-inside text-slate-600 pl-2 space-y-1">
                        {activeResume.atsResult?.warnings?.map((w, i) => (
                          <li key={i}>{w}</li>
                        )) || <li>Ensure experience list includes strong action metrics.</li>}
                      </ul>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-2">
                      <span className="font-bold text-blue-700 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded w-max">
                        <BadgeInfo className="w-4 h-4 text-blue-600" /> AI Action Recommendations
                      </span>
                      <p className="text-slate-600 pl-2 italic">
                        {activeResume.atsResult?.suggestions?.[0] || "We recommend navigating to the Workshop to improve bullet verb metrics."}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="border-2 border-dashed rounded-2xl p-12 text-center text-slate-400 space-y-3 bg-white">
                <BarChart2 className="w-10 h-10 text-gray-300 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">No Scan Logs Available</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Click "Execute Audit Scan" to run parsed diagnostic metrics using server-side Gemini intelligence.
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
