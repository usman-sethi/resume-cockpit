import { ProviderName, RoutingMode, AIRequestType, AIProviderConfig } from "../types";
import { aiRegistry } from "../registry";
import { aiMonitor } from "../telemetry";
import { aiCache } from "../cache";
import { validateJSONResponse } from "../validators";

// Standard Fallback Chain
const FALLBACK_CHAIN: ProviderName[] = ["gemini", "groq", "mistral"];

// Default Provider Configs
const DEFAULT_CONFIGS: Record<ProviderName, AIProviderConfig> = {
  gemini: { model: "gemini-3.5-flash", temperature: 0.2, maxTokens: 4096, timeoutMs: 15000, retries: 2, priority: 1, jsonMode: true },
  groq: { model: "llama-3.1-8b-instant", temperature: 0.2, maxTokens: 4096, timeoutMs: 10000, retries: 2, priority: 2, jsonMode: true },
  mistral: { model: "mistral-small-latest", temperature: 0.2, maxTokens: 4096, timeoutMs: 12000, retries: 2, priority: 3, jsonMode: true }
};

/**
 * Parses prompts for inline override commands like @groq or /gemini.
 */
export function parsePromptOverride(prompt: string): { cleanedPrompt: string; overrideProvider?: ProviderName | "auto" } {
  let cleaned = prompt.trim();
  let overrideProvider: ProviderName | "auto" | undefined;

  // Inline @ command parsing
  const inlineRegex = /^\s*@(gemini|groq|mistral|auto)\s+/i;
  const matchInline = cleaned.match(inlineRegex);
  if (matchInline) {
    overrideProvider = matchInline[1].toLowerCase() as any;
    cleaned = cleaned.replace(inlineRegex, "");
  }

  // Slash command parsing
  const slashRegex = /^\s*\/(gemini|groq|mistral|auto)(?:\s+|$)/i;
  const matchSlash = cleaned.match(slashRegex);
  if (matchSlash) {
    overrideProvider = matchSlash[1].toLowerCase() as any;
    cleaned = cleaned.replace(slashRegex, "");
  }

  return { cleanedPrompt: cleaned, overrideProvider };
}

export class AIRouter {
  private static instance: AIRouter;

  private constructor() {}

  public static getInstance(): AIRouter {
    if (!AIRouter.instance) {
      AIRouter.instance = new AIRouter();
    }
    return AIRouter.instance;
  }

  /**
   * Intelligently selects the primary provider based on the request type (AUTO Mode routing).
   */
  public selectAutoProvider(type: AIRequestType): ProviderName {
    switch (type) {
      case "generate":
        return "gemini"; // Complex orchestration
      case "cover-letter":
        return "gemini"; // Creative writing
      case "ats-check":
        return "gemini"; // Complex analysis
      case "optimize":
        return "gemini"; // Alignment
      case "improve-bullet-point":
        return "groq"; // Super fast bullet rewrites
      case "rewrite-summary":
        return "mistral"; // Great professional editorial tone
      default:
        return "gemini";
    }
  }

