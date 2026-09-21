import type { Lang } from "@/lib/i18n";
import type { Policy } from "@/lib/privacy-content";

// Terms of service and cookie policy, in both languages. Rendered by /vilkar
// and /informasjonskapsler. Same shape as the privacy policy.

const termsNo: Policy = {
  title: "Bruksvilkår",
  intro:
    "Disse vilkårene gjelder når du bruker Kollokvie@IFI. Ved å opprette en konto sier du at du har lest og godtar dem. Hvordan vi behandler opplysningene dine står i personvernerklæringen.",
  summaryTitle: "Kort fortalt",
  summary: [],
  sections: [
    {
      heading: "1. Om tjenesten",
      paragraphs: [
        "Kollokvie@IFI er en gratis tjeneste der studenter kan finne og opprette kollokviegrupper, følge hverandre og holde oversikt i en kalender. Tjenesten er et uavhengig studentprosjekt drevet av Henning Trillhus. Den er ikke laget, godkjent eller drevet av Universitetet i Oslo (UiO) eller Institutt for informatikk (IFI), og har ingen offisiell tilknytning til dem. Navn og logoer tilhører sine respektive eiere.",
      ],
    },
    {
      heading: "2. Hvem kan bruke tjenesten",
      bullets: [
        "Du må være minst 13 år.",
        "Du må ha tilgang til en uio.no-adresse. Vi bekrefter bare at du kan lese e-post på adressen, ikke at du er student eller hører til et bestemt institutt.",
        "Du kan ha én konto, og opplysningene du oppgir må være riktige.",
      ],
    },
    {
      heading: "3. Kontoen din",
      paragraphs: [
        "Hold passordet ditt hemmelig. Du er ansvarlig for det som skjer på kontoen din. Tror du at noen andre har tilgang, bør du bytte passord og gi oss beskjed. Du kan når som helst slette kontoen under Innstillinger.",
      ],
    },
    {
      heading: "4. Slik skal tjenesten brukes",
      paragraphs: ["Du skal ikke bruke tjenesten til, eller dele innhold som:"],
      bullets: [
        "er ulovlig, truende, trakasserende, diskriminerende, hatefullt eller krenkende,",
        "gir deg ut for å være en annen person, eller bruker andres navn eller bilder uten lov,",
        "bryter andres opphavsrett eller personvern, for eksempel bilder av andre uten samtykke,",
        "er spam, reklame eller masseutsendelser,",
        "henter ut eller samler inn profiler eller andre data automatisk (scraping),",
        "forsøker å forstyrre tjenesten, omgå sikkerheten eller få tilgang til andres kontoer eller data,",
        "sender uvanlig mange forespørsler eller bruker automatiserte verktøy mot tjenesten.",
      ],
    },
    {
      heading: "5. Grenser",
      paragraphs: [
        "Tjenesten har kvoter (for eksempel hvor mange kollokviegrupper og hendelser du kan lage) og hastighetsgrenser. De er satt høyt, så vanlig bruk aldri merker dem. Går du over, kan handlingen bli avvist en stund, og vi kan stenge ute den som gjentatte ganger prøver å overbelaste eller ødelegge tjenesten.",
      ],
    },
    {
      heading: "6. Faglig ærlighet",
      paragraphs: [
        "Kollokviegrupper er til faglig samarbeid og diskusjon. Du er selv ansvarlig for å følge UiOs regler om selvstendig arbeid, samarbeid og fusk. Tjenesten er ikke ment for å dele eller selge besvarelser til vurderte oppgaver.",
      ],
    },
    {
      heading: "7. Innholdet ditt",
      paragraphs: [
        "Du eier innholdet du legger inn (for eksempel profil, bio, bilde, kollokviegrupper og kalenderhendelser) og er ansvarlig for det. Du gir oss en begrenset, ikke-eksklusiv rett til å lagre og vise innholdet i tjenesten, slik synlighetsvalgene dine bestemmer. Retten opphører når du sletter innholdet eller kontoen din.",
      ],
    },
    {
      heading: "8. Fjerning av innhold og stenging",
      paragraphs: [
        "Vi kan fjerne innhold og stenge eller slette kontoer som bryter disse vilkårene, eller som setter andre eller tjenesten i fare. Skal vi stenge en konto, sier vi fra og forklarer hvorfor, med mindre det er urimelig, for eksempel ved alvorlig misbruk. Ser du innhold som bryter vilkårene, kan du ta kontakt (se nederst).",
      ],
    },
    {
      heading: "9. Tilgjengelighet og endringer",
      paragraphs: [
        "Tjenesten er gratis og leveres slik den er. Vi lover ikke at den alltid er tilgjengelig eller feilfri. Vi kan endre, pause eller avvikle tjenesten. Avvikler vi den, prøver vi å gi beskjed i god tid slik at du kan laste ned dataene dine (Innstillinger).",
      ],
    },
    {
      heading: "10. Ansvar",
      paragraphs: [
        "Så langt loven tillater, er vi ikke ansvarlige for indirekte tap, for innhold brukere har lagt inn, eller for avtaler og samarbeid mellom brukere. Begrensningen gjelder ikke ved forsett eller grov uaktsomhet, og heller ikke der loven ikke tillater å begrense ansvar. Dine ufravikelige rettigheter, blant annet som forbruker, påvirkes ikke.",
      ],
    },
    {
      heading: "11. Endringer i vilkårene",
      paragraphs: [
        "Vi kan oppdatere vilkårene. Ved vesentlige endringer ber vi deg godta dem på nytt neste gang du åpner appen. Datoen øverst viser når de sist ble endret.",
      ],
    },
    {
      heading: "12. Lovvalg og tvister",
      paragraphs: [
        "Norsk rett gjelder. Tvister som ikke lar seg løse i minnelighet, behandles av norske domstoler med Oslo tingrett som verneting, med mindre ufravikelige regler sier noe annet.",
      ],
    },
  ],
};

