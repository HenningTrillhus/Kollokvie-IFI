-- Slår av det åpne GraphQL-endepunktet (/graphql/v1) for uinnloggede og innloggede.
-- Appen bruker bare REST og RPC, så GraphQL er bare en ekstra angrepsflate
-- (for eksempel til å kartlegge skjemaet). Kjør i Supabase → SQL Editor.
-- Trygt å kjøre flere ganger. Vil du ha GraphQL tilbake, gi «usage» på skjemaene igjen.
do $$
begin
  revoke usage on schema graphql from anon, authenticated;
exception when others then
  raise notice 'Hoppet over skjemaet graphql: %', sqlerrm;
end
$$;

do $$
begin
  revoke usage on schema graphql_public from anon, authenticated;
exception when others then
  raise notice 'Hoppet over skjemaet graphql_public: %', sqlerrm;
end
$$;
