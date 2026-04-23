-- ============================================================
-- Spidey – Spider Manager · Supabase Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Spiders table
CREATE TABLE IF NOT EXISTS spiders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  species        text NOT NULL,
  common_name    text,
  origin         text,
  habitat        text,
  body_size      text,
  span           text,
  toxicity       text,
  sex            text,
  age            text,
  temp_range     text,
  humidity_range text,
  last_fed       date,
  molts          text[],
  notes          text,
  image_url      text,
  color          text,
  created_at     timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE spiders ENABLE ROW LEVEL SECURITY;

-- Public: read-only
CREATE POLICY "Public read spiders"
  ON spiders FOR SELECT
  USING (true);

-- Authenticated (admin): full write access
CREATE POLICY "Authenticated insert spiders"
  ON spiders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update spiders"
  ON spiders FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated delete spiders"
  ON spiders FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- Storage bucket for spider photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('spider-images', 'spider-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public: view images
CREATE POLICY "Public read spider images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'spider-images');

-- Authenticated: upload images
CREATE POLICY "Authenticated upload spider images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'spider-images');

-- Authenticated: delete images
CREATE POLICY "Authenticated delete spider images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'spider-images');