const termsEn: Policy = {
  title: "Terms of service",
  intro:
    "These terms apply when you use Kollokvie@IFI. By creating an account you confirm that you have read and accept them. How we process your data is described in the privacy policy.",
  summaryTitle: "In short",
  summary: [],
  sections: [
    {
      heading: "1. About the service",
      paragraphs: [
        "Kollokvie@IFI is a free service where students can find and create study groups, follow each other and keep track in a calendar. It is an independent student project run by Henning Trillhus. It is not made, endorsed or operated by the University of Oslo (UiO) or the Department of Informatics (IFI), and has no official affiliation with them. Names and logos belong to their respective owners.",
      ],
    },
    {
      heading: "2. Who can use the service",
      bullets: [
        "You must be at least 13 years old.",
        "You need access to a uio.no address. We only verify that you can read email at the address, not that you are a student or belong to a particular department.",
        "You may have one account, and the information you provide must be correct.",
      ],
    },
    {
      heading: "3. Your account",
      paragraphs: [
        "Keep your password secret. You are responsible for what happens on your account. If you think someone else has access, change your password and let us know. You can delete your account at any time in Settings.",
      ],
    },
    {
      heading: "4. How the service may be used",
      paragraphs: ["You must not use the service for, or share, content that:"],
      bullets: [
        "is illegal, threatening, harassing, discriminatory, hateful or abusive,",
        "impersonates another person, or uses someone else's name or pictures without permission,",
        "infringes others' copyright or privacy, for example pictures of others without consent,",
        "is spam, advertising or bulk messaging,",
        "collects profiles or other data automatically (scraping),",
        "tries to disrupt the service, bypass its security or gain access to other people's accounts or data,",
        "sends an unusual number of requests or uses automated tools against the service.",
      ],
    },
    {
      heading: "5. Limits",
      paragraphs: [
        "The service has quotas (for example how many study groups and events you can create) and rate limits. They are set high, so normal use never notices them. If you go over, the action may be rejected for a while, and we may block anyone who repeatedly tries to overload or break the service.",
      ],
    },
    {
      heading: "6. Academic integrity",
      paragraphs: [
        "Study groups are for academic collaboration and discussion. You are responsible for following UiO's rules on independent work, collaboration and cheating. The service is not meant for sharing or selling answers to assessed assignments.",
      ],
    },
    {
      heading: "7. Your content",
      paragraphs: [
        "You own the content you add (for example profile, bio, picture, study groups and calendar events) and you are responsible for it. You give us a limited, non-exclusive right to store and display the content in the service, as your visibility choices determine. The right ends when you delete the content or your account.",
      ],
    },
    {
      heading: "8. Removal of content and suspension",
      paragraphs: [
        "We may remove content and suspend or delete accounts that break these terms or put others or the service at risk. When we suspend an account we tell you and explain why, unless that is unreasonable, for example in cases of serious abuse. If you see content that breaks the terms, contact us (see the bottom of this page).",
      ],
    },
    {
      heading: "9. Availability and changes",
      paragraphs: [
        "The service is free and provided as it is. We don't promise that it is always available or free of errors. We may change, pause or discontinue the service. If we discontinue it, we will try to give notice in good time so you can download your data (Settings).",
      ],
    },
    {
      heading: "10. Liability",
      paragraphs: [
        "To the extent the law allows, we are not liable for indirect loss, for content added by users, or for agreements and cooperation between users. This limitation does not apply to intent or gross negligence, or where the law does not allow limiting liability. Your mandatory rights, including as a consumer, are not affected.",
      ],
    },
    {
      heading: "11. Changes to the terms",
      paragraphs: [
        "We may update these terms. For material changes we will ask you to accept them again the next time you open the app. The date at the top shows when they were last changed.",
      ],
    },
    {
      heading: "12. Governing law and disputes",
      paragraphs: [
        "Norwegian law applies. Disputes that cannot be settled amicably are handled by Norwegian courts with Oslo District Court as the venue, unless mandatory rules say otherwise.",
      ],
    },
  ],
};

