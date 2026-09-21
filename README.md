# Kollokvie@IFI

Finn og hold kontakt med kollokviegruppen din på Institutt for informatikk, UiO.

Kollokvie@IFI er en liten webapp (og PWA) der studenter kan lage og finne kollokviegrupper,
følge hverandre, holde oversikt over eksamener og innleveringer i en kalender, og styre
det hele fra mobilen som om det var en app.

Bygget med **Next.js 16** (App Router), **React 19**, **Supabase** (Postgres, Auth og
Row Level Security) og **Tailwind CSS 4**. Hostes på Vercel.

## Hva appen kan

- **Innlogging med IFI-brukernavn og passord.** Registrering ber om fullt navn, IFI-brukernavn
  (bare små bokstaver, det er delen før @uio.no) og passord (skrevet to ganger). IFI-brukernavnet er
  også brukernavnet i appen. Adressen bekreftes med en engangskode på e-post.
- **Utforsk.** Alle kollokviegrupper du kan se, med søk, emnefilter og filter for
  offentlige/private. Fulle kollokviegrupper legges bakerst og merkes «Full». Kortene viser profilbildene til de
  fire første medlemmene.
- **Kollokviegrupper.** Lag, rediger, bli med, forlat og slett. Synlighet er *offentlig*,
  *privat* (bare folk du følger eller som følger deg) eller *kun invitasjon*. Emne, rom,
  dato, tid (i kvarter) og maks antall deltakere kan settes. Medlemmer kan invitere.
- **Profiler og følgere.** Følgeforespørsler må godkjennes. Følger- og følgerlister er
  låst til folk som følger deg tilbake. Linje, årstrinn, emner, GitHub og LinkedIn.
  Profilbilde: last opp eget bilde (fra maskinen, bildegalleriet eller kamera) eller velg
  blant 65 ferdige ikoner. Uten bilde vises forbokstaven på en aksentfarge du velger.
  En kort bio (160 tegn) er bare synlig for de som følger deg.
