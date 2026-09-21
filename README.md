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
  offentlige/private. Fulle kollokviegrupper legges bakerst og merkes «Full». Kortene viser profilbildene til de
  fire første medlemmene.
- **Kollokviegrupper.** Lag, rediger, bli med, forlat og slett. Synlighet er *offentlig*,
  *privat* (bare folk du følger eller som følger deg) eller *kun invitasjon*. Emne, rom,
  dato, tid (i kvarter) og maks antall deltakere kan settes. Medlemmer kan invitere.
- **Profiler og følgere.** Følgeforespørsler må godkjennes. Følger- og følgerlister er
  låst til folk som følger deg tilbake. Linje, årstrinn, emner, GitHub og LinkedIn.
  Profilbilde: last opp eget bilde (fra maskinen, bildegalleriet eller kamera) eller velg
  blant 45 ferdige ikoner. Uten bilde vises forbokstaven på en aksentfarge du velger.
  En kort bio (160 tegn) er bare synlig for de som følger deg.
- **Personvern og samtykke.** Fullstendig personvernerklæring (`/personvern`, norsk og engelsk), obligatorisk
  samtykke ved registrering, en samtykkeside (`/samtykke`) for eksisterende brukere, og «Last ned dataene mine»
  og «Slett bruker» i Innstillinger. Innlogging lagres i langvarige informasjonskapsler, og en liten
  melding sier «Logget inn som …» når appen åpnes.
- **Innboks** for følgeforespørsler og invitasjoner til kollokviegrupper, med en rød
  prikk på avataren når noe venter.
- **Kalender** med måneds- og semestervisning. Semestrene følger UiOs datoer (høst og vår, med kilde-lenke),
  og du kan bla mellom dem. En rad viser hvor lenge det er til de neste eksamenene og obligene. Hele
  kalenderen fyller skjermen uten at siden scroller: bokser og rader du sveiper i gjør jobben. Hendelser er eksamen, oblig eller annet, med klokkeslett og emne. Du velger
  hvilke emner som vises og hvilken farge hvert emne har. Obliger og annet kan markeres som ferdige (med konfetti), og havner bakerst. Kollokviegruppene dine står på riktig dato.
- **Søk** etter folk og kollokviegrupper, med resultatene i en egen scroll-boks og sider (30 per side).
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
| `0018`–`0019` | Profilbilder: `profiles.avatar`, lagringsbøtten `avatars` og de 45 ikonene |
| `0020` | Bio (`profile_bios`, bare synlig for følgere) og medlemsforhåndsvisning på kollokviegrupper |
| `0021` | Samtykke: `profiles.privacy_version` / `privacy_accepted_at` |
| `0022` | Kalender: klokkeslett og emne på hendelser, og `calendar_prefs` (farger og filter per emne) |
| `0027` | Rydder opp i uferdige registreringer (aldri bekreftet), så de ikke blokkerer e-post eller brukernavn |
| `0026` | Innhenting: kjører 0017, 0021 og 0024 i riktig rekkefølge hvis de ble hoppet over |
| `0025` | Sjekk om brukernavn er ledig ved registrering (`username_available`) |
| `0024` | Bare UiO-e-poster (`brukernavn@uio.no`) kan registrere seg, og IFI-brukernavnet leses fra den bekreftede adressen (kjøres sammen med steget under) |
| `0023` | «Ferdig» på hendelser (`events.completed_at`) og ikon 01–45 |

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

Valgfritt: sett `NEXT_PUBLIC_CONTACT_EMAIL` (lokalt og i Vercel) for å vise en kontakt-e-post nederst i
personvernerklæringen. Når personvernerklæringen endres på en måte som krever nytt samtykke, øk
`PRIVACY_VERSION` i `src/lib/privacy.ts`, så blir alle spurt på nytt.

## E-postkode ved registrering (valgfritt, men anbefalt)

Uten dette kan hvem som helst registrere seg med et hvilket som helst IFI-brukernavn. Med det må man ha
tilgang til `brukernavn@uio.no` og skrive inn en engangskode.

1. Opprett en konto hos [Resend](https://resend.com) (velg EU-region), legg til domenet ditt og legg
   DNS-oppføringene inn hos domeneleverandøren. Lag en API-nøkkel med «Sending access».
2. Supabase → **Authentication → SMTP Settings**: skru på egen SMTP med vert `smtp.resend.com`,
   port `465`, bruker `resend`, passord = API-nøkkelen, og avsender `no-reply@ditt-domene`.
3. Supabase → **Authentication → Sign In / Providers → Email**: skru på **Confirm email**, skru av
   **Secure email change**, og sett gyldighet til rundt 10 minutter. Kodelengden (6–10 siffer) kan du velge fritt; er den ikke 8, sett `NEXT_PUBLIC_OTP_LENGTH` til samme tall.
4. Supabase → **Authentication → Email Templates**: bytt «Confirm signup» og «Change Email Address» til
   maler som viser `{{ .Token }}` (koden) i stedet for en lenke.
5. Kjør `0024_verified_ifi_email.sql` i SQL Editor.
6. Sett `NEXT_PUBLIC_EMAIL_VERIFICATION=1` i Vercel og deploy på nytt.

Eksisterende brukere (laget før dette) blir bedt om å bekrefte UiO-e-posten sin én gang på `/bekreft`.
Gjør stegene i rekkefølge: appen ber ikke om kode før steg 6.

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
