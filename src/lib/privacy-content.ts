import type { Lang } from "@/lib/i18n";

// The privacy policy, in both languages. Rendered by /personvern; the short
// summary on the consent page lives in `summary`.

export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type Policy = {
  title: string;
  intro: string;
  summaryTitle: string;
  summary: string[];
  sections: PolicySection[];
};

const no: Policy = {
  title: "Personvernerklæring",
  intro:
    "Her forklarer vi hvilke opplysninger Kollokvie@IFI samler inn, hvorfor, hvor de lagres og hvilke rettigheter du har. Vi behandler opplysningene i tråd med personopplysningsloven og EUs personvernforordning (GDPR).",
  summaryTitle: "Kort fortalt",
  summary: [
    "Vi lagrer navn, brukernavn, UiO-e-postadressen din (bekreftet med en kode) og det du selv fyller inn på profilen din, og hvem du følger, hvilke kollokviegrupper du er med i og kalenderhendelsene dine.",
    "Alt lagres hos Supabase (database i EU, Irland), og nettstedet drives av Vercel. Vi selger ikke opplysningene dine og bruker dem ikke til reklame eller sporing.",
    "Du velger selv om profilen din er åpen eller privat. På en privat profil ser andre innloggede bare navnet og ikonet ditt. På en åpen profil ser de også IFI-brukernavn, studielinje, årstrinn, emner, bio og lenker. De som følger deg ser alltid alt.",
    "Vi bruker bare nødvendige informasjonskapsler (innlogging, språk og tema).",
    "Du kan når som helst laste ned dataene dine, endre dem eller slette kontoen, og dermed trekke samtykket ditt.",
    "Bruken din er også omfattet av bruksvilkårene.",
  ],
  sections: [
    {
      heading: "1. Hvem er ansvarlig",
      paragraphs: [
        "Kollokvie@IFI er et uavhengig studentprosjekt og ikke en tjeneste fra Universitetet i Oslo. Behandlingsansvarlig er Henning Trillhus.",
      ],
    },
    {
      heading: "2. Hvilke opplysninger vi behandler",
      bullets: [
        "Konto: fullt navn, brukernavn og UiO-e-postadressen din (brukernavn@uio.no). Adressen bekreftes med en engangskode som sendes til den når du registrerer deg. Passordet ditt lagres kryptert (som hash) av Supabase Auth. Vi kan aldri se det.",
        "Profil (valgfritt): studielinje, årstrinn, emner, foreninger og tittel i dem, GitHub- og LinkedIn-lenke, bio, profilbilde (et ferdig ikon eller et bilde du laster opp) og en farge.",
        "Bruk: hvem du følger og hvem som følger deg (også forespørsler), kollokviegrupper du lager, er med i eller blir invitert til, og hendelser du legger i kalenderen (for eksempel eksamener og innleveringer).",
        "Tekniske opplysninger: en innloggingsøkt i en informasjonskapsel, og valg av språk og tema. Leverandørene våre kan i tillegg logge IP-adresse og tekniske data for drift og sikkerhet.",
        "Misbruksvern: for å stoppe skript og oversvømmelse teller vi hvor mange handlinger hver bruker gjør per minutt og time (for eksempel nye hendelser eller følgeforespørsler), og serveren teller forespørsler per IP-adresse og innloggingsøkt i minnet i under ett minutt. Innloggingsøkten brukes bare som en kortlivet, uleselig etikett i telleren og lagres ikke. Grensene er satt høyt, så vanlig bruk aldri merker dem.",
      ],
    },
    {
      heading: "3. Formål og rettslig grunnlag",
      paragraphs: [
        "Vi bruker opplysningene til å levere tjenesten: la deg finne og delta i kollokviegrupper, følge andre studenter, holde oversikt i en kalender og vise deg til dem du velger å dele med.",
        "Rettslig grunnlag er samtykket ditt (GDPR artikkel 6 nr. 1 bokstav a), som du gir når du oppretter konto eller godtar denne erklæringen. Misbruksvernet over bygger på berettiget interesse i å holde tjenesten trygg og tilgjengelig (artikkel 6 nr. 1 bokstav f); det er lite inngripende og lagrer ingenting varig. Du kan trekke samtykket når som helst ved å slette kontoen din i Innstillinger. Å trekke samtykket påvirker ikke lovligheten av behandlingen frem til det tidspunktet.",
      ],
    },
    {
      heading: "4. Hvem kan se hva",
      bullets: [
        "Alle innloggede brukere kan alltid se navnet og profilbildet ditt (ikonet).",
        "Er profilen din åpen, kan alle innloggede også se IFI-brukernavn, studielinje, årstrinn, emner, foreninger, bio, GitHub- og LinkedIn-lenke og antall følgere og følger. Er den privat, kan bare de som følger deg (godkjent) se dette. Du bytter mellom åpen og privat i Innstillinger, og nye og eksisterende profiler er private til du selv velger noe annet.",
        "Listene over hvem du følger og hvem som følger deg kan bare ses av de som følger deg.",
        "Offentlige kollokviegrupper kan ses av alle innloggede brukere. Private kollokviegrupper kan ses av folk som følger eieren eller blir fulgt av eieren. Kollokviegrupper med «kun invitasjon» kan bare ses av medlemmer og inviterte.",
        "Kalenderhendelsene dine er bare synlige for deg.",
        "Ingen som ikke er innlogget kan se profiler eller kollokviegrupper.",
      ],
    },
    {
      heading: "5. Databehandlere og hvor dataene lagres",
      bullets: [
        "Supabase (Supabase Inc.): database, innlogging og lagring av profilbilder. Vi har valgt datasenter i EU (Irland, AWS eu-west-1).",
        "Vercel (Vercel Inc.): hosting av nettstedet. Serverfunksjonene kjører i Dublin, Irland, og skalerer ned og kontrollerer profilbildet du laster opp før det lagres. Statiske filer leveres via et globalt innholdsnettverk.",
        "Resend (Resend Inc.): sender e-postene med koder (bekreftelse og tilbakestilling av passord). Vi har valgt EU-region (Irland). Resend ser UiO-e-postadressen din og innholdet i e-posten, og bare for å levere den.",
      ],
      paragraphs: [
        "Alle er databehandlere for oss og behandler opplysningene bare på våre vegne. Leverandørene er amerikanske selskaper. Der opplysninger kan bli behandlet utenfor EØS, skjer det med et lovlig overføringsgrunnlag, som EUs standardkontrakter (SCC) eller EU–USAs personvernrammeverk (Data Privacy Framework).",
        "Vi bruker ingen analyse-, reklame- eller sporingsverktøy, og vi selger eller deler ikke opplysningene dine med andre.",
      ],
    },
    {
      heading: "6. Hvor lenge vi lagrer opplysningene",
      paragraphs: [
        "Vi lagrer opplysningene så lenge du har en konto. Tellerne for misbruksvern slettes av seg selv etter noen timer (per bruker) eller under ett minutt (per IP-adresse i serverens minne). En IP-adresse som sender ekstremt mange forespørsler, kan stenges ute i noen minutter. Når du sletter kontoen din i Innstillinger, slettes profilen, bioen, følgeforhold, medlemskap, kollokviegrupper du eier, kalenderhendelser og et opplastet profilbilde. Kopier i leverandørenes sikkerhetskopier kan ligge igjen i en begrenset periode før de forsvinner.",
      ],
    },
    {
      heading: "7. Dine rettigheter",
      bullets: [
        "Innsyn: du kan laste ned alle dataene dine som en fil under Innstillinger.",
        "Retting: du kan endre profilen din når som helst under Innstillinger.",
        "Sletting: du kan slette kontoen og alle opplysningene dine under Innstillinger.",
        "Dataportabilitet: filen du laster ned er i et vanlig maskinlesbart format (JSON).",
        "Begrensning og innsigelse: du kan be oss begrense behandlingen eller protestere mot den.",
        "Trekke samtykke: slett kontoen, eller ta kontakt.",
      ],
      paragraphs: [
        "Har du spørsmål eller vil bruke rettighetene dine på annen måte, ta kontakt med oss (se nederst). Du har også rett til å klage til Datatilsynet (datatilsynet.no) hvis du mener vi behandler opplysningene dine i strid med regelverket.",
      ],
    },
    {
      heading: "8. Informasjonskapsler",
      paragraphs: [
        "Vi bruker bare informasjonskapsler og lokal lagring som er nødvendige for at tjenesten skal fungere. De krever ikke samtykke etter ekomloven § 3-15, men du skal informeres om dem. Full oversikt, også over lokal lagring i nettleseren, finner du i erklæringen om informasjonskapsler. Kapslene er:",
      ],
      bullets: [
        "sb-…-auth-token: holder deg innlogget. Varer i inntil 400 dager, eller til du logger ut.",
        "lang: valgt språk. Varer i ett år.",
        "theme: valgt tema (lys eller mørk). Varer i ett år.",
      ],
    },
    {
      heading: "8b. Lokal lagring",
      paragraphs: [
        "Vi bruker også lokal lagring i nettleseren (for eksempel for å huske hvor du var i søkeresultatene, og at du har lukket informasjonsboksen om informasjonskapsler). Alt om dette står i erklæringen om informasjonskapsler og lokal lagring.",
      ],
    },
    {
      heading: "8c. Rapportering av feil og brukere",
      paragraphs: [
        "Knappene «Rapporter feil» og «Rapporter bruker» åpner din egen e-postklient med en ferdig utfylt melding til utvikleren (henninlt@uio.no). E-posten sendes direkte fra din egen e-postkonto og går ikke via våre servere eller databasen — vi ser og lagrer den bare som en vanlig e-post i innboksen vår, på samme måte som annen e-post du sender oss.",
      ],
    },
    {
      heading: "9. Sikkerhet",
      paragraphs: [
        "All trafikk går over kryptert forbindelse (HTTPS). Tilgang til dataene styres i databasen, slik at hver bruker bare får de opplysningene de har lov til å se. Passord lagres aldri i klartekst.",
      ],
    },
    {
      heading: "10. Alder",
      paragraphs: [
        "Tjenesten er laget for studenter. Du må være minst 13 år for å bruke den.",
      ],
    },
    {
      heading: "11. Automatiserte avgjørelser",
      paragraphs: [
        "Vi bruker ingen automatiserte avgjørelser eller profilering som har rettslig eller lignende betydelig virkning for deg.",
      ],
    },
    {
      heading: "12. Endringer",
      paragraphs: [
        "Endrer vi erklæringen på en måte som krever nytt samtykke, ber vi deg godta den på nytt neste gang du åpner appen.",
      ],
    },
  ],
};

