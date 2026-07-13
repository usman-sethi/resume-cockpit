export type ProviderName = "gemini" | "groq" | "mistral";

export type RoutingMode = "AUTO" | "GEMINI" | "GROQ" | "MISTRAL";

export type AIRequestType = 
  | "generate" 
  | "ats-check" 
  | "optimize" 
  | "improve-bullet-point" 
  | "rewrite-summary"
  | "cover-letter";

export interface AIProviderConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  retries: number;
  priority: number;
  jsonMode: boolean;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  provider: ProviderName;
  requestType: AIRequestType;
  latencyMs: number;
  retries: number;
  status: "success" | "error" | "fallback";
  errorMessage?: string;
}

export interface ProviderStats {
  provider: ProviderName;
  successCount: number;
  failureCount: number;
  successRate: number; // 0 - 100
  avgLatencyMs: number;
  consecutiveFailures: number;
  isHealthy: boolean;
  cooldownUntil?: number; // timestamp
}

export interface AIOrchestrationTelemetry {
  logs: TelemetryLog[];
  stats: Record<ProviderName, ProviderStats>;
  totalRequests: number;
  fallbackCount: number;
  retryCount: number;
  errorCount: number;
}

export interface PipelineStageConfig {
  id: string;
  name: string;
  description: string;
  provider: ProviderName;
  enabled: boolean;
}

export interface PipelineConfig {
  generateResume: {
    stages: PipelineStageConfig[];
    parallelMode: boolean;
  };
}

export interface AIOrchestrationSettings {
  routingMode: RoutingMode;
  cacheEnabled: boolean;
  cacheTTLSeconds: number;
  pipelineConfig: PipelineConfig;
}
