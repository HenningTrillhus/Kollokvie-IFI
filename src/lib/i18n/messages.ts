// Every user-facing string, with Norwegian (source language) and English side
// by side. `{name}` placeholders are filled in by translate().
export const messages = {
  // ---- app / landing
  "app.description": { no: "Finn kollokviegruppen din på IFI", en: "Find your study group at IFI" },
  "app.tagline": {
    no: "Finn og hold kontakt med kollokviegruppen din",
    en: "Find and stay in touch with your study group",
  },
  "app.forStudents": {
    no: "Laget for studenter ved Institutt for informatikk, UiO",
    en: "Made for students at the Department of Informatics, UiO",
  },

  // ---- common
  "common.loading": { no: "Laster…", en: "Loading…" },
  "common.loadingAria": { no: "Laster", en: "Loading" },
  "common.back": { no: "← Tilbake", en: "← Back" },
  "common.save": { no: "Lagre", en: "Save" },
  "common.saving": { no: "Lagrer…", en: "Saving…" },
  "common.saved": { no: "Lagret.", en: "Saved." },
  "common.cancel": { no: "Avbryt", en: "Cancel" },
  "common.delete": { no: "Slett", en: "Delete" },
  "common.deleting": { no: "Sletter…", en: "Deleting…" },
  "common.close": { no: "Lukk", en: "Close" },
  "common.notSelected": { no: "Ikke valgt", en: "Not selected" },
  "common.optional": { no: "Valgfritt", en: "Optional" },
  "common.somethingWrong": { no: "Noe gikk galt.", en: "Something went wrong." },
  "common.accept": { no: "Godta", en: "Accept" },
  "common.decline": { no: "Avslå", en: "Decline" },
  "common.public": { no: "Offentlig", en: "Public" },
  "common.private": { no: "Privat", en: "Private" },
  "common.inviteOnly": { no: "Kun invitasjon", en: "Invite only" },
  "common.searching": { no: "Søker…", en: "Searching…" },
  "common.refresh": { no: "Oppdater", en: "Refresh" },

  // ---- auth
  "auth.login": { no: "Logg inn", en: "Log in" },
  "auth.loggingIn": { no: "Logger inn…", en: "Logging in…" },
  "auth.signup": { no: "Registrer deg", en: "Sign up" },
  "auth.signOut": { no: "Logg ut", en: "Log out" },
  "auth.ifiUsername": { no: "IFI-brukernavn", en: "IFI username" },
  "auth.ifiHint": {
    no: "Brukernavnet ditt på IFI, f.eks. det du logger inn med på ifi-maskinene.",
    en: "Your username at IFI, e.g. the one you use on the IFI machines.",
  },
  "auth.password": { no: "Passord", en: "Password" },
  "auth.confirmPassword": { no: "Bekreft passord", en: "Confirm password" },
  "auth.fullName": { no: "Fullt navn", en: "Full name" },
  "auth.username": { no: "Brukernavn", en: "Username" },
  "auth.newHere": { no: "Ny her?", en: "New here?" },
  "auth.haveAccount": { no: "Har du allerede bruker?", en: "Already have an account?" },
  "auth.badCredentials": {
    no: "Feil IFI-brukernavn eller passord.",
    en: "Wrong IFI username or password.",
  },
  "auth.createUser": { no: "Opprett bruker", en: "Create account" },
  "auth.creating": { no: "Oppretter bruker…", en: "Creating account…" },
  "auth.usernameInvalid": {
    no: "Brukernavnet kan bare ha bokstaver, tall, punktum, understrek og bindestrek (2–24 tegn).",
    en: "The username can only contain letters, numbers, dots, underscores and hyphens (2–24 characters).",
  },
  "auth.ifiInvalid": {
    no: "IFI-brukernavnet kan bare ha bokstaver, tall, punktum, understrek og bindestrek.",
    en: "The IFI username can only contain letters, numbers, dots, underscores and hyphens.",
  },
  "auth.passwordShort": {
    no: "Passordet må være minst {min} tegn.",
    en: "The password must be at least {min} characters.",
  },
  "auth.passwordMismatch": { no: "Passordene er ikke like.", en: "The passwords don't match." },
  "auth.alreadyRegistered": {
    no: "Det finnes allerede en bruker med dette IFI-brukernavnet.",
    en: "An account with this IFI username already exists.",
  },

  // ---- navigation
  "nav.explore": { no: "Utforsk", en: "Explore" },
  "nav.myGroups": { no: "Mine kollokviegrupper", en: "My study groups" },
  "nav.myGroupsShort": { no: "Kollokvier", en: "Groups" },
  "nav.calendar": { no: "Kalender", en: "Calendar" },
  "nav.search": { no: "Søk", en: "Search" },
  "nav.main": { no: "Hovedmeny", en: "Main menu" },
  "nav.yourProfile": { no: "Din profil", en: "Your profile" },

  // ---- 404
  "notFound.title": { no: "Fant ikke siden", en: "Page not found" },
  "notFound.text": {
    no: "Siden finnes ikke, eller den er flyttet. Kollokviegruppen du leter etter kan også være slettet eller privat.",
    en: "This page doesn't exist or has moved. The study group you're looking for may also have been deleted or be private.",
  },
  "notFound.toStart": { no: "Til forsiden", en: "Go to the start page" },
  "notFound.toExplore": { no: "Tilbake til utforsk", en: "Back to Explore" },

  // ---- explore (home)
  "explore.searchPlaceholder": { no: "Søk i kollokviegrupper", en: "Search study groups" },
  "explore.refresh": { no: "Oppdater kollokviegrupper", en: "Refresh study groups" },
  "explore.all": { no: "Alle", en: "All" },
  "explore.onlyPublic": { no: "Offentlige", en: "Public" },
  "explore.onlyPrivate": { no: "Private", en: "Private" },
  "explore.noPrivate": {
    no: "Ingen private kollokviegrupper fra folk du følger ennå.",
    en: "No private study groups from people you follow yet.",
  },
  "explore.empty": {
    no: "Ingen offentlige kollokviegrupper ennå.",
    en: "No public study groups yet.",
  },
  "explore.noMatch": { no: "Ingen kollokviegrupper matcher.", en: "No study groups match." },

  // ---- search
  "search.people": { no: "Folk", en: "People" },
  "search.groups": { no: "Kollokviegrupper", en: "Study groups" },
  "search.peoplePlaceholder": { no: "Navn eller brukernavn…", en: "Name or username…" },
  "search.groupsPlaceholder": {
    no: "Navn, emnekode eller beskrivelse…",
    en: "Name, course code or description…",
  },
  "search.noUsers": { no: "Fant ingen brukere.", en: "No users found." },
  "search.noGroups": { no: "Fant ingen kollokviegrupper.", en: "No study groups found." },

  // ---- study groups
  "group.create": { no: "Lag kollokviegruppe", en: "Create study group" },
  "group.none": {
    no: "Du er ikke med i noen kollokviegrupper ennå.",
    en: "You're not in any study groups yet.",
  },
  "group.name": { no: "Navn", en: "Name" },
  "group.namePlaceholder": { no: "Kollokvie i algoritmer", en: "Algorithms study group" },
  "group.course": { no: "Emne", en: "Course" },
  "group.description": { no: "Beskrivelse", en: "Description" },
  "group.descriptionPlaceholder": {
    no: "Hva skal dere gjøre sammen?",
    en: "What will you do together?",
  },
  "group.visibility": { no: "Synlighet", en: "Visibility" },
  "group.publicHint": {
    no: "Alle kan se og bli med i kollokviegruppa. Vises under Utforsk.",
    en: "Anyone can see and join the study group. Shown under Explore.",
  },
  "group.inviteHint": {
    no: "Skjult for alle andre. Bare du kan invitere, og bare inviterte kan bli med.",
    en: "Hidden from everyone else. Only you can invite, and only invited people can join.",
  },
  "group.fullError": { no: "Kollokviegruppen er full.", en: "The study group is full." },
  "group.mustBeInvited": {
    no: "Du må bli invitert for å bli med i denne kollokviegruppa.",
    en: "You need an invitation to join this study group.",
  },
  "group.privateHint": {
    no: "Bare folk du følger eller som følger deg kan bli med.",
    en: "Only people you follow or who follow you can join.",
  },
  "group.room": { no: "Rom", en: "Room" },
  "group.roomPlaceholder": { no: "Ada Lovelaces hus, rom 2439", en: "Ada Lovelace building, room 2439" },
  "group.date": { no: "Dato", en: "Date" },
  "group.time": { no: "Tid", en: "Time" },
  "group.max": { no: "Maks antall personer", en: "Max number of people" },
  "group.creating": { no: "Oppretter…", en: "Creating…" },
  "group.createSubmit": { no: "Opprett kollokviegruppe", en: "Create study group" },
  "group.members": { no: "{count} medlemmer", en: "{count} members" },
  "group.membersMax": { no: "{count} / {max} medlemmer", en: "{count} / {max} members" },
  "group.atTime": { no: "kl. {time}", en: "at {time}" },
  "group.membersHeading": { no: "Medlemmer", en: "Members" },
  "group.settingsAria": {
    no: "Innstillinger for kollokviegruppa",
    en: "Study group settings",
  },
  "group.mustFollowOwner": {
    no: "Du må følge eieren for å bli med i denne private kollokviegruppa.",
    en: "You need to follow the owner to join this private study group.",
  },
  "group.memberListHidden": {
    no: "Medlemslisten vises når du er med i kollokviegruppa.",
    en: "The member list is shown once you've joined the study group.",
  },
  "group.noMembers": { no: "Ingen medlemmer ennå.", en: "No members yet." },
  "group.join": { no: "Bli med", en: "Join" },
  "group.joinFull": { no: "Fullt", en: "Full" },
  "group.joinError": {
    no: "Du kan ikke bli med i denne kollokviegruppa.",
    en: "You can't join this study group.",
  },
  "group.leave": { no: "Forlat kollokviegruppe", en: "Leave study group" },
  "group.fullBadge": { no: "Full", en: "Full" },
  "group.delete": { no: "Slett kollokviegruppe", en: "Delete study group" },
  "group.deleteConfirm": { no: "Ja, slett kollokviegruppa", en: "Yes, delete the study group" },
  "group.settingsTitle": {
    no: "Innstillinger for kollokviegruppa",
    en: "Study group settings",
  },
  "group.onlyOwner": {
    no: "Bare den som lagde kollokviegruppa kan endre innstillingene.",
    en: "Only the person who created the study group can change its settings.",
  },
  "group.backToGroup": { no: "← Tilbake til kollokviegruppa", en: "← Back to the study group" },
  "group.backToMine": { no: "← Mine kollokviegrupper", en: "← My study groups" },
  "invite.button": { no: "Inviter", en: "Invite" },
  "invite.title": { no: "Inviter folk", en: "Invite people" },
  "invite.invited": { no: "Invitert", en: "Invited" },

  // ---- inbox
  "inbox.title": { no: "Innboks", en: "Inbox" },
  "inbox.followRequests": { no: "Følgeforespørsler", en: "Follow requests" },
  "inbox.groupInvites": {
    no: "Invitasjoner til kollokviegrupper",
    en: "Study group invitations",
  },
  "inbox.noRequests": { no: "Ingen nye følgeforespørsler.", en: "No new follow requests." },
  "inbox.noInvites": {
    no: "Ingen nye invitasjoner til kollokviegrupper.",
    en: "No new study group invitations.",
  },
  "inbox.invitedBy": { no: "Invitert av {name}", en: "Invited by {name}" },
  "inbox.invitation": { no: "Invitasjon", en: "Invitation" },
  "inbox.nothingNew": { no: "Ingenting nytt", en: "Nothing new" },

  // ---- profiles
  "profile.backToProfile": { no: "← Tilbake til profilen", en: "← Back to profile" },
  "profile.settings": { no: "Innstillinger", en: "Settings" },
  "profile.ifi": { no: "IFI: {name}", en: "IFI: {name}" },
  "profile.year": { no: "{n}. år", en: "Year {n}" },
  "profile.followers": { no: "følgere", en: "followers" },
  "profile.following": { no: "følger", en: "following" },
  "profile.tabFollowers": { no: "Følgere", en: "Followers" },
  "profile.tabFollowing": { no: "Følger", en: "Following" },
  "profile.noFollowers": { no: "Ingen følgere ennå.", en: "No followers yet." },
  "profile.followNobody": { no: "Du følger ingen ennå.", en: "You're not following anyone yet." },
  "profile.userFollowsNobody": {
    no: "@{username} følger ingen ennå.",
    en: "@{username} isn't following anyone yet.",
  },
  "profile.followToSee": {
    no: "Følg @{username} for å se hvem de følger og blir fulgt av.",
    en: "Follow @{username} to see who they follow and who follows them.",
  },
  "follow.follow": { no: "Følg", en: "Follow" },
  "follow.following": { no: "Følger", en: "Following" },
  "follow.requested": { no: "Forespørsel sendt", en: "Requested" },

  // ---- settings
  "settings.title": { no: "Innstillinger", en: "Settings" },
  "settings.photo": { no: "Profilbilde", en: "Profile picture" },
  "settings.photoUpload": { no: "Last opp bilde", en: "Upload photo" },
  "settings.photoChoose": { no: "Velg ikon", en: "Choose an icon" },
  "settings.photoRemove": { no: "Bruk forbokstav", en: "Use initial" },
  "settings.photoHint": {
    no: "Last opp fra enheten eller bildegalleriet, eller velg et av ikonene.",
    en: "Upload from your device or photo library, or pick one of the icons.",
  },
  "settings.photoError": {
    no: "Kunne ikke bruke bildet. Prøv et annet.",
    en: "Couldn't use that picture. Try another one.",
  },
  "settings.nameRequired": { no: "Navn kan ikke være tomt.", en: "Name can't be empty." },
  "settings.iconLabel": { no: "Ikon {n}", en: "Icon {n}" },
  "settings.colorHint": {
    no: "Fargen brukes når du ikke har profilbilde.",
    en: "The color is used when you don't have a profile picture.",
  },
  "settings.color": { no: "Farge", en: "Color" },
  "settings.program": { no: "Linje", en: "Study program" },
  "settings.year": { no: "År", en: "Year" },
  "settings.courses": { no: "Emner", en: "Courses" },
  "settings.coursesHint": {
    no: "Velg så mange emner du vil. Finner du ikke faget, kan du legge det til selv.",
    en: "Pick as many courses as you like. If you can't find a course, you can add it yourself.",
  },
  "settings.github": { no: "GitHub-lenke", en: "GitHub link" },
  "settings.linkedin": { no: "LinkedIn-lenke", en: "LinkedIn link" },
  "settings.ifiLocked": {
    no: "Kan ikke endres — det er dette du logger inn med.",
    en: "Can't be changed — it's what you log in with.",
  },
  "settings.invalidLink": { no: "Ugyldig lenke: {field}", en: "Invalid link: {field}" },
  "settings.usernameTaken": { no: "Brukernavnet er allerede tatt.", en: "That username is already taken." },
  "settings.deleteTitle": { no: "Slett bruker", en: "Delete account" },
  "settings.deleteText": {
    no: "Dette sletter kontoen din for godt, inkludert profil, følgere og forespørsler. Kan ikke angres.",
    en: "This permanently deletes your account, including your profile, followers and requests. It can't be undone.",
  },
  "settings.deleteConfirm": { no: "Ja, slett kontoen min", en: "Yes, delete my account" },
  "settings.appearance": { no: "Utseende", en: "Appearance" },
  "settings.theme": { no: "Tema", en: "Theme" },
  "settings.themeLight": { no: "Lys", en: "Light" },
  "settings.themeDark": { no: "Mørk", en: "Dark" },
  "settings.language": { no: "Språk", en: "Language" },
  "settings.notSelected": { no: "Ikke valgt", en: "Not selected" },

  // ---- accent colors
  "color.sage": { no: "Salvie", en: "Sage" },
  "color.blue": { no: "Blå", en: "Blue" },
  "color.indigo": { no: "Indigo", en: "Indigo" },
  "color.purple": { no: "Lilla", en: "Purple" },
  "color.pink": { no: "Rosa", en: "Pink" },
  "color.orange": { no: "Oransje", en: "Orange" },
  "color.amber": { no: "Rav", en: "Amber" },
  "color.teal": { no: "Teal", en: "Teal" },
  "color.slate": { no: "Skifer", en: "Slate" },

  // ---- course pickers
  "course.searchPlaceholder": { no: "Søk emnekode eller navn…", en: "Search course code or name…" },
  "course.choose": { no: "Velg emne", en: "Choose course" },
  "course.noMatch": { no: "Ingen treff.", en: "No matches." },
  "course.typeToSearch": { no: "Skriv for å søke…", en: "Type to search…" },
  "course.addHint": { no: "Legg til {code} som eget fag", en: "Add {code} as your own course" },
  "course.addLink": { no: "+ Legg til «{code}» som eget fag", en: "+ Add “{code}” as your own course" },
  "course.customName": { no: "Navn på faget", en: "Course name" },
  "course.adding": { no: "Legger til…", en: "Adding…" },
  "course.addSubmit": { no: "Legg til fag", en: "Add course" },
  "course.invalidCode": {
    no: "Emnekoden kan bare ha bokstaver og tall (2–12 tegn).",
    en: "The course code can only have letters and numbers (2–12 characters).",
  },
  "course.remove": { no: "Fjern {code}", en: "Remove {code}" },
  "select.search": { no: "Søk…", en: "Search…" },

  // ---- calendar
  "cal.prevMonth": { no: "Forrige måned", en: "Previous month" },
  "cal.nextMonth": { no: "Neste måned", en: "Next month" },
  "cal.weekdays": { no: "Man|Tir|Ons|Tor|Fre|Lør|Søn", en: "Mon|Tue|Wed|Thu|Fri|Sat|Sun" },
  "cal.months": {
    no: "Januar|Februar|Mars|April|Mai|Juni|Juli|August|September|Oktober|November|Desember",
    en: "January|February|March|April|May|June|July|August|September|October|November|December",
  },
  "cal.dayHeading": { no: "{day}. {month}", en: "{month} {day}" },
  "cal.studyGroup": { no: "Kollokviegruppe", en: "Study group" },
  "cal.saveError": { no: "Kunne ikke lagre hendelsen.", en: "Couldn't save the event." },
  "cal.deleteEvent": { no: "Slett hendelse", en: "Delete event" },
  "cal.newEvent": { no: "Ny hendelse…", en: "New event…" },
  "cal.exam": { no: "Eksamen", en: "Exam" },
  "cal.deadline": { no: "Innlevering", en: "Deadline" },
  "cal.other": { no: "Annet", en: "Other" },
  "cal.add": { no: "Legg til", en: "Add" },
  "cal.adding": { no: "Legger til…", en: "Adding…" },
  "cal.hint": {
    no: "Klikk på en dag for å se eller legge til hendelser, som eksamener og innleveringer. Kollokviegruppene dine dukker automatisk opp på sin dato.",
    en: "Click a day to see or add events, like exams and deadlines. Your study groups show up automatically on their date.",
  },
} as const satisfies Record<string, { no: string; en: string }>;

