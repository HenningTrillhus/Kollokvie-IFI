# Kollokvie@IFI

En enkel og lavmælt app for å finne og holde kontakt med kollokviegruppen din på IFI.

Bygget med Next.js (App Router) + Supabase (autentisering via magisk lenke på e-post) + Tailwind CSS.

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

### 3. Slå på e-post-innlogging med 6-sifret kode

Appen bruker Supabase sin OTP-innlogging: brukeren får en 6-sifret kode på e-post og skriver den inn i appen (ingen lenke å klikke).

1. I Supabase-dashbordet: **Authentication → Sign In / Providers → Email**, og sørg for at **Email** er aktivert.
2. Gå til **Authentication → Email Templates → Magic Link**. Standardmalen viser bare en lenke — legg til `{{ .Token }}` i malen, f.eks.:
   ```html
   <h2>Din innloggingskode</h2>
   <p>Skriv inn denne koden i appen: <strong>{{ .Token }}</strong></p>
   ```
3. (Valgfritt) Under **Authentication → Rate Limits** kan du justere hvor ofte en bruker kan be om ny kode.

### 4. Kjør appen

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000). Du blir sendt til `/login` — skriv inn en e-postadresse og du får tilsendt en innloggingslenke. Klikk den, og du havner på `/dashboard`.

## Struktur

- `src/app/login` – start-/innloggingsskjermen
- `src/app/auth/confirm` – bekrefter magic-link-tokenet fra e-posten
- `src/app/dashboard` – siden du havner på etter innlogging
- `src/lib/supabase` – Supabase-klienter for nettleser, server og middleware
- `src/middleware.ts` – holder sesjonen oppdatert og styrer hvem som får se hva
