import { logInfo } from './logger';

type TraceStage = {
  name: string;
  durationMs: number;
  success: boolean;
};

type TraceLogger = (eventName: string, data: Record<string, unknown>) => void;

export function createRequestTrace({
  requestId,
  route,
  logger = logInfo,
  now = () => performance.now(),
}: {
  requestId: string;
  route: string;
  logger?: TraceLogger;
  now?: () => number;
}) {
  const traceStartedAt = now();
  const stages: TraceStage[] = [];
  let finished = false;

  async function measure<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startedAt = now();
    try {
      const result = await operation();
      stages.push({
        name,
        durationMs: roundDuration(now() - startedAt),
        success: true,
      });
      return result;
    } catch (error) {
      stages.push({
        name,
        durationMs: roundDuration(now() - startedAt),
        success: false,
      });
      throw error;
    }
  }

  function measureSync<T>(name: string, operation: () => T): T {
    const startedAt = now();
    try {
      const result = operation();
      stages.push({
        name,
        durationMs: roundDuration(now() - startedAt),
        success: true,
      });
      return result;
    } catch (error) {
      stages.push({
        name,
        durationMs: roundDuration(now() - startedAt),
        success: false,
      });
      throw error;
    }
  }

  function finish() {
    if (finished) return;
    finished = true;
    logger('chat.trace_completed', {
      requestId,
      route,
      totalLatencyMs: roundDuration(now() - traceStartedAt),
      stageCount: stages.length,
      stages,
    });
  }

  return { measure, measureSync, finish };
}

function roundDuration(value: number) {
  return Number(Math.max(0, value).toFixed(3));
}