const en: Policy = {
  title: "Privacy policy",
  intro:
    "This page explains what information Kollokvie@IFI collects, why, where it is stored and what rights you have. We process your data in accordance with the Norwegian Personal Data Act and the EU General Data Protection Regulation (GDPR).",
  summaryTitle: "In short",
  summary: [
    "We store your name, username, your UiO email address (confirmed with a code) and what you choose to add to your profile, who you follow, which study groups you are in and your calendar events.",
    "Everything is stored with Supabase (database in the EU, Ireland) and the site is run by Vercel. We don't sell your data and don't use it for advertising or tracking.",
    "You choose whether your profile is open or private. On a private profile other signed-in users only see your name and icon. On an open profile they also see your IFI username, study program, year, courses, bio and links. People who follow you always see everything.",
    "We only use strictly necessary cookies (sign-in, language and theme).",
    "You can download your data, change it or delete your account at any time, which also withdraws your consent.",
    "Your use of the service is also covered by the terms of service.",
  ],
  sections: [
    {
      heading: "1. Who is responsible",
      paragraphs: [
        "Kollokvie@IFI is an independent student project and not a service from the University of Oslo. The data controller is Henning Trillhus.",
      ],
    },
    {
      heading: "2. What information we process",
      bullets: [
        "Account: full name, username and your UiO email address (username@uio.no). The address is confirmed with a one-time code sent to it when you sign up. Your password is stored encrypted (as a hash) by Supabase Auth. We can never see it.",
        "Profile (optional): study program, year, courses, associations and your title in them, GitHub and LinkedIn link, bio, profile picture (a ready-made icon or a picture you upload) and a color.",
        "Usage: who you follow and who follows you (including requests), study groups you create, join or are invited to, and events you add to the calendar (for example exams and deadlines).",
        "Technical: a sign-in session in a cookie, and your language and theme choice. Our providers may also log IP addresses and technical data for operation and security.",
        "Abuse protection: to stop scripts and flooding we count how many actions each user makes per minute and hour (for example new events or follow requests), and the server counts requests per IP address and sign-in session in memory for under a minute. The sign-in session is only used as a short-lived, unreadable label in the counter and is not stored. The limits are high, so normal use never notices them.",
      ],
    },
    {
      heading: "3. Purpose and legal basis",
      paragraphs: [
        "We use the information to provide the service: letting you find and join study groups, follow other students, keep track in a calendar and show you to the people you choose to share with.",
        "The legal basis is your consent (GDPR Article 6(1)(a)), which you give when you create an account or accept this policy. The abuse protection above is based on a legitimate interest in keeping the service safe and available (Article 6(1)(f)); it is minimally intrusive and stores nothing permanently. You can withdraw it at any time by deleting your account in Settings. Withdrawing consent does not affect the lawfulness of processing before that point.",
      ],
    },
    {
      heading: "4. Who can see what",
      bullets: [
        "All signed-in users can always see your name and profile picture (icon).",
        "If your profile is open, all signed-in users can also see your IFI username, study program, year, courses, associations, bio, GitHub and LinkedIn links and follower counts. If it is private, only people who follow you (approved) can see this. You switch between open and private in Settings, and new and existing profiles are private until you choose otherwise.",
        "The lists of who you follow and who follows you can only be seen by people who follow you.",
        "Public study groups can be seen by all signed-in users. Private study groups can be seen by people who follow the owner or are followed by the owner. Invite-only study groups can only be seen by members and invited people.",
        "Your calendar events are only visible to you.",
        "People who are not signed in cannot see any profiles or study groups.",
      ],
    },
    {
      heading: "5. Processors and where data is stored",
      bullets: [
        "Supabase (Supabase Inc.): database, sign-in and storage of profile pictures. We have chosen a data center in the EU (Ireland, AWS eu-west-1).",
        "Vercel (Vercel Inc.): hosting of the site. Server functions run in Dublin, Ireland, and shrink and check the profile picture you upload before it is stored. Static files are delivered through a global content network.",
        "Resend (Resend Inc.): sends the emails with codes (confirmation and password reset). We have chosen the EU region (Ireland). Resend sees your UiO email address and the contents of the email, only to deliver it.",
      ],
      paragraphs: [
        "All of them are processors for us and only process the data on our behalf. The providers are US companies. Where data may be processed outside the EEA, this happens on a lawful transfer basis, such as the EU Standard Contractual Clauses (SCCs) or the EU–US Data Privacy Framework.",
        "We use no analytics, advertising or tracking tools, and we don't sell or share your data with anyone else.",
      ],
    },
    {
      heading: "6. How long we keep the data",
      paragraphs: [
        "We keep the data for as long as you have an account. The abuse-protection counters delete themselves after a few hours (per user) or in under a minute (per IP address, in the server's memory). An IP address that sends an extreme number of requests may be blocked for a few minutes. When you delete your account in Settings, your profile, bio, follow relationships, memberships, study groups you own, calendar events and an uploaded profile picture are deleted. Copies in our providers' backups may remain for a limited period before they disappear.",
      ],
    },
    {
      heading: "7. Your rights",
      bullets: [
        "Access: you can download all your data as a file in Settings.",
        "Rectification: you can change your profile at any time in Settings.",
        "Erasure: you can delete your account and all your data in Settings.",
        "Data portability: the file you download is in a common machine-readable format (JSON).",
        "Restriction and objection: you can ask us to restrict the processing or object to it.",
        "Withdraw consent: delete your account, or contact us.",
      ],
      paragraphs: [
        "If you have questions or want to use your rights in another way, contact us (see the bottom of this page). You also have the right to complain to the Norwegian Data Protection Authority (Datatilsynet, datatilsynet.no) if you believe we process your data in breach of the rules.",
      ],
    },
    {
      heading: "8. Cookies",
      paragraphs: [
        "We only use cookies and local storage that are necessary for the service to work. They don't require consent under the Norwegian Electronic Communications Act § 3-15, but you should be informed about them. A full overview, including local storage in your browser, is in the cookies policy. The cookies are:",
      ],
      bullets: [
        "sb-…-auth-token: keeps you signed in. Lasts up to 400 days, or until you sign out.",
        "lang: your chosen language. Lasts one year.",
        "theme: your chosen theme (light or dark). Lasts one year.",
      ],
    },
    {
      heading: "8b. Local storage",
      paragraphs: [
        "We also use local storage in your browser (for example to remember where you were in the search results, and that you closed the cookie information box). Everything about this is in the cookies and local storage policy.",
      ],
    },
    {
      heading: "8c. Reporting bugs and users",
      paragraphs: [
        "The “Report a bug” and “Report user” buttons open your own email app with a pre-filled message to the developer (henninlt@uio.no). It is sent directly from your own email account, not through our servers or database — we only see and keep it like any other email you send us.",
      ],
    },
    {
      heading: "9. Security",
      paragraphs: [
        "All traffic uses an encrypted connection (HTTPS). Access to the data is enforced in the database so that each user only gets the information they are allowed to see. Passwords are never stored in plain text.",
      ],
    },
    {
      heading: "10. Age",
      paragraphs: [
        "The service is made for students. You must be at least 13 years old to use it.",
      ],
    },
    {
      heading: "11. Automated decisions",
      paragraphs: [
        "We don't use automated decision-making or profiling that has legal or similarly significant effects on you.",
      ],
    },
    {
      heading: "12. Changes",
      paragraphs: [
        "If we change this policy in a way that requires new consent, we will ask you to accept it again the next time you open the app.",
      ],
    },
  ],
};

export function getPolicy(lang: Lang): Policy {
  return lang === "en" ? en : no;
}
