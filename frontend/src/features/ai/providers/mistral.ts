import { ProviderAdapter } from "./base";
import { ProviderName, AIRequestType, AIProviderConfig } from "../types";
import { cleanAndParseJSON } from "../validators";

export class MistralProviderAdapter implements ProviderAdapter {
  name: ProviderName = "mistral";
  private apiKey: string | null = null;

  constructor() {
    this.initKey();
  }

  private initKey() {
    const envKey = process.env.MISTRAL_API_KEY;
    if (envKey && envKey !== "MY_MISTRAL_API_KEY") {
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
      throw new Error("Mistral API key is not configured.");
    }

    const modelName = config.model || "mistral-small-latest";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

      const requestBody: any = {
        model: modelName,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens || 4096,
      };

      if (config.jsonMode) {
        requestBody.response_format = { type: "json_object" };
      }

      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
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
        throw new Error(`Mistral API returned HTTP error ${response.status}: ${errText}`);
      }

      const resJson = await response.json();
      const content = resJson.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Mistral returned an empty response.");
      }

      if (config.jsonMode) {
        return cleanAndParseJSON(content);
      }

      return { text: content };
    } catch (e: any) {
      if (e.name === "AbortError") {
        throw new Error(`Mistral request timed out after ${config.timeoutMs}ms.`);
      }
      throw e;
    }
  }
}
