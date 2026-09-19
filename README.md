# Kollokvie@IFI

Finn og hold kontakt med kollokviegruppen din på Institutt for informatikk, UiO.

Kollokvie@IFI er en liten webapp (og PWA) der studenter kan lage og finne kollokviegrupper,
følge hverandre, holde oversikt over eksamener og innleveringer i en kalender, og styre
det hele fra mobilen som om det var en app.

Bygget med **Next.js 16** (App Router), **React 19**, **Supabase** (Postgres, Auth og
Row Level Security) og **Tailwind CSS 4**. Hostes på Vercel.

## Hva appen kan

- **Innlogging med IFI-brukernavn og passord.** Ingen e-post. Registrering ber om fullt
  navn, brukernavn, IFI-brukernavn og passord (skrevet to ganger).
- **Utforsk.** Alle kollokviegrupper du kan se, med søk, emnefilter og filter for
  offentlige/private. Fulle kollokviegrupper legges bakerst og merkes «Full».
- **Kollokviegrupper.** Lag, rediger, bli med, forlat og slett. Synlighet er *offentlig*,
  *privat* (bare folk du følger eller som følger deg) eller *kun invitasjon*. Emne, rom,
  dato, tid (i kvarter) og maks antall deltakere kan settes. Medlemmer kan invitere.
- **Profiler og følgere.** Følgeforespørsler må godkjennes. Følger- og følgerlister er
  låst til folk som følger deg tilbake. Linje, årstrinn, emner, GitHub og LinkedIn.
  Profilbilde: last opp eget bilde (fra maskinen, bildegalleriet eller kamera) eller velg
  blant 21 ferdige ikoner. Uten bilde vises forbokstaven på en aksentfarge du velger.
- **Innboks** for følgeforespørsler og invitasjoner til kollokviegrupper, med en rød
  prikk på avataren når noe venter.
- **Kalender** med månedsvisning, egne hendelser (eksamen, innlevering, annet) og
  kollokviegruppene dine på riktig dato.
- **Søk** etter folk og kollokviegrupper.
- **Lyst og mørkt tema** (hvitt og lyseblått, eller mørkt), og **norsk og engelsk**.
  Begge velges nederst i Innstillinger.
- **Appfølelse på mobil.** Fast topp- og bunnmeny, låst side, ingen zoom, PWA som kan
  legges til på hjemskjermen.
- **Oppdaterer seg selv.** Nye kollokviegrupper og innboksvarsler hentes automatisk
  hvert 30. sekund og når du kommer tilbake til appen, og det er en oppdater-knapp på
  Utforsk.

## Kom i gang

Krever Node.js 20 eller nyere.

### 1. Opprett et Supabase-prosjekt

1. Gå til [supabase.com](https://supabase.com) og opprett et prosjekt.
2. Under **Project Settings → API**, kopiér **Project URL** og nøkkelen for klienten
   (`anon` / publishable key).

### 2. Miljøvariabler

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-nøkkel
```

### 3. Sett opp databasen

Kjør filene i `supabase/migrations` i **Supabase → SQL Editor**, i rekkefølge fra
`0001` til den nyeste. Hver fil er skrevet for å tåle å kjøres på nytt.

| Fil | Innhold |
| --- | --- |
| `0001`–`0003` | Profiler, følgere og tilgangsrettigheter |
| `0004`–`0006` | Profilfelter (linje, år, lenker) og aksentfarge, sletting av egen bruker |
| `0007`–`0009` | Kalenderhendelser, emner og «mine emner» |
| `0010`–`0015` | Kollokviegrupper, medlemmer, invitasjoner og RLS-policyer |
| `0016` | Synlighetsnivået «kun invitasjon» |
| `0017` | Herding: godkjenning av følgere, kapasitet i databasen, kolonnerettigheter |
| `0018` | Profilbilder: `profiles.avatar` og lagringsbøtten `avatars` |

### 4. Skru av e-postbekreftelse

Appen bruker Supabase sin e-post/passord-innlogging med en utledet adresse
(`brukernavn@kollokvie.internal`, se `src/lib/ifi-auth.ts`), så Supabase må ikke kreve
bekreftelse: **Authentication → Sign In / Providers → Email → skru av «Confirm email»**.

### 5. Kjør appen

```bash
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

Andre kommandoer: `npm run lint` og `npm run build`.

## Deploy (Vercel)

Legg de to miljøvariablene inn i Vercel-prosjektet. `vercel.json` setter regionen til
`dub1` (Dublin), som ligger ved siden av Supabase-databasen i `eu-west-1`. Det gjør en
stor forskjell for hvor rask appen føles. Push til `main` deployer automatisk.

## Struktur

```
src/
  app/
    page.tsx, login/, signup/     Startskjerm og innlogging (offentlig)
    (app)/                        Alt som krever innlogging, med felles toppbar/bunnmeny
      dashboard/                  Utforsk
      groups/, groups/[id]/       Mine kollokviegrupper, opprett, detalj og innstillinger
      calendar/, search/, inbox/
      profile/, profile/[username]/, profile/settings/
      not-found.tsx, loading.tsx
  components/                     UI-komponenter (skall, navigasjon, skjemaer, kort, ...)
  lib/
    supabase/                     Klienter for nettleser, server og proxy
    i18n/                         Oversettelser (messages.ts), server-/klienthjelpere
    avatars.ts                    Profilbilder: ikoner, URL-er og bildeklargjøring
    groups.ts, profiles.ts,       Typer og databasehjelpere
    courses.ts, events.ts
  proxy.ts                        Holder sesjonen oppdatert og beskytter sidene
supabase/migrations/              SQL i rekkefølge (se over)
```

## Litt om hvordan det henger sammen

- **Tilgang ligger i databasen.** Alle tabeller har Row Level Security. Skriving som
  krever mer enn en enkel policy (opprette og endre kollokviegrupper, invitasjoner) går
  via `security definer`-funksjoner. Kapasitet på kollokviegrupper sjekkes av en trigger.
- **Rask autentisering.** Sesjonen sjekkes lokalt med `getClaims()` i stedet for et
  nettverkskall på hver forespørsel.
- **Språk og tema** lagres i informasjonskapsler (`lang`, `theme`), slik at serveren
  rendrer riktig fra første byte. Alle tekster ligger i `src/lib/i18n/messages.ts`, på
  norsk og engelsk ved siden av hverandre. Nye tekster legges inn der og brukes med
  `t("nøkkel")`.
- **Ny å røre koden?** Dette er en nyere Next.js-versjon enn de fleste kjenner. Se
  `AGENTS.md` og dokumentasjonen i `node_modules/next/dist/docs/`.

## Kjente begrensninger

- Ingen e-postbekreftelse: hvem som helst kan registrere seg med et hvilket som helst
  IFI-brukernavn, så et IFI-brukernavn i appen er ikke bekreftet å tilhøre personen.
- Emneregisteret er et lite startsett. Andre emner kan legges til av brukerne selv.
