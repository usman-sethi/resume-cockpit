import { AIRequestType } from "../types";

export function validateJSONResponse(type: AIRequestType, data: any): boolean {
  if (!data || typeof data !== "object") return false;

  try {
    switch (type) {
      case "generate":
        // Must contain summary, experience, projects, skills, score, atsResult, coverLetter
        if (typeof data.summary !== "string") return false;
        if (!Array.isArray(data.experience)) return false;
        if (!Array.isArray(data.projects)) return false;
        if (!Array.isArray(data.skills)) return false;
        if (typeof data.score !== "object" || typeof data.score.overall !== "number") return false;
        if (typeof data.atsResult !== "object" || typeof data.atsResult.overallScore !== "number") return false;
        if (typeof data.coverLetter !== "object" || typeof data.coverLetter.body !== "string") return false;
        return true;

      case "ats-check":
        // Must contain overallScore, formatting, length, sections, contactInfo, keywordDensity, actionVerbs, grammar, readability, suggestions, warnings, strengths
        if (typeof data.overallScore !== "number") return false;
        const subScores = ["formatting", "length", "sections", "contactInfo", "keywordDensity", "actionVerbs", "grammar", "readability"];
        for (const key of subScores) {
          if (typeof data[key] !== "object" || typeof data[key].score !== "number" || typeof data[key].text !== "string") return false;
        }
        if (!Array.isArray(data.suggestions)) return false;
        if (!Array.isArray(data.warnings)) return false;
        if (!Array.isArray(data.strengths)) return false;
        return true;

      case "optimize":
        // Must contain summary, optimizedBullets, analysis
        if (typeof data.summary !== "string") return false;
        if (!Array.isArray(data.optimizedBullets)) return false;
        if (typeof data.analysis !== "object" || typeof data.analysis.matchPercentage !== "number") return false;
        return true;

      case "improve-bullet-point":
        // Must contain variants with star, quantified, professional, executive
        if (typeof data.variants !== "object") return false;
        if (typeof data.variants.star !== "string") return false;
        if (typeof data.variants.quantified !== "string") return false;
        if (typeof data.variants.professional !== "string") return false;
        if (typeof data.variants.executive !== "string") return false;
        return true;

      case "rewrite-summary":
        // Must contain rewritten
        if (typeof data.rewritten !== "string") return false;
        return true;

      case "cover-letter":
        // Must contain body
        if (typeof data.body !== "string") return false;
        return true;

      default:
        return true;
    }
  } catch (e) {
    return false;
  }
}

/**
 * Attempts to parse loose JSON strings or markdown blocks, handling common LLM response artifacts.
 */
export function cleanAndParseJSON(rawText: string): any {
  if (!rawText) return null;
  
  let cleaned = rawText.trim();
  
  // Strip Markdown JSON fences if present
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    if (lines[0].includes("json") || lines[0] === "```") {
      lines.shift();
    }
    if (lines[lines.length - 1] === "```") {
      lines.pop();
    }
    cleaned = lines.join("\n").trim();
  }

  // Find first '{' and last '}' to strip surrounding conversational text
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}
