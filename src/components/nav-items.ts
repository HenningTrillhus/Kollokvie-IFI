import { ExploreIcon, GroupsIcon, CalendarIcon, SearchIcon } from "./nav-icons";

import type { MessageKey } from "@/lib/i18n";

export const NAV_ITEMS: {
  href: string;
  labelKey: MessageKey;
  shortKey: MessageKey;
  Icon: typeof ExploreIcon;
}[] = [
  { href: "/dashboard", labelKey: "nav.explore", shortKey: "nav.explore", Icon: ExploreIcon },
  {
    href: "/groups",
    labelKey: "nav.myGroups",
    shortKey: "nav.myGroupsShort",
    Icon: GroupsIcon,
  },
  { href: "/calendar", labelKey: "nav.calendar", shortKey: "nav.calendar", Icon: CalendarIcon },
  { href: "/search", labelKey: "nav.search", shortKey: "nav.search", Icon: SearchIcon },
];