- **Personvern og samtykke.** Personvernerklæring (`/personvern`), bruksvilkår (`/vilkar`) og erklæring om
  informasjonskapsler (`/informasjonskapsler`), alle på norsk og engelsk. Obligatorisk, ikke forhåndskrysset
  samtykke ved registrering, en samtykkeside (`/samtykke`) for eksisterende brukere, og «Last ned dataene mine»
  og «Slett bruker» i Innstillinger. Se [Personvern, juridisk og tilgjengelighet](#personvern-juridisk-og-tilgjengelighet).
- **Innboks** for følgeforespørsler og invitasjoner til kollokviegrupper, med en rød
  prikk på avataren når noe venter.
- **Kalender** med måneds- og semestervisning. Semestrene følger UiOs datoer (høst og vår, med kilde-lenke),
  og du kan bla mellom dem. En rad viser hvor lenge det er til de neste eksamenene og obligene. Hele
  kalenderen fyller skjermen uten at siden scroller: bokser og rader du sveiper i gjør jobben. Hendelser er eksamen, oblig eller annet, med klokkeslett og emne. Du velger
  hvilke emner som vises og hvilken farge hvert emne har. Obliger og annet kan markeres som ferdige (med konfetti), og havner bakerst. Kollokviegruppene dine står på riktig dato.
- **Søk** etter folk og kollokviegrupper, med resultatene i en egen scroll-boks og sider (30 per side).
  Uten søketekst vises alle: folk du har flest felles kontakter med først, resten og kollokviegruppene A–Å.
- **Lyst og mørkt tema** (hvitt og lyseblått, eller mørkt), og **norsk og engelsk**.
  Begge velges nederst i Innstillinger.
- **Appfølelse på mobil.** Fast topp- og bunnmeny, låst side, PWA som kan legges til på hjemskjermen.
  Innlogging og registrering fyller skjermen uten å scrolle. Nettleser-zoom er tillatt (tilgjengelighet).
- **Fungerer på alle skjermer.** Mobil: bunnmeny og én kolonne. Nettbrett: toppmeny og to kolonner med kort.
  PC: bredt innhold med tre kolonner med kort, kalender i to kolonner (måned til venstre, frister og valgt dag
  til høyre, med hendelsestitler i rutene), profil og kollokviegruppe i to kolonner, og snarveien «/» for å søke.
  Innlogging og registrering scroller på liggende mobil der det ikke er plass.
- **Små animasjoner** (av hvis du har valgt «reduser bevegelse»): sider og lister glir inn, kort løfter seg ved
  hover, nedtrekksmenyer «popper» opp, og knapper bytter form når tilstanden endres. «Slutt å følge» og «Forlat
  kollokviegruppe» krever to trykk, så man ikke gjør det ved uhell.
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
| `0028` | Brukernavn = IFI-brukernavn (ingen egen brukernavn-innstilling lenger) |
| `0029` | `suggested_profiles`: søket viser alle brukere når feltet er tomt, med felles kontakter først |
| `0030` | Profilikoner 01–60 (var 01–45) |
| `0031` | Sikkerhet: tekstgrenser og lenke-sjekk, strammere bildelagring, mindre rettigheter for uinnloggede |
| `0032` | Profilikoner 01–65 (var 01–60) |
| `0026` | Innhenting: kjører 0017, 0021 og 0024 i riktig rekkefølge hvis de ble hoppet over |
| `0025` | Sjekk om brukernavn er ledig ved registrering (`username_available`) |
| `0024` | Bare UiO-e-poster (`brukernavn@uio.no`) kan registrere seg, og IFI-brukernavnet leses fra den bekreftede adressen (kjøres sammen med steget under) |
| `0023` | «Ferdig» på hendelser (`events.completed_at`) og ikon 01–45 |

### 4. E-postbekreftelse

Uten e-postkode (se «E-postkode ved registrering» lenger ned) bruker appen en utledet adresse
(`brukernavn@kollokvie.internal`, se `src/lib/ifi-auth.ts`), og Supabase må da **ikke** kreve bekreftelse
(**Authentication → Sign In / Providers → Email → skru av «Confirm email»**). Med e-postkode skal den
derimot være **på**. E-postmalene ligger ferdig i `supabase/email-templates/`.

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

## Personvern, juridisk og tilgjengelighet

> Dette er en teknisk gjennomgang, ikke juridisk rådgivning. Tekstene under `/personvern`, `/vilkar` og
> `/informasjonskapsler` er skrevet for denne appen slik den fungerer nå, men la gjerne noen med juridisk
> kompetanse lese gjennom dem, spesielt hvis appen vokser eller begynner å samle inn mer.

### Sider og tekster

| Side | Fil | Innhold |
| --- | --- | --- |
| `/personvern` | `src/lib/privacy-content.ts` | Personvernerklæring (GDPR): hvem, hva, hvorfor, hvem ser hva, databehandlere, lagringstid, rettigheter |
| `/vilkar` | `src/lib/legal-content.ts` | Bruksvilkår: uavhengig av UiO, regler for bruk, innhold, fjerning, ansvar, norsk rett |
| `/informasjonskapsler` | `src/lib/legal-content.ts` | Alle informasjonskapsler og lokal lagring, med varighet |

Endrer du personvernerklæringen på en måte som krever nytt samtykke, endre `PRIVACY_VERSION` i `src/lib/privacy.ts`.
Alle blir da bedt om å godta på nytt (`/samtykke`), og hvert samtykke lagres med versjon og tidspunkt.

### Samtykke og skjemaer

- Avkrysningsboksen ved registrering er **ikke forhåndskrysset**, og man kan ikke opprette bruker uten den. Den lenker til
  personvernerklæringen og vilkårene.
- Samtykkesiden har «Godta» og «Avslå» som like store knapper, og forklarer at man kan slette kontoen i stedet.
- Å trekke samtykket er like enkelt som å gi det: «Slett bruker» i Innstillinger, uten omveier.
- Informasjonsboksen om informasjonskapsler (`src/components/cookie-notice.tsx`) har bare «OK», fordi vi ikke bruker
  kapsler som krever samtykke. Legger du til statistikk, reklame eller sporing, må den byttes ut med et ekte valg
  (godta/avslå med lik vekt) som blokkerer dem til samtykke er gitt.

### Datainnsamling (dataminimering)

Obligatorisk: fullt navn, IFI-brukernavn (= e-postadressen `brukernavn@uio.no`) og passord (lagres som hash av Supabase Auth).
Alt annet er **valgfritt**: studielinje, årstrinn, emner, GitHub/LinkedIn, bio, profilbilde, farge. Vi lagrer ingen
telefonnummer, fødselsdato, adresse, posisjon eller enhets-ID-er, og ingen analyse. Kalenderhendelser er bare synlige for eieren.

### Tredjeparter (revisjon)

| Tjeneste | Hva | Sted | Merknad |
| --- | --- | --- | --- |
| Supabase | Database, innlogging, bildelagring | EU (Irland) | Databehandler. Signer DPA hos Supabase |
| Vercel | Hosting | Dublin (`dub1`) | Databehandler. Signer DPA hos Vercel |
| Resend | Sender e-postkoden | EU (Irland) | Databehandler. Signer DPA hos Resend |

Ingen analyse-, reklame-, sporings-, chat- eller kartverktøy, og ingen skript, skrifter eller bilder lastes fra tredjeparts-domener
i nettleseren (skriftene hostes selv via `next/font`). Avhengighetene i `package.json` er bare Next.js, React og Supabase-klientene.
Legger du til en ny tjeneste: oppdater personvernerklæringen (§ 5), cookie-erklæringen, og denne tabellen.

### Tilgjengelighet

- «Hopp til innholdet»-lenke, riktige landemerker (`main`, `nav`, `header`), `lang`-attributt på siden.
- Synlig fokusramme for tastaturbrukere, tastaturnavigasjon i faner (piltaster), dialoger (Escape, fokus fanges og
  gjenopprettes) og nedtrekksmenyer (`aria-expanded`).
- Alle felt og ikon-knapper har tilgjengelige navn. Feilmeldinger leses opp (`role="alert"`). Profilbilder er
  dekorative (`alt=""`) fordi navnet står ved siden av; ikonvelgeren har navn på hvert ikon.
- Respekterer «reduser bevegelse» (animasjoner og konfetti). Feilfarge har nok kontrast i lys og mørk modus.
- Nettleser-zoom er tillatt. Felt er 16 px på berøringsskjermer, så iOS ikke zoomer inn av seg selv.

### Sikkerhet

| Tema | Status |
| --- | --- |
| **HSTS** | På (`next.config.ts`, to år). Vercel tvinger i tillegg HTTPS. |
| **Sikkerhetshoder** | `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`. Ingen `X-Powered-By`. |
| **CSRF** | Ikke et problem her: appen kaller Supabase med et token i `Authorization`-headeren, ikke med cookies alene, og innloggingscookien er `SameSite=Lax`. De få server-handlingene (språk og tema) sjekkes av Next.js mot `Origin`. Appen har ingen egne POST-ruter. |
| **Passord** | Minst 8 tegn ved nytt passord (`src/lib/passwords.ts`). Lagres som hash av Supabase Auth. |
| **Nullstill økter ved passordbytte** | Ja. Både «Glemt passord» og «Bytt passord» (Innstillinger) logger ut alle andre enheter (`signOut({ scope: "others" })`). |
| **Glemt passord** | `/glemt-passord`: kode på e-post til `brukernavn@uio.no`, deretter nytt passord. Koden kan bare brukes én gang og utløper (se under). |
| **Brukeroppslag (enumeration)** | Innlogging gir alltid samme feilmelding. «Glemt passord» svarer likt om brukeren finnes eller ikke. Registrering sier at adressen er i bruk, ellers ville ikke brukeren forstå hvorfor koden ikke kommer. Profilene er uansett synlige for alle innloggede. |
| **Rate limiting** | Håndheves av Supabase Auth (se innstillingene under) og av 60 sekunders nedtelling på «Send ny kode». |
| **Filopplasting** | Bildet gjøres om til en 256×256 JPEG i nettleseren. Bøtta godtar bare `image/jpeg` (maks 300 KB), og bare filen `<din-id>/avatar.jpg` (migrering 0031). |
| **Ingen kataloglisting** | Bildebøtta kan ikke listes av andre (lese-policyen er bare for egen mappe). Next.js og Vercel viser aldri mappeinnhold. |
| **CORS** | Appen sender ingen CORS-hoder, så andre nettsteder kan ikke lese svarene den gir. Supabase-API-et er åpent for alle opprinnelser med vilje; det beskyttes av innlogging (JWT) og Row Level Security. |
| **Rens før lagring** | Alle spørringer er parametriserte (ingen SQL bygges av tekst), og React escaper all tekst. Lenker må være `http(s)` både i skjemaet, i databasen (`profiles_text_limits`) og når de vises. Lengdegrenser finnes i databasen for navn, bio, kollokviegrupper, hendelser og emner. |
| **Databasetilgang** | Row Level Security på alle tabeller. Migrering 0031: uinnloggede har null tilgang til tabeller, og kan bare kalle én funksjon (opprydding av uferdig registrering). `is_following` svarer bare om deg selv. |
| **Prompt injection** | Ikke relevant: appen bruker ingen AI-modell og sender ingen tekst til en. Legger du til AI senere, behandle brukertekst som data, aldri som instruksjoner. |

Ingen Content-Security-Policy ennå (Next.js trenger nonces for sine inline-skript, som gjør alle sider dynamiske). Ta det når appen har fått mer trafikk.

#### Innstillinger du må gjøre i Supabase

Dette ligger i Supabase-dashbordet, ikke i koden:

1. **Authentication → URL Configuration:** sett *Site URL* til `https://kollokvie-ifi.no`, og la *Redirect URLs* bare inneholde adresser du selv bruker (fjern `*`-mønstre og `localhost` i produksjon).
2. **Authentication → Sign In / Providers → Email:** *Email OTP Expiration* = 600 sekunder (10 min), *Minimum password length* = 8. Koden er engangs, og utløper etter tiden du setter.
3. **Authentication → Rate Limits:** behold lave grenser for e-post (sending av koder) og for innlogging/verifisering per IP. Standardverdiene er greie for en liten app; ikke øk dem.
4. **Authentication → Attack Protection** (hvis tilgjengelig i planen din): skru på «Prevent use of leaked passwords». CAPTCHA er valgfritt, men legger til en tredjepart, og personvernerklæringen må oppdateres hvis du bruker det.
5. **Project Settings → API:** ikke del `service_role`-nøkkelen med noen, og legg den aldri i en `NEXT_PUBLIC_`-variabel. Appen bruker bare `anon`-nøkkelen.

### Dette må du gjøre selv

1. **Legg inn en kontakt-e-post**: sett `NEXT_PUBLIC_CONTACT_EMAIL` i Vercel (Settings → Environment Variables) og deploy på nytt.
   GDPR krever at brukerne kan kontakte behandlingsansvarlig. Uten den viser sidene bare navnet ditt.
2. Les gjennom de tre tekstene og rett det som ikke stemmer (for eksempel navn på behandlingsansvarlig og databaseregion).
3. Signer databehandleravtaler (DPA) med Supabase, Vercel og Resend (finnes i kontoinnstillingene deres).
4. Ha en enkel oversikt over behandlingen (hva, hvorfor, hvem, hvor lenge). Tabellene over dekker mesteparten.
5. Behold «Confirm email» skrudd på i Supabase Auth (se «E-postkode ved registrering»), ellers kan hvem som helst registrere seg med en annens adresse.
6. Ta jevnlig stikkprøver på at slettede kontoer faktisk er borte, og slett inaktive test-kontoer.

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
