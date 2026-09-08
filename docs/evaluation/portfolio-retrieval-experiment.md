# Portfolio Retrieval Experiment v1

## Question

Does AskOosu's entity-aware hybrid retrieval improve portfolio-evidence retrieval over lexical-only PostgreSQL search while preserving abstention on queries that have no portfolio evidence?

## Hypothesis

The candidate should improve ambiguous, typo/colloquial, and multi-turn-resolved portfolio queries because entity aliases add a second ranking signal. It should not turn clearly off-domain/no-evidence queries into fabricated portfolio matches.

## Baseline and candidate

- Baseline: PostgreSQL lexical retrieval.
- Candidate: the production hybrid RRF path with lexical + entity ranking. External embeddings were intentionally disabled for this run because no embedding credential is required for a reproducible local/CI experiment.
- Corpus: 650 committed public portfolio chunks loaded through the same RAG sync/storage code used by the application.

This result **does not claim vector-search quality**. A vector leg must be measured separately with a fixed embedding model and version before it can be added to the claim.

## Dataset

`data/evals/portfolio-query-benchmark.ts` deterministically defines 120 queries:

| Split       | Count | Coverage                                                              |
| ----------- | ----: | --------------------------------------------------------------------- |
| Easy        |    40 | direct entity/project questions, Korean + English                     |
| Medium      |    40 | ambiguous wording, indirect project descriptions, resolved follow-ups |
| Adversarial |    40 | typo/colloquial Korean, noisy English, 20 no-evidence questions       |

Relevance is labeled by the expected canonical entity and a case-specific title/content anchor. The labels are curated from the committed public portfolio domain; this is not a blinded external annotation study.

## Metrics and procedure

- Recall@5, MRR@10, nDCG@10
- canonical entity top-1 accuracy
- no-evidence precision and recall, where abstention means zero retrieved chunks
- p50/p95/mean latency and latency variance
- 95% non-parametric bootstrap confidence intervals with 1,000 samples and fixed seed `20260908`
- three repeated retrieval measurements per query

Run:

```bash
DATABASE_URL=postgresql://... ASKOOSU_BENCHMARK_REPEATS=3 pnpm rag:benchmark
```

CI uses one repeat plus `ASKOOSU_BENCHMARK_STRICT=1` as a regression gate; the three-repeat run below is the portfolio measurement.

## Result — 2026-09-08

| Metric                 | Lexical baseline | Hybrid lexical + entity |    Change |
| ---------------------- | ---------------: | ----------------------: | --------: |
| Recall@5               |           0.2500 |                  0.5300 |   +0.2800 |
| Recall@5 95% CI        | [0.1700, 0.3400] |        [0.4300, 0.6300] |         — |
| MRR@10                 |           0.2528 |                  0.5348 |   +0.2820 |
| nDCG@10                |           0.2566 |                  0.5424 |   +0.2858 |
| Canonical entity top-1 |           0.0000 |                  0.2800 |   +0.2800 |
| No-evidence recall     |           1.0000 |                  1.0000 | unchanged |
| No-evidence precision  |           0.2353 |                  0.3704 |   +0.1351 |
| p50 latency            |        30.570 ms |               32.257 ms | +1.687 ms |
| p95 latency            |        75.207 ms |               76.164 ms | +0.957 ms |

Difficulty-level Recall@5 was `0.425 → 0.775` on easy, `0.175 → 0.400` on medium, and `0.050 → 0.300` on adversarial evidence-bearing cases. The typo/colloquial-Korean subgroup moved from `0.000 → 0.400`; resolved follow-ups moved from `0.500 → 0.800`.

## Interpretation

### Problem

Lexical-only search was brittle when the query did not share exact wording with committed portfolio documents, and canonical entity tags were sparse enough that lexical top-1 entity accuracy was zero on this benchmark.

### Measurement

The benchmark uses the real PostgreSQL RAG schema/search implementation, a fixed 120-query dataset, repeated measurements, subgroup reporting, and bootstrap confidence intervals.

### Change

The candidate enables the existing entity-aware hybrid RRF path rather than adding an evaluation-only ranking algorithm.

### Result

Hybrid improved overall Recall@5 from `0.25` to `0.53` and nDCG@10 from `0.2566` to `0.5424`. No-evidence recall remained `1.0`. The cost was a small local p50 latency increase of `1.687 ms`.

### Limitation

The absolute scores remain intentionally visible: medium/adversarial retrieval is not solved, canonical entity coverage is incomplete, and no vector model was measured in this run. The next retrieval experiment should label a held-out set independently and compare a fixed embedding-only leg plus hybrid + reranker against this result.
