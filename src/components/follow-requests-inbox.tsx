"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PersonRow from "@/components/person-row";
import { EmptyCard, ListCard, SectionTitle } from "@/components/form-ui";
import { useI18n } from "@/lib/i18n/client";
import type { Profile } from "@/lib/profiles";

export type PendingRequest = {
  followerId: string;
  profile: Profile;
};

export default function FollowRequestsInbox({
  initialRequests,
  currentUserId,
}: {
  initialRequests: PendingRequest[];
  currentUserId: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [requests, setRequests] = useState(initialRequests);
  const [errorMessage, setErrorMessage] = useState("");

  // Optimistic: the row disappears at once, and comes back if it failed.
  async function respond(followerId: string, action: "accept" | "decline") {
    const before = requests;
    setErrorMessage("");
    setRequests((prev) => prev.filter((r) => r.followerId !== followerId));

    const supabase = createClient();
    const { error } =
      action === "accept"
        ? await supabase
            .from("follows")
            .update({ status: "accepted" })
            .eq("follower_id", followerId)
            .eq("followee_id", currentUserId)
        : await supabase
            .from("follows")
            .delete()
            .eq("follower_id", followerId)
            .eq("followee_id", currentUserId);

    if (error) {
      setRequests(before);
      setErrorMessage(t("common.somethingWrong"));
      return;
    }
    router.refresh();
  }

  return (
    <section>
      <SectionTitle
        right={
          requests.length > 0 ? (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
              {requests.length}
            </span>
          ) : null
        }
      >
        {t("inbox.followRequests")}
      </SectionTitle>
      {errorMessage && <p className="mb-2 text-sm text-red-500">{errorMessage}</p>}
      {requests.length === 0 ? (
        <EmptyCard>{t("inbox.noRequests")}</EmptyCard>
      ) : (
        <ListCard>
          {requests.map((r, i) => (
            <div key={r.followerId} style={{ ["--i" as string]: i }} className="animate-rise">
              <PersonRow
                profile={r.profile}
                below={
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => respond(r.followerId, "accept")}
                      className="h-9 rounded-xl bg-accent text-sm font-medium text-white transition hover:bg-accent-hover active:scale-95"
                    >
                      {t("common.accept")}
                    </button>
                    <button
                      onClick={() => respond(r.followerId, "decline")}
                      className="h-9 rounded-xl border border-card-border text-sm font-medium transition hover:bg-accent-soft active:scale-95"
                    >
                      {t("common.decline")}
                    </button>
                  </div>
                }
              />
            </div>
          ))}
        </ListCard>
      )}
    </section>
  );
}
