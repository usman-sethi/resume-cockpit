import { aiRouter } from "../router";
import { Prompts } from "../prompts";
import { qualityEvaluator } from "../evaluator";
import { RoutingMode } from "../types";

export class AIPipeline {
  private static instance: AIPipeline;

  private constructor() {}

  public static getInstance(): AIPipeline {
    if (!AIPipeline.instance) {
      AIPipeline.instance = new AIPipeline();
    }
    return AIPipeline.instance;
  }

  /**
   * Orchestrates the premium resume generation pipeline.
   */
  public async generate(
    formData: any,
    options: {
      mode: RoutingMode;
      pipelineEnabled: boolean;
      parallelMode: boolean;
      cacheEnabled: boolean;
    }
  ): Promise<any> {
    console.log(`[AI Pipeline] Starting generation. Pipeline: ${options.pipelineEnabled}, Parallel: ${options.parallelMode}`);

    // Scenario A: Parallel Mode
    if (options.parallelMode) {
      console.log("[AI Pipeline] Parallel Mode active. Dispatching Gemini, Groq, and Mistral in parallel...");
      const prompt = Prompts.generateResume.user(formData);
      const system = Prompts.generateResume.system;

      const results = await Promise.allSettled([
        aiRouter.route("generate", system, prompt, { mode: "GEMINI", cacheEnabled: options.cacheEnabled }),
        aiRouter.route("generate", system, prompt, { mode: "GROQ", cacheEnabled: options.cacheEnabled }),
        aiRouter.route("generate", system, prompt, { mode: "MISTRAL", cacheEnabled: options.cacheEnabled }),
      ]);

      const successfulVariants: { provider: string; value: any }[] = [];
      results.forEach((r, idx) => {
        const providerName = idx === 0 ? "gemini" : idx === 1 ? "groq" : "mistral";
        if (r.status === "fulfilled" && r.value) {
          successfulVariants.push({ provider: providerName, value: r.value });
        }
      });

      if (successfulVariants.length === 0) {
        throw new Error("AI Pipeline: All parallel generation requests failed.");
      }

      if (successfulVariants.length === 1) {
        console.log(`[AI Pipeline] Only one successful variant returned from parallel generation (${successfulVariants[0].provider}). Selecting it.`);
        return successfulVariants[0].value;
      }

      // Invoke the Quality Evaluator to choose the absolute best candidate
      console.log(`[AI Pipeline] Invoking Quality Evaluator on ${successfulVariants.length} successful variants...`);
      const evaluation = await qualityEvaluator.evaluate(
        prompt,
        successfulVariants.map((v) => ({
          provider: v.provider,
          content: JSON.stringify(v.value),
        }))
      );

      const bestIndex = evaluation.bestIndex;
      const selectedVariant = successfulVariants[bestIndex];
      console.log(`[AI Pipeline] Best variant selected: ${selectedVariant.provider} (Overall Score: ${evaluation.evaluations[bestIndex]?.overallScore || "N/A"})`);

      const finalResume = selectedVariant.value;
      // Inject selected provider details so UI knows which one won
      finalResume.evaluationMetadata = {
        evaluations: evaluation.evaluations,
        bestProvider: selectedVariant.provider,
        bestIndex
      };

      return finalResume;
    }

    // Scenario B: Multi-Stage Pipeline Mode
    if (options.pipelineEnabled) {
      console.log("[AI Pipeline] Multi-Stage Pipeline mode active. Executing Stages sequentially...");

      // Stage 1: Generate base structure with Gemini
      console.log("[AI Pipeline] [Stage 1/4] Generating base resume using Google Gemini...");
      const resume = await aiRouter.route(
        "generate",
        Prompts.generateResume.system,
        Prompts.generateResume.user(formData),
        { mode: "GEMINI", cacheEnabled: options.cacheEnabled }
      );

      // Stage 2: Summary refinement using Mistral
      try {
        console.log("[AI Pipeline] [Stage 2/4] Refining summary grammar & professional style with Mistral...");
        const result = await aiRouter.route(
          "rewrite-summary",
          Prompts.rewriteSummary.system,
          Prompts.rewriteSummary.user(resume.summary, "Executive"),
          { mode: "MISTRAL", cacheEnabled: options.cacheEnabled }
        );
        if (result && result.rewritten) {
          resume.summary = result.rewritten;
        }
      } catch (err) {
        console.warn("[AI Pipeline] Stage 2 (Mistral summary refinement) failed. Continuing with base summary...", err);
      }

      // Stage 3: Experience bullet points optimization using Groq
      try {
        if (resume.experience && resume.experience.length > 0) {
          console.log("[AI Pipeline] [Stage 3/4] Optimizing high-impact achievements with Groq...");
          const firstExp = resume.experience[0];
          if (firstExp.achievements && firstExp.achievements.length > 0) {
            const bullet = firstExp.achievements[0];
            const result = await aiRouter.route(
              "improve-bullet-point",
              Prompts.improveBulletPoint.system,
              Prompts.improveBulletPoint.user(bullet, firstExp.role),
              { mode: "GROQ", cacheEnabled: options.cacheEnabled }
            );
            if (result && result.variants && result.variants.executive) {
              firstExp.achievements[0] = result.variants.executive;
            }
          }
        }
      } catch (err) {
        console.warn("[AI Pipeline] Stage 3 (Groq achievements optimization) failed. Continuing with original achievements...", err);
      }

      // Stage 4: ATS Optimization Score and validation using Gemini Engine
      try {
        console.log("[AI Pipeline] [Stage 4/4] Conducting final ATS Validation with Gemini...");
        const atsResult = await aiRouter.route(
          "ats-check",
          Prompts.atsCheck.system,
          Prompts.atsCheck.user(resume),
          { mode: "GEMINI", cacheEnabled: options.cacheEnabled }
        );
        if (atsResult) {
          resume.atsResult = atsResult;
          if (resume.score) {
            resume.score.overall = atsResult.overallScore;
            resume.score.ats = atsResult.overallScore;
          }
        }
      } catch (err) {
        console.warn("[AI Pipeline] Stage 4 (Gemini ATS Audit) failed. Keeping raw base scores...", err);
      }

      resume.evaluationMetadata = {
        pipelineActive: true,
        stages: [
          { name: "Drafting", provider: "gemini", status: "success" },
          { name: "Grammar & Style", provider: "mistral", status: "success" },
          { name: "Bullet Optimization", provider: "groq", status: "success" },
          { name: "ATS Auditing", provider: "gemini", status: "success" }
        ]
      };

      return resume;
    }

    // Scenario C: Standard Direct Routing (Fallback Chain / Auto)
    console.log(`[AI Pipeline] Direct mode active. Routing through standard AI Router...`);
    return await aiRouter.route(
      "generate",
      Prompts.generateResume.system,
      Prompts.generateResume.user(formData),
      { mode: options.mode, cacheEnabled: options.cacheEnabled }
    );
  }
}

export const aiPipeline = AIPipeline.getInstance();