  /**
   * Main routing orchestrator. Performs routing, caching, retries, fallbacks, and schema validation.
   */
  public async route(
    type: AIRequestType,
    systemInstruction: string,
    prompt: string,
    options: {
      mode: RoutingMode;
      cacheEnabled: boolean;
      cacheTTLSeconds?: number;
      customModel?: string;
    }
  ): Promise<any> {
    // 1. Check for slash/inline overrides in prompt
    const { cleanedPrompt, overrideProvider } = parsePromptOverride(prompt);

    // Determine target routing provider
    let selectedMode = options.mode;
    if (overrideProvider) {
      selectedMode = overrideProvider === "auto" ? "AUTO" : (overrideProvider.toUpperCase() as RoutingMode);
      console.log(`AI Router: Prompt command overrode routing mode to ${selectedMode}`);
    }

    let primaryProvider: ProviderName;
    if (selectedMode === "AUTO") {
      primaryProvider = this.selectAutoProvider(type);
    } else {
      primaryProvider = selectedMode.toLowerCase() as ProviderName;
    }

    // 2. Cache check
    const cacheKey = aiCache.generateKey(type, systemInstruction, cleanedPrompt);
    if (options.cacheEnabled) {
      const cachedResult = aiCache.get(cacheKey);
      if (cachedResult) return cachedResult;
    }

    // 3. Construct candidate chain starting with primary, followed by fallbacks
    const candidateChain: ProviderName[] = [primaryProvider];
    for (const p of FALLBACK_CHAIN) {
      if (p !== primaryProvider) {
        candidateChain.push(p);
      }
    }

    let lastError: Error | null = null;

    // Loop through the candidate chain for failovers
    for (let pIndex = 0; pIndex < candidateChain.length; pIndex++) {
      const providerName = candidateChain[pIndex];
      const isPrimary = pIndex === 0;

      // Check health (only failover if unhealthy, or let primary attempt recovery if forced)
      if (!isPrimary && !aiMonitor.isProviderHealthy(providerName)) {
        console.warn(`AI Router: Skipping unhealthy failover provider "${providerName}"`);
        continue;
      }

      const adapter = aiRegistry.getProvider(providerName);
      if (!adapter.isConfigured()) {
        console.warn(`AI Router: Provider "${providerName}" is not fully configured (missing API keys). Skipping...`);
        continue;
      }

      const baseConfig = { ...DEFAULT_CONFIGS[providerName] };
      if (options.customModel) {
        baseConfig.model = options.customModel;
      }

      // Optimize maxTokens dynamically based on request type to prevent TPM (Tokens Per Minute) limit issues (e.g. Groq 6000 TPM limit)
      if (type === "improve-bullet-point" || type === "rewrite-summary") {
        baseConfig.maxTokens = 512;
      } else if (type === "ats-check" || type === "optimize") {
        baseConfig.maxTokens = 1536;
      } else {
        baseConfig.maxTokens = 2048; // generate, cover-letter
      }

      let attempt = 0;
      const maxRetries = baseConfig.retries || 2;

      // Exponential Backoff Retry Loop
      while (attempt <= maxRetries) {
        const startTime = Date.now();
        try {
          console.log(`AI Router: Dispatching request "${type}" to "${providerName}" (Attempt ${attempt + 1}/${maxRetries + 1})...`);
          
          const result = await adapter.execute(type, systemInstruction, cleanedPrompt, baseConfig);

          // Validate Schema if JSON mode is requested
          if (baseConfig.jsonMode && !validateJSONResponse(type, result)) {
            throw new Error(`Invalid JSON format returned by provider "${providerName}". Failed schema validation.`);
          }

          // Request succeeded! Record metrics
          const latencyMs = Date.now() - startTime;
          aiMonitor.recordRequest(providerName, type, latencyMs, attempt, "success");

          // Cache result
          if (options.cacheEnabled) {
            aiCache.set(cacheKey, result, options.cacheTTLSeconds || 300);
          }

          return result;
        } catch (err: any) {
          attempt++;
          const latencyMs = Date.now() - startTime;
          console.error(`AI Router: Attempt ${attempt} failed on "${providerName}". Error: ${err.message}`);

          // Retry wait using exponential backoff
          if (attempt <= maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 150;
            console.log(`AI Router: Waiting ${backoffMs}ms before retrying "${providerName}"...`);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
          } else {
            // Record provider-level failure / fallback transition
            aiMonitor.recordRequest(
              providerName,
              type,
              latencyMs,
              attempt - 1,
              pIndex < candidateChain.length - 1 ? "fallback" : "error",
              err.message
            );
            lastError = err;
          }
        }
      }

      console.warn(`AI Router: Provider "${providerName}" exhausted all retries. Initiating failover fallback if available...`);
    }

    // If we reach here, all providers in the chain have failed
    const finalErrorMessage = `AI Services are currently experiencing exceptionally high loads. Gemini, Groq, and Mistral failed to resolve the request. Error: ${lastError?.message || "Unknown error"}`;
    console.error(`[AI ORCHESTRATION CRITICAL]: ${finalErrorMessage}`);
    throw new Error(finalErrorMessage);
  }
}

export const aiRouter = AIRouter.getInstance();
