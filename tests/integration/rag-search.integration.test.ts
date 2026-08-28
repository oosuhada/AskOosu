import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { getPostgresPool } from '../../src/lib/db/postgres.ts';
import {
  ensureRagDatabaseSchema,
  searchStoredRagChunkRowsByEmbedding,
} from '../../src/lib/rag/database.ts';
import { searchRagChunks } from '../../src/lib/rag/search.ts';
import { ensureRagSearchCacheSchema } from '../../src/lib/rag/search-cache.ts';

const databaseAvailable = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
const vectorDimensions = 1536;

function vector(index: number) {
  return Array.from({ length: vectorDimensions }, (_, position) =>
    position === index ? 1 : 0
  );
}

function vectorLiteral(values: number[]) {
  return `[${values.join(',')}]`;
}

before(async () => {
  if (!databaseAvailable) return;
  process.env.ASKOOSU_RAG_RETRIEVAL = 'lexical';
  process.env.ASKOOSU_RAG_SEARCH_CACHE_TTL_MS = '600000';
  delete process.env.OPENAI_API_KEY;

  await ensureRagDatabaseSchema();
  await ensureRagSearchCacheSchema();
  const pool = await getPostgresPool();
  await pool.query('TRUNCATE rag_search_cache, rag_chunks, rag_sources CASCADE');
  const source = await pool.query<{ id: string }>(
    `INSERT INTO rag_sources (type, source_key, title) VALUES ('test', 'quality-suite', 'Quality Suite') RETURNING id`
  );
  const sourceId = source.rows[0].id;

  const rows = [
    {
      chunkId: 'public-askoosu',
      entityId: 'project.askoosu',
      title: 'AskOosu Architecture',
      content: 'AskOosu uses deterministic FAQ routing, PostgreSQL RAG, pgvector, and source evidence.',
      visibility: 'public',
      todo: false,
      embedding: vector(0),
    },
    {
      chunkId: 'public-portfoli-oh',
      entityId: 'project.portfoli_oh',
      title: 'Portfoli-Oh Archive',
      content: 'The earlier portfolio focused on frontend interactions and visual experiments.',
      visibility: 'public',
      todo: false,
      embedding: vector(1),
    },
    {
      chunkId: 'private-note',
      entityId: 'profile.private',
      title: 'Private Internal Note',
      content: 'ultrasecretportfolio internal material that must remain private.',
      visibility: 'private',
      todo: false,
      embedding: vector(2),
    },
    {
      chunkId: 'todo-askoosu',
      entityId: 'project.askoosu',
      title: 'AskOosu TODO Draft',
      content: 'AskOosu architecture draft with unresolved TODO evidence.',
      visibility: 'public',
      todo: true,
      embedding: vector(3),
    },
  ];

  for (const row of rows) {
    await pool.query(
      `
        INSERT INTO rag_chunks (
          source_id, chunk_id, entity_id, title, section_path, content,
          content_hash, metadata, visibility, freshness, has_todo, confidence,
          language, embedding
        ) VALUES (
          $1, $2, $3, $4, ARRAY['Architecture'], $5,
          $2 || '-hash', '{}'::jsonb, $6, 'current', $7, 1.0,
          'en', $8::vector
        )
      `,
      [
        sourceId,
        row.chunkId,
        row.entityId,
        row.title,
        row.content,
        row.visibility,
        row.todo,
        vectorLiteral(row.embedding),
      ]
    );
  }
});

after(async () => {
  if (!databaseAvailable) return;
  const pool = await getPostgresPool();
  await pool.end();
  globalThis.askOosuPgPool = undefined;
});

test('lexical retrieval ranks public AskOosu evidence and excludes private chunks', { skip: !databaseAvailable }, async () => {
  process.env.ASKOOSU_RAG_RETRIEVAL = 'lexical';
  const result = await searchRagChunks({
    q: 'AskOosu architecture pgvector',
    language: 'en',
    includePrivate: false,
    debug: true,
  });

  assert.equal(result.ok, true);
  assert.equal(result.searchMode, 'postgres_fts');
  assert.equal(result.results[0]?.chunk_id, 'public-askoosu');
  assert.equal(result.results.some((item) => item.chunk_id === 'private-note'), false);
});

test('visibility filtering can explicitly include private evidence', { skip: !databaseAvailable }, async () => {
  process.env.ASKOOSU_RAG_RETRIEVAL = 'lexical';
  const hidden = await searchRagChunks({
    q: 'ultrasecretportfolio',
    language: 'en',
    includePrivate: false,
    debug: true,
  });
  const visible = await searchRagChunks({
    q: 'ultrasecretportfolio',
    language: 'en',
    includePrivate: true,
    debug: true,
  });

  assert.equal(hidden.results.some((item) => item.chunk_id === 'private-note'), false);
  assert.equal(visible.results[0]?.chunk_id, 'private-note');
});

test('hybrid retrieval degrades to lexical/entity evidence when embeddings are unavailable', { skip: !databaseAvailable }, async () => {
  process.env.ASKOOSU_RAG_RETRIEVAL = 'hybrid';
  delete process.env.OPENAI_API_KEY;
  const result = await searchRagChunks({
    q: 'AskOosu architecture',
    language: 'en',
    includePrivate: false,
    debug: true,
  });

  assert.equal(result.ok, true);
  assert.equal(result.searchMode, 'hybrid');
  assert.equal(result.results[0]?.entity_id, 'project.askoosu');
  assert.equal(
    result.warnings.some((warning) => /embedding credentials/i.test(warning)),
    true
  );
});

test('pgvector similarity search ranks the closest stored embedding first', { skip: !databaseAvailable }, async () => {
  const rows = await searchStoredRagChunkRowsByEmbedding({
    embedding: vector(0),
    limit: 3,
    includePrivate: false,
    language: 'en',
  });

  assert.equal(rows[0]?.chunk_id, 'public-askoosu');
  assert.ok((rows[0]?.embedding_score ?? 0) > 0.99);
});

test('search cache returns the prior payload after the underlying matching text changes', { skip: !databaseAvailable }, async () => {
  process.env.ASKOOSU_RAG_RETRIEVAL = 'lexical';
  const query = {
    q: 'cacheproofkeyword',
    language: 'en' as const,
    includePrivate: false,
    debug: false,
  };
  const pool = await getPostgresPool();
  await pool.query(
    `UPDATE rag_chunks SET content = content || ' cacheproofkeyword' WHERE chunk_id = 'public-askoosu'`
  );

  const first = await searchRagChunks(query);
  assert.equal(first.results[0]?.chunk_id, 'public-askoosu');

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const cacheRows = await pool.query<{ count: string }>(
      'SELECT count(*)::text AS count FROM rag_search_cache'
    );
    if (Number(cacheRows.rows[0]?.count ?? 0) > 0) break;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  await pool.query(
    `UPDATE rag_chunks SET content = replace(content, ' cacheproofkeyword', '') WHERE chunk_id = 'public-askoosu'`
  );
  const second = await searchRagChunks(query);
  assert.equal(second.results[0]?.chunk_id, 'public-askoosu');
});
