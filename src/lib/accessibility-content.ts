import type { Lang } from "@/lib/i18n";
import type { Policy } from "@/lib/privacy-content";

// The accessibility statement (tilgjengelighetserklæring), in both languages.
// Rendered by /tilgjengelighet. Keep it honest: update the lists when
// something is fixed or a new shortcoming is found.

const no: Policy = {
  title: "Tilgjengelighetserklæring",
  intro:
    "Kollokvie@IFI skal kunne brukes av flest mulig, uavhengig av syn, hørsel, motorikk eller hvilken enhet man bruker. Denne erklæringen gjelder nettstedet kollokvie-ifi.no. Målet vårt er å følge WCAG 2.1 på nivå AA, som er kravet i norsk regelverk for universell utforming av IKT.",
  summaryTitle: "Kort fortalt",
  summary: [],
  sections: [
    {
      heading: "1. Status",
      paragraphs: [
        "Nettstedet er delvis i samsvar med WCAG 2.1 nivå AA. Vurderingen er gjort av utvikleren selv. Vi har ikke fått en uavhengig revisjon, og vi har ikke testet systematisk med alle skjermlesere og hjelpemidler.",
      ],
    },
    {
      heading: "2. Dette har vi gjort",
      bullets: [
        "Hele appen kan brukes med tastatur. Fokus vises tydelig, og en «Hopp til innholdet»-lenke lar deg hoppe forbi menyen.",
        "Dialoger lukkes med Escape, holder fokus innenfor seg mens de er åpne, og gir fokus tilbake når de lukkes. Faner kan styres med piltaster.",
        "Skjemafelt har synlige ledetekster og tilgjengelige navn. Feilmeldinger leses opp av skjermlesere.",
        "Ikonknapper og lenker har tekstlige navn. Profilbilder er dekorative fordi navnet står ved siden av.",
        "Du kan zoome i nettleseren, og innholdet tilpasser seg mobil, nettbrett og PC. Tekstfelt er 16 px på berøringsskjermer, så nettleseren ikke zoomer av seg selv.",
        "Dato og tid velges med appens egne velgere. Tiden velges med piltaster i kolonnene for time og minutt, og datoen kan skrives inn for hånd.",
        "Det finnes lyst og mørkt tema. Animasjoner slås av hvis du har valgt «reduser bevegelse» i enheten din.",
        "Språket på siden er merket (norsk eller engelsk), og du kan bytte språk uten å logge inn.",
      ],
    },
    {
      heading: "3. Kjente mangler",
      bullets: [
        "Noen mindre tekster og lenker i aksentfargen (blå) har en kontrast på rundt 4,4:1 mot den lyse bakgrunnen, altså litt under kravet på 4,5:1 (WCAG 1.4.3).",
        "I kalenderen brukes farger til å skille emner. Emnekoden står som tekst i detaljvisningen, men i månedsoversikten skiller fargen alene mellom noen hendelser (WCAG 1.4.1).",
        "I datovelgeren kan du gå mellom dagene med Tab, men ikke med piltaster.",
        "Noen rader, for eksempel fristene på mobil, kan sveipes sidelengs. Alle elementene kan nås med tastatur, men vi har ikke testet alle kombinasjoner med hjelpemidler.",
        "Engangskoden du får på e-post ved registrering og glemt passord utløper etter noen minutter av sikkerhetshensyn. Du kan når som helst be om en ny kode.",
        "Innhold brukerne selv skriver (navn, bio, kollokviegrupper) og profilbilder de laster opp har ikke alltid beskrivelser. Vi kontrollerer ikke dette på forhånd.",
      ],
    },
    {
      heading: "4. Slik gir du tilbakemelding",
      paragraphs: [
        "Opplever du en hindring, eller trenger du innholdet i et annet format, ta kontakt med oss (se nederst på siden). Beskriv gjerne hvilken side du var på, hva du prøvde å gjøre og hvilket hjelpemiddel eller hvilken enhet du brukte. Vi svarer så raskt vi kan og retter det vi kan.",
      ],
    },
    {
      heading: "5. Klage og tilsyn",
      paragraphs: [
        "Er du ikke fornøyd med svaret vårt, kan du melde fra til Digitaliseringsdirektoratet (Digdir), som fører tilsyn med universell utforming av IKT (uutilsynet.no).",
      ],
    },
    {
      heading: "6. Teknisk",
      paragraphs: [
        "Nettstedet er bygget med HTML, CSS og JavaScript og er ment å fungere i nyere versjoner av Chrome, Safari, Firefox og Edge. Erklæringen bygger på utviklerens egenvurdering og ble sist oppdatert på datoen øverst.",
      ],
    },
  ],
};

