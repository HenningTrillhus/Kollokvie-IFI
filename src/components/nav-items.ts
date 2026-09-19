import { HomeIcon, GroupsIcon, CalendarIcon, SearchIcon } from "./nav-icons";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Hjem", shortLabel: "Hjem", Icon: HomeIcon },
  {
    href: "/groups",
    label: "Mine kollokviegrupper",
    shortLabel: "Grupper",
    Icon: GroupsIcon,
  },
  { href: "/calendar", label: "Kalender", shortLabel: "Kalender", Icon: CalendarIcon },
  { href: "/search", label: "Søk", shortLabel: "Søk", Icon: SearchIcon },
];
