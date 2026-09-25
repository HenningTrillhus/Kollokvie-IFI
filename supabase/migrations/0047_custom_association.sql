-- Lets people add a forening that isn't on the fixed list: 'custom' is now
-- an allowed value, and its typed name is stored as the title, exactly like
-- any other association (see lib/associations.ts, CUSTOM_ASSOCIATION).
--
-- Kjør i Supabase → SQL Editor. Trygt å kjøre flere ganger.

alter table public.user_associations drop constraint if exists user_associations_association_check;

alter table public.user_associations add constraint user_associations_association_check
  check (association in (
    'dagen', 'navet', 'maps', 'fadderstyret', 'cybernetisk-selskab', 'sifi',
    'sonen', 'pga-ifi', 'creators-guild', 'maki', 'toast-jaern', 'defi',
    'progsys', 'fifi', 'digitus', 'rastlos', 'fui', 'pitch', 'mikro',
    'runtime', 'output', 'readline', 'vifi', 'realitiifi', 'pitbulls',
    'quizifi', 'custom'
  ));
