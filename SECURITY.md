# Sikkerhet

Kollokvie@IFI er et lite studentprosjekt. Finner du en sårbarhet, si fra, så ordner vi det.

## Meld fra

Send en e-post til adressen som står under «Kontakt» på [kollokvie-ifi.no/personvern](https://kollokvie-ifi.no/personvern)
(den står også i `/.well-known/security.txt`). Beskriv hva du fant, hvordan det kan gjentas og hva du mener konsekvensen er.
Vi svarer så raskt vi kan, og vi krediterer deg gjerne hvis du ønsker det.

## Spillereglene

- Test bare mot dine egne kontoer og data. Ikke les, endre eller slett andres data.
- Ingen tjenestenekt (DoS), masseutsendelse av e-post, sosial manipulering eller fysiske angrep.
- Ikke test mot Supabase, Vercel eller Resend sine egne systemer; meld dem til dem.
- Gi oss rimelig tid til å rette feilen før du offentliggjør noe.
- Handler du i god tro etter reglene her, vil vi ikke følge det opp rettslig.

## Det som allerede er på plass

Se «Sikkerhet» i [docs/oppsett-og-drift.md](docs/oppsett-og-drift.md): Row Level Security på alle tabeller, Content-Security-Policy med nonce,
sikkerhetshoder, begrensede rettigheter i databasen, kvoter og hastighetsgrenser per bruker og strenge regler for opplastede bilder.
Kjente og aksepterte begrensninger står også der, så du ikke bruker tid på dem.
