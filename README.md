# Kollokvie@IFI

En enkel og lavmælt app for å finne og holde kontakt med kollokviegruppen din på IFI.

Bygget med Next.js (App Router) + Supabase (autentisering via IFI-brukernavn) + Tailwind CSS.

## Kom i gang

### 1. Opprett et Supabase-prosjekt

1. Gå til [supabase.com](https://supabase.com) og logg inn / opprett en konto.
2. Klikk **New project**, gi det et navn (f.eks. `kollokvie-ifi`) og velg et passord til databasen.
3. Når prosjektet er klart: gå til **Project Settings → API**.
4. Kopiér **Project URL** og **anon public key**.

### 2. Sett opp miljøvariabler

Kopiér `.env.local.example` til `.env.local` og lim inn verdiene dine:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-key
```

### 3. Skru av e-postbekreftelse i Supabase

Appen ber aldri om e-post — man logger inn med kun et IFI-brukernavn. Internt bruker den
Supabase sin e-post/passord-innlogging med en oppdiktet e-post/passord utledet fra
brukernavnet (se `src/lib/ifi-auth.ts`), så Supabase må ikke kreve e-postbekreftelse:

1. Gå til **Authentication → Sign In / Providers → Email** i Supabase-dashbordet.
2. Skru **av** "Confirm email".

Uten dette steget vil registrering se ut til å henge, siden Supabase venter på en
bekreftelse brukeren aldri får sendt.

> **Merk:** Siden det ikke er noe passord synlig i appen, er det ingen reell hemmelighet
> som beskytter kontoen — hvem som helst som taster inn et IFI-brukernavn kommer inn på
> den kontoen. Helt greit for et lite, internt kollokvie-verktøy, men vit at det er slik
> det fungerer.

### 4. Kjør appen

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000). Du blir sendt til en startside med
**Logg inn** / **Registrer deg**. Registrering ber om fullt navn, brukernavn og
IFI-brukernavn; innlogging ber bare om IFI-brukernavnet.

## Struktur

- `src/app/page.tsx` – startskjermen (logg inn / registrer deg)
- `src/app/login`, `src/app/signup` – innloggings- og registreringssidene
- `src/app/(app)` – alt som krever innlogging: delt toppbar (Hjem / Mine grupper /
  Kalender) og sidene `dashboard`, `groups`, `calendar`
- `src/lib/supabase` – Supabase-klienter for nettleser, server og middleware
- `src/lib/ifi-auth.ts` – utleder e-post/passord fra IFI-brukernavnet
- `src/proxy.ts` – holder sesjonen oppdatert og styrer hvem som får se hva
- `supabase/migrations` – SQL som kjøres i Supabase sin SQL Editor
