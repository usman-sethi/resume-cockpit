import { ProviderName, AIRequestType, AIProviderConfig } from "../types";

export interface ProviderAdapter {
  name: ProviderName;
  isConfigured(): boolean;
  execute(
    type: AIRequestType,
    systemInstruction: string,
    prompt: string,
    config: AIProviderConfig
  ): Promise<any>;
}
