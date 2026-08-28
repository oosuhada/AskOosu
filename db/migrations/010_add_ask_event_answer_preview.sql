ALTER TABLE ask_events
  ADD COLUMN IF NOT EXISTS answer_preview text;