const cookiesNo: Policy = {
  title: "Informasjonskapsler og lokal lagring",
  intro:
    "Kollokvie@IFI bruker bare det som er nødvendig for at tjenesten skal fungere. Vi bruker ingen analyse-, reklame- eller sporingsverktøy, og ingen informasjonskapsler fra tredjeparter.",
  summaryTitle: "Kort fortalt",
  summary: [],
  sections: [
    {
      heading: "1. Hva er informasjonskapsler",
      paragraphs: [
        "Informasjonskapsler (cookies) er små tekstfiler nettleseren lagrer på enheten din. Lokal lagring (localStorage og sessionStorage) fungerer på lignende måte. Vi bruker begge deler til å huske innlogging og valgene dine.",
      ],
    },
    {
      heading: "2. Informasjonskapsler vi bruker",
      paragraphs: ["Alle er våre egne (førstepart) og strengt nødvendige:"],
      bullets: [
        "sb-…-auth-token: holder deg innlogget (settes av innloggingstjenesten Supabase Auth). Varer i inntil 400 dager, eller til du logger ut. Kan være delt i flere deler (.0, .1).",
        "lang: språket du har valgt (norsk eller engelsk). Varer i ett år.",
        "theme: temaet du har valgt (lys eller mørk). Varer i ett år.",
      ],
    },
    {
      heading: "3. Lokal lagring i nettleseren",
      bullets: [
        "kollokvie:signed-in-toast (sessionStorage): husker at «logget inn som …»-meldingen er vist, så den ikke kommer igjen. Slettes når du lukker fanen.",
        "kollokvie:search-scroll (sessionStorage): husker hvor i søkeresultatene du var, så du kommer tilbake til samme sted. Slettes når du lukker fanen.",
        "kollokvie:cookie-notice (localStorage): husker at du har lukket informasjonsboksen om informasjonskapsler, så den ikke vises hver gang.",
      ],
    },
    {
      heading: "4. Hvorfor vi ikke spør om samtykke",
      paragraphs: [
        "Informasjonskapsler og lokal lagring som er nødvendige for å levere tjenesten du ber om, krever ikke samtykke etter ekomloven § 3-15 og personvernforordningen. Du skal likevel få informasjon om dem, og det er formålet med denne siden og infoboksen. Bruker vi noen gang kapsler til statistikk, reklame eller sporing, ber vi om samtykke først, og du kan velge bort dem like enkelt som du kan velge dem.",
      ],
    },
    {
      heading: "5. Tredjeparter",
      paragraphs: [
        "Vi laster ikke inn skript, skrifter, kart, videoer eller annet innhold fra tredjeparter i nettleseren din. Skriftene lagres på vår egen server. Profilbilder du laster opp hentes fra lagringen hos Supabase, som er vår databehandler (se personvernerklæringen).",
      ],
    },
    {
      heading: "6. Slik sletter eller blokkerer du dem",
      paragraphs: [
        "Du kan slette informasjonskapsler og lokal lagring i nettleserinnstillingene, eller ved å logge ut. Blokkerer du de nødvendige kapslene, kan du ikke logge inn, og språk- og temavalget blir ikke husket.",
      ],
    },
  ],
};

