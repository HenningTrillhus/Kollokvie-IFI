import type { Lang } from "@/lib/i18n";

// The privacy policy, in both languages. Rendered by /personvern; the short
// summary on the consent page lives in `summary`.

export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type Policy = {
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
    "Vi lagrer navn, brukernavn, IFI-brukernavn og det du selv fyller inn på profilen din, og hvem du følger, hvilke kollokviegrupper du er med i og kalenderhendelsene dine.",
    "Alt lagres hos Supabase (database i EU, Irland), og nettstedet drives av Vercel. Vi selger ikke opplysningene dine og bruker dem ikke til reklame eller sporing.",
    "Andre innloggede brukere ser deler av profilen din: navn, brukernavn, studielinje, emner og profilbilde. Bioen din ser bare de som følger deg.",
    "Vi bruker bare nødvendige informasjonskapsler (innlogging, språk og tema).",
    "Du kan når som helst laste ned dataene dine, endre dem eller slette kontoen, og dermed trekke samtykket ditt.",
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
        "Konto: fullt navn, brukernavn og IFI-brukernavn. Passordet ditt lagres kryptert (som hash) av Supabase Auth. Vi kan aldri se det.",
        "Profil (valgfritt): studielinje, årstrinn, emner, GitHub- og LinkedIn-lenke, bio, profilbilde (et ferdig ikon eller et bilde du laster opp) og en farge.",
        "Bruk: hvem du følger og hvem som følger deg (også forespørsler), kollokviegrupper du lager, er med i eller blir invitert til, og hendelser du legger i kalenderen (for eksempel eksamener og innleveringer).",
        "Tekniske opplysninger: en innloggingsøkt i en informasjonskapsel, og valg av språk og tema. Leverandørene våre kan i tillegg logge IP-adresse og tekniske data for drift og sikkerhet.",
      ],
    },
    {
      heading: "3. Formål og rettslig grunnlag",
      paragraphs: [
        "Vi bruker opplysningene til å levere tjenesten: la deg finne og delta i kollokviegrupper, følge andre studenter, holde oversikt i en kalender og vise deg til dem du velger å dele med.",
        "Rettslig grunnlag er samtykket ditt (GDPR artikkel 6 nr. 1 bokstav a), som du gir når du oppretter konto eller godtar denne erklæringen. Du kan trekke samtykket når som helst ved å slette kontoen din i Innstillinger. Å trekke samtykket påvirker ikke lovligheten av behandlingen frem til det tidspunktet.",
      ],
    },
    {
      heading: "4. Hvem kan se hva",
      bullets: [
        "Alle innloggede brukere kan se navn, brukernavn, studielinje, årstrinn, emner, lenker, profilbilde og antall følgere og følger.",
        "Bioen din og listene over hvem du følger og hvem som følger deg kan bare ses av de som følger deg.",
        "Offentlige kollokviegrupper kan ses av alle innloggede brukere. Private kollokviegrupper kan ses av folk som følger eieren eller blir fulgt av eieren. Kollokviegrupper med «kun invitasjon» kan bare ses av medlemmer og inviterte.",
        "Kalenderhendelsene dine er bare synlige for deg.",
        "Ingen som ikke er innlogget kan se profiler eller kollokviegrupper.",
      ],
    },
    {
      heading: "5. Databehandlere og hvor dataene lagres",
      bullets: [
        "Supabase (Supabase Inc.): database, innlogging og lagring av profilbilder. Vi har valgt datasenter i EU (Irland, AWS eu-west-1).",
        "Vercel (Vercel Inc.): hosting av nettstedet. Serverfunksjonene kjører i Dublin, Irland. Statiske filer leveres via et globalt innholdsnettverk.",
      ],
      paragraphs: [
        "Begge er databehandlere for oss og behandler opplysningene bare på våre vegne. Leverandørene er amerikanske selskaper. Der opplysninger kan bli behandlet utenfor EØS, skjer det med et lovlig overføringsgrunnlag, som EUs standardkontrakter (SCC) eller EU–USAs personvernrammeverk (Data Privacy Framework).",
        "Vi bruker ingen analyse-, reklame- eller sporingsverktøy, og vi selger eller deler ikke opplysningene dine med andre.",
      ],
    },
    {
      heading: "6. Hvor lenge vi lagrer opplysningene",
      paragraphs: [
        "Vi lagrer opplysningene så lenge du har en konto. Når du sletter kontoen din i Innstillinger, slettes profilen, bioen, følgeforhold, medlemskap, kollokviegrupper du eier, kalenderhendelser og et opplastet profilbilde. Kopier i leverandørenes sikkerhetskopier kan ligge igjen i en begrenset periode før de forsvinner.",
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
        "Vi bruker bare informasjonskapsler som er nødvendige for at tjenesten skal fungere. De krever ikke samtykke etter ekomloven § 3-15, men du skal informeres om dem:",
      ],
      bullets: [
        "sb-…-auth-token: holder deg innlogget. Varer i inntil 400 dager, eller til du logger ut.",
        "lang: valgt språk. Varer i ett år.",
        "theme: valgt tema (lys eller mørk). Varer i ett år.",
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
      heading: "11. Endringer",
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
    "We store your name, username, IFI username and what you choose to add to your profile, who you follow, which study groups you are in and your calendar events.",
    "Everything is stored with Supabase (database in the EU, Ireland) and the site is run by Vercel. We don't sell your data and don't use it for advertising or tracking.",
    "Other signed-in users can see parts of your profile: name, username, study program, courses and profile picture. Only people who follow you can see your bio.",
    "We only use strictly necessary cookies (sign-in, language and theme).",
    "You can download your data, change it or delete your account at any time, which also withdraws your consent.",
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
        "Account: full name, username and IFI username. Your password is stored encrypted (as a hash) by Supabase Auth. We can never see it.",
        "Profile (optional): study program, year, courses, GitHub and LinkedIn link, bio, profile picture (a ready-made icon or a picture you upload) and a color.",
        "Usage: who you follow and who follows you (including requests), study groups you create, join or are invited to, and events you add to the calendar (for example exams and deadlines).",
        "Technical: a sign-in session in a cookie, and your language and theme choice. Our providers may also log IP addresses and technical data for operation and security.",
      ],
    },
    {
      heading: "3. Purpose and legal basis",
      paragraphs: [
        "We use the information to provide the service: letting you find and join study groups, follow other students, keep track in a calendar and show you to the people you choose to share with.",
        "The legal basis is your consent (GDPR Article 6(1)(a)), which you give when you create an account or accept this policy. You can withdraw it at any time by deleting your account in Settings. Withdrawing consent does not affect the lawfulness of processing before that point.",
      ],
    },
    {
      heading: "4. Who can see what",
      bullets: [
        "All signed-in users can see your name, username, study program, year, courses, links, profile picture and follower counts.",
        "Your bio and the lists of who you follow and who follows you can only be seen by people who follow you.",
        "Public study groups can be seen by all signed-in users. Private study groups can be seen by people who follow the owner or are followed by the owner. Invite-only study groups can only be seen by members and invited people.",
        "Your calendar events are only visible to you.",
        "People who are not signed in cannot see any profiles or study groups.",
      ],
    },
    {
      heading: "5. Processors and where data is stored",
      bullets: [
        "Supabase (Supabase Inc.): database, sign-in and storage of profile pictures. We have chosen a data center in the EU (Ireland, AWS eu-west-1).",
        "Vercel (Vercel Inc.): hosting of the site. Server functions run in Dublin, Ireland. Static files are delivered through a global content network.",
      ],
      paragraphs: [
        "Both are processors for us and only process the data on our behalf. The providers are US companies. Where data may be processed outside the EEA, this happens on a lawful transfer basis, such as the EU Standard Contractual Clauses (SCCs) or the EU–US Data Privacy Framework.",
        "We use no analytics, advertising or tracking tools, and we don't sell or share your data with anyone else.",
      ],
    },
    {
      heading: "6. How long we keep the data",
      paragraphs: [
        "We keep the data for as long as you have an account. When you delete your account in Settings, your profile, bio, follow relationships, memberships, study groups you own, calendar events and an uploaded profile picture are deleted. Copies in our providers' backups may remain for a limited period before they disappear.",
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
        "We only use cookies that are necessary for the service to work. They don't require consent under the Norwegian Electronic Communications Act § 3-15, but you should be informed about them:",
      ],
      bullets: [
        "sb-…-auth-token: keeps you signed in. Lasts up to 400 days, or until you sign out.",
        "lang: your chosen language. Lasts one year.",
        "theme: your chosen theme (light or dark). Lasts one year.",
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
      heading: "11. Changes",
      paragraphs: [
        "If we change this policy in a way that requires new consent, we will ask you to accept it again the next time you open the app.",
      ],
    },
  ],
};

export function getPolicy(lang: Lang): Policy {
  return lang === "en" ? en : no;
}
