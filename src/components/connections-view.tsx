"use client";

import { useMemo, useState } from "react";
import SwipeTabs from "@/components/swipe-tabs";
import ProfileList from "@/components/profile-list";
import SearchInput from "@/components/search-input";
import { useI18n } from "@/lib/i18n/client";
import type { Profile } from "@/lib/profiles";

function matches(profile: Profile, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    profile.full_name.toLowerCase().includes(q) ||
    (profile.username ?? "").toLowerCase().includes(q)
  );
}

// Followers and following, swipeable between the two, with a search box that
// filters whichever pane you're on. Used by the four connections pages
// (own/other x followers/following) so all four behave the same.
export default function ConnectionsView({
  followers,
  following,
  emptyFollowers,
  emptyFollowing,
  initialTab,
}: {
  followers: Profile[];
  following: Profile[];
  emptyFollowers: string;
  emptyFollowing: string;
  initialTab: "followers" | "following";
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;

  const filteredFollowers = useMemo(
    () => followers.filter((p) => matches(p, query)),
    [followers, query]
  );
  const filteredFollowing = useMemo(
    () => following.filter((p) => matches(p, query)),
    [following, query]
  );

  return (
    <div className="space-y-3">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={t("search.peoplePlaceholder")}
      />
      <SwipeTabs
        initialIndex={initialTab === "following" ? 1 : 0}
        tabs={[
          {
            label: t("profile.tabFollowers"),
            count: filteredFollowers.length,
            content: (
              <ProfileList
                profiles={filteredFollowers}
                emptyLabel={searching ? t("search.noUsers") : emptyFollowers}
              />
            ),
          },
          {
            label: t("profile.tabFollowing"),
            count: filteredFollowing.length,
            content: (
              <ProfileList
                profiles={filteredFollowing}
                emptyLabel={searching ? t("search.noUsers") : emptyFollowing}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
