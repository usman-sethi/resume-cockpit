import { useState } from "react";
import { Sparkles, ArrowLeft, ArrowRight, Plus, Trash2, CheckCircle2, ChevronRight, Briefcase, GraduationCap, FolderCode, Award, Shield, MessageSquare, Compass, Globe } from "lucide-react";
import { useResumeStore } from "../../stores/resumeStore";
import { ResumeData, ExperienceItem, EducationItem, ProjectItem, SkillGroup, CertificationItem, AwardItem, LanguageItem, VolunteerItem, PublicationItem } from "../../types";

interface CreateWizardProps {
  onComplete: (newResumeId: string) => void;
  onCancel: () => void;
}

export default function CreateWizard({ onComplete, onCancel }: CreateWizardProps) {
  const { createResume, updateActiveResume, importResume, addActivity, settings } = useResumeStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Step 1: Personal Info
  const [personal, setPersonal] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    github: "",
    portfolio: "",
    website: "",
    photoUrl: "",
  });

  // Step 2: Target Job
  const [target, setTarget] = useState({
    title: "",
    company: "",
    industry: "",
    employmentType: "Full-time",
    experienceLevel: "Mid-level",
    desiredLocation: "",
    salaryRange: "",
    jobDescription: "",
  });

  // Step 3: Experience List
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  // Step 4: Education List
  const [education, setEducation] = useState<EducationItem[]>([]);
  // Step 5: Projects List
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  
  // Step 6: Skills Categorized (Standard defaults to pick from)
  const [skills, setSkills] = useState<SkillGroup[]>([
    { category: "Languages", skills: ["TypeScript", "JavaScript", "Go", "Rust", "Python", "SQL"] },
    { category: "Frameworks & Engines", skills: ["React", "Next.js", "Node.js", "Express", "Vite", "Tailwind CSS"] }
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [newSkillText, setNewSkillText] = useState<{ [key: number]: string }>({});

  // Step 7: Certifications
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  // Step 8: Awards
  const [awards, setAwards] = useState<AwardItem[]>([]);
  // Step 9: Languages
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  // Step 10: Volunteer
  const [volunteer, setVolunteer] = useState<VolunteerItem[]>([]);
  // Step 11: Publications
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  // Step 12: Additional Notes
  const [additionalNotes, setAdditionalNotes] = useState("");

  const totalSteps = 12;

  // Loading animation sequence
  const triggerLoadingSequence = async () => {
    const messages = [
      "Establishing server-side connection to Gemini API...",
      "Analyzing your 12-step questionnaire profile...",
      "Matching accomplishments with ATS keyword indexes...",
      "Polishing job descriptions into high-impact STAR formats...",
      "Synthesizing customized Cover Letter tailored to JD...",
      "Finalizing high-contrast design blueprints...",
    ];

    for (let i = 0; i < messages.length; i++) {
      setLoadingMessage(messages[i]);
      await new Promise((resolve) => setTimeout(resolve, i === 0 ? 1000 : 1500));
    }
  };

  // Submission handler
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Launch loading sequence in background
    triggerLoadingSequence();

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo: personal,
          targetJob: target,
          experience,
          education,
          projects,
          skills,
          certifications,
          awards,
          languages,
          volunteer,
          publications,
          additionalNotes,
          options: {
            routingMode: settings.aiRoutingMode || "AUTO",
            pipelineEnabled: settings.aiPipelineEnabled !== false,
            parallelMode: !!settings.aiParallelMode,
            cacheEnabled: settings.aiCacheEnabled !== false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI generation endpoint");
      }

      const generatedData = await response.json();

      // Create resume item in Zustand store
      const resumeId = createResume(`${personal.name || "My AI"} - ${target.title || "Target Resume"}`, false);
      
      // Update with generated content
      useResumeStore.getState().updateActiveResume(() => ({
        personalInfo: {
          ...personal,
          photoUrl: personal.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
        },
        targetJob: target,
        summary: generatedData.summary || "",
        experience: generatedData.experience || experience,
        education: generatedData.education || education,
        projects: generatedData.projects || projects,
        skills: generatedData.skills || skills,
        certifications: certifications,
        awards: awards,
        languages: languages,
        volunteer: volunteer,
        publications: publications,
        additionalNotes: additionalNotes,
        score: generatedData.score || {
          overall: 80,
          content: 80,
          ats: 80,
          grammar: 90,
          design: 80,
          impact: 80,
          skills: 85,
          keywords: 80,
          experience: 80,
          suggestions: ["Keep editing to refine results."]
        },
        atsResult: generatedData.atsResult,
        coverLetter: generatedData.coverLetter,
      }));

      addActivity("generate", `Generated new ATS-optimized resume for "${target.title}"`);
      onComplete(resumeId);
    } catch (e) {
      console.error(e);
      alert("AI generation encountered a transient issue. Creating a local template resume instead.");
      
      // Fallback
      const resumeId = createResume(`${personal.name || "My"} - ${target.title || "Resume"}`, true);
      onComplete(resumeId);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Dynamic add / deletes
  const addExperience = () => {
    const newItem: ExperienceItem = {
      id: "exp-" + Date.now(),
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "Present",
      current: true,
      description: "",
      technologies: [],
      achievements: []
    };
    setExperience([...experience, newItem]);
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter((e) => e.id !== id));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    setExperience(
      experience.map((e) => {
        if (e.id === id) {
          const updated = { ...e, [field]: value };
          if (field === "current" && value === true) {
            updated.endDate = "Present";
          }
          return updated;
        }
        return e;
      })
    );
  };

  const addEducation = () => {
    const newItem: EducationItem = {
      id: "edu-" + Date.now(),
      school: "",
      degree: "",
      major: "",
      graduationYear: "",
    };
    setEducation([...education, newItem]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((e) => e.id !== id));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: any) => {
    setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const addProject = () => {
    const newItem: ProjectItem = {
      id: "proj-" + Date.now(),
      name: "",
      description: "",
      technologies: [],
      challenges: "",
      achievements: ""
    };
    setProjects([...projects, newItem]);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: any) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  // Skill managers
  const addSkillCategory = () => {
    if (!newCategory.trim()) return;
    setSkills([...skills, { category: newCategory.trim(), skills: [] }]);
    setNewCategory("");
  };

  const removeSkillCategory = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addSkillToCategory = (catIdx: number) => {
    const txt = newSkillText[catIdx];
    if (!txt || !txt.trim()) return;

    setSkills(
      skills.map((s, idx) => {
        if (idx === catIdx) {
          return { ...s, skills: [...s.skills, txt.trim()] };
        }
        return s;
      })
    );

    setNewSkillText({ ...newSkillText, [catIdx]: "" });
  };

  const removeSkillFromCategory = (catIdx: number, skillIdx: number) => {
    setSkills(
      skills.map((s, idx) => {
        if (idx === catIdx) {
          return { ...s, skills: s.skills.filter((_, sI) => sI !== skillIdx) };
        }
        return s;
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      {/* LOADING SCREEN TRANSITION */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col justify-center items-center text-white space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center animate-spin shadow-lg shadow-blue-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black tracking-tight">Generating Professional Resume</h2>
            <p className="text-sm text-blue-400 font-mono animate-pulse">{loadingMessage}</p>
          </div>
          <p className="text-xs text-slate-500 italic max-w-sm text-center pt-8 border-t border-slate-800 leading-relaxed">
            We are styling section containers, generating cover letters, and optimizing ATS scores using Gemini intelligence. This may take up to 10 seconds.
          </p>
        </div>
      )}

      {/* HEADER PROGRESS BAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-extrabold text-base text-slate-900">AI Creator Wizard</h2>
          </div>
          <span className="text-xs font-mono text-gray-400">Step {currentStep} of {totalSteps}</span>
        </div>

        {/* Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* STEP BODY */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-8 min-h-[500px] flex flex-col justify-between">
        
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" /> Personal Information
              </h3>
              <p className="text-xs text-slate-500">Provide contact details so employers and recruitment systems can easily parse your identity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={personal.name}
                  onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Professional Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={personal.title}
                  onChange={(e) => setPersonal({ ...personal, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. alex@rivera.dev"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={personal.address}
                  onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">LinkedIn URL</label>
                <input
                  type="text"
                  placeholder="linkedin.com/in/username"
                  value={personal.linkedin}
                  onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">GitHub URL</label>
                <input
                  type="text"
                  placeholder="github.com/username"
                  value={personal.github}
                  onChange={(e) => setPersonal({ ...personal, github: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Profile Picture Link</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={personal.photoUrl}
                  onChange={(e) => setPersonal({ ...personal, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Portfolio / Website</label>
                <input
                  type="text"
                  placeholder="username.dev"
                  value={personal.website}
                  onChange={(e) => setPersonal({ ...personal, website: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Target Job & Job Description */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Target Job Details
              </h3>
              <p className="text-xs text-slate-500">Provide the requirements of the job you are targeting. AI will customize keywords around these values.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Target Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Principal Engineer / Solutions Architect"
                  value={target.title}
                  onChange={(e) => setTarget({ ...target, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Target Company</label>
                <input
                  type="text"
                  placeholder="e.g. Stripe, Linear"
                  value={target.company}
                  onChange={(e) => setTarget({ ...target, company: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Industry</label>
                <input
                  type="text"
                  placeholder="e.g. Fintech / developer platforms"
                  value={target.industry}
                  onChange={(e) => setTarget({ ...target, industry: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Experience Level</label>
                <select
                  value={target.experienceLevel}
                  onChange={(e) => setTarget({ ...target, experienceLevel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50"
                >
                  <option>Entry-level</option>
                  <option>Mid-level</option>
                  <option>Senior-level</option>
                  <option>Staff / Lead</option>
                  <option>Executive</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">Paste Target Job Description (Highly Recommended for AI Alignment)</label>
                <textarea
                  rows={6}
                  placeholder="Paste the raw requirements or job post here..."
                  value={target.jobDescription}
                  onChange={(e) => setTarget({ ...target, jobDescription: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Professional Background (Experience) */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" /> Work History
                </h3>
                <p className="text-xs text-slate-500">List your primary career positions. Leave bullet descriptions blank to let AI draft them!</p>
              </div>
              <button
                onClick={addExperience}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Role
              </button>
            </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {experience.map((exp, idx) => (
                <div key={exp.id} className="p-4 border rounded-xl bg-slate-50/50 space-y-4 relative">
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Position #{idx + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Stripe"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Role Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Staff Software Engineer"
                        value={exp.role}
                        onChange={(e) => updateExperience(exp.id, "role", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Start Date (YYYY-MM)</label>
                      <input
                        type="text"
                        placeholder="e.g. 2021-06"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">End Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Present or 2023-12"
                        disabled={exp.current}
                        value={exp.current ? "Present" : exp.endDate}
                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white disabled:bg-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-2 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        id={`current-${exp.id}`}
                        onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                      />
                      <label htmlFor={`current-${exp.id}`} className="text-xs font-bold text-slate-700">I currently work here</label>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Raw Notes / Responsibilities (Let AI polish this later)</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Managed Stripe subscription databases. Optimized transactional latency..."
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {experience.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-100 italic text-slate-400">
                  No previous roles entered. Click "Add Role" above to enter details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Education */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" /> Academic Background
                </h3>
                <p className="text-xs text-slate-500">Provide academic credentials from high school or universities.</p>
              </div>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Degree
              </button>
            </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {education.map((edu, idx) => (
                <div key={edu.id} className="p-4 border rounded-xl bg-slate-50/50 space-y-4 relative">
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">University / School</label>
                      <input
                        type="text"
                        placeholder="e.g. Stanford University"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Degree</label>
                      <input
                        type="text"
                        placeholder="e.g. Bachelor of Science"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Major / Specialization</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={edu.major}
                        onChange={(e) => updateEducation(edu.id, "major", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Graduation Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2018"
                        value={edu.graduationYear}
                        onChange={(e) => updateEducation(edu.id, "graduationYear", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {education.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-100 italic text-slate-400">
                  No academic credentials entered. Click "Add Degree" to include one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Projects */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FolderCode className="w-5 h-5 text-blue-600" /> Highlight Projects
                </h3>
                <p className="text-xs text-slate-500">Provide detailed open-source libraries or core personal developer highlights.</p>
              </div>
              <button
                onClick={addProject}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {projects.map((proj, idx) => (
                <div key={proj.id} className="p-4 border rounded-xl bg-slate-50/50 space-y-4 relative">
                  <button
                    onClick={() => removeProject(proj.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Project Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ledger Consensus Engine"
                        value={proj.name}
                        onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">GitHub Link</label>
                      <input
                        type="text"
                        placeholder="github.com/alex/project"
                        value={proj.githubUrl || ""}
                        onChange={(e) => updateProject(proj.id, "githubUrl", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Core Description</label>
                      <textarea
                        rows={2}
                        placeholder="Detail the stack and core execution goal..."
                        value={proj.description}
                        onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {projects.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-100 italic text-slate-400">
                  No projects added yet. Click "Add Project" above to include details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Skills groups */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="space-y-1 border-b pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Core Expertise & Skills
              </h3>
              <p className="text-xs text-slate-500">Group your skills into categories. These will map cleanly into ATS keywords.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[350px] overflow-y-auto pr-2">
              {skills.map((group, catIdx) => (
                <div key={catIdx} className="p-4 border rounded-xl bg-slate-50/50 space-y-3 relative">
                  <button
                    onClick={() => removeSkillCategory(catIdx)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">{group.category}</h4>

                  {/* Skills lists */}
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {group.skills.map((s, sIdx) => (
                      <span key={sIdx} className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        {s}
                        <button
                          onClick={() => removeSkillFromCategory(catIdx, sIdx)}
                          className="text-gray-400 hover:text-red-500 font-extrabold text-[10px]"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add skill input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add individual skill..."
                      value={newSkillText[catIdx] || ""}
                      onChange={(e) => setNewSkillText({ ...newSkillText, [catIdx]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && addSkillToCategory(catIdx)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                    />
                    <button
                      onClick={() => addSkillToCategory(catIdx)}
                      className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Category section */}
            <div className="flex gap-3 items-center border-t pt-4">
              <input
                type="text"
                placeholder="New Category (e.g. Cloud & Operations)..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50"
              />
              <button
                onClick={addSkillCategory}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shrink-0"
              >
                Create Category
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Certifications */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" /> Certifications
                </h3>
                <p className="text-xs text-slate-500">Provide official industry credentials or professional certifications.</p>
              </div>
              <button
                onClick={() => setCertifications([...certifications, { id: "c-" + Date.now(), name: "", issuer: "", date: "" }])}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Certificate
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-4 border rounded-xl bg-slate-50/50 flex flex-col md:flex-row gap-4 relative">
                  <button
                    onClick={() => setCertifications(certifications.filter((c) => c.id !== cert.id))}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Certificate Name (e.g. AWS Certified Developer)"
                    value={cert.name}
                    onChange={(e) => setCertifications(certifications.map((c) => c.id === cert.id ? { ...c, name: e.target.value } : c))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Issuer (e.g. Amazon Web Services)"
                    value={cert.issuer}
                    onChange={(e) => setCertifications(certifications.map((c) => c.id === cert.id ? { ...c, issuer: e.target.value } : c))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Awards */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" /> Honors & Awards
                </h3>
                <p className="text-xs text-slate-500">Highlight industry honors, hacks, or team achievements.</p>
              </div>
              <button
                onClick={() => setAwards([...awards, { id: "a-" + Date.now(), title: "", issuer: "", date: "" }])}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Award
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {awards.map((aw) => (
                <div key={aw.id} className="p-4 border rounded-xl bg-slate-50/50 flex flex-col md:flex-row gap-4 relative">
                  <button
                    onClick={() => setAwards(awards.filter((a) => a.id !== aw.id))}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Award Title (e.g. Hackathon Winner)"
                    value={aw.title}
                    onChange={(e) => setAwards(awards.map((a) => a.id === aw.id ? { ...a, title: e.target.value } : a))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Issuer / Year"
                    value={aw.issuer}
                    onChange={(e) => setAwards(awards.map((a) => a.id === aw.id ? { ...a, issuer: e.target.value } : a))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 9: Languages */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" /> Languages
                </h3>
                <p className="text-xs text-slate-500">Provide language proficiencies.</p>
              </div>
              <button
                onClick={() => setLanguages([...languages, { id: "l-" + Date.now(), language: "", proficiency: "Fluent" }])}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Language
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {languages.map((l) => (
                <div key={l.id} className="p-4 border rounded-xl bg-slate-50/50 flex flex-col md:flex-row gap-4 relative">
                  <button
                    onClick={() => setLanguages(languages.filter((lang) => lang.id !== l.id))}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Language (e.g. English)"
                    value={l.language}
                    onChange={(e) => setLanguages(languages.map((la) => la.id === l.id ? { ...la, language: e.target.value } : la))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                  <select
                    value={l.proficiency}
                    onChange={(e) => setLanguages(languages.map((la) => la.id === l.id ? { ...la, proficiency: e.target.value as any } : la))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                  >
                    <option>Native</option>
                    <option>Fluent</option>
                    <option>Professional</option>
                    <option>Intermediate</option>
                    <option>Conversational</option>
                    <option>Basic</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 10: Volunteer Work */}
        {currentStep === 10 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" /> Volunteer & Leadership
                </h3>
                <p className="text-xs text-slate-500">Include any charitable organization or mentoring history.</p>
              </div>
              <button
                onClick={() => setVolunteer([...volunteer, { id: "v-" + Date.now(), organization: "", role: "", startDate: "", endDate: "", current: false, description: "" }])}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Volunteer Role
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {volunteer.map((v) => (
                <div key={v.id} className="p-4 border rounded-xl bg-slate-50/50 space-y-3 relative">
                  <button
                    onClick={() => setVolunteer(volunteer.filter((vol) => vol.id !== v.id))}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Organization Name"
                      value={v.organization}
                      onChange={(e) => setVolunteer(volunteer.map((vol) => vol.id === v.id ? { ...vol, organization: e.target.value } : vol))}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Tech Advisor)"
                      value={v.role}
                      onChange={(e) => setVolunteer(volunteer.map((vol) => vol.id === v.id ? { ...vol, role: e.target.value } : vol))}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 11: Publications */}
        {currentStep === 11 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FolderCode className="w-5 h-5 text-blue-600" /> Publications
                </h3>
                <p className="text-xs text-slate-500">Provide thesis papers or articles detailing tech specialization.</p>
              </div>
              <button
                onClick={() => setPublications([...publications, { id: "p-" + Date.now(), title: "", publisher: "", date: "" }])}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Publication
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {publications.map((p) => (
                <div key={p.id} className="p-4 border rounded-xl bg-slate-50/50 flex flex-col md:flex-row gap-4 relative">
                  <button
                    onClick={() => setPublications(publications.filter((pub) => pub.id !== p.id))}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Paper / Publication Title"
                    value={p.title}
                    onChange={(e) => setPublications(publications.map((pub) => pub.id === p.id ? { ...pub, title: e.target.value } : pub))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Publisher / Journal"
                    value={p.publisher}
                    onChange={(e) => setPublications(publications.map((pub) => pub.id === p.id ? { ...pub, publisher: e.target.value } : pub))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 12: Additional Free-text Notes */}
        {currentStep === 12 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" /> Additional Context for AI
              </h3>
              <p className="text-xs text-slate-500">Provide any final strategic highlights or focus directions. The AI will weave these into the generated resume summary and achievements.</p>
            </div>

            <div className="space-y-4">
              <textarea
                rows={6}
                placeholder="e.g. Focus deeply on my high-availability systems work. Highlight that I graduated with honors from Stanford. Ensure the tone is highly strategic and commanding..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-slate-50 font-mono text-xs"
              />
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-xs text-blue-700">
                <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Clicking "Generate Resume" below</strong> will initiate a multi-factor LLM synthesis. Gemini will rewrite, refine, audit grammar, suggest keywords, structure bullet points, compute scores, and draft a cover letter.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CONTROLS ROW */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-6 mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-1 bg-slate-100 disabled:opacity-50 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4.5 h-4.5" /> Back Step
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-1 bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              Next Step <ArrowRight className="w-4.5 h-4.5" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-300 cursor-pointer animate-pulse"
            >
              <Sparkles className="w-5 h-5" /> Generate Resume with AI
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
