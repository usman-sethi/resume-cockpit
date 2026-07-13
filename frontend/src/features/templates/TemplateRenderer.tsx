import { ResumeData, TemplateId } from "../../types";

interface TemplateRendererProps {
  data: ResumeData;
  zoom?: number; // scale factor, e.g. 1
  pageSize?: "A4" | "Letter";
  margins?: "compact" | "normal" | "wide";
  showSignature?: boolean;
  showQrCode?: boolean;
}

export default function TemplateRenderer({
  data,
  zoom = 1,
  pageSize = "Letter",
  margins = "normal",
  showSignature = true,
  showQrCode = true,
}: TemplateRendererProps) {
  const { personalInfo, summary, experience, education, projects, skills, certifications, awards, languages, volunteer, publications, templateId } = data;

  // Margin CSS classes
  const paddingClasses = {
    compact: "p-6 md:p-8",
    normal: "p-10 md:p-12",
    wide: "p-14 md:p-16",
  }[margins];

  const pageDimensions = {
    A4: "w-[210mm] min-h-[297mm]",
    Letter: "w-[8.5in] min-h-[11in]",
  }[pageSize];

  // Helper to render star rating or proficiency pill
  const renderProficiency = (level: string) => {
    const map = {
      Native: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      Fluent: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
      Professional: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Intermediate: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      Conversational: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      Basic: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    };
    return (
      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${map[level as keyof typeof map] || "bg-gray-100 text-gray-800"}`}>
        {level}
      </span>
    );
  };

  // Render Section Headers consistently with template guidelines
  const renderHeader = (title: string, colorClass: string, isSerif: boolean) => {
    return (
      <div className="mb-4">
        <h3 className={`text-xs uppercase tracking-widest font-semibold ${colorClass} ${isSerif ? "font-serif" : "font-sans"}`}>
          {title}
        </h3>
        <div className={`h-[1px] w-full mt-1 ${templateId === "minimal" ? "bg-gray-200" : "bg-gray-300 dark:bg-gray-700"}`}></div>
      </div>
    );
  };

  // Determine fonts and color themes based on Template ID
  const isSerif = ["executive", "elegant", "academic", "harvard", "stanford"].includes(templateId);
  const fontClass = isSerif ? "font-serif text-gray-800" : "font-sans text-gray-800";

  let headerColor = "text-gray-900";
  let accentColor = "text-blue-600";
  let borderAccent = "border-blue-600";
  let badgeBg = "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300";

  if (templateId === "harvard") {
    headerColor = "text-[#A51C30]"; // Crimson
    accentColor = "text-[#A51C30]";
    borderAccent = "border-[#A51C30]";
    badgeBg = "bg-red-50 text-[#A51C30]";
  } else if (templateId === "stanford") {
    headerColor = "text-[#8C1515]"; // Cardinal Red
    accentColor = "text-[#8C1515]";
    borderAccent = "border-[#8C1515]";
    badgeBg = "bg-red-50 text-[#8C1515]";
  } else if (templateId === "google") {
    headerColor = "text-[#4285F4]"; // Google Blue
    accentColor = "text-[#34A853]"; // Green accent
    borderAccent = "border-[#4285F4]";
    badgeBg = "bg-blue-50 text-blue-700";
  } else if (templateId === "microsoft") {
    headerColor = "text-[#0078D4]"; // MS Blue
    accentColor = "text-[#0078D4]";
    borderAccent = "border-[#0078D4]";
    badgeBg = "bg-blue-50 text-[#0078D4]";
  } else if (templateId === "executive") {
    headerColor = "text-slate-900";
    accentColor = "text-amber-700";
    borderAccent = "border-amber-700";
    badgeBg = "bg-amber-50 text-amber-900";
  } else if (templateId === "elegant") {
    headerColor = "text-indigo-950";
    accentColor = "text-indigo-600";
    borderAccent = "border-indigo-600";
    badgeBg = "bg-indigo-50 text-indigo-700";
  } else if (templateId === "creative") {
    headerColor = "text-pink-600";
    accentColor = "text-purple-600";
    borderAccent = "border-pink-500";
    badgeBg = "bg-pink-50 text-pink-700";
  }

  // Split-screen Template Layout Structures
  const hasSidebar = ["modern", "creative", "elegant"].includes(templateId);

  return (
    <div className="bg-gray-100 dark:bg-zinc-900 p-2 overflow-auto flex justify-center items-start w-full">
      <div
        id="resume-print-area"
        style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        className={`bg-white dark:bg-zinc-950 shadow-xl transition-all duration-300 relative text-left leading-relaxed ${pageDimensions} ${paddingClasses} ${fontClass}`}
      >
        {/* Style Block for print pagination/page-breaks */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; color: black !important; }
            #resume-print-area { transform: none !important; box-shadow: none !important; width: 100% !important; height: auto !important; margin: 0 !important; padding: 0.5in !important; }
            .page-break { page-break-before: always; }
          }
        `}} />

        {/* --- TEMPLATE 1: HARVARD (Symmetric serif, prestigious, centered summary) --- */}
        {templateId === "harvard" && (
          <div className="space-y-6">
            <div className="text-center border-b pb-4 border-[#A51C30]/20">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[#A51C30]">{personalInfo.name || "YOUR NAME"}</h1>
              <p className="text-sm font-medium tracking-wide text-gray-600 mt-1 uppercase">{personalInfo.title || "PROFESSIONAL TITLE"}</p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-3 font-serif italic">
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.address && <span>{personalInfo.address}</span>}
                {personalInfo.website && <span className="underline">{personalInfo.website}</span>}
              </div>
            </div>

            {summary && (
              <div className="text-sm text-gray-700 text-justify italic font-serif leading-relaxed px-4">
                "{summary}"
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div>
                {renderHeader("Professional Experience", "text-[#A51C30]", true)}
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="text-sm">
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>{exp.role} — <span className="font-normal italic">{exp.company}</span></span>
                        <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <p className="text-xs text-gray-500 italic mb-1">{exp.location}</p>
                      <p className="text-gray-700 whitespace-pre-line text-xs pl-2 border-l border-gray-200 mt-1">{exp.description}</p>
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-gray-700 mt-1 pl-4 space-y-0.5">
                          {exp.achievements.map((ach, idx) => <li key={idx}>{ach}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                {renderHeader("Education", "text-[#A51C30]", true)}
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="text-sm">
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>{edu.degree} in {edu.major}</span>
                        <span className="text-xs text-gray-500">{edu.graduationYear}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{edu.school}</span>
                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                      </div>
                      {edu.coursework && <p className="text-[11px] text-gray-500 mt-0.5 italic">Relevant Coursework: {edu.coursework}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div>
                {renderHeader("Selected Projects", "text-[#A51C30]", true)}
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="text-xs">
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>{proj.name} {proj.liveUrl && <span className="text-[10px] font-normal text-gray-400">({proj.liveUrl})</span>}</span>
                        {proj.githubUrl && <span className="text-[10px] font-mono text-gray-400">{proj.githubUrl}</span>}
                      </div>
                      <p className="text-gray-700 mt-0.5">{proj.description}</p>
                      {proj.achievements && <p className="text-gray-600 mt-0.5 italic"><strong className="not-italic">Key result:</strong> {proj.achievements}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                {renderHeader("Core Expertise", "text-[#A51C30]", true)}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {skills.map((group, idx) => (
                    <div key={idx} className="border-l border-red-100 pl-2">
                      <span className="font-semibold text-gray-800 block text-[11px] uppercase tracking-wider">{group.category}</span>
                      <p className="text-gray-600 mt-0.5 text-[11px]">{group.skills.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TEMPLATE 2: MODERN (Elegant grid sidebar, visual icons / photo placeholder, dual panel) --- */}
        {templateId === "modern" && (
          <div className="grid grid-cols-12 gap-8 h-full">
            {/* Sidebar Column */}
            <div className="col-span-4 border-r border-gray-100 pr-6 space-y-6">
              <div className="text-center md:text-left space-y-4">
                {personalInfo.photoUrl && (
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.name}
                    className="w-24 h-24 rounded-2xl object-cover border border-gray-200 mx-auto md:mx-0 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-tight">{personalInfo.name || "YOUR NAME"}</h1>
                  <p className="text-xs font-semibold text-blue-600 tracking-wider uppercase mt-1">{personalInfo.title || "TITLE"}</p>
                </div>
              </div>

              {/* Contact Block */}
              <div className="space-y-2 text-xs text-gray-600 pt-4 border-t border-gray-100">
                <p className="font-bold uppercase tracking-wider text-[10px] text-gray-400">Contact</p>
                {personalInfo.phone && <p className="truncate">📞 {personalInfo.phone}</p>}
                {personalInfo.email && <p className="truncate">✉️ {personalInfo.email}</p>}
                {personalInfo.address && <p>📍 {personalInfo.address}</p>}
                {personalInfo.linkedin && <p className="truncate">🔗 {personalInfo.linkedin}</p>}
                {personalInfo.github && <p className="truncate">💻 {personalInfo.github}</p>}
              </div>

              {/* Skills groups inside sidebar */}
              {skills.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-gray-400">Technical Skills</p>
                  {skills.map((grp, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-700 uppercase">{grp.category}</p>
                      <div className="flex flex-wrap gap-1">
                        {grp.skills.map((sk, sIdx) => (
                          <span key={sIdx} className="inline-block text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Languages */}
              {languages.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-gray-400">Languages</p>
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between items-center text-xs">
                      <span>{l.language}</span>
                      {renderProficiency(l.proficiency)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content Column */}
            <div className="col-span-8 space-y-6">
              {summary && (
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400">Executive Summary</h3>
                  <p className="text-xs text-gray-600 text-justify leading-relaxed">{summary}</p>
                </div>
              )}

              {/* Professional Experience */}
              {experience.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b pb-1">Professional Experience</h3>
                  <div className="space-y-4">
                    {experience.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-sm font-bold text-slate-900">{exp.role}</h4>
                          <span className="text-[11px] font-semibold text-slate-500">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-xs text-blue-600 font-semibold">
                          <span>{exp.company}</span>
                          <span className="text-gray-400 font-normal italic">{exp.location}</span>
                        </div>
                        <p className="text-xs text-gray-600 whitespace-pre-line mt-1">{exp.description}</p>
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-gray-600 pl-2 space-y-0.5">
                            {exp.achievements.map((ach, idx) => <li key={idx}>{ach}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b pb-1">Featured Projects</h3>
                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div key={proj.id} className="text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>🚀 {proj.name}</span>
                          {proj.liveUrl && <span className="text-[10px] text-blue-500 underline">{proj.liveUrl}</span>}
                        </div>
                        <p className="text-gray-600 text-[11px]">{proj.description}</p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {proj.technologies.map((t, idx) => (
                              <span key={idx} className="inline-block text-[9px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.2 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b pb-1">Education</h3>
                  {education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <div className="flex justify-between font-bold text-gray-800">
                        <span>{edu.degree} in {edu.major}</span>
                        <span className="text-gray-500 font-normal">{edu.graduationYear}</span>
                      </div>
                      <p className="text-gray-600 text-[11px]">{edu.school} {edu.gpa && `| GPA: ${edu.gpa}`}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TEMPLATE 3: STANFORD (Cardinal Red, high prestige academic/serif) --- */}
        {templateId === "stanford" && (
          <div className="space-y-6 font-serif">
            <div className="border-b-2 border-[#8C1515] pb-3 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-[#8C1515] uppercase">{personalInfo.name || "YOUR NAME"}</h1>
              <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mt-1.5">{personalInfo.title || "PROFESSIONAL TITLE"}</p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-gray-600 mt-3 font-serif">
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.email && <span className="underline">{personalInfo.email}</span>}
                {personalInfo.address && <span>{personalInfo.address}</span>}
                {personalInfo.website && <span className="underline">{personalInfo.website}</span>}
                {personalInfo.linkedin && <span className="underline">{personalInfo.linkedin}</span>}
              </div>
            </div>

            {summary && (
              <div className="text-xs text-gray-700 text-justify leading-relaxed border-l-2 border-[#8C1515]/30 pl-4 italic">
                {summary}
              </div>
            )}

            {experience.length > 0 && (
              <div>
                {renderHeader("Professional Experience", "text-[#8C1515]", true)}
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="text-xs">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>{exp.role} — <span className="font-normal italic">{exp.company}</span></span>
                        <span className="text-gray-500 font-normal">{exp.startDate} – {exp.endDate}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 italic mt-0.5">{exp.location}</p>
                      <p className="text-gray-700 whitespace-pre-line text-xs mt-1 leading-relaxed pl-3 border-l border-gray-100">{exp.description}</p>
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-gray-700 mt-1 pl-3 space-y-0.5">
                          {exp.achievements.map((ach, idx) => <li key={idx}>{ach}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education.length > 0 && (
              <div>
                {renderHeader("Education & Credentials", "text-[#8C1515]", true)}
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>{edu.degree} in {edu.major}</span>
                        <span className="text-gray-500 font-normal">{edu.graduationYear}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 text-[11px]">
                        <span>{edu.school}</span>
                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                      </div>
                      {edu.coursework && <p className="text-[10px] text-gray-500 mt-1 italic">Focus coursework: {edu.coursework}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div>
                {renderHeader("Research & Engineering Projects", "text-[#8C1515]", true)}
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="text-xs">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>{proj.name} {proj.liveUrl && <span className="text-[10px] font-normal text-blue-600 underline">({proj.liveUrl})</span>}</span>
                        {proj.githubUrl && <span className="text-[10px] font-mono text-gray-500">{proj.githubUrl}</span>}
                      </div>
                      <p className="text-gray-700 mt-1 leading-relaxed">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <div>
                {renderHeader("Expertise Areas", "text-[#8C1515]", true)}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {skills.map((group, idx) => (
                    <div key={idx} className="border-l border-red-200 pl-3">
                      <span className="font-bold text-gray-800 text-[11px] uppercase tracking-wider block">{group.category}</span>
                      <p className="text-gray-600 mt-0.5 text-[11px] leading-relaxed">{group.skills.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TEMPLATE 4: GOOGLE (Tech professional, clean split grids, minimal custom panels) --- */}
        {templateId === "google" && (
          <div className="grid grid-cols-12 gap-6 font-sans">
            <div className="col-span-12 border-b-2 border-blue-500 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-blue-600">{personalInfo.name || "YOUR NAME"}</h1>
                  <p className="text-sm font-bold tracking-wider text-green-600 uppercase mt-1">{personalInfo.title || "SOFTWARE ENGINEER"}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-3 font-mono">
                    {personalInfo.email && <span>✉ {personalInfo.email}</span>}
                    {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
                    {personalInfo.address && <span>📍 {personalInfo.address}</span>}
                    {personalInfo.linkedin && <span className="text-blue-500 font-bold">🔗 LinkedIn</span>}
                    {personalInfo.github && <span className="text-slate-700 font-bold">💻 GitHub</span>}
                  </div>
                </div>
                {personalInfo.photoUrl && (
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>

            {/* Main content left side */}
            <div className="col-span-8 space-y-5">
              {summary && (
                <div className="space-y-1.5">
                  <h3 className="text-xs uppercase tracking-widest font-extrabold text-blue-600">Executive Profile</h3>
                  <p className="text-xs text-gray-600 text-justify leading-relaxed">{summary}</p>
                </div>
              )}

              {experience.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest font-extrabold text-blue-600">Employment History</h3>
                  <div className="space-y-4">
                    {experience.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-bold text-gray-900">{exp.role} <span className="text-blue-600">@ {exp.company}</span></h4>
                          <span className="text-[10px] font-bold text-gray-400">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">{exp.location}</p>
                        <p className="text-xs text-gray-600 whitespace-pre-line mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest font-extrabold text-blue-600">Systems & Projects</h3>
                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div key={proj.id} className="text-xs space-y-1">
                        <div className="flex justify-between font-bold text-gray-800">
                          <span>⚙ {proj.name}</span>
                          {proj.liveUrl && <span className="text-[10px] text-blue-500 font-bold">{proj.liveUrl}</span>}
                        </div>
                        <p className="text-gray-600 text-[11px]">{proj.description}</p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {proj.technologies.map((t, idx) => (
                              <span key={idx} className="inline-block text-[9px] bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar content right side */}
            <div className="col-span-4 bg-slate-50/70 dark:bg-slate-900/30 p-4 rounded-xl space-y-5 h-max border">
              {skills.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest font-extrabold text-blue-600">Technical Skills</h3>
                  {skills.map((grp, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">{grp.category}</p>
                      <div className="flex flex-wrap gap-1">
                        {grp.skills.map((sk, sIdx) => (
                          <span key={sIdx} className="inline-block text-[9px] bg-white border border-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-medium">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {education.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-widest font-extrabold text-blue-600">Education</h3>
                  {education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <p className="font-bold text-gray-800">{edu.degree}</p>
                      <p className="text-gray-600 text-[11px]">{edu.major}</p>
                      <p className="text-gray-400 text-[10px]">{edu.school} ({edu.graduationYear})</p>
                    </div>
                  ))}
                </div>
              )}

              {languages.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-widest font-extrabold text-blue-600">Languages</h3>
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-700">{l.language}</span>
                      {renderProficiency(l.proficiency)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TEMPLATE 5: EXECUTIVE (Ultra-premium classic corporate, centered serif headers, amber/slate) --- */}
        {templateId === "executive" && (
          <div className="space-y-6 font-serif">
            <div className="text-center space-y-2 border-b-4 border-slate-900 pb-4">
              <h1 className="text-3xl font-extrabold text-slate-950 uppercase tracking-tight">{personalInfo.name || "YOUR NAME"}</h1>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest">{personalInfo.title || "CHIEF EXECUTIVE OFFICER"}</p>
              <div className="h-[1px] w-24 bg-amber-700 mx-auto my-1"></div>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-slate-600 mt-2">
                {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
                {personalInfo.email && <span className="underline">✉ {personalInfo.email}</span>}
                {personalInfo.address && <span>📍 {personalInfo.address}</span>}
                {personalInfo.website && <span className="underline">🌐 {personalInfo.website}</span>}
              </div>
            </div>

            {summary && (
              <div className="bg-slate-50 border-l-4 border-amber-700 p-4 text-xs text-slate-700 leading-relaxed italic text-justify">
                "{summary}"
              </div>
            )}

            {experience.length > 0 && (
              <div>
                {renderHeader("Executive Chronology", "text-slate-950 font-bold", true)}
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-950">
                        <span>{exp.role} <span className="font-normal italic">at {exp.company}</span></span>
                        <span className="text-slate-500 font-normal">{exp.startDate} – {exp.endDate}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">{exp.location}</p>
                      <p className="text-slate-700 whitespace-pre-line mt-1.5 leading-relaxed text-justify">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {education.length > 0 && (
                <div>
                  {renderHeader("Academic Credentials", "text-slate-950 font-bold", true)}
                  <div className="space-y-3">
                    {education.map((edu) => (
                      <div key={edu.id} className="text-xs">
                        <p className="font-bold text-slate-900">{edu.degree} — <span className="font-normal italic">{edu.major}</span></p>
                        <p className="text-slate-500 text-[11px]">{edu.school} ({edu.graduationYear})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {skills.length > 0 && (
                <div>
                  {renderHeader("Key Competency Framework", "text-slate-950 font-bold", true)}
                  <div className="space-y-2">
                    {skills.map((grp, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="font-bold text-slate-800 text-[10px] uppercase block">{grp.category}</span>
                        <p className="text-slate-600 text-[10px] leading-relaxed">{grp.skills.join(", ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TEMPLATE 6: ELEGANT (Luxury asymmetric indigo/cream grid with sidebar) --- */}
        {templateId === "elegant" && (
          <div className="grid grid-cols-12 gap-8 font-serif">
            {/* Sidebar Left Column */}
            <div className="col-span-4 border-r border-indigo-50/50 pr-6 space-y-6">
              <div className="space-y-4">
                {personalInfo.photoUrl && (
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.name}
                    className="w-24 h-24 rounded-full object-cover border border-indigo-100 mx-auto shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-indigo-950">{personalInfo.name || "YOUR NAME"}</h1>
                  <p className="text-xs font-semibold text-indigo-600 tracking-widest uppercase mt-1.5">{personalInfo.title || "TITLE"}</p>
                </div>
              </div>

              {/* Contact Grid */}
              <div className="space-y-2.5 text-xs text-slate-600 pt-5 border-t border-indigo-50">
                <p className="font-bold uppercase tracking-widest text-[9px] text-indigo-400">Personal Details</p>
                {personalInfo.phone && <p className="truncate">📞 {personalInfo.phone}</p>}
                {personalInfo.email && <p className="truncate">✉ {personalInfo.email}</p>}
                {personalInfo.address && <p>📍 {personalInfo.address}</p>}
                {personalInfo.website && <p className="truncate text-indigo-600 underline">🌐 {personalInfo.website}</p>}
              </div>

              {/* Skills Area */}
              {skills.length > 0 && (
                <div className="space-y-3 pt-5 border-t border-indigo-50">
                  <p className="font-bold uppercase tracking-widest text-[9px] text-indigo-400">Core Expertise</p>
                  {skills.map((grp, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-800 uppercase">{grp.category}</p>
                      <p className="text-[11px] text-slate-500 leading-normal">{grp.skills.join(", ")}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Languages */}
              {languages.length > 0 && (
                <div className="space-y-2.5 pt-5 border-t border-indigo-50">
                  <p className="font-bold uppercase tracking-widest text-[9px] text-indigo-400">Languages</p>
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between items-center text-xs">
                      <span className="text-slate-700">{l.language}</span>
                      {renderProficiency(l.proficiency)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content Right Column */}
            <div className="col-span-8 space-y-6">
              {summary && (
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-indigo-400">Summary profile</h3>
                  <p className="text-xs text-slate-700 text-justify leading-relaxed italic">"{summary}"</p>
                </div>
              )}

              {experience.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-indigo-400 border-b pb-1 border-indigo-50">Career Highlights</h3>
                  <div className="space-y-4">
                    {experience.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-sm font-bold text-indigo-950">{exp.role}</h4>
                          <span className="text-[10px] font-medium text-slate-400">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-xs text-indigo-600 font-semibold italic">
                          <span>{exp.company}</span>
                          <span className="text-slate-400 font-normal">{exp.location}</span>
                        </div>
                        <p className="text-xs text-slate-600 whitespace-pre-line mt-1.5 leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {education.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-indigo-400 border-b pb-1 border-indigo-50">Academic Education</h3>
                  {education.map((edu) => (
                    <div key={edu.id} className="text-xs space-y-0.5">
                      <div className="flex justify-between font-bold text-indigo-950">
                        <span>{edu.degree} in {edu.major}</span>
                        <span className="text-slate-400 font-normal">{edu.graduationYear}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] italic">{edu.school} {edu.gpa && `| GPA: ${edu.gpa}`}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TEMPLATE 7: CREATIVE (Dynamic layout with pink-to-purple header accents) --- */}
        {templateId === "creative" && (
          <div className="space-y-6 font-sans">
            <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 -mx-10 -mt-10 p-8 text-white relative">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <span className="bg-white/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">CREATIVE BLUEPRINT</span>
                  <h1 className="text-3xl font-extrabold tracking-tight mt-1">{personalInfo.name || "YOUR NAME"}</h1>
                  <p className="text-sm font-semibold tracking-wide text-pink-200 mt-1 uppercase">{personalInfo.title || "CREATIVE DIRECTOR / DESIGNER"}</p>
                </div>
                <div className="flex flex-col text-xs md:text-right space-y-1 bg-black/10 p-3 rounded-xl font-mono text-pink-100 border border-white/10">
                  {personalInfo.email && <p>✉ {personalInfo.email}</p>}
                  {personalInfo.phone && <p>📞 {personalInfo.phone}</p>}
                  {personalInfo.portfolio && <p className="underline">🔗 {personalInfo.portfolio}</p>}
                </div>
              </div>
            </div>

            {summary && (
              <div className="space-y-2 bg-pink-50/40 p-4 rounded-xl border border-pink-100">
                <h3 className="text-xs uppercase tracking-widest font-extrabold text-pink-600">The Story</h3>
                <p className="text-xs text-gray-700 leading-relaxed text-justify">{summary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Experience column */}
              <div className="md:col-span-8 space-y-5">
                {experience.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-extrabold text-purple-600 border-b pb-1">Creative Experience</h3>
                    <div className="space-y-4">
                      {experience.map((exp) => (
                        <div key={exp.id} className="p-3 bg-slate-50 hover:bg-purple-50/20 transition-colors border rounded-xl space-y-1">
                          <div className="flex justify-between items-baseline">
                            <h4 className="text-xs font-bold text-gray-900">{exp.role} — <span className="text-purple-600">{exp.company}</span></h4>
                            <span className="text-[10px] font-bold text-gray-400">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 italic">{exp.location}</p>
                          <p className="text-xs text-gray-600 whitespace-pre-line mt-1.5 leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-extrabold text-purple-600 border-b pb-1">Showcase Projects</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {projects.map((proj) => (
                        <div key={proj.id} className="p-3 border border-pink-100 rounded-xl space-y-1.5 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-gray-800 text-xs">🚀 {proj.name}</h4>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-3">{proj.description}</p>
                          </div>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {proj.technologies.slice(0, 3).map((t, idx) => (
                                <span key={idx} className="inline-block text-[8px] bg-pink-50 text-pink-600 font-semibold px-1 py-0.2 rounded">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar column */}
              <div className="md:col-span-4 space-y-5">
                {skills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-extrabold text-purple-600">Skill Palette</h3>
                    <div className="space-y-3 bg-purple-50/10 p-3 rounded-xl border border-purple-100">
                      {skills.map((grp, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="text-[9px] font-bold text-purple-700 uppercase tracking-wider">{grp.category}</p>
                          <div className="flex flex-wrap gap-1">
                            {grp.skills.map((sk, sIdx) => (
                              <span key={sIdx} className="inline-block text-[9px] bg-white border text-gray-600 px-2 py-0.5 rounded-full">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {education.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs uppercase tracking-widest font-extrabold text-purple-600">Education</h3>
                    <div className="space-y-3">
                      {education.map((edu) => (
                        <div key={edu.id} className="text-xs">
                          <p className="font-bold text-gray-800">{edu.degree}</p>
                          <p className="text-[11px] text-gray-500">{edu.major}</p>
                          <p className="text-[10px] text-gray-400">{edu.school} ({edu.graduationYear})</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- DEFAULT FALLBACK / GENERIC TEMPLATE: MINIMAL (Classic black & white, sleek spacing) --- */}
        {!["harvard", "modern", "stanford", "google", "executive", "elegant", "creative"].includes(templateId) && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className={`text-3xl font-extrabold tracking-tight ${headerColor}`}>{personalInfo.name || "YOUR NAME"}</h1>
                  <p className={`text-sm font-semibold tracking-wide uppercase mt-1 ${accentColor}`}>{personalInfo.title || "PROFESSIONAL TITLE"}</p>
                </div>
                {showQrCode && personalInfo.portfolio && (
                  <div className="hidden md:flex flex-col items-center border p-1 rounded-lg bg-gray-50 dark:bg-zinc-900 border-gray-200">
                    <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-[8px] font-mono text-white text-center">
                      QR Code
                    </div>
                    <span className="text-[8px] mt-0.5 text-gray-400">alexrivera.dev</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-gray-500 mt-4 font-mono">
                {personalInfo.email && <span>✉️ {personalInfo.email}</span>}
                {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
                {personalInfo.address && <span>📍 {personalInfo.address}</span>}
                {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
                {personalInfo.github && <span>💻 {personalInfo.github}</span>}
              </div>
            </div>

            {summary && (
              <div className="space-y-1.5">
                <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400">Professional Summary</h2>
                <p className="text-xs text-gray-700 leading-relaxed text-justify">{summary}</p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b pb-1">Professional Experience</h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="text-xs space-y-1">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>{exp.role} <span className="text-gray-400 font-normal">at</span> {exp.company}</span>
                        <span className="font-semibold text-gray-500 text-[10px]">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 italic">{exp.location}</p>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed mt-1 pl-2 border-l-2 border-gray-100">{exp.description}</p>
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="list-disc list-inside pl-2 space-y-0.5 text-[11px] text-gray-600">
                          {exp.achievements.map((ach, idx) => <li key={idx}>{ach}</li>)}
                        </ul>
                      )}
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {exp.technologies.map((t, idx) => (
                            <span key={idx} className="inline-block text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="space-y-2 pt-1">
                <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b pb-1">Key Projects</h2>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="text-xs space-y-1">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>🚀 {proj.name}</span>
                        {proj.githubUrl && <span className="font-mono text-[10px] text-gray-400">{proj.githubUrl}</span>}
                      </div>
                      <p className="text-gray-600 text-[11px] leading-relaxed">{proj.description}</p>
                      {proj.challenges && <p className="text-[11px] text-gray-500 italic"><span className="font-semibold not-italic">Challenge:</span> {proj.challenges}</p>}
                      {proj.achievements && <p className="text-[11px] text-gray-600"><span className="font-semibold text-green-600">Impact:</span> {proj.achievements}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="space-y-2 pt-1">
                <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b pb-1">Education</h2>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>{edu.degree} in {edu.major}</span>
                        <span className="font-normal text-gray-500">{edu.graduationYear}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>{edu.school}</span>
                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="space-y-2 pt-1">
                <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 border-b pb-1">Skills</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {skills.map((grp, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="font-bold text-gray-800 text-[11px] uppercase block tracking-wider">{grp.category}</span>
                      <p className="text-gray-600 leading-normal text-[11px]">{grp.skills.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications and Awards */}
            {(certifications.length > 0 || awards.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
                {certifications.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400">Certifications</h3>
                    {certifications.map((c) => (
                      <div key={c.id} className="text-xs">
                        <p className="font-bold text-gray-800">{c.name}</p>
                        <p className="text-[11px] text-gray-500">{c.issuer} | {c.date}</p>
                      </div>
                    ))}
                  </div>
                )}
                {awards.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400">Awards</h3>
                    {awards.map((aw) => (
                      <div key={aw.id} className="text-xs">
                        <p className="font-bold text-gray-800">🏆 {aw.title}</p>
                        <p className="text-[11px] text-gray-500">{aw.issuer} | {aw.date}</p>
                        {aw.description && <p className="text-[10px] text-gray-400">{aw.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Signature Block */}
            {showSignature && personalInfo.name && (
              <div className="pt-8 flex justify-end">
                <div className="text-right border-t border-gray-200 pt-1 w-48">
                  <p className="font-serif italic text-sm text-gray-400 select-none">{personalInfo.name}</p>
                  <p className="text-[9px] uppercase tracking-wider text-gray-400">Candidate Signature</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
