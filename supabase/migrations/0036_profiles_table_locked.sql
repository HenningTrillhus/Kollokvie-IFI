-- Del 2 av privat profil. Kjør ETTER 0035 og ETTER at den nye appen ligger ute på Vercel.
-- Kjører du den før, slutter den gamle appen å kunne lese profiler.
--
-- Stenger den direkte veien inn til profiles-tabellen: innloggede kan bare lese de
-- åpne kolonnene der. Alt annet (IFI-brukernavn, lenker, studielinje, årstrinn)
-- går bare via visningen visible_profiles, som respekterer privat/åpen.
-- Oppdateringer (endre eget navn osv.) virker som før.
revoke select on public.profiles from authenticated;
grant select (id, full_name, accent_color, avatar, created_at, is_private)
  on public.profiles to authenticated;
