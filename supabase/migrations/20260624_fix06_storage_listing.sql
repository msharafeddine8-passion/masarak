-- ════════════════════════════════════════════════════════════════════════════
-- Audit Fix #06 — Stop public listing of storage buckets (H-7) — 24 June 2026
-- The `avatars` and `images` buckets had a broad `SELECT USING (bucket_id=...)`
-- policy that let ANY client enumerate (.list()) every file. Both buckets are
-- public=true, so object URLs are served by the CDN WITHOUT this policy — so we
-- can restrict the SELECT (API/list) path to the owner + platform admin without
-- breaking public image display. Admin MediaTab .list() keeps working via the
-- email check.
-- ════════════════════════════════════════════════════════════════════════════

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars owner read" on storage.objects for select
  using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (auth.jwt() ->> 'email') = 'msharafeddine8@gmail.com'
    )
  );

drop policy if exists "images_public_read" on storage.objects;
create policy "images_owner_read" on storage.objects for select
  using (
    bucket_id = 'images'
    and (
      owner = auth.uid()
      or (auth.jwt() ->> 'email') = 'msharafeddine8@gmail.com'
    )
  );