const en: Policy = {
  title: "Accessibility statement",
  intro:
    "Kollokvie@IFI should be usable by as many people as possible, regardless of vision, hearing, motor ability or the device they use. This statement applies to the website kollokvie-ifi.no. Our goal is to follow WCAG 2.1 level AA, which is the requirement in Norwegian rules for accessible ICT.",
  summaryTitle: "In short",
  summary: [],
  sections: [
    {
      heading: "1. Status",
      paragraphs: [
        "The website partially conforms to WCAG 2.1 level AA. The assessment was made by the developer. We have not had an independent audit, and we have not tested systematically with all screen readers and assistive technologies.",
      ],
    },
    {
      heading: "2. What we have done",
      bullets: [
        "The whole app can be used with a keyboard. Focus is clearly visible, and a “Skip to content” link lets you jump past the menu.",
        "Dialogs close with Escape, keep focus inside while open, and return focus when closed. Tabs can be operated with the arrow keys.",
        "Form fields have visible labels and accessible names. Error messages are announced by screen readers.",
        "Icon buttons and links have text names. Profile pictures are decorative because the name is next to them.",
        "You can zoom in the browser, and the content adapts to phone, tablet and desktop. Text fields are 16 px on touch screens, so the browser does not zoom in on its own.",
        "Date and time are chosen with the app's own pickers. Time is chosen with the arrow keys in the hour and minute columns, and the date can be typed in.",
        "There is a light and a dark theme. Animations are turned off if you have chosen “reduce motion” on your device.",
        "The language of the page is marked (Norwegian or English), and you can switch language without signing in.",
      ],
    },
    {
      heading: "3. Known shortcomings",
      bullets: [
        "Some smaller text and links in the accent color (blue) have a contrast of about 4.4:1 against the light background, slightly below the required 4.5:1 (WCAG 1.4.3).",
        "In the calendar, colors are used to tell courses apart. The course code is shown as text in the detail view, but in the month overview color alone distinguishes some events (WCAG 1.4.1).",
        "In the date picker you can move between days with Tab, but not with the arrow keys.",
        "Some rows, for example deadlines on mobile, can be swiped sideways. All items can be reached with a keyboard, but we have not tested every combination with assistive technology.",
        "The one-time code you get by email when signing up and resetting your password expires after a few minutes for security reasons. You can ask for a new code at any time.",
        "Content written by users (names, bios, study groups) and profile pictures they upload do not always have descriptions. We do not check this in advance.",
      ],
    },
    {
      heading: "4. How to give feedback",
      paragraphs: [
        "If you run into a barrier, or need the content in another format, contact us (see the bottom of this page). Please describe which page you were on, what you tried to do and which assistive technology or device you used. We reply as quickly as we can and fix what we can.",
      ],
    },
    {
      heading: "5. Complaints and supervision",
      paragraphs: [
        "If you are not satisfied with our reply, you can report to the Norwegian Digitalisation Agency (Digdir), which supervises accessibility of ICT (uutilsynet.no).",
      ],
    },
    {
      heading: "6. Technical information",
      paragraphs: [
        "The website is built with HTML, CSS and JavaScript and is intended to work in recent versions of Chrome, Safari, Firefox and Edge. This statement is based on the developer's own assessment and was last updated on the date at the top.",
      ],
    },
  ],
};

export function getAccessibility(lang: Lang): Policy {
  return lang === "en" ? en : no;
}
