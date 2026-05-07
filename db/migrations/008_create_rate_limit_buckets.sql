CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  key text NOT NULL,
  scope text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (key, scope)
);

CREATE INDEX IF NOT EXISTS rate_limit_buckets_updated_at_idx
  ON rate_limit_buckets (updated_at);
