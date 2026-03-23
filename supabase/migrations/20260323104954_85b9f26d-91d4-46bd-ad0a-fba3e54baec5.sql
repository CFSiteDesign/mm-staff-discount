
-- Create a public storage bucket for pass photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pass-photos', 'pass-photos', true);

-- Allow anyone to upload to pass-photos bucket
CREATE POLICY "Anyone can upload pass photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pass-photos');

-- Allow anyone to read pass photos (public bucket)
CREATE POLICY "Anyone can read pass photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'pass-photos');