const cookiesEn: Policy = {
  title: "Cookies and local storage",
  intro:
    "Kollokvie@IFI only uses what is necessary for the service to work. We use no analytics, advertising or tracking tools, and no third-party cookies.",
  summaryTitle: "In short",
  summary: [],
  sections: [
    {
      heading: "1. What cookies are",
      paragraphs: [
        "Cookies are small text files your browser stores on your device. Local storage (localStorage and sessionStorage) works in a similar way. We use both to remember your sign-in and your choices.",
      ],
    },
    {
      heading: "2. Cookies we use",
      paragraphs: ["All of them are our own (first-party) and strictly necessary:"],
      bullets: [
        "sb-…-auth-token: keeps you signed in (set by the sign-in service Supabase Auth). Lasts up to 400 days, or until you sign out. May be split into several parts (.0, .1).",
        "lang: the language you chose (Norwegian or English). Lasts one year.",
        "theme: the theme you chose (light or dark). Lasts one year.",
      ],
    },
    {
      heading: "3. Local storage in the browser",
      bullets: [
        "kollokvie:signed-in-toast (sessionStorage): remembers that the “signed in as …” message has been shown, so it doesn't appear again. Deleted when you close the tab.",
        "kollokvie:search-scroll (sessionStorage): remembers where in the search results you were, so you return to the same place. Deleted when you close the tab.",
        "kollokvie:cookie-notice (localStorage): remembers that you closed the cookie information box, so it isn't shown every time.",
      ],
    },
    {
      heading: "4. Why we don't ask for consent",
      paragraphs: [
        "Cookies and local storage that are necessary to provide the service you ask for don't require consent under the Norwegian Electronic Communications Act § 3-15 and the GDPR. You should still be informed about them, which is the purpose of this page and the information box. If we ever use cookies for statistics, advertising or tracking, we will ask for consent first, and you will be able to decline them as easily as accept them.",
      ],
    },
    {
      heading: "5. Third parties",
      paragraphs: [
        "We don't load scripts, fonts, maps, videos or other content from third parties in your browser. The fonts are stored on our own server. Profile pictures you upload are fetched from Supabase storage, which is our processor (see the privacy policy).",
      ],
    },
    {
      heading: "6. How to delete or block them",
      paragraphs: [
        "You can delete cookies and local storage in your browser settings, or by signing out. If you block the necessary cookies you can't sign in, and your language and theme choice won't be remembered.",
      ],
    },
  ],
};

export function getTerms(lang: Lang): Policy {
  return lang === "en" ? termsEn : termsNo;
}

export function getCookiePolicy(lang: Lang): Policy {
  return lang === "en" ? cookiesEn : cookiesNo;
}
