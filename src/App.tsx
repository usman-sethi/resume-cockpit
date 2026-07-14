import { useState, useEffect } from "react";
import { useResumeStore } from "./stores/resumeStore";
import LandingPage from "./features/landing/LandingPage";
import Dashboard from "./features/dashboard/Dashboard";
import CreateWizard from "./features/resume/CreateWizard";
import LiveEditor from "./features/resume/LiveEditor";
import ATSCheckerPage from "./features/ats/ATSCheckerPage";
import JobMatchPage from "./features/ats/JobMatchPage";
import SettingsPage from "./features/settings/SettingsPage";
import { CustomUserButton, useCustomUser } from "./components/ClerkAuthWrapper";
import { motion } from "motion/react";

import { Sparkles, LayoutDashboard, Sliders, LogOut, FileSearch, ShieldCheck, Menu, X } from "lucide-react";

type ViewState = "landing" | "dashboard" | "create_wizard" | "live_editor" | "ats_checker" | "job_match" | "settings";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>("landing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeResumeId, resumes, setActiveResumeId, updateActiveResume, resetToDefaultDataset, initialize, setUserId } = useResumeStore();
  const { isSignedIn, user, openSignIn } = useCustomUser();

  // Redirect to landing if user becomes unauthenticated while on a protected page
  useEffect(() => {
    if (!isSignedIn && currentView !== "landing") {
      setCurrentView("landing");
    }
  }, [isSignedIn, currentView]);

  // Sync Clerk authenticated user to state
  useEffect(() => {
    if (isSignedIn && user?.id) {
      setUserId(user.id);
    } else {
      setUserId(null);
    }
  }, [isSignedIn, user?.id, setUserId]);

  // Initial load
  useEffect(() => {
    initialize();
  }, [initialize]);

  const navigateToView = (view: ViewState) => {
    if (view !== "landing" && !isSignedIn) {
      openSignIn();
      return;
    }
    setCurrentView(view);
  };

  const handleStartApp = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    // If we have zero resumes, let's load our gorgeous mock data first so they don't see a blank state.
    if (resumes.length === 0) {
      resetToDefaultDataset();
    }
    setCurrentView("dashboard");
  };

  const handleSelectTemplateFromLanding = (templateId: any) => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    resetToDefaultDataset();
    // Set the template ID of the first resume to this selection
    if (resumes.length > 0) {
      setActiveResumeId(resumes[0].id);
      updateActiveResume(() => ({ templateId }));
      setCurrentView("live_editor");
    } else {
      setCurrentView("create_wizard");
    }
  };

  const handleCreateComplete = (newResumeId: string) => {
    setActiveResumeId(newResumeId);
    navigateToView("live_editor");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* LANDING PAGE ROUTE */}
      {currentView === "landing" && (
        <LandingPage
          onStart={handleStartApp}
          onSelectTemplate={handleSelectTemplateFromLanding}
        />
      )}

      {/* INNER COCKPIT APPLICATION ROUTER */}
      {currentView !== "landing" && (
        <div className="flex flex-col min-h-screen">
          
          {/* TOP INNER NAV HEADER */}
          {currentView !== "live_editor" && (
            <header className="border-b border-gray-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <div
                  onClick={() => { navigateToView("dashboard"); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <img 
                    src="/logo.png" 
                    onError={(e) => { e.currentTarget.src = "/logo.jpg"; }}
                    alt="AI Resume Architect Logo" 
                    className="w-8 h-8 rounded-lg object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-extrabold text-xs sm:text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 max-w-[130px] sm:max-w-none truncate">
                    AI Resume Architect
                  </span>
                </div>

                {/* Inner Tabbing Controls */}
                <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-500">
                  <button
                    onClick={() => navigateToView("dashboard")}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                      currentView === "dashboard" ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-500" /> Cockpit
                  </button>
                  <button
                    onClick={() => navigateToView("ats_checker")}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                      currentView === "ats_checker" ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> ATS Checker
                  </button>
                  <button
                    onClick={() => navigateToView("job_match")}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                      currentView === "job_match" ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <FileSearch className="w-4 h-4 text-indigo-500" /> Job Matching
                  </button>
                  <button
                    onClick={() => navigateToView("settings")}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                      currentView === "settings" ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-purple-500" /> Settings
                  </button>
                </nav>

                <div className="flex items-center gap-4">
                  <CustomUserButton />

                  <button
                    onClick={() => { navigateToView("landing"); setMobileMenuOpen(false); }}
                    className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Exit Cockpit
                  </button>

                  {/* Mobile Hamburger Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 md:hidden cursor-pointer"
                    aria-label="Toggle navigation menu"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Mobile Drawer Dropdown */}
              {mobileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-6 py-4 flex flex-col gap-3 text-xs font-bold shadow-lg"
                >
                  <button
                    onClick={() => { navigateToView("dashboard"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                      currentView === "dashboard" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-500" /> Cockpit Dashboard
                  </button>
                  <button
                    onClick={() => { navigateToView("ats_checker"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                      currentView === "ats_checker" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> ATS Scan Checklist
                  </button>
                  <button
                    onClick={() => { navigateToView("job_match"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                      currentView === "job_match" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FileSearch className="w-4 h-4 text-indigo-500" /> AI Job Matching
                  </button>
                  <button
                    onClick={() => { navigateToView("settings"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                      currentView === "settings" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-purple-500" /> Settings Panel
                  </button>
                  <div className="h-[1px] bg-slate-100 my-1"></div>
                  <button
                    onClick={() => { navigateToView("landing"); setMobileMenuOpen(false); }}
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Exit Cockpit
                  </button>
                </motion.div>
              )}
            </header>
          )}

          {/* DYNAMIC VIEW CONTAINER */}
          <main className="flex-1">
            {currentView === "dashboard" && (
              <Dashboard
                onEditResume={(id) => navigateToView("live_editor")}
                onCreateNew={() => navigateToView("create_wizard")}
                onNavigateToATS={() => navigateToView("ats_checker")}
                onNavigateToMatch={() => navigateToView("job_match")}
                onNavigateToSettings={() => navigateToView("settings")}
              />
            )}

            {currentView === "create_wizard" && (
              <CreateWizard
                onComplete={handleCreateComplete}
                onCancel={() => navigateToView("dashboard")}
              />
            )}

            {currentView === "live_editor" && activeResumeId && (
              <LiveEditor
                resumeId={activeResumeId}
                onBackToDashboard={() => navigateToView("dashboard")}
                onNavigateToATS={() => navigateToView("ats_checker")}
                onNavigateToSettings={() => navigateToView("settings")}
              />
            )}

            {currentView === "ats_checker" && (
              <ATSCheckerPage
                onBack={() => navigateToView("dashboard")}
              />
            )}

            {currentView === "job_match" && (
              <JobMatchPage
                onBack={() => navigateToView("dashboard")}
              />
            )}

            {currentView === "settings" && (
              <SettingsPage
                onBack={() => navigateToView("dashboard")}
              />
            )}
          </main>
        </div>
      )}

    </div>
  );
}
