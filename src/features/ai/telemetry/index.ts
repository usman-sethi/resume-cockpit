import { ProviderName, AIRequestType, TelemetryLog, ProviderStats, AIOrchestrationTelemetry } from "../types";

export class AIMonitor {
  private static instance: AIMonitor;
  private logs: TelemetryLog[] = [];
  private stats: Record<ProviderName, ProviderStats> = {
    gemini: { provider: "gemini", successCount: 0, failureCount: 0, successRate: 100, avgLatencyMs: 0, consecutiveFailures: 0, isHealthy: true },
    groq: { provider: "groq", successCount: 0, failureCount: 0, successRate: 100, avgLatencyMs: 0, consecutiveFailures: 0, isHealthy: true },
    mistral: { provider: "mistral", successCount: 0, failureCount: 0, successRate: 100, avgLatencyMs: 0, consecutiveFailures: 0, isHealthy: true }
  };
  private totalRequests = 0;
  private fallbackCount = 0;
  private retryCount = 0;
  private errorCount = 0;

  private constructor() {}

  public static getInstance(): AIMonitor {
    if (!AIMonitor.instance) {
      AIMonitor.instance = new AIMonitor();
    }
    return AIMonitor.instance;
  }

  public recordRequest(
    provider: ProviderName,
    requestType: AIRequestType,
    latencyMs: number,
    retries: number,
    status: "success" | "error" | "fallback",
    errorMessage?: string
  ) {
    this.totalRequests++;
    
    if (status === "fallback") {
      this.fallbackCount++;
    } else if (status === "error") {
      this.errorCount++;
    }

    if (retries > 0) {
      this.retryCount += retries;
    }

    const log: TelemetryLog = {
      id: "log-" + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      provider,
      requestType,
      latencyMs,
      retries,
      status,
      errorMessage
    };

    // Store up to 100 logs
    this.logs.unshift(log);
    if (this.logs.length > 100) {
      this.logs.pop();
    }

    // Update Stats
    const s = this.stats[provider];
    if (status === "success") {
      s.successCount++;
      s.consecutiveFailures = 0;
      s.isHealthy = true;
      s.cooldownUntil = undefined;
    } else {
      s.failureCount++;
      s.consecutiveFailures++;
      
      // If a provider fails 3 consecutive times, mark unhealthy for 1 minute
      if (s.consecutiveFailures >= 3) {
        s.isHealthy = false;
        s.cooldownUntil = Date.now() + 60 * 1000; // 1 minute cooldown
        console.warn(`AI Health Monitor: Provider "${provider}" marked UNHEALTHY. Cooldown active for 1 minute.`);
      }
    }

    // Recompute Success Rate and Average Latency
    const totalForProvider = s.successCount + s.failureCount;
    if (totalForProvider > 0) {
      s.successRate = Math.round((s.successCount / totalForProvider) * 100);
    }

    // Calculate moving average latency
    if (status === "success") {
      s.avgLatencyMs = s.avgLatencyMs === 0 
        ? latencyMs 
        : Math.round((s.avgLatencyMs * 4 + latencyMs) / 5); // 5-point moving average
    }

    console.log(`[AI TELEMETRY] Provider: ${provider}, Type: ${requestType}, Status: ${status}, Latency: ${latencyMs}ms, Retries: ${retries}`);
  }

  public isProviderHealthy(provider: ProviderName): boolean {
    const s = this.stats[provider];
    if (s.isHealthy) return true;

    // Check if cooldown expired
    if (s.cooldownUntil && Date.now() > s.cooldownUntil) {
      s.isHealthy = true;
      s.consecutiveFailures = 0;
      s.cooldownUntil = undefined;
      console.log(`AI Health Monitor: Provider "${provider}" cooldown expired. Testing health in recovery mode.`);
      return true;
    }

    return false;
  }

  public getTelemetry(): AIOrchestrationTelemetry {
    return {
      logs: this.logs,
      stats: this.stats,
      totalRequests: this.totalRequests,
      fallbackCount: this.fallbackCount,
      retryCount: this.retryCount,
      errorCount: this.errorCount
    };
  }

  public resetTelemetry() {
    this.logs = [];
    this.totalRequests = 0;
    this.fallbackCount = 0;
    this.retryCount = 0;
    this.errorCount = 0;
    for (const key of Object.keys(this.stats) as ProviderName[]) {
      this.stats[key] = {
        provider: key,
        successCount: 0,
        failureCount: 0,
        successRate: 100,
        avgLatencyMs: 0,
        consecutiveFailures: 0,
        isHealthy: true
      };
    }
  }
}

export const aiMonitor = AIMonitor.getInstance();
