import React, { useState } from "react";
import { useResumeStore } from "../../stores/resumeStore";
import { ResumeData } from "../../types";
import FileUploader from "../../components/FileUploader";
import { Search, Plus, Star, MoreVertical, Archive, Trash2, Copy, FileEdit, Clock, BarChart3, AlertCircle, FileText, CheckCircle2, LayoutGrid, ListFilter, ExternalLink, Download } from "lucide-react";

interface DashboardProps {
  onEditResume: (id: string) => void;
  onCreateNew: () => void;
  onNavigateToATS: () => void;
  onNavigateToMatch: () => void;
  onNavigateToSettings: () => void;
}

export default function Dashboard({
  onEditResume,
  onCreateNew,
  onNavigateToATS,
  onNavigateToMatch,
  onNavigateToSettings,
}: DashboardProps) {
  const { resumes, createResume, duplicateResume, deleteResume, archiveResume, pinResume, recentActivities, setActiveResumeId } = useResumeStore();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<"updated" | "title">("updated");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string, date: string, type: "image" | "docx"}[]>(() => {
    try {
      const saved = localStorage.getItem("cloudinary_vault_files");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleUploadSuccess = (url: string, name: string) => {
    const isDocx = name.toLowerCase().endsWith(".docx");
    const newFile = {
      name,
      url,
      date: new Date().toLocaleDateString(),
      type: isDocx ? ("docx" as const) : ("image" as const),
    };
    const updated = [newFile, ...uploadedFiles];
    setUploadedFiles(updated);
    localStorage.setItem("cloudinary_vault_files", JSON.stringify(updated));
  };

  // Filter resumes
  const filteredResumes = resumes.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          (r.personalInfo?.name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (r.targetJob?.title || "").toLowerCase().includes(search.toLowerCase());
    
    if (showArchived) {
      return r.isArchived && matchesSearch;
    }
    return !r.isArchived && matchesSearch;
  });

  // Sort resumes
  const sortedResumes = [...filteredResumes].sort((a, b) => {
    if (sortBy === "updated") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return a.title.localeCompare(b.title);
  });

  // Stats calculation
  const totalResumes = resumes.length;
  const pinnedCount = resumes.filter((r) => r.isPinned && !r.isArchived).length;
  const averageScore = Math.round(
    resumes.reduce((acc, r) => acc + (r.score?.overall || 0), 0) / (totalResumes || 1)
  );

  const handleEditClick = (id: string) => {
    setActiveResumeId(id);
    onEditResume(id);
  };

  const handleDuplicate = (id: string) => {
    duplicateResume(id);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this resume? This action cannot be undone.")) {
      deleteResume(id);
      setActiveMenuId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* HEADER WITH ACTION ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Resume Cockpit</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, optimize, and generate your career blueprints in one place.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Create AI Resume
          </button>
        </div>
      </div>

      {/* STATS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Resumes</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-extrabold text-slate-900">{totalResumes}</span>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">Drafts Live</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Average AI Score</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-extrabold text-slate-900">{averageScore || 0}%</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${averageScore >= 90 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
              {averageScore >= 90 ? "Excellent" : "Needs Work"}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pinned Items</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-extrabold text-slate-900">{pinnedCount}</span>
            <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">Quick Access</span>
          </div>
        </div>

        {/* ATS shortcut block */}
        <div
          onClick={onNavigateToATS}
          className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 text-white shadow-sm space-y-3 cursor-pointer group hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ATS Optimizer</span>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold group-hover:underline flex items-center gap-1.5">
              Run Scan Checklist <ArrowUpRight className="w-4 h-4 text-blue-400" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Verify layout structures, length, and content readability.
          </p>
        </div>
      </div>

      {/* EXPLORER CONTROLS */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, role or developer skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        {/* Sorting / Filter switches */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setSortBy("updated")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${sortBy === "updated" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
            >
              Recent Update
            </button>
            <button
              onClick={() => setSortBy("title")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${sortBy === "title" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"}`}
            >
              Alphabetical
            </button>
          </div>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showArchived
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-white border-gray-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Archive className="w-4 h-4" />
            {showArchived ? "Show Active Only" : "Show Archived"}
          </button>
        </div>
      </div>

      {/* DRAFTS LIST OR CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedResumes.map((resume) => (
          <div
            key={resume.id}
            className={`relative bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group overflow-visible ${
              resume.isPinned ? "border-blue-200 ring-2 ring-blue-500/5 bg-gradient-to-tr from-white to-blue-50/10" : "border-gray-200"
            }`}
          >
            {/* Top actions */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {resume.title || "Untitled Resume"}
                  </h3>
                  {resume.isPinned && <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />}
                </div>
                <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                  {resume.targetJob?.title || "No Target Title"}
                </span>
              </div>

              {/* Menu dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenuId(activeMenuId === resume.id ? null : resume.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-4.5 h-4.5" />
                </button>

                {activeMenuId === resume.id && (
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 text-xs text-slate-700 animate-scale-in">
                    <button
                      onClick={() => { pinResume(resume.id); setActiveMenuId(null); }}
                      className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      {resume.isPinned ? "Unpin Item" : "Pin Item"}
                    </button>
                    <button
                      onClick={() => { archiveResume(resume.id); setActiveMenuId(null); }}
                      className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-slate-50 transition-colors text-left text-amber-700"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      {resume.isArchived ? "Restore Item" : "Archive Item"}
                    </button>
                    <button
                      onClick={() => handleDuplicate(resume.id)}
                      className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Duplicate Code
                    </button>
                    <div className="h-[1px] bg-gray-100 my-1"></div>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors text-left font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Permanently
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Resume metadata body */}
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center border-t border-gray-100 pt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(resume.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  Score: <span className="text-blue-600">{resume.score?.overall || 0}/100</span>
                </span>
              </div>

              {/* Horizontal grid bar of progress */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  style={{ width: `${resume.score?.overall || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => handleEditClick(resume.id)}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
              >
                <FileEdit className="w-4 h-4" />
                Launch Live Editor
              </button>
            </div>
          </div>
        ))}

        {sortedResumes.length === 0 && (
          <div className="col-span-3 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-800">No Resumes Found</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {search
                  ? "We couldn't find any blueprints matching your query. Try searching for other key phrases."
                  : showArchived
                  ? "Your archive vault is currently empty."
                  : "You haven't built any resume variants yet. Begin by generating your first AI masterpiece!"}
              </p>
            </div>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create One Now
            </button>
          </div>
        )}
      </div>

      {/* RECENT ACTIVITIES, CLOUD DOCUMENT VAULT, & LOGS TIMELINE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Recent Operations Column */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-900">Recent Platform Operations</h3>
              <span className="text-[10px] uppercase font-bold text-gray-400">Activity Ledger</span>
            </div>

            <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3 items-start text-[11px] border-b border-gray-50 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-gray-400 shrink-0 font-mono mt-0.5">
                    {new Date(act.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800 leading-snug">{act.description}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">{act.type}</p>
                  </div>
                </div>
              ))}

              {recentActivities.length === 0 && (
                <div className="text-center py-8 text-gray-400 italic text-xs">
                  Platform ledger is blank. Launch your editor to register activity milestones.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cloud Document Vault Column */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-900">Cloud Document Vault</h3>
              <span className="text-[10px] uppercase font-bold text-gray-400">Cloudinary Drive</span>
            </div>
            
            {/* File List */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <FileText className={`w-4 h-4 shrink-0 ${file.type === "docx" ? "text-blue-500" : "text-emerald-500"}`} />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-800 truncate" title={file.name}>{file.name}</p>
                      <p className="text-[8px] text-gray-400 font-mono">{file.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                      title="Open Cloud Document Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}

              {uploadedFiles.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-[11px] italic">
                  No backups in cloud. Upload your images or .docx references below!
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <FileUploader
              allowedTypes="both"
              label="Backup Image / DOCX to Cloudinary"
              onUploadSuccess={handleUploadSuccess}
            />
            {uploadedFiles.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear your local file references? Files will remain on Cloudinary.")) {
                    setUploadedFiles([]);
                    localStorage.removeItem("cloudinary_vault_files");
                  }
                }}
                className="w-full text-center text-[9px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Clear Document History
              </button>
            )}
          </div>
        </div>

        {/* Pro Tip Column */}
        <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 border border-slate-800 rounded-2xl p-6 shadow-sm text-white flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pro Tip Vault</span>
            <h4 className="font-extrabold text-sm text-white leading-snug">
              Boost Your ATS Parsing Score to 95+ Percentile
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Recruiters prioritize quantifiable metrics. Replace standard lines like "responsible for optimizing servers" with STAR bullet formulations: "Spearheaded platform middleware consolidation, reducing P99 latency overhead by 32%."
            </p>
          </div>
          <button
            onClick={onNavigateToATS}
            className="mt-6 flex items-center justify-center gap-1.5 w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Review Scan Checklist
          </button>
        </div>
      </div>
    </div>
  );
}

interface ArrowUpRightProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

function ArrowUpRight(props: ArrowUpRightProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
