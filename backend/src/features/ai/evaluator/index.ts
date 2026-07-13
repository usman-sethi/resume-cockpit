import { aiRouter } from "../router";
import { Prompts } from "../prompts";

export interface EvaluationResult {
  index: number;
  provider: string;
  scores: {
    professionalism: number;
    grammar: number;
    clarity: number;
    impact: number;
    atsFriendliness: number;
    keywordUsage: number;
    readability: number;
    consistency: number;
  };
  overallScore: number;
  feedback: string;
}

export interface EvaluatorReport {
  evaluations: EvaluationResult[];
  bestIndex: number;
}

export class QualityEvaluator {
  private static instance: QualityEvaluator;

  private constructor() {}

  public static getInstance(): QualityEvaluator {
    if (!QualityEvaluator.instance) {
      QualityEvaluator.instance = new QualityEvaluator();
    }
    return QualityEvaluator.instance;
  }

  /**
   * Evaluates multiple candidate outputs and selects the highest scoring version.
   */
  public async evaluate(
    originalPrompt: string,
    variants: { provider: string; content: string }[]
  ): Promise<EvaluatorReport> {
    if (variants.length === 0) {
      throw new Error("QualityEvaluator: No variants provided for evaluation.");
    }

    if (variants.length === 1) {
      return {
        evaluations: [
          {
            index: 0,
            provider: variants[0].provider,
            scores: { professionalism: 100, grammar: 100, clarity: 100, impact: 100, atsFriendliness: 100, keywordUsage: 100, readability: 100, consistency: 100 },
            overallScore: 100,
            feedback: "Single candidate provided. Automatically selected."
          }
        ],
        bestIndex: 0
      };
    }

    try {
      const evaluationPrompt = Prompts.qualityEvaluator.user(variants, originalPrompt);
      
      // Use Gemini (highest reasoning capabilities) to evaluate the candidate results
      const report: EvaluatorReport = await aiRouter.route(
        "ats-check", // Uses check routing (defaults to Gemini)
        Prompts.qualityEvaluator.system,
        evaluationPrompt,
        {
          mode: "GEMINI", // Lock to Gemini for high-quality evaluation
          cacheEnabled: false
        }
      );

      return report;
    } catch (e) {
      console.error("QualityEvaluator failed. Falling back to default selection index 0.", e);
      // Fallback: Grade them equally and select the first one
      return {
        evaluations: variants.map((v, i) => ({
          index: i,
          provider: v.provider,
          scores: { professionalism: 80, grammar: 80, clarity: 80, impact: 80, atsFriendliness: 80, keywordUsage: 80, readability: 80, consistency: 80 },
          overallScore: 80,
          feedback: `Fallback evaluator assigned a uniform score. Original evaluation error: ${e instanceof Error ? e.message : "Unknown"}`
        })),
        bestIndex: 0
      };
    }
  }
}

export const qualityEvaluator = QualityEvaluator.getInstance();
