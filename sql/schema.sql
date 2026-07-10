-- Ember · Snowflake schema
-- Run once in your Snowflake worksheet (trial account is fine).
CREATE DATABASE IF NOT EXISTS EMBER;
USE DATABASE EMBER;
USE SCHEMA PUBLIC;

CREATE TABLE IF NOT EXISTS sessions (
  id                 STRING,
  passion_label      STRING,
  passion_category   STRING,   -- music|sport|writing|art|craft|language|other
  years_active       NUMBER,
  years_dormant      NUMBER,
  abandonment_reason STRING,   -- time|money|fear|injury|life_event|lost_joy|other
  age_at_abandonment NUMBER,
  emotional_tone     STRING,   -- wistful|bitter|guilty|peaceful
  verdict            STRING DEFAULT 'undecided',  -- rekindled|laid_to_rest|undecided
  pledge_tx          STRING,
  created_at         TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Atlas queries used by the app (see src/lib/store.ts):
--   most abandoned:  SELECT LOWER(passion_label), COUNT(*) FROM sessions GROUP BY 1 ORDER BY 2 DESC;
--   what killed them: SELECT abandonment_reason, COUNT(*) FROM sessions GROUP BY 1 ORDER BY 2 DESC;
--   rekindle rate:   SELECT AVG(IFF(verdict='rekindled',1,0)) FROM sessions WHERE verdict != 'undecided';

-- Stretch (Cortex): one-line insight per category
-- SELECT passion_category,
--        SNOWFLAKE.CORTEX.COMPLETE('mistral-large2',
--          'One wry, humane sentence about people abandoning ' || passion_category) AS insight
-- FROM (SELECT DISTINCT passion_category FROM sessions);
