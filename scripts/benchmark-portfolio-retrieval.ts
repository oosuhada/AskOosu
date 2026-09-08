import process from 'node:process';

import { PORTFOLIO_QUERY_BENCHMARK } from '../data/evals/portfolio-query-benchmark';
import { getPostgresPool } from '../src/lib/db/postgres';
import { syncPortfolioKnowledgeBase } from '../src/lib/rag/notion-rag';
import { searchRagChunks } from '../src/lib/rag/search';

type RetrievalMode = 'lexical' | 'hybrid';

type CaseObservation = {
  id: string;
  difficulty: string;
  category: string;
  expectEvidence: boolean;
  relevantRank: number | null;
  top1EntityCorrect: boolean;
  predictedNoEvidence: boolean;
  latencyMs: number;
};

type SearchResult = Awaited<
  ReturnType<typeof searchRagChunks>
>['results'][number];

const REPEATS = Math.max(
  1,
  Number.parseInt(process.env.ASKOOSU_BENCHMARK_REPEATS ?? '3', 10) || 3
);
const BOOTSTRAP_SAMPLES = 1000;

function percentile(values: number[], p: number) {
  const ordered = [...values].sort((a, b) => a - b);
  if (ordered.length === 0) return 0;
  const position = (ordered.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return ordered[lower];
  return (
    ordered[lower] + (ordered[upper] - ordered[lower]) * (position - lower)
  );
}

function round(value: number, digits = 4) {
  return Number(value.toFixed(digits));
}

function mean(values: number[]) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

function variance(values: number[]) {
  if (values.length === 0) return 0;
  const average = mean(values);
  return mean(values.map((value) => (value - average) ** 2));
}

function seededRandom(seed = 20260908) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function bootstrapCi(values: number[]) {
  if (values.length === 0) return [0, 0];
  const random = seededRandom();
  const estimates: number[] = [];
  for (let sample = 0; sample < BOOTSTRAP_SAMPLES; sample += 1) {
    const drawn: number[] = [];
    for (let index = 0; index < values.length; index += 1) {
      drawn.push(values[Math.floor(random() * values.length)]);
    }
    estimates.push(mean(drawn));
  }
  return [
    round(percentile(estimates, 0.025)),
    round(percentile(estimates, 0.975)),
  ];
}

function metricSummary(observations: CaseObservation[]) {
  const evidence = observations.filter((row) => row.expectEvidence);
  const noEvidence = observations.filter((row) => !row.expectEvidence);
  const recall5 = evidence.map((row) =>
    row.relevantRank !== null && row.relevantRank <= 5 ? 1 : 0
  );
  const reciprocalRanks = evidence.map((row) =>
    row.relevantRank !== null && row.relevantRank <= 10
      ? 1 / row.relevantRank
      : 0
  );
  const ndcg10 = evidence.map((row) =>
    row.relevantRank !== null && row.relevantRank <= 10
      ? 1 / Math.log2(row.relevantRank + 1)
      : 0
  );
  const entityTop1 = evidence.map((row) => (row.top1EntityCorrect ? 1 : 0));
  const predictedAbstentions = observations.filter(
    (row) => row.predictedNoEvidence
  );
  const correctAbstentions = predictedAbstentions.filter(
    (row) => !row.expectEvidence
  );
  const noEvidencePrecision = predictedAbstentions.length
    ? correctAbstentions.length / predictedAbstentions.length
    : 0;
  const noEvidenceRecall = noEvidence.length
    ? noEvidence.filter((row) => row.predictedNoEvidence).length /
      noEvidence.length
    : 0;
  const latencies = observations.map((row) => row.latencyMs);

  return {
    recall_at_5: round(mean(recall5)),
    recall_at_5_ci95: bootstrapCi(recall5),
    mrr_at_10: round(mean(reciprocalRanks)),
    mrr_at_10_ci95: bootstrapCi(reciprocalRanks),
    ndcg_at_10: round(mean(ndcg10)),
    ndcg_at_10_ci95: bootstrapCi(ndcg10),
    entity_top1_accuracy: round(mean(entityTop1)),
    entity_top1_ci95: bootstrapCi(entityTop1),
    no_evidence_precision: round(noEvidencePrecision),
    no_evidence_recall: round(noEvidenceRecall),
    predicted_abstentions: predictedAbstentions.length,
    latency_ms: {
      p50: round(percentile(latencies, 0.5), 3),
      p95: round(percentile(latencies, 0.95), 3),
      mean: round(mean(latencies), 3),
      variance: round(variance(latencies), 5),
    },
  };
}

function isRelevant(
  result: SearchResult,
  benchmarkCase: (typeof PORTFOLIO_QUERY_BENCHMARK)[number]
) {
  if (
    result.entity_id &&
    benchmarkCase.expectedEntityIds.includes(result.entity_id)
  ) {
    return true;
  }

  const evidenceText =
    `${result.title}\n${result.contentPreview}`.toLowerCase();
  return benchmarkCase.relevanceHints.some((hint) =>
    evidenceText.includes(hint.toLowerCase())
  );
}

async function runMode(mode: RetrievalMode) {
  process.env.ASKOOSU_RAG_RETRIEVAL = mode;
  const observations: CaseObservation[] = [];

  for (const benchmarkCase of PORTFOLIO_QUERY_BENCHMARK) {
    const repeatLatencies: number[] = [];
    let relevantRank: number | null = null;
    let top1EntityCorrect = false;
    let predictedNoEvidence = false;

    for (let repeat = 0; repeat < REPEATS; repeat += 1) {
      const retrievalQuery = benchmarkCase.priorTurn
        ? `${benchmarkCase.priorTurn}\nFollow-up: ${benchmarkCase.query}`
        : benchmarkCase.query;
      const startedAt = performance.now();
      const payload = await searchRagChunks({
        q: retrievalQuery,
        limit: 10,
        includePrivate: false,
        debug: true,
      });
      repeatLatencies.push(performance.now() - startedAt);
      if (repeat > 0) continue;

      relevantRank = benchmarkCase.expectEvidence
        ? payload.results.findIndex((result) =>
            isRelevant(result, benchmarkCase)
          ) + 1
        : null;
      if (relevantRank === 0) relevantRank = null;
      top1EntityCorrect = Boolean(
        payload.results[0]?.entity_id &&
          benchmarkCase.expectedEntityIds.includes(payload.results[0].entity_id)
      );
      predictedNoEvidence = payload.results.length === 0;
    }

    observations.push({
      id: benchmarkCase.id,
      difficulty: benchmarkCase.difficulty,
      category: benchmarkCase.category,
      expectEvidence: benchmarkCase.expectEvidence,
      relevantRank,
      top1EntityCorrect,
      predictedNoEvidence,
      latencyMs: mean(repeatLatencies),
    });
  }

  const byDifficulty = Object.fromEntries(
    ['easy', 'medium', 'adversarial'].map((difficulty) => [
      difficulty,
      metricSummary(
        observations.filter((row) => row.difficulty === difficulty)
      ),
    ])
  );
  const byCategory = Object.fromEntries(
    [...new Set(observations.map((row) => row.category))].map((category) => [
      category,
      metricSummary(observations.filter((row) => row.category === category)),
    ])
  );

  return {
    mode,
    metrics: metricSummary(observations),
    by_difficulty: byDifficulty,
    by_category: byCategory,
  };
}

async function main() {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    throw new Error('DATABASE_URL or POSTGRES_URL is required');
  }

  process.env.ASKOOSU_RAG_STORE = 'postgres';
  process.env.ASKOOSU_RAG_AUTO_SYNC = 'false';
  process.env.ASKOOSU_RAG_SEARCH_CACHE_TTL_MS = '0';
  process.env.ASKOOSU_RAG_RETRIEVAL = 'lexical';
  delete process.env.OPENAI_API_KEY;
  delete process.env.NOTION_API_KEY;

  const sync = await syncPortfolioKnowledgeBase({ force: true });
  const baseline = await runMode('lexical');
  const candidate = await runMode('hybrid');

  const result = {
    experiment: 'askoosu-portfolio-retrieval-v1',
    question:
      'Does entity-aware hybrid RRF improve retrieval over lexical-only search on committed portfolio evidence?',
    hypothesis:
      'Hybrid lexical + entity RRF will improve entity retrieval on ambiguous/typo queries without increasing private-data exposure.',
    dataset: {
      total_queries: PORTFOLIO_QUERY_BENCHMARK.length,
      easy: PORTFOLIO_QUERY_BENCHMARK.filter((row) => row.difficulty === 'easy')
        .length,
      medium: PORTFOLIO_QUERY_BENCHMARK.filter(
        (row) => row.difficulty === 'medium'
      ).length,
      adversarial: PORTFOLIO_QUERY_BENCHMARK.filter(
        (row) => row.difficulty === 'adversarial'
      ).length,
      no_evidence: PORTFOLIO_QUERY_BENCHMARK.filter(
        (row) => !row.expectEvidence
      ).length,
      relevance_label:
        'expected entity id OR case-specific title/content anchor',
    },
    corpus: {
      stored_chunks: sync.storedChunkCount,
      embedded_chunks: sync.embeddedChunkCount,
      source_chunks: sync.sourceChunkCount,
    },
    repeated_measurements_per_query: REPEATS,
    confidence_interval: `non-parametric bootstrap, ${BOOTSTRAP_SAMPLES} samples, fixed seed 20260908`,
    baseline,
    candidate,
    limitations: [
      'The benchmark uses committed portfolio documents only; live Notion content and external embeddings are intentionally disabled.',
      'Hybrid in this run means lexical + entity RRF/boosting; vector retrieval is not claimed without embedding credentials.',
      'Entity labels are curated from the same public portfolio knowledge domain and are not an independently blinded annotation study.',
      'No-evidence behavior is measured as retrieval abstention (zero returned chunks), not LLM factuality.',
    ],
  };

  console.log(JSON.stringify(result, null, 2));
  if (process.env.ASKOOSU_BENCHMARK_STRICT === '1') {
    const baselineRecall = baseline.metrics.recall_at_5;
    const candidateRecall = candidate.metrics.recall_at_5;
    const candidateNoEvidenceRecall = candidate.metrics.no_evidence_recall;
    const candidateEntityAccuracy = candidate.metrics.entity_top1_accuracy;
    const failures = [
      candidateRecall < baselineRecall
        ? `candidate Recall@5 ${candidateRecall} is below lexical ${baselineRecall}`
        : null,
      candidateRecall < 0.45
        ? `candidate Recall@5 ${candidateRecall} is below release floor 0.45`
        : null,
      candidateNoEvidenceRecall < 0.9
        ? `candidate no-evidence recall ${candidateNoEvidenceRecall} is below 0.90`
        : null,
      candidateEntityAccuracy < 0.2
        ? `candidate entity top-1 accuracy ${candidateEntityAccuracy} is below 0.20`
        : null,
    ].filter(Boolean);
    if (failures.length > 0) {
      throw new Error(
        `Retrieval benchmark gate failed: ${failures.join('; ')}`
      );
    }
  }
  const pool = await getPostgresPool();
  await pool.end();
  globalThis.askOosuPgPool = undefined;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