// English names for the study programs (stored in Norwegian in the database).
export const PROGRAM_NAMES_EN: Record<string, string> = {
  "Elektronikk, informatikk og teknologi (bachelor)": "Electronics, Informatics and Technology (bachelor)",
  "Informatikk: design, bruk, interaksjon (bachelor)": "Informatics: Design, Use, Interaction (bachelor)",
  "Informatikk: digital økonomi og ledelse (bachelor)": "Informatics: Digital Economics and Leadership (bachelor)",
  "Informatikk: maskinlæring og kunstig intelligens (bachelor)":
    "Informatics: Machine Learning and Artificial Intelligence (bachelor)",
  "Informatikk: programmering og systemarkitektur (bachelor)":
    "Informatics: Programming and System Architecture (bachelor)",
  "Informatikk: robotikk og intelligente systemer (bachelor)":
    "Informatics: Robotics and Intelligent Systems (bachelor)",
  "Digitalisering i helsesektoren (master)": "Digitalisation in Healthcare (master)",
  "Elektronikk, informatikk og teknologi (master)": "Electronics, Informatics and Technology (master)",
  "Entreprenørskap og innovasjonsledelse (master)": "Entrepreneurship and Innovation Management (master)",
  "Informatikk: design, bruk, interaksjon (master)": "Informatics: Design, Use, Interaction (master)",
  "Informatikk: digital økonomi og ledelse (master)": "Informatics: Digital Economics and Leadership (master)",
  "Informatikk: informasjonssikkerhet (master)": "Informatics: Information Security (master)",
  "Informatikk: programmering og systemarkitektur (master)":
    "Informatics: Programming and System Architecture (master)",
  "Informatikk: robotikk og intelligente systemer (master)":
    "Informatics: Robotics and Intelligent Systems (master)",
  "Informatikk: språkteknologi (master)": "Informatics: Language Technology (master)",
};
