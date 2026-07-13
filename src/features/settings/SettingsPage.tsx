import React, { useEffect, useState } from "react";
import { useResumeStore } from "../../stores/resumeStore";
import { useCustomUser, CustomSignInButton } from "../../components/ClerkAuthWrapper";
import AvatarGalleryPicker from "../../components/AvatarGalleryPicker";
import FileUploader from "../../components/FileUploader";
import {
  ArrowLeft,
  RotateCcw,
  Layout,
  Eye,
  Database,
  Sparkles,
  Sliders,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Zap,
  Trash2,
  RefreshCw,
  Cpu,
  CornerDownRight,
  ShieldCheck,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { settings, updateSettings, resetToDefaultDataset, clearAllCache, addActivity } = useResumeStore();
  const [activeTab, setActiveTab] = useState<"profile" | "general" | "ai">("profile");
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { isSignedIn, user, updateUser } = useCustomUser();
  const [profileName, setProfileName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.firstName || "");
      setProfilePic(user.imageUrl || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSavingProfile(true);
      setSaveSuccess(false);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profileName,
          imageUrl: profilePic
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          updateUser(data.user);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
          addActivity("edit", "Updated cloud user profile name and avatar image");
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Fetch telemetry from server
  const fetchTelemetry = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/ai/telemetry");
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error("Failed to load AI telemetry:", err);
    } finally {
      setLoadingTelemetry(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    // Auto-poll telemetry every 6 seconds to keep stats fresh
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    if (confirm("Are you sure you want to clear the AI request cache? Identical prompts will trigger fresh API roundtrips.")) {
      try {
        const res = await fetch("/api/ai/cache/clear", { method: "POST" });
        if (res.ok) {
          alert("AI Prompt Cache cleared successfully!");
          fetchTelemetry();
          addActivity("generate", "Cleared enterprise AI query cache");
        }
      } catch (err) {
        console.error("Failed to clear cache:", err);
      }
    }
  };

  const handleResetTelemetry = async () => {
    if (confirm("Reset all latency and request analytics metrics? This cannot be undone.")) {
      try {
        const res = await fetch("/api/ai/telemetry/reset", { method: "POST" });
        if (res.ok) {
          fetchTelemetry();
          addActivity("generate", "Reset AI orchestration analytics dashboard");
        }
      } catch (err) {
        console.error("Failed to reset telemetry:", err);
      }
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ pdfPageSize: e.target.value as "A4" | "Letter" });
    addActivity("edit", `Adjusted default PDF page size format to "${e.target.value.toUpperCase()}"`);
  };

  const handleMarginsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ pdfMargins: e.target.value as "compact" | "normal" | "wide" });
    addActivity("edit", `Adjusted default PDF document margins to "${e.target.value}"`);
  };

  const handleResetDataset = () => {
    if (confirm("This will overwrite your current active resume list and reload our default Stripe Staff Engineer resume. Continue?")) {
      resetToDefaultDataset();
      addActivity("edit", "Reinitialized local storage with premium sample Stripe developer dataset");
      alert("Sample dataset loaded successfully!");
      onBack();
    }
  };

  const handleWipeLocalStorage = () => {
    if (confirm("Are you sure you want to permanently delete all resumes and activity histories? This action cannot be undone.")) {
      clearAllCache();
      alert("Local storage cache cleared.");
      onBack();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center border-b pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Platform Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Configure rendering structures, caches, and enterprise-grade multi-model AI routing.</p>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex bg-slate-100 p-1 rounded-xl border">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "profile" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5 text-indigo-500" /> User Profile
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "general" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> General Settings
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "ai" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-500" /> AI Orchestrator
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "profile" ? (
          <motion.div
            key="profile-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 animate-fade-in"
          >
            {!isSignedIn || !user ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-5 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 border rounded-full flex items-center justify-center mx-auto">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900">Signed Out</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sign in or create a secure cloud-native account to update your profile name, select a custom avatar, and persist your work across sessions.
                  </p>
                </div>
                <div>
                  <CustomSignInButton>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-indigo-500/20 transition-all">
                      Sign In or Sign Up
                    </button>
                  </CustomSignInButton>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card & Avatar Selection */}
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white border rounded-2xl p-6 shadow-sm text-center space-y-4">
                    <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-indigo-500/30 shadow-md">
                      <img 
                        src={profilePic || "/assets/image.jpg"} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{profileName || "User"}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{user.email}</p>
                    </div>
                    
                    <div className="pt-2 border-t text-[10px] text-slate-400">
                      Cloud Account: {user.id}
                    </div>
                  </div>

                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">Custom Upload</h3>
                    <FileUploader
                      allowedTypes="image"
                      label="Upload Photo to Cloudinary"
                      onUploadSuccess={(url) => setProfilePic(url)}
                    />
                  </div>
                </div>

                {/* Form Fields & Gallery */}
                <div className="md:col-span-2 bg-white border rounded-2xl p-6 shadow-sm space-y-6">
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                    <User className="w-4.5 h-4.5 text-indigo-500" /> Account Customization
                  </h3>

                  {saveSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Profile details updated successfully!
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">First Name / Nickname</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Profile Image URL</label>
                      <input
                        type="text"
                        value={profilePic}
                        onChange={(e) => setProfilePic(e.target.value)}
                        placeholder="Or enter custom URL"
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <AvatarGalleryPicker
                        currentValue={profilePic}
                        onChange={(url) => setProfilePic(url)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        "Save Profile Details"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        ) : activeTab === "general" ? (
          <motion.div
            key="general-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* DOCUMENT RENDER PREFERENCES */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                <Layout className="w-4.5 h-4.5 text-blue-500" /> Print & Rendering Styles
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Default PDF Page Format</label>
                  <select
                    value={settings.pdfPageSize}
                    onChange={handlePageSizeChange}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none"
                  >
                    <option value="Letter">US Letter (8.5" x 11")</option>
                    <option value="A4">Standard A4 Format (210mm x 297mm)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Document Margin Tolerances</label>
                  <select
                    value={settings.pdfMargins}
                    onChange={handleMarginsChange}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none"
                  >
                    <option value="compact">Compact Margins (0.5 in)</option>
                    <option value="normal">Standard / Regular (0.75 in)</option>
                    <option value="wide">Spacious Margins (1.0 in)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* OPTIONAL VISUAL BLOCKS */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                <Eye className="w-4.5 h-4.5 text-purple-500" /> Optional Visual Blocks
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl border bg-slate-50/50">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">Render Signature Block</span>
                    <span className="text-[10px] text-slate-400">Append an elite cursive signature footer line.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showSignature}
                    onChange={(e) => updateSettings({ showSignature: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl border bg-slate-50/50">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">Append Profile QR Verification</span>
                    <span className="text-[10px] text-slate-400">Embed a dynamic verification check for physical scanners.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showQrCode}
                    onChange={(e) => updateSettings({ showQrCode: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* PLATFORM STORAGE MAINTENANCE */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6 md:col-span-2">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                <Database className="w-4.5 h-4.5 text-red-500" /> Platform Storage Maintenance
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-xl bg-amber-50/30 border-amber-100 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                      <RotateCcw className="w-4 h-4" /> Reset Default Mock Profile
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Clear existing workspace drafts and re-populate with our complete Senior Staff Software Engineer at Stripe profile. Perfect for viewing multi-page template scales instantly.
                    </p>
                  </div>
                  <button
                    onClick={handleResetDataset}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Restore Stripe Mock Profile
                  </button>
                </div>

                <div className="p-4 border rounded-xl bg-red-50/30 border-red-100 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-red-800 flex items-center gap-1">
                      <Trash2 className="w-4 h-4" /> Wipe Entire Application Cache
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Permanently wipe all resumes, customized cover letters, settings configs, and platform logs from your browser's local storage. This action cannot be reversed.
                    </p>
                  </div>
                  <button
                    onClick={handleWipeLocalStorage}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Permanently Wipe Cache Database
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ai-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 animate-fade-in"
          >
            {/* TOP DYNAMIC METRICS SUMMARY ROW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 text-blue-500" /> Total Requests
                </span>
                <span className="text-2xl font-black text-slate-900 mt-2">
                  {telemetry?.requestCount ?? 0}
                </span>
                <span className="text-[9px] text-slate-400 mt-1">
                  Across Gemini, Groq, Mistral
                </span>
              </div>

              <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Success Rate
                </span>
                <span className="text-2xl font-black text-emerald-600 mt-2">
                  {telemetry?.requestCount
                    ? `${Math.round((telemetry.successCount / telemetry.requestCount) * 100)}%`
                    : "100%"}
                </span>
                <span className="text-[9px] text-slate-400 mt-1">
                  Fault-tolerant routing active
                </span>
              </div>

              <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Database className="w-3 h-3 text-purple-500" /> Cache Hits
                </span>
                <span className="text-2xl font-black text-purple-600 mt-2">
                  {telemetry?.cacheHits ?? 0}
                </span>
                <span className="text-[9px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Saves bandwidth & costs</span>
                </span>
              </div>

              <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" /> Primary Route
                </span>
                <span className="text-sm font-black text-slate-800 mt-3 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  {settings.aiRoutingMode === "AUTO" ? "Smart AUTO" : settings.aiRoutingMode}
                </span>
                <span className="text-[9px] text-slate-400 mt-1">
                  Fallback order: Gemini &rarr; Groq
                </span>
              </div>
            </div>

            {/* AI CONFIGURATION INTERACTIVE PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* INTERACTIVE CONTROLS */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm md:col-span-2 space-y-6">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                  <Sliders className="w-4.5 h-4.5 text-blue-500" /> Orchestrator Control Panel
                </h3>

                <div className="space-y-5">
                  {/* Mode Selector */}
                  <div className="space-y-1.5 p-4 border rounded-xl bg-slate-50">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-blue-600" /> AI Routing Intelligence Mode
                    </label>
                    <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                      Select <strong>Smart AUTO</strong> for context-aware model orchestration, or lock to a specific model provider. Fallback and retry policies apply to all modes.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(["AUTO", "GEMINI", "GROQ", "MISTRAL"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            updateSettings({ aiRoutingMode: mode });
                            addActivity("generate", `Changed system AI router mode to ${mode}`);
                          }}
                          className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center ${
                            (settings.aiRoutingMode || "AUTO") === mode
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800"
                          }`}
                        >
                          {mode === "AUTO" ? "Smart AUTO" : mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Multi-stage pipeline toggle */}
                  <div className="flex justify-between items-center p-4 rounded-xl border bg-slate-50/50">
                    <div className="space-y-1 max-w-[80%]">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300" /> Enable Multi-Stage Generation Pipeline
                      </span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Sequentially coordinates tasks: <strong>Gemini</strong> drafts structures &rarr; <strong>Mistral</strong> refines grammar & style &rarr; <strong>Groq</strong> optimizes experiences with quantified metrics &rarr; <strong>Gemini</strong> performs final ATS analysis.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!settings.aiPipelineEnabled}
                      onChange={(e) => {
                        updateSettings({
                          aiPipelineEnabled: e.target.checked,
                          aiParallelMode: e.target.checked ? false : settings.aiParallelMode // Mutually exclusive
                        });
                        addActivity("generate", `${e.target.checked ? "Enabled" : "Disabled"} multi-stage generator pipeline`);
                      }}
                      className="w-4.5 h-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Parallel Model toggle */}
                  <div className="flex justify-between items-center p-4 rounded-xl border bg-slate-50/50">
                    <div className="space-y-1 max-w-[80%]">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-purple-500" /> Enable Parallel Evaluator Mode
                      </span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Runs generation on <strong>Gemini, Groq, and Mistral simultaneously</strong>. Uses our <strong>AI Quality Evaluator</strong> to score the candidates on professionalism, ATS friendliness, and grammar, choosing the highest quality result. Recommended for critical tasks.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!settings.aiParallelMode}
                      onChange={(e) => {
                        updateSettings({
                          aiParallelMode: e.target.checked,
                          aiPipelineEnabled: e.target.checked ? false : settings.aiPipelineEnabled // Mutually exclusive
                        });
                        addActivity("generate", `${e.target.checked ? "Enabled" : "Disabled"} parallel model evaluator mode`);
                      }}
                      className="w-4.5 h-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Cache toggle */}
                  <div className="flex justify-between items-center p-4 rounded-xl border bg-slate-50/50">
                    <div className="space-y-1 max-w-[80%]">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-purple-500" /> Enable Prompt & Result Caching
                      </span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Caches identical generations and suggestions locally to prevent redundant server roundtrips, reducing latency to 10ms for previous lookups. Features a 5-minute configurable TTL.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.aiCacheEnabled !== false}
                      onChange={(e) => {
                        updateSettings({ aiCacheEnabled: e.target.checked });
                        addActivity("generate", `${e.target.checked ? "Enabled" : "Disabled"} prompt results cache`);
                      }}
                      className="w-4.5 h-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* STORAGE AND TELEMETRY CONTROLS */}
              <div className="space-y-6">
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                    <Database className="w-4.5 h-4.5 text-purple-500" /> Cache Operations
                  </h3>
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Clear the AI query cache database to ensure any following optimization or cover letter builds bypass previous cache and fetch fresh responses.
                    </p>
                    <button
                      onClick={handleClearCache}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Wipe AI Result Cache
                    </button>
                  </div>
                </div>

                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                    <Activity className="w-4.5 h-4.5 text-blue-500" /> Analytics Actions
                  </h3>
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Reset the latencies tracker, cache hit counts, success ratios, and request histories logs back to 0. This clears current telemetry panels.
                    </p>
                    <button
                      onClick={handleResetTelemetry}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Telemetry Ratios
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* REAL-TIME MODEL PROVIDER METRICS CHANNELS */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-emerald-500" /> Active Provider Health Channels
                </h3>
                <button
                  onClick={fetchTelemetry}
                  disabled={refreshing}
                  className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh Live Stats
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* GEMINI */}
                <div className="border rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-black text-slate-800 block">Google Gemini</span>
                      <span className="text-[10px] text-slate-400 font-medium">Model: gemini-3.5-flash</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Avg Latency:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />{" "}
                        {telemetry?.providers?.gemini?.avgLatencyMs
                          ? `${Math.round(telemetry.providers.gemini.avgLatencyMs)}ms`
                          : "1.2s (est.)"}
                      </span>
                    </div>
                    {/* Latency bar visualization */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((telemetry?.providers?.gemini?.avgLatencyMs || 1200) / 3000) * 100,
                            100
                          )}%`
                        }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Total Queries:</span>
                        <span className="font-black text-slate-700">
                          {telemetry?.providers?.gemini?.requests ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Succeeded:</span>
                        <span className="font-black text-emerald-600">
                          {telemetry?.providers?.gemini?.successes ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GROQ */}
                <div className="border rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-black text-slate-800 block">Groq Engine</span>
                      <span className="text-[10px] text-slate-400 font-medium">Model: llama-3.1-8b</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Avg Latency:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-300" />{" "}
                        {telemetry?.providers?.groq?.avgLatencyMs
                          ? `${Math.round(telemetry.providers.groq.avgLatencyMs)}ms`
                          : "250ms (est.)"}
                      </span>
                    </div>
                    {/* Latency bar visualization */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((telemetry?.providers?.groq?.avgLatencyMs || 250) / 3000) * 100,
                            100
                          )}%`
                        }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Total Queries:</span>
                        <span className="font-black text-slate-700">
                          {telemetry?.providers?.groq?.requests ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Succeeded:</span>
                        <span className="font-black text-emerald-600">
                          {telemetry?.providers?.groq?.successes ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MISTRAL */}
                <div className="border rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-black text-slate-800 block">Mistral AI</span>
                      <span className="text-[10px] text-slate-400 font-medium">Model: mistral-small</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Avg Latency:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />{" "}
                        {telemetry?.providers?.mistral?.avgLatencyMs
                          ? `${Math.round(telemetry.providers.mistral.avgLatencyMs)}ms`
                          : "1.1s (est.)"}
                      </span>
                    </div>
                    {/* Latency bar visualization */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((telemetry?.providers?.mistral?.avgLatencyMs || 1100) / 3000) * 100,
                            100
                          )}%`
                        }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Total Queries:</span>
                        <span className="font-black text-slate-700">
                          {telemetry?.providers?.mistral?.requests ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Succeeded:</span>
                        <span className="font-black text-emerald-600">
                          {telemetry?.providers?.mistral?.successes ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* REAL-TIME AUDIT LOGS TERMINAL */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-md text-slate-100 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex gap-1.5">
                    <span className="w-3 bg-red-500 h-3 rounded-full"></span>
                    <span className="w-3 bg-amber-500 h-3 rounded-full"></span>
                    <span className="w-3 bg-green-500 h-3 rounded-full"></span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider pl-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-400" /> Orchestrator Audit Log
                  </span>
                </div>
                <span className="text-[9px] text-slate-500">Live request streaming active</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {loadingTelemetry ? (
                  <p className="text-slate-500 italic text-[11px] animate-pulse">Initializing monitoring systems...</p>
                ) : telemetry?.logs && telemetry.logs.length > 0 ? (
                  telemetry.logs.map((log: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-800/30 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">
                          [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        <span className="text-slate-300 font-bold uppercase">
                          {log.type}
                        </span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="text-blue-400 font-bold uppercase">
                          {log.provider}
                        </span>
                        {log.fallbackFrom && (
                          <span className="text-amber-400 font-bold">
                            (FAILOVER FROM {log.fallbackFrom.toUpperCase()})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{log.latencyMs}ms</span>
                        <span
                          className={`font-extrabold px-1.5 py-0.5 rounded text-[9px] ${
                            log.status === "success"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900/50"
                              : "bg-rose-950/80 text-rose-400 border border-rose-900/50"
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-[11px] flex items-center gap-2">
                    <CornerDownRight className="w-3.5 h-3.5 text-slate-600" /> No requests captured in current active session. Click "Generate Resume" or optimize to stream telemetry audits in real-time.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
