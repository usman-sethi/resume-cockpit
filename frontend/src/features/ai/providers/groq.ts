import { ProviderAdapter } from "./base";
import { ProviderName, AIRequestType, AIProviderConfig } from "../types";
import { cleanAndParseJSON } from "../validators";

export class GroqProviderAdapter implements ProviderAdapter {
  name: ProviderName = "groq";
  private apiKey: string | null = null;

  constructor() {
    this.initKey();
  }

  private initKey() {
    const envKey = process.env.GROQ_API_KEY;
    if (envKey && envKey !== "MY_GROQ_API_KEY") {
      this.apiKey = envKey;
    } else {
      this.apiKey = null;
    }
  }

  isConfigured(): boolean {
    if (!this.apiKey) {
      this.initKey();
    }
    return !!this.apiKey;
  }

  async execute(
    type: AIRequestType,
    systemInstruction: string,
    prompt: string,
    config: AIProviderConfig
  ): Promise<any> {
    if (!this.isConfigured() || !this.apiKey) {
      throw new Error("Groq API key is not configured.");
    }

    const modelName = config.model || "llama-3.1-8b-instant";
    const modelsToTry = [modelName];
    if (modelName === "llama-3.1-8b-instant") {
      modelsToTry.push("llama-3.3-70b-versatile", "mixtral-8x7b-32768");
    }

    let lastError: any = null;
    for (const currentModel of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

        const requestBody: any = {
          model: currentModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens || 2048,
        };

        if (config.jsonMode) {
          requestBody.response_format = { type: "json_object" };
        }

        console.log(`Groq Adapter: Dispatching request to model "${currentModel}"...`);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Groq API returned HTTP error ${response.status}: ${errText}`);
        }

        const resJson = await response.json();
        const content = resJson.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("Groq returned an empty response.");
        }

        if (config.jsonMode) {
          return cleanAndParseJSON(content);
        }

        return { text: content };
      } catch (e: any) {
        lastError = e;
        if (e.name === "AbortError") {
          console.warn(`Groq request timed out after ${config.timeoutMs}ms with model "${currentModel}".`);
        } else {
          console.warn(`Groq Adapter: Model "${currentModel}" failed. Error: ${e.message || JSON.stringify(e)}`);
        }
      }
    }

    throw lastError || new Error("Groq failed on all model candidates.");
  }
}
