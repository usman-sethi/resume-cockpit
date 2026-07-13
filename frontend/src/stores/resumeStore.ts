import { create } from "zustand";
import { ResumeData, AppSettings, RecentActivity } from "../types";
import { SAMPLE_RESUME, DEFAULT_SETTINGS } from "../utils/initialData";

interface UndoRedoState {
  past: ResumeData[];
  future: ResumeData[];
}

interface ResumeStore {
  resumes: ResumeData[];
  activeResumeId: string | null;
  settings: AppSettings;
  recentActivities: RecentActivity[];
  userId: string | null;
  
  // History tracking per active resume session
  history: UndoRedoState;
  
  // Load initial state
  initialize: () => void;
  setUserId: (userId: string | null) => Promise<void>;
  
  // Resume Actions
  setActiveResumeId: (id: string | null) => void;
  createResume: (title: string, prefill?: boolean) => string;
  updateActiveResume: (updater: (prev: ResumeData) => ResumeData | Partial<ResumeData>) => void;
  duplicateResume: (id: string) => void;
  deleteResume: (id: string) => void;
  archiveResume: (id: string) => void;
  pinResume: (id: string) => void;
  importResume: (data: ResumeData) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Settings & Activity
  updateSettings: (settings: Partial<AppSettings>) => void;
  addActivity: (type: RecentActivity["type"], description: string) => void;
  resetToDefaultDataset: () => void;
  clearAllCache: () => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => {
  const saveToStorage = (resumes: ResumeData[], settings: AppSettings, activities: RecentActivity[]) => {
    try {
      localStorage.setItem("ai_resumes", JSON.stringify(resumes));
      localStorage.setItem("ai_resume_settings", JSON.stringify(settings));
      localStorage.setItem("ai_resume_activities", JSON.stringify(activities));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  };

  const getHeaders = async (additional: Record<string, string> = {}) => {
    const headers: Record<string, string> = { ...additional };
    const userId = get().userId;
    if (userId) {
      headers["x-user-id"] = userId;
    }
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  return {
    resumes: [],
    activeResumeId: null,
    settings: DEFAULT_SETTINGS,
    recentActivities: [],
    userId: null,
    history: { past: [], future: [] },

    setUserId: async (userId) => {
      set({ userId });
      try {
        const headers = await getHeaders({ "Content-Type": "application/json" });
        const response = await fetch("/api/resumes", { headers });
        if (response.ok) {
          const dbResumes = await response.json();
          if (dbResumes && dbResumes.length > 0) {
            set({ resumes: dbResumes, activeResumeId: dbResumes[0].id });
            localStorage.setItem("ai_resumes", JSON.stringify(dbResumes));
          } else {
            // Seed MongoDB database with our local resumes if database is empty for this user
            const currentResumes = get().resumes;
            for (const resume of currentResumes) {
              const seedHeaders = await getHeaders({ "Content-Type": "application/json" });
              await fetch("/api/resumes", {
                method: "POST",
                headers: seedHeaders,
                body: JSON.stringify(resume),
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not synchronize user resumes with MongoDB:", err);
      }
    },

    initialize: async () => {
      let resumes: ResumeData[] = [];
      let settings = DEFAULT_SETTINGS;
      let activities: RecentActivity[] = [];

      try {
        const storedResumes = localStorage.getItem("ai_resumes");
        const storedSettings = localStorage.getItem("ai_resume_settings");
        const storedActivities = localStorage.getItem("ai_resume_activities");

        if (storedResumes) resumes = JSON.parse(storedResumes);
        if (storedSettings) settings = JSON.parse(storedSettings);
        if (storedActivities) activities = JSON.parse(storedActivities);
      } catch (e) {
        console.error("Failed to load local state", e);
      }

      // Populate with default sample if nothing exists
      if (resumes.length === 0) {
        resumes = [SAMPLE_RESUME];
      }

      const activeId = resumes.length > 0 ? resumes[0].id : null;

      set({
        resumes,
        settings,
        recentActivities: activities,
        activeResumeId: activeId,
        history: { past: [], future: [] }
      });

      // Production-grade async sync with MongoDB
      try {
        const headers = await getHeaders();
        const response = await fetch("/api/resumes", { headers });
        if (response.ok) {
          const dbResumes = await response.json();
          if (dbResumes && dbResumes.length > 0) {
            set({ resumes: dbResumes, activeResumeId: dbResumes[0].id });
            localStorage.setItem("ai_resumes", JSON.stringify(dbResumes));
          } else {
            // Seed MongoDB database with our local resumes if database is empty
            for (const resume of resumes) {
              const seedHeaders = await getHeaders({ "Content-Type": "application/json" });
              await fetch("/api/resumes", {
                method: "POST",
                headers: seedHeaders,
                body: JSON.stringify(resume),
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not synchronize with MongoDB database. Running in offline-first mode:", err);
      }
    },

    setActiveResumeId: (id) => {
      set({ activeResumeId: id, history: { past: [], future: [] } });
    },

    createResume: (title, prefill = false) => {
      const id = "resume-" + Date.now();
      const newResume: ResumeData = prefill
        ? {
            ...SAMPLE_RESUME,
            id,
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isArchived: false,
            isPinned: false,
            version: 1,
          }
        : {
            id,
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isArchived: false,
            isPinned: false,
            version: 1,
            templateId: "minimal",
            customSections: [],
            personalInfo: {
              name: "",
              title: "",
              email: "",
              phone: "",
              address: "",
              linkedin: "",
              github: "",
              portfolio: "",
              website: "",
            },
            targetJob: {
              title: "",
              company: "",
              industry: "",
              employmentType: "Full-time",
              experienceLevel: "Mid-level",
              desiredLocation: "",
              jobDescription: "",
            },
            summary: "",
            experience: [],
            education: [],
            projects: [],
            skills: [],
            certifications: [],
            awards: [],
            languages: [],
            volunteer: [],
            publications: [],
            additionalNotes: "",
            score: {
              overall: 0,
              content: 0,
              ats: 0,
              grammar: 0,
              design: 30,
              impact: 0,
              skills: 0,
              keywords: 0,
              experience: 0,
              suggestions: ["Fill out sections to receive a comprehensive score analysis."]
            }
          };

      set((state) => {
        const nextResumes = [newResume, ...state.resumes];
        const nextActivities: RecentActivity[] = [
          {
            id: "act-" + Date.now(),
            timestamp: new Date().toISOString(),
            type: "create" as const,
            description: `Created new resume "${title}"`
          },
          ...state.recentActivities
        ].slice(0, 50);

        saveToStorage(nextResumes, state.settings, nextActivities);
        
        // Async Sync to MongoDB Cloud Database
        getHeaders({ "Content-Type": "application/json" }).then((headers) => {
          fetch("/api/resumes", {
            method: "POST",
            headers,
            body: JSON.stringify(newResume),
          }).catch((err) => console.error("Failed to sync created resume to MongoDB:", err));
        });

        return {
          resumes: nextResumes,
          activeResumeId: id,
          recentActivities: nextActivities,
          history: { past: [], future: [] }
        };
      });

      return id;
    },

    updateActiveResume: (updater) => {
      const state = get();
      const { activeResumeId, resumes, history } = state;
      if (!activeResumeId) return;const currentResume = resumes.find((r) => r.id === activeResumeId);
      if (!currentResume) return;

      const updatedFields = updater(currentResume);
      const updatedResume: ResumeData = {
        ...currentResume,
        ...updatedFields,
        updatedAt: new Date().toISOString(),
      };

      // Push to undo stack
      const newPast = [...history.past, currentResume].slice(-30); // limit to 30 undos

      const nextResumes = resumes.map((r) =>
        r.id === activeResumeId ? updatedResume : r
      );

      set({
        resumes: nextResumes,
        history: {
          past: newPast,
          future: [] // Clear redo history upon new modification
        }
      });

      saveToStorage(nextResumes, state.settings, state.recentActivities);

      // Async Sync update to MongoDB
      getHeaders({ "Content-Type": "application/json" }).then((headers) => {
        fetch(`/api/resumes/${activeResumeId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(updatedResume),
        }).catch((err) => console.error("Failed to sync updated resume to MongoDB:", err));
      });
    },

    duplicateResume: (id) => {
      set((state) => {
        const target = state.resumes.find((r) => r.id === id);
        if (!target) return {};

        const newId = "resume-" + Date.now();
        const duplicated: ResumeData = {
          ...target,
          id: newId,
          title: `${target.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: false,
          version: 1,
        };

        const nextResumes = [duplicated, ...state.resumes];
        const nextActivities: RecentActivity[] = [
          {
            id: "act-" + Date.now(),
            timestamp: new Date().toISOString(),
            type: "create" as const,
            description: `Duplicated resume "${target.title}"`
          },
          ...state.recentActivities
        ].slice(0, 50);

        saveToStorage(nextResumes, state.settings, nextActivities);

        // Async Sync duplicated item to MongoDB
        getHeaders({ "Content-Type": "application/json" }).then((headers) => {
          fetch("/api/resumes", {
            method: "POST",
            headers,
            body: JSON.stringify(duplicated),
          }).catch((err) => console.error("Failed to sync duplicated resume to MongoDB:", err));
        });

        return {
          resumes: nextResumes,
          recentActivities: nextActivities
        };
      });
    },

    deleteResume: (id) => {
      set((state) => {
        const target = state.resumes.find((r) => r.id === id);
        const nextResumes = state.resumes.filter((r) => r.id !== id);
        let nextActiveId = state.activeResumeId;
        
        if (state.activeResumeId === id) {
          nextActiveId = nextResumes.length > 0 ? nextResumes[0].id : null;
        }

        const nextActivities: RecentActivity[] = [
          {
            id: "act-" + Date.now(),
            timestamp: new Date().toISOString(),
            type: "edit" as const,
            description: `Deleted resume "${target?.title || "Unknown"}"`
          },
          ...state.recentActivities
        ].slice(0, 50);

        saveToStorage(nextResumes, state.settings, nextActivities);

        // Async Sync delete to MongoDB
        getHeaders().then((headers) => {
          fetch(`/api/resumes/${id}`, {
            method: "DELETE",
            headers,
          }).catch((err) => console.error("Failed to delete resume from MongoDB:", err));
        });

        return {
          resumes: nextResumes,
          activeResumeId: nextActiveId,
          recentActivities: nextActivities,
          history: { past: [], future: [] }
        };
      });
    },

    archiveResume: (id) => {
      set((state) => {
        const nextResumes = state.resumes.map((r) =>
          r.id === id ? { ...r, isArchived: !r.isArchived } : r
        );
        const target = state.resumes.find((r) => r.id === id);
        const actionText = target?.isArchived ? "Restored" : "Archived";

        const nextActivities: RecentActivity[] = [
          {
            id: "act-" + Date.now(),
            timestamp: new Date().toISOString(),
            type: "edit" as const,
            description: `${actionText} resume "${target?.title}"`
          },
          ...state.recentActivities
        ].slice(0, 50);

        saveToStorage(nextResumes, state.settings, nextActivities);

        // Async Sync archive state to MongoDB
        const updated = nextResumes.find((r) => r.id === id);
        if (updated) {
          getHeaders({ "Content-Type": "application/json" }).then((headers) => {
            fetch(`/api/resumes/${id}`, {
              method: "PUT",
              headers,
              body: JSON.stringify(updated),
            }).catch((err) => console.error("Failed to sync archive status to MongoDB:", err));
          });
        }

        return {
          resumes: nextResumes,
          recentActivities: nextActivities
        };
      });
    },

    pinResume: (id) => {
      set((state) => {
        const nextResumes = state.resumes.map((r) =>
          r.id === id ? { ...r, isPinned: !r.isPinned } : r
        );
        saveToStorage(nextResumes, state.settings, state.recentActivities);

        // Async Sync pin state to MongoDB
        const updated = nextResumes.find((r) => r.id === id);
        if (updated) {
          getHeaders({ "Content-Type": "application/json" }).then((headers) => {
            fetch(`/api/resumes/${id}`, {
              method: "PUT",
              headers,
              body: JSON.stringify(updated),
            }).catch((err) => console.error("Failed to sync pin status to MongoDB:", err));
          });
        }

        return { resumes: nextResumes };
      });
    },

    importResume: (data) => {
      set((state) => {
        // Ensure valid ID
        const importData = {
          ...data,
          id: data.id || "resume-" + Date.now(),
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const nextResumes = [importData, ...state.resumes.filter((r) => r.id !== importData.id)];
        const nextActivities: RecentActivity[] = [
          {
            id: "act-" + Date.now(),
            timestamp: new Date().toISOString(),
            type: "edit" as const,
            description: `Imported resume "${importData.title}"`
          },
          ...state.recentActivities
        ].slice(0, 50);

        saveToStorage(nextResumes, state.settings, nextActivities);

        // Async Sync imported resume to MongoDB
        getHeaders({ "Content-Type": "application/json" }).then((headers) => {
          fetch("/api/resumes", {
            method: "POST",
            headers,
            body: JSON.stringify(importData),
          }).catch((err) => console.error("Failed to sync imported resume to MongoDB:", err));
        });

        return {
          resumes: nextResumes,
          activeResumeId: importData.id,
          recentActivities: nextActivities,
          history: { past: [], future: [] }
        };
      });
    },

    undo: () => {
      const { history, resumes, activeResumeId } = get();
      if (!activeResumeId || history.past.length === 0) return;

      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, history.past.length - 1);
      const current = resumes.find((r) => r.id === activeResumeId);

      if (!current) return;

      const nextResumes = resumes.map((r) =>
        r.id === activeResumeId ? previous : r
      );

      set({
        resumes: nextResumes,
        history: {
          past: newPast,
          future: [current, ...history.future]
        }
      });

      saveToStorage(nextResumes, get().settings, get().recentActivities);
    },

    redo: () => {
      const { history, resumes, activeResumeId } = get();
      if (!activeResumeId || history.future.length === 0) return;

      const next = history.future[0];
      const newFuture = history.future.slice(1);
      const current = resumes.find((r) => r.id === activeResumeId);

      if (!current) return;

      const nextResumes = resumes.map((r) =>
        r.id === activeResumeId ? next : r
      );

      set({
        resumes: nextResumes,
        history: {
          past: [...history.past, current],
          future: newFuture
        }
      });

      saveToStorage(nextResumes, get().settings, get().recentActivities);
    },

    canUndo: () => get().history.past.length > 0,
    canRedo: () => get().history.future.length > 0,

    updateSettings: (newSettings) => {
      set((state) => {
        const nextSettings = { ...state.settings, ...newSettings };
        saveToStorage(state.resumes, nextSettings, state.recentActivities);
        return { settings: nextSettings };
      });
    },

    addActivity: (type, description) => {
      set((state) => {
        const nextActivities: RecentActivity[] = [
          {
            id: "act-" + Date.now(),
            timestamp: new Date().toISOString(),
            type,
            description
          },
          ...state.recentActivities
        ].slice(0, 50);
        saveToStorage(state.resumes, state.settings, nextActivities);
        return { recentActivities: nextActivities };
      });
    },

    resetToDefaultDataset: () => {
      set((state) => {
        const nextResumes = [SAMPLE_RESUME];
        const nextActivities: RecentActivity[] = [
          {
            id: "act-" + Date.now(),
            timestamp: new Date().toISOString(),
            type: "edit" as const,
            description: "Loaded sample Stripe staff developer data profiles"
          },
          ...state.recentActivities
        ].slice(0, 50);

        saveToStorage(nextResumes, state.settings, nextActivities);
        return {
          resumes: nextResumes,
          activeResumeId: SAMPLE_RESUME.id,
          recentActivities: nextActivities,
          history: { past: [], future: [] }
        };
      });
    },

    clearAllCache: () => {
      set({
        resumes: [],
        activeResumeId: null,
        recentActivities: [],
        history: { past: [], future: [] }
      });
      try {
        localStorage.removeItem("ai_resumes");
        localStorage.removeItem("ai_resume_settings");
        localStorage.removeItem("ai_resume_activities");
      } catch (e) {
        console.error(e);
      }
    }
  };
});
