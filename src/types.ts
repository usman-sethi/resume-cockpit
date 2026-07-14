export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
  photoUrl?: string;
  signatureUrl?: string;
  qrCodeUrl?: string;
}

export interface TargetJob {
  title: string;
  company: string;
  industry: string;
  employmentType: string;
  experienceLevel: string;
  desiredLocation: string;
  salaryRange?: string;
  jobDescription?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string; // "Present" or Date
  current: boolean;
  description: string; // Bullet points as text or list
  technologies: string[];
  achievements: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  major: string;
  graduationYear: string;
  gpa?: string;
  coursework?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  challenges?: string;
  achievements?: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expirationDate?: string;
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: "Native" | "Fluent" | "Professional" | "Intermediate" | "Conversational" | "Basic";
}

export interface VolunteerItem {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url?: string;
  description?: string;
}

export type TemplateId =
  | "minimal"
  | "modern"
  | "executive"
  | "professional"
  | "corporate"
  | "elegant"
  | "academic"
  | "creative"
  | "harvard"
  | "stanford"
  | "google"
  | "microsoft";

export interface ResumeScore {
  overall: number;
  content: number;
  ats: number;
  grammar: number;
  design: number;
  impact: number;
  skills: number;
  keywords: number;
  experience: number;
  suggestions: string[];
}

export interface ATSCheckerResult {
  overallScore: number;
  formatting: { score: number; text: string; status: "success" | "warning" | "error" };
  length: { score: number; text: string; status: "success" | "warning" | "error" };
  sections: { score: number; text: string; status: "success" | "warning" | "error" };
  contactInfo: { score: number; text: string; status: "success" | "warning" | "error" };
  keywordDensity: { score: number; text: string; status: "success" | "warning" | "error" };
  actionVerbs: { score: number; text: string; status: "success" | "warning" | "error" };
  grammar: { score: number; text: string; status: "success" | "warning" | "error" };
  readability: { score: number; text: string; status: "success" | "warning" | "error" };
  suggestions: string[];
  warnings: string[];
  strengths: string[];
}

export interface JobMatchResult {
  matchPercentage: number;
  keywordMatchScore: number;
  skillsMatchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface CoverLetter {
  recipientName?: string;
  recipientTitle?: string;
  companyName?: string;
  companyAddress?: string;
  date?: string;
  subject?: string;
  salutation?: string;
  body: string;
  signOff?: string;
}

export interface ResumeData {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  isArchived: boolean;
  isPinned: boolean;
  version: number;
  
  // Custom Sections
  customSections: { id: string; title: string; content: string }[];

  // Resume Content
  personalInfo: PersonalInfo;
  targetJob: TargetJob;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillGroup[];
  certifications: CertificationItem[];
  awards: AwardItem[];
  languages: LanguageItem[];
  volunteer: VolunteerItem[];
  publications: PublicationItem[];
  additionalNotes: string;
  
  // AI Generated / Secondary Content
  score: ResumeScore;
  atsResult?: ATSCheckerResult;
  jobMatchResult?: JobMatchResult;
  coverLetter?: CoverLetter;
  linkedinSummary?: string;
  interviewQuestions?: string[];
  
  // UI preferences
  templateId: TemplateId;
}

export interface ResumeVersion {
  version: number;
  timestamp: string;
  description: string;
  data: ResumeData;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: "en" | "es" | "fr" | "de";
  pdfPageSize: "A4" | "Letter";
  pdfMargins: "compact" | "normal" | "wide";
  autosave: boolean;
  aiModelPreference: "gemini-3.5-flash" | "gemini-3.1-pro-preview";
  showSignature: boolean;
  showQrCode: boolean;
  aiRoutingMode?: "AUTO" | "GEMINI" | "GROQ" | "MISTRAL";
  aiPipelineEnabled?: boolean;
  aiParallelMode?: boolean;
  aiCacheEnabled?: boolean;
  subscriptionPlan?: "basic" | "premium";
  premiumUnlocked?: boolean;
  promoCodeApplied?: string;
}

export interface RecentActivity {
  id: string;
  timestamp: string;
  type: "create" | "edit" | "generate" | "optimize" | "export";
  description: string;
}
