import { ProviderAdapter } from "../providers/base";
import { GeminiProviderAdapter } from "../providers/gemini";
import { GroqProviderAdapter } from "../providers/groq";
import { MistralProviderAdapter } from "../providers/mistral";
import { ProviderName } from "../types";

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers = new Map<ProviderName, ProviderAdapter>();

  private constructor() {
    // Register standard adapters
    this.register(new GeminiProviderAdapter());
    this.register(new GroqProviderAdapter());
    this.register(new MistralProviderAdapter());
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public register(provider: ProviderAdapter) {
    this.providers.set(provider.name, provider);
    console.log(`AI Registry: Registered provider adapter "${provider.name}" successfully.`);
  }

  public getProvider(name: ProviderName): ProviderAdapter {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`AI Registry: Provider "${name}" is not registered in the AI Provider Registry.`);
    }
    return provider;
  }

  public getAvailableProviders(): ProviderName[] {
    return Array.from(this.providers.keys());
  }

  public getRegisteredProviders(): ProviderAdapter[] {
    return Array.from(this.providers.values());
  }
}
export const aiRegistry = ProviderRegistry.getInstance();
