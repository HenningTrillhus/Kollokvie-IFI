import { ExploreIcon, GroupsIcon, CalendarIcon, SearchIcon } from "./nav-icons";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Utforsk", shortLabel: "Utforsk", Icon: ExploreIcon },
  {
    href: "/groups",
    label: "Mine kollokviegrupper",
    shortLabel: "Kollokvier",
    Icon: GroupsIcon,
  },
  { href: "/calendar", label: "Kalender", shortLabel: "Kalender", Icon: CalendarIcon },
  { href: "/search", label: "Søk", shortLabel: "Søk", Icon: SearchIcon },
];
