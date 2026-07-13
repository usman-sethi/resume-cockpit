import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useResumeStore } from "../../stores/resumeStore";
import { ResumeData, TemplateId, ExperienceItem, ProjectItem, SkillGroup, EducationItem, AwardItem, CertificationItem } from "../../types";
import TemplateRenderer from "../templates/TemplateRenderer";
import FileUploader from "../../components/FileUploader";
import AvatarGalleryPicker from "../../components/AvatarGalleryPicker";
import { exportToPDF } from "../../utils/pdfExport";
import {
  Sparkles,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Printer,
  FileDown,
  FileJson,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Maximize2,
  Eye,
  FileText,
  BadgeAlert,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Wand2,
  Copy,
  FolderDot,
  CheckCircle
} from "lucide-react";

interface LiveEditorProps {
  resumeId: string;
  onBackToDashboard: () => void;
  onNavigateToATS: () => void;
  onNavigateToSettings: () => void;
}

export default function LiveEditor({
  resumeId,
  onBackToDashboard,
  onNavigateToATS,
  onNavigateToSettings
}: LiveEditorProps) {
  const { resumes, updateActiveResume, undo, redo, canUndo, canRedo, settings, addActivity } = useResumeStore();
  const resume = resumes.find((r) => r.id === resumeId);

  const [zoom, setZoom] = useState(0.85);
  const [activeTab, setActiveTab] = useState<"content" | "templates">("content");
  const [activeMobileWorkspace, setActiveMobileWorkspace] = useState<"edit" | "preview">("edit");
  const [openSection, setOpenSection] = useState<string | null>("personal");
  const [isImprovingSummary, setIsImprovingSummary] = useState(false);
  const [isImprovingBulletId, setIsImprovingBulletId] = useState<string | null>(null);
  const [aiBulletVariants, setAiBulletVariants] = useState<{ [key: string]: string } | null>(null);
  const [selectedSummaryTone, setSelectedSummaryTone] = useState("Executive");
  const [pdfStatus, setPdfStatus] = useState<"idle" | "generating" | "success" | "error">("idle");

  const handleExportPDF = async () => {
    if (!resume) return;
    const filename = `${resume.title.toLowerCase().replace(/\s+/g, "_")}_resume.pdf`;
    await exportToPDF("resume-print-area", filename, (status) => {
      setPdfStatus(status);
      if (status === "success") {
        addActivity("export", `Generated ATS-optimized PDF for "${resume.title}"`);
        setTimeout(() => setPdfStatus("idle"), 3000);
      } else if (status === "error") {
        setTimeout(() => setPdfStatus("idle"), 4000);
      }
    });
  };

  // If no active resume, return empty loading
  if (!resume) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 text-slate-500">
        <Sliders className="w-10 h-10 animate-spin text-blue-500 mb-2" />
        <p className="text-sm font-semibold">Loading Workshop...</p>
      </div>
    );
  }

  const { personalInfo, summary, experience, education, projects, skills, certifications, awards, languages, volunteer, publications, templateId } = resume;

  // Print adapter (uses simple CSS to print only the resume element)
  const handlePrint = () => {
    addActivity("export", `Printed resume "${resume.title}"`);
    window.print();
  };

  // JSON Export adapter
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resume, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${resume.title.toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addActivity("export", `Exported resume JSON for "${resume.title}"`);
  };

  // JSON Import handler
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData && importedData.title && importedData.personalInfo) {
          useResumeStore.getState().importResume(importedData);
          alert("Resume imported successfully!");
        } else {
          alert("Invalid file format. Ensure the JSON conforms to the Resume Schema.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // Accordion utility
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // AI Summary Rewrite
  const handleAISummaryRewrite = async () => {
    if (!summary.trim()) {
      alert("Please enter some baseline text in the Summary field first.");
      return;
    }
    setIsImprovingSummary(true);
    try {
      const res = await fetch("/api/ai/rewrite-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          tone: selectedSummaryTone,
          options: {
            routingMode: settings.aiRoutingMode || "AUTO",
            cacheEnabled: settings.aiCacheEnabled !== false
          }
        }),
      });
      const data = await res.json();
      if (data.rewritten) {
        updateActiveResume(() => ({ summary: data.rewritten }));
        addActivity("optimize", `Rewrote profile summary with AI (${selectedSummaryTone} tone)`);
      }
    } catch (e) {
      alert("AI failed to optimize summary.");
    } finally {
      setIsImprovingSummary(false);
    }
  };

  // AI Improve Bullet Point
  const handleAIImproveBullet = async (expId: string, bulletText: string) => {
    if (!bulletText.trim()) {
      alert("Please write a sentence first.");
      return;
    }
    setIsImprovingBulletId(expId);
    setAiBulletVariants(null);
    try {
      const res = await fetch("/api/ai/improve-bullet-point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletPoint: bulletText,
          roleTitle: experience.find((e) => e.id === expId)?.role || "Engineer",
          options: {
            routingMode: settings.aiRoutingMode || "AUTO",
            cacheEnabled: settings.aiCacheEnabled !== false
          }
        }),
      });
      const data = await res.json();
      if (data.variants) {
        setAiBulletVariants(data.variants);
      }
    } catch (e) {
      alert("Failed to generate bullet improvements.");
    }
  };

  // Apply selected bullet point improvement
  const applyBulletImprovement = (expId: string, improvedText: string) => {
    updateActiveResume((prev) => ({
      experience: prev.experience.map((exp) => {
        if (exp.id === expId) {
          return { ...exp, description: improvedText };
        }
        return exp;
      }),
    }));
    setAiBulletVariants(null);
    setIsImprovingBulletId(null);
    addActivity("optimize", `Applied STAR/Quantified bullet enhancement to experience role`);
  };

  // Form value updates
  const updatePersonalInfo = (field: keyof typeof personalInfo, value: string) => {
    updateActiveResume((prev) => ({
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const addExperienceItem = () => {
    const newItem: ExperienceItem = {
      id: "exp-" + Date.now(),
      company: "Company Name",
      role: "Position",
      location: "City, ST",
      startDate: "YYYY-MM",
      endDate: "Present",
      current: true,
      description: "Spearheaded core feature implementations...",
      technologies: [],
      achievements: []
    };
    updateActiveResume((prev) => ({ experience: [...prev.experience, newItem] }));
  };

  const updateExperienceItem = (id: string, field: keyof ExperienceItem, value: any) => {
    updateActiveResume((prev) => ({
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const removeExperienceItem = (id: string) => {
    updateActiveResume((prev) => ({ experience: prev.experience.filter((e) => e.id !== id) }));
  };

  const addEducationItem = () => {
    const newItem: EducationItem = {
      id: "edu-" + Date.now(),
      school: "University",
      degree: "Degree",
      major: "Major",
      graduationYear: "YYYY",
    };
    updateActiveResume((prev) => ({ education: [...prev.education, newItem] }));
  };

  const updateEducationItem = (id: string, field: keyof EducationItem, value: any) => {
    updateActiveResume((prev) => ({
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const removeEducationItem = (id: string) => {
    updateActiveResume((prev) => ({ education: prev.education.filter((e) => e.id !== id) }));
  };

  const addProjectItem = () => {
    const newItem: ProjectItem = {
      id: "proj-" + Date.now(),
      name: "Project Name",
      description: "Short description...",
      technologies: []
    };
    updateActiveResume((prev) => ({ projects: [...prev.projects, newItem] }));
  };

  const updateProjectItem = (id: string, field: keyof ProjectItem, value: any) => {
    updateActiveResume((prev) => ({
      projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const removeProjectItem = (id: string) => {
    updateActiveResume((prev) => ({ projects: prev.projects.filter((p) => p.id !== id) }));
  };

  const handleTemplateSelect = (id: TemplateId) => {
    updateActiveResume(() => ({ templateId: id }));
    addActivity("edit", `Switched resume template design to "${id}"`);
  };

  const templates: { id: TemplateId; name: string }[] = [
    { id: "minimal", name: "Cosmic Slate" },
    { id: "modern", name: "Modern Chronology" },
    { id: "harvard", name: "Harvard Elite" },
    { id: "stanford", name: "Stanford Prestige" },
    { id: "google", name: "Google Tech" },
    { id: "microsoft", name: "Microsoft Grid" },
    { id: "executive", name: "Executive Suite" },
    { id: "elegant", name: "Elegant Typography" },
    { id: "corporate", name: "Corporate Lead" },
    { id: "academic", name: "Academic Details" },
  ];

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 p-4 lg:p-6 h-[calc(100vh-16px)] lg:h-[calc(100vh-64px)] max-w-[1600px] mx-auto overflow-hidden animate-fade-in">
      
      {/* Mobile Workspace Toggle Switcher */}
      <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 gap-1 shrink-0">
        <button
          onClick={() => setActiveMobileWorkspace("edit")}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMobileWorkspace === "edit" ? "bg-white text-slate-900 shadow-sm font-bold" : "hover:text-slate-900"
          }`}
        >
          <Sliders className="w-4 h-4 text-blue-500" /> Edit Form
        </button>
        <button
          onClick={() => setActiveMobileWorkspace("preview")}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMobileWorkspace === "preview" ? "bg-white text-slate-900 shadow-sm font-bold" : "hover:text-slate-900"
          }`}
        >
          <Eye className="w-4 h-4 text-emerald-500" /> Live Preview ({Math.round(zoom * 100)}%)
        </button>
      </div>

      {/* LEFT WORKSPACE PANEL */}
      <div className={`lg:col-span-5 bg-white border border-gray-200 rounded-2xl flex-col h-full overflow-hidden shadow-sm ${
        activeMobileWorkspace === "edit" ? "flex" : "hidden lg:flex"
      }`}>
        {/* Toggle Headbar */}
        <div className="flex border-b border-gray-200 bg-slate-50 p-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("content")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "content" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-500" /> Accordion Workshop
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "templates" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4 text-purple-500" /> 12 Design Presets
          </button>
        </div>

        {/* Dynamic Panel Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* CONTENT ACCORDIONS TAB */}
          {activeTab === "content" && (
            <div className="space-y-3">
              
              {/* Accordion Block: Personal Info */}
              <div className="border rounded-xl bg-slate-50/20 overflow-hidden">
                <button
                  onClick={() => toggleSection("personal")}
                  className="w-full px-4 py-3 flex justify-between items-center bg-slate-50 border-b text-xs font-bold text-slate-800"
                >
                  <span className="flex items-center gap-2">🧑 Personal Information</span>
                  {openSection === "personal" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === "personal" && (
                  <div className="p-4 space-y-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 block uppercase">Full Name</label>
                      <input
                        type="text"
                        value={personalInfo.name}
                        onChange={(e) => updatePersonalInfo("name", e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 block uppercase">Role Title</label>
                      <input
                        type="text"
                        value={personalInfo.title}
                        onChange={(e) => updatePersonalInfo("title", e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 block uppercase">Email</label>
                      <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => updatePersonalInfo("email", e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 block uppercase">Phone</label>
                      <input
                        type="text"
                        value={personalInfo.phone}
                        onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 block uppercase">Address / Location</label>
                      <input
                        type="text"
                        value={personalInfo.address}
                        onChange={(e) => updatePersonalInfo("address", e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 block uppercase">Profile Photo (via Cloudinary)</label>
                      {personalInfo.photoUrl && (
                        <div className="flex items-center gap-3 p-2 border border-slate-100 rounded-xl bg-slate-50/50 mb-2">
                          <img src={personalInfo.photoUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-slate-800">Current Photo Active</p>
                            <p className="text-[9px] text-slate-500 truncate max-w-full">{personalInfo.photoUrl}</p>
                          </div>
                        </div>
                      )}
                      <FileUploader
                        allowedTypes="image"
                        label="Upload Profile Photo to Cloudinary"
                        onUploadSuccess={(url) => updatePersonalInfo("photoUrl", url)}
                      />
                      <div className="mt-3">
                        <AvatarGalleryPicker
                          currentValue={personalInfo.photoUrl}
                          onChange={(url) => updatePersonalInfo("photoUrl", url)}
                          title="Or Choose From Gallery"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion Block: Summary & AI optimizer */}
              <div className="border rounded-xl bg-slate-50/20 overflow-hidden">
                <button
                  onClick={() => toggleSection("summary")}
                  className="w-full px-4 py-3 flex justify-between items-center bg-slate-50 border-b text-xs font-bold text-slate-800"
                >
                  <span className="flex items-center gap-2">✍️ Executive Summary</span>
                  {openSection === "summary" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === "summary" && (
                  <div className="p-4 space-y-4 bg-white">
                    <textarea
                      rows={5}
                      value={summary}
                      onChange={(e) => updateActiveResume(() => ({ summary: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                    />

                    {/* AI Toolbar */}
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> AI Summary Assistant
                        </span>
                        <select
                          value={selectedSummaryTone}
                          onChange={(e) => setSelectedSummaryTone(e.target.value)}
                          className="text-[10px] bg-white border px-2 py-1 rounded"
                        >
                          <option>Executive</option>
                          <option>ATS Friendly</option>
                          <option>Shorten</option>
                          <option>Expand</option>
                          <option>Friendly</option>
                        </select>
                      </div>
                      <button
                        onClick={handleAISummaryRewrite}
                        disabled={isImprovingSummary}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[11px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        {isImprovingSummary ? "Generating high-impact synthesis..." : "Rewrite and Align Profile"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion Block: Experience & STAR suggestions */}
              <div className="border rounded-xl bg-slate-50/20 overflow-hidden">
                <button
                  onClick={() => toggleSection("experience")}
                  className="w-full px-4 py-3 flex justify-between items-center bg-slate-50 border-b text-xs font-bold text-slate-800"
                >
                  <span className="flex items-center gap-2">💼 Career Milestones</span>
                  {openSection === "experience" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === "experience" && (
                  <div className="p-4 space-y-4 bg-white">
                    {experience.map((exp) => (
                      <div key={exp.id} className="p-3 border rounded-xl bg-slate-50/50 space-y-3 relative">
                        <button
                          onClick={() => removeExperienceItem(exp.id)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => updateExperienceItem(exp.id, "company", e.target.value)}
                            className="px-2 py-1 border rounded text-xs bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Role"
                            value={exp.role}
                            onChange={(e) => updateExperienceItem(exp.id, "role", e.target.value)}
                            className="px-2 py-1 border rounded text-xs bg-white"
                          />
                        </div>

                        <textarea
                          rows={3}
                          placeholder="Bullet point accomplishment..."
                          value={exp.description}
                          onChange={(e) => updateExperienceItem(exp.id, "description", e.target.value)}
                          className="w-full px-2 py-1 border rounded text-xs font-mono bg-white"
                        />

                        {/* AI Improve bullet button */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAIImproveBullet(exp.id, exp.description)}
                            disabled={isImprovingBulletId === exp.id}
                            className="text-[10px] bg-slate-900 hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-sm shrink-0"
                          >
                            <Sparkles className="w-3 h-3" />
                            {isImprovingBulletId === exp.id && !aiBulletVariants ? "Enhancing..." : "Improve Bullet"}
                          </button>
                        </div>

                        {/* AI Bullet variants popup list */}
                        {isImprovingBulletId === exp.id && aiBulletVariants && (
                          <div className="p-3 border border-indigo-100 bg-indigo-50/40 rounded-lg space-y-2 animate-scale-in">
                            <span className="text-[9px] font-bold text-indigo-700 block uppercase">Enhancement Variants:</span>
                            <div className="space-y-1.5">
                              <button
                                onClick={() => applyBulletImprovement(exp.id, aiBulletVariants.star)}
                                className="w-full text-left text-[11px] p-2 bg-white hover:bg-indigo-50 border rounded transition-colors text-slate-700 block"
                              >
                                <strong className="text-indigo-600">STAR Format:</strong> {aiBulletVariants.star}
                              </button>
                              <button
                                onClick={() => applyBulletImprovement(exp.id, aiBulletVariants.quantified)}
                                className="w-full text-left text-[11px] p-2 bg-white hover:bg-indigo-50 border rounded transition-colors text-slate-700 block"
                              >
                                <strong className="text-green-600">Quantified:</strong> {aiBulletVariants.quantified}
                              </button>
                              <button
                                onClick={() => applyBulletImprovement(exp.id, aiBulletVariants.executive)}
                                className="w-full text-left text-[11px] p-2 bg-white hover:bg-indigo-50 border rounded transition-colors text-slate-700 block"
                              >
                                <strong className="text-amber-600">Executive:</strong> {aiBulletVariants.executive}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={addExperienceItem}
                      className="w-full py-2 border-2 border-dashed rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Experience Record
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion Block: Education */}
              <div className="border rounded-xl bg-slate-50/20 overflow-hidden">
                <button
                  onClick={() => toggleSection("education")}
                  className="w-full px-4 py-3 flex justify-between items-center bg-slate-50 border-b text-xs font-bold text-slate-800"
                >
                  <span className="flex items-center gap-2">🎓 Academic Degrees</span>
                  {openSection === "education" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === "education" && (
                  <div className="p-4 space-y-4 bg-white">
                    {education.map((edu) => (
                      <div key={edu.id} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 relative">
                        <button
                          onClick={() => removeEducationItem(edu.id)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="School"
                            value={edu.school}
                            onChange={(e) => updateEducationItem(edu.id, "school", e.target.value)}
                            className="px-2 py-1 border rounded text-xs bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => updateEducationItem(edu.id, "degree", e.target.value)}
                            className="px-2 py-1 border rounded text-xs bg-white"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addEducationItem}
                      className="w-full py-2 border-2 border-dashed rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Education
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion Block: Projects */}
              <div className="border rounded-xl bg-slate-50/20 overflow-hidden">
                <button
                  onClick={() => toggleSection("projects")}
                  className="w-full px-4 py-3 flex justify-between items-center bg-slate-50 border-b text-xs font-bold text-slate-800"
                >
                  <span className="flex items-center gap-2">🚀 Selected Projects</span>
                  {openSection === "projects" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === "projects" && (
                  <div className="p-4 space-y-4 bg-white">
                    {projects.map((proj) => (
                      <div key={proj.id} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 relative">
                        <button
                          onClick={() => removeProjectItem(proj.id)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <input
                          type="text"
                          placeholder="Project Name"
                          value={proj.name}
                          onChange={(e) => updateProjectItem(proj.id, "name", e.target.value)}
                          className="w-full px-2 py-1 border rounded text-xs bg-white font-bold"
                        />
                        <textarea
                          placeholder="Project description..."
                          value={proj.description}
                          onChange={(e) => updateProjectItem(proj.id, "description", e.target.value)}
                          className="w-full px-2 py-1 border rounded text-xs bg-white font-mono"
                        />
                      </div>
                    ))}
                    <button
                      onClick={addProjectItem}
                      className="w-full py-2 border-2 border-dashed rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Project
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* DESIGN PRESETS / TEMPLATES TAB */}
          {activeTab === "templates" && (
            <div className="grid grid-cols-2 gap-3.5">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className={`border rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all text-center space-y-3 relative overflow-hidden flex flex-col justify-between h-32 ${
                    templateId === tmpl.id ? "border-blue-600 ring-2 ring-blue-500/10 bg-blue-50/10" : "border-gray-200"
                  }`}
                >
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider block mx-auto w-max">
                    {tmpl.id === "harvard" || tmpl.id === "stanford" ? "Serif Elite" : "Classic Layout"}
                  </span>
                  <p className="text-xs font-bold text-slate-800">{tmpl.name}</p>
                  
                  {templateId === tmpl.id && (
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-1 rounded">Active</span>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* WORKSHOP FOOTER QUICK EXPORTS */}
        <div className="border-t border-gray-200 p-4 bg-slate-50 shrink-0 space-y-3">
          <div className="flex gap-2 justify-between items-center text-xs text-slate-500">
            <span className="font-mono text-[10px]">JSON Blueprint</span>
            <div className="flex gap-1.5">
              <label className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded font-bold cursor-pointer transition-colors flex items-center gap-1 text-[10px]">
                <FileJson className="w-3 h-3" /> Import
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
              <button
                onClick={handleExportJSON}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded font-bold transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
              >
                <FileJson className="w-3 h-3" /> Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PREVIEW WORKSPACE */}
      <div className={`lg:col-span-7 flex-col h-full overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-xl relative ${
        activeMobileWorkspace === "preview" ? "flex" : "hidden lg:flex"
      }`}>
        
        {/* UPPER CONTROLS HEADBAR */}
        <div className="flex justify-between items-center px-5 py-3 border-b border-slate-800 bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors"
            >
              ← Cockpit
            </button>
            <span className="font-mono text-[10px] text-slate-400 uppercase hidden md:inline">Live Canvas</span>
          </div>

          {/* Workspace utilities (Undo, Redo, Zoom) */}
          <div className="flex items-center gap-3">
            <div className="flex border border-slate-800 rounded-xl bg-slate-900 p-0.5">
              <button
                onClick={undo}
                disabled={!canUndo()}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 disabled:opacity-40 hover:text-white transition-all cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 disabled:opacity-40 hover:text-white transition-all cursor-pointer"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex border border-slate-800 rounded-xl bg-slate-900 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.05))}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 py-1 text-[10px] text-slate-400 font-mono select-none flex items-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.min(1.5, zoom + 0.05))}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <motion.button
              layout
              onClick={handleExportPDF}
              disabled={pdfStatus === "generating"}
              whileHover={{ scale: pdfStatus === "generating" ? 1 : 1.03 }}
              whileTap={{ scale: pdfStatus === "generating" ? 1 : 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`relative overflow-hidden px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-md disabled:cursor-not-allowed ${
                pdfStatus === "generating"
                  ? "bg-slate-800 text-slate-400 shadow-none border border-slate-700"
                  : pdfStatus === "success"
                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/10"
                  : pdfStatus === "error"
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10"
              }`}
            >
              <AnimatePresence mode="wait">
                {pdfStatus === "generating" ? (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    <span className="font-mono text-[11px] tracking-wide text-emerald-400 animate-pulse">
                      OPTIMIZING ATS...
                    </span>
                  </motion.div>
                ) : pdfStatus === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="flex items-center gap-1.5"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                    </motion.div>
                    <span className="font-semibold text-emerald-100">Resume Exported!</span>
                  </motion.div>
                ) : pdfStatus === "error" ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5"
                  >
                    <BadgeAlert className="w-3.5 h-3.5 text-rose-200" />
                    <span className="text-rose-100">Export Failed</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>

        {/* HIGH RES GRAPHIC VIEWPORT */}
        <div className="flex-1 overflow-auto bg-slate-950 p-6 flex justify-center items-start">
          <TemplateRenderer
            data={resume}
            zoom={zoom}
            pageSize={settings.pdfPageSize}
            margins={settings.pdfMargins}
            showSignature={settings.showSignature}
            showQrCode={settings.showQrCode}
          />
        </div>
      </div>
    </div>
  );
}
