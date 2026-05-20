ALTER TABLE visitor_events
  DROP CONSTRAINT IF EXISTS visitor_events_event_type_check;

ALTER TABLE visitor_events
  ADD CONSTRAINT visitor_events_event_type_check
  CHECK (event_type IN ('page_view', 'click', 'engagement'));

ALTER TABLE visitor_events
  ADD COLUMN IF NOT EXISTS duration_ms integer CHECK (duration_ms IS NULL OR duration_ms >= 0),
  ADD COLUMN IF NOT EXISTS target_tag text,
  ADD COLUMN IF NOT EXISTS target_text text,
  ADD COLUMN IF NOT EXISTS target_href text;

CREATE INDEX IF NOT EXISTS visitor_events_event_type_idx
  ON visitor_events (event_type);
