import { ResumeData, AppSettings } from "../types";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  language: "en",
  pdfPageSize: "Letter",
  pdfMargins: "normal",
  autosave: true,
  aiModelPreference: "gemini-3.5-flash",
  showSignature: true,
  showQrCode: true,
  aiRoutingMode: "AUTO",
  aiPipelineEnabled: false,
  aiParallelMode: false,
  aiCacheEnabled: true,
};

export const SAMPLE_RESUME: ResumeData = {
  id: "stripe-sample-resume",
  title: "Stripe Senior Staff Engineer Resume",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isArchived: false,
  isPinned: true,
  version: 1,
  templateId: "modern",
  customSections: [],
  personalInfo: {
    name: "Alex Rivera",
    title: "Senior Staff Software Engineer",
    email: "alex.rivera@gmail.com",
    phone: "+1 (555) 019-2834",
    address: "San Francisco, CA",
    linkedin: "linkedin.com/in/alex-rivera-staff",
    github: "github.com/alexrivera-dev",
    portfolio: "alexrivera.dev",
    website: "alexrivera.dev",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
    signatureUrl: "",
    qrCodeUrl: "",
  },
  targetJob: {
    title: "Principal Engineer / Software Architect",
    company: "Stripe, Linear, or Vercel",
    industry: "Fintech & Developer Tools",
    employmentType: "Full-time",
    experienceLevel: "Staff / Principal",
    desiredLocation: "San Francisco, CA or Remote",
    salaryRange: "$250k - $300k",
    jobDescription: "Seeking a Principal Engineer to scale core payment processing pipelines, mentor senior staff, and define multi-region architecture for high-throughput transactional engines."
  },
  summary: "Distinguished Staff Engineer with over 8 years of experience designing, building, and operating high-throughput transactional APIs and developer platforms. Proven track record of spearheading zero-downtime database migrations, leading cross-functional platform teams of 15+ engineers, and optimizing system latencies by up to 40% at scale. Deep expertise in distributed systems, financial ledger integrity, and cloud-native infrastructure.",
  experience: [
    {
      id: "exp-1",
      company: "Stripe",
      role: "Senior Staff Software Engineer",
      location: "San Francisco, CA",
      startDate: "2021-06",
      endDate: "Present",
      current: true,
      description: "Spearheaded the design and implementation of Stripe's next-generation Global Billing Engine, serving over 15M+ active daily subscribers.\nLed architectural overhaul of the multi-tenant core database, transitioning from a legacy SQL shard model to distributed Spanner, achieving 99.999% uptime.\nMentored 12 senior engineers, established weekly architecture reviews, and fostered a culture of performance-oriented craftsmanship.",
      technologies: ["TypeScript", "Go", "Spanner", "Kubernetes", "gRPC", "Kafka"],
      achievements: [
        "Reduced 99th percentile API latency by 32% (from 180ms to 122ms) under a peak load of 45,000 requests per second.",
        "Delivered zero-downtime data migration of 4.2 billion ledger records with zero reconciliation errors, saving $1.2M in infrastructure overhead."
      ]
    },
    {
      id: "exp-2",
      company: "Vercel",
      role: "Staff Platform Engineer",
      location: "Remote",
      startDate: "2018-03",
      endDate: "2021-05",
      current: false,
      description: "Designed core Edge Network routing architectures and middleware execution runtime for Vercel's global CDN platform.\nCollaborated directly with the Next.js core team to optimize static-site generation compilation caches, decreasing build cold-starts across Vercel deployments.",
      technologies: ["TypeScript", "Next.js", "Rust", "WebAssembly", "Cloudflare Workers", "AWS"],
      achievements: [
        "Improved global edge asset delivery caching ratios by 18%, resulting in an average 80ms reduction in Time-to-First-Byte (TTFB).",
        "Pioneered serverless cold-start reduction techniques, improving initial execution responsiveness by 45% globally."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "Stanford University",
      degree: "Master of Science",
      major: "Computer Science (Distributed Systems)",
      graduationYear: "2018",
      gpa: "3.92",
      coursework: "Advanced Distributed Systems, Database Systems, Cloud Computing Architectures, Advanced Cryptography"
    },
    {
      id: "edu-2",
      school: "UC Berkeley",
      degree: "Bachelor of Science",
      major: "Electrical Engineering and Computer Science (EECS)",
      graduationYear: "2016",
      gpa: "3.85"
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "Chronos Ledger",
      description: "An open-source, ultra-fast financial transaction ledger utilizing Raft consensus protocol for strict serializability and double-entry auditing validation.",
      technologies: ["Rust", "gRPC", "RocksDB", "Docker"],
      challenges: "Ensuring sub-millisecond local latency while preserving distributed state consensus during network split-brain simulations.",
      achievements: "Capable of processing 120,000 write transactions per second per shard with a consensus commit latency of <3.5ms.",
      githubUrl: "github.com/alexrivera-dev/chronos-ledger",
      liveUrl: "chronosledger.dev"
    },
    {
      id: "proj-2",
      name: "EdgeStore Key-Value",
      description: "High-performance edge key-value storage engine designed to run in local WASM environments with instant asynchronous synchronization to cloud databases.",
      technologies: ["TypeScript", "WebAssembly", "SQLite", "Cloudflare Workers"],
      githubUrl: "github.com/alexrivera-dev/edgestore-kv"
    }
  ],
  skills: [
    {
      category: "Languages & Core Technologies",
      skills: ["TypeScript", "JavaScript", "Go", "Rust", "C++", "Python", "SQL", "GraphQL"]
    },
    {
      category: "Frameworks & Runtimes",
      skills: ["React", "Next.js", "Node.js", "Express", "Vite", "WebAssembly", "gRPC"]
    },
    {
      category: "Infrastructure & Cloud",
      skills: ["AWS", "Google Cloud", "Spanner", "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes", "CI/CD Platforms"]
    },
    {
      category: "Design & Soft Skills",
      skills: ["System Architecture", "API Design", "Distributed Ledgers", "Technical Leadership", "Agile Methodologies", "Stripe Integration"]
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Professional",
      issuer: "Amazon Web Services (AWS)",
      date: "2023-04"
    },
    {
      id: "cert-2",
      name: "Google Cloud Certified Professional Cloud Architect",
      issuer: "Google Cloud Platform",
      date: "2022-09"
    }
  ],
  awards: [
    {
      id: "award-1",
      title: "Outstanding Engineering Achievement Award",
      issuer: "Stripe",
      date: "2022-12",
      description: "Awarded for lead contribution to zero-downtime Billing platform migration."
    }
  ],
  languages: [
    {
      id: "lang-1",
      language: "English",
      proficiency: "Native"
    },
    {
      id: "lang-2",
      language: "Spanish",
      proficiency: "Fluent"
    }
  ],
  volunteer: [
    {
      id: "vol-1",
      organization: "Bridge to Tech",
      role: "Technical Mentor",
      startDate: "2019-01",
      endDate: "Present",
      current: true,
      description: "Fostering programming, data structures, and distributed systems fundamentals for students from underrepresented communities."
    }
  ],
  publications: [
    {
      id: "pub-1",
      title: "Consensus Tuning in High-Frequency FinTech Architectures",
      publisher: "IEEE Distributed Systems Newsletter",
      date: "2023-08",
      url: "ieee.org/publications/consensus-tuning-fintech",
      description: "An analytical study of Raft consensus tuning for low latency double-entry ledgers."
    }
  ],
  additionalNotes: "Alex is highly passionate about performance profiling, compiling optimizations, and edge runtimes. He is active in open-source developer communities and regularly speaks at React and Node summits.",
  score: {
    overall: 94,
    content: 95,
    ats: 98,
    grammar: 96,
    design: 90,
    impact: 95,
    skills: 96,
    keywords: 92,
    experience: 94,
    suggestions: [
      "Your resume score is excellent (94/100). To reach 100/100, consider adding exact numbers to your volunteer work responsibilities.",
      "Consider using more action verbs in your Vercel Staff Platform Engineer description to further boost the impact score.",
      "Add direct links to your Stanford thesis paper if available online."
    ]
  },
  atsResult: {
    overallScore: 96,
    formatting: { score: 98, text: "Excellent clean formatting, no complex columns or un-scannable text frames.", status: "success" },
    length: { score: 95, text: "Perfect balance. Your resume has an appropriate amount of content spanning 1 to 2 A4 pages.", status: "success" },
    sections: { score: 100, text: "Standard ATS section headers (Summary, Experience, Education, Skills, Projects) detected in order.", status: "success" },
    contactInfo: { score: 100, text: "Full contact detail blocks including professional email, phone number, LinkedIn, and GitHub links present.", status: "success" },
    keywordDensity: { score: 92, text: "Good keyword density. High occurrences of TypeScript, Distributed Systems, Spanner, Go, and Spanner.", status: "success" },
    actionVerbs: { score: 94, text: "Excellent usage of modern action verbs: Spearheaded, Mentored, Overhauled, Pioneered, Reduced.", status: "success" },
    grammar: { score: 98, text: "Zero grammatical errors or passive statements found.", status: "success" },
    readability: { score: 96, text: "Excellent readability level, suitable for technical screening.", status: "success" },
    suggestions: [
      "No critical errors. Double check that phone number format includes a country code if applying overseas.",
      "Include 'GraphQL' once more under achievements to reinforce API specialization."
    ],
    warnings: [],
    strengths: [
      "High density of strong, quantifiable action verbs.",
      "Standard readable section structure that parses seamlessly into ATS databases.",
      "GitHub and LinkedIn profiles are verified and clickable."
    ]
  }
};
