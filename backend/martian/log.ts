/**
 * Analytics logging for Martian AI routing
 * Maintains in-memory circular buffer for performance tracking
 */

export interface AIMeta {
  taskType: string;
  model: string;
  latency_ms: number;
  tokens_in?: number;
  tokens_out?: number;
  cost_est?: number;
  valid_json?: boolean;
  repaired?: boolean;
  timestamp: number;
}

interface LogEntry extends AIMeta {
  id: string;
}

class AILogger {
  private logs: LogEntry[] = [];
  private maxSize = 200;
  private idCounter = 0;

  /**
   * Log AI call metadata
   */
  logAI(meta: AIMeta): void {
    const entry: LogEntry = {
      id: `ai_${++this.idCounter}_${Date.now()}`,
      ...meta,
      timestamp: Date.now(),
    };

    this.logs.push(entry);

    // Maintain circular buffer
    if (this.logs.length > this.maxSize) {
      this.logs.shift();
    }
  }

  /**
   * Get recent logs with optional filtering
   */
  getLogs(options?: {
    limit?: number;
    taskType?: string;
    model?: string;
    since?: number; // timestamp
  }): LogEntry[] {
    let filtered = [...this.logs];

    if (options?.taskType) {
      filtered = filtered.filter(log => log.taskType === options.taskType);
    }

    if (options?.model) {
      filtered = filtered.filter(log => log.model === options.model);
    }

    if (options?.since) {
      filtered = filtered.filter(log => log.timestamp >= options.since);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Get analytics summary
   */
  getAnalytics(): {
    totalCalls: number;
    avgLatency: number;
    totalCost: number;
    taskTypeStats: Record<string, { count: number; avgLatency: number; totalCost: number }>;
    modelStats: Record<string, { count: number; avgLatency: number; totalCost: number }>;
    repairStats: { totalRepairs: number; repairRate: number };
    validationStats: { totalValidations: number; successRate: number };
  } {
    const logs = this.logs;
    
    if (logs.length === 0) {
      return {
        totalCalls: 0,
        avgLatency: 0,
        totalCost: 0,
        taskTypeStats: {},
        modelStats: {},
        repairStats: { totalRepairs: 0, repairRate: 0 },
        validationStats: { totalValidations: 0, successRate: 0 },
      };
    }

    const totalCalls = logs.length;
    const avgLatency = logs.reduce((sum, log) => sum + log.latency_ms, 0) / totalCalls;
    const totalCost = logs.reduce((sum, log) => sum + (log.cost_est || 0), 0);

    // Task type statistics
    const taskTypeStats: Record<string, { count: number; avgLatency: number; totalCost: number }> = {};
    const taskTypeGroups = logs.reduce((acc, log) => {
      if (!acc[log.taskType]) acc[log.taskType] = [];
      acc[log.taskType].push(log);
      return acc;
    }, {} as Record<string, LogEntry[]>);

    Object.entries(taskTypeGroups).forEach(([taskType, taskLogs]) => {
      const count = taskLogs.length;
      const avgLatency = taskLogs.reduce((sum, log) => sum + log.latency_ms, 0) / count;
      const totalCost = taskLogs.reduce((sum, log) => sum + (log.cost_est || 0), 0);
      taskTypeStats[taskType] = { count, avgLatency, totalCost };
    });

    // Model statistics
    const modelStats: Record<string, { count: number; avgLatency: number; totalCost: number }> = {};
    const modelGroups = logs.reduce((acc, log) => {
      if (!acc[log.model]) acc[log.model] = [];
      acc[log.model].push(log);
      return acc;
    }, {} as Record<string, LogEntry[]>);

    Object.entries(modelGroups).forEach(([model, modelLogs]) => {
      const count = modelLogs.length;
      const avgLatency = modelLogs.reduce((sum, log) => sum + log.latency_ms, 0) / count;
      const totalCost = modelLogs.reduce((sum, log) => sum + (log.cost_est || 0), 0);
      modelStats[model] = { count, avgLatency, totalCost };
    });

    // Repair statistics
    const totalRepairs = logs.filter(log => log.repaired).length;
    const repairRate = totalRepairs / totalCalls;

    // Validation statistics
    const validationLogs = logs.filter(log => log.valid_json !== undefined);
    const totalValidations = validationLogs.length;
    const successfulValidations = validationLogs.filter(log => log.valid_json).length;
    const successRate = totalValidations > 0 ? successfulValidations / totalValidations : 0;

    return {
      totalCalls,
      avgLatency,
      totalCost,
      taskTypeStats,
      modelStats,
      repairStats: { totalRepairs, repairRate },
      validationStats: { totalValidations, successRate },
    };
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
    this.idCounter = 0;
  }
}

// Export singleton instance
export const aiLogger = new AILogger();
