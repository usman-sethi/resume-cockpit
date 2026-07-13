import { GoogleGenAI } from "@google/genai";
import { ProviderAdapter } from "./base";
import { ProviderName, AIRequestType, AIProviderConfig } from "../types";
import { cleanAndParseJSON } from "../validators";

export class GeminiProviderAdapter implements ProviderAdapter {
  name: ProviderName = "gemini";
  private client: GoogleGenAI | null = null;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        this.client = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } catch (e) {
        console.error("Gemini Adapter: Failed to initialize GoogleGenAI", e);
      }
    }
  }

  isConfigured(): boolean {
    if (!this.client) {
      this.initClient();
    }
    return !!this.client;
  }

  async execute(
    type: AIRequestType,
    systemInstruction: string,
    prompt: string,
    config: AIProviderConfig
  ): Promise<any> {
    if (!this.isConfigured() || !this.client) {
      throw new Error("Gemini API key is not configured or client initialization failed.");
    }

    const modelName = config.model || "gemini-3.5-flash";
    const modelsToTry = [modelName];
    if (modelName === "gemini-3.5-flash") {
      modelsToTry.push("gemini-2.5-flash", "gemini-1.5-flash");
    } else if (modelName === "gemini-3.1-pro-preview") {
      modelsToTry.push("gemini-2.5-pro", "gemini-1.5-pro");
    }

    let lastError: any = null;
    for (const currentModel of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

        console.log(`Gemini Adapter: Requesting with model "${currentModel}"...`);
        const response = await this.client.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: config.jsonMode ? "application/json" : "text/plain",
            temperature: config.temperature,
          },
        });

        clearTimeout(timeoutId);

        const responseText = response.text;
        if (!responseText) {
          throw new Error("Gemini returned an empty response.");
        }

        if (config.jsonMode) {
          return cleanAndParseJSON(responseText);
        }

        return { text: responseText };
      } catch (e: any) {
        lastError = e;
        if (e.name === "AbortError") {
          console.warn(`Gemini request timed out after ${config.timeoutMs}ms with model "${currentModel}".`);
        } else {
          console.warn(`Gemini Adapter: Model "${currentModel}" failed. Error: ${e.message || JSON.stringify(e)}`);
        }
      }
    }

    throw lastError || new Error("Gemini failed on all model candidates.");
  }
}
