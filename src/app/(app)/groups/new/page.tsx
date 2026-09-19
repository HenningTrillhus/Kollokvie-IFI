"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserCourses } from "@/lib/courses";
import GroupForm, { EMPTY_GROUP_FORM, type GroupFormValues } from "@/components/group-form";
import { useI18n } from "@/lib/i18n/client";
import type { Group } from "@/lib/groups";

export default function NewGroupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [priorityCodes, setPriorityCodes] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const myCourses = await getUserCourses(supabase, user.id);
      setPriorityCodes(myCourses.map((c) => c.code));
    })();
  }, []);

  async function create(v: GroupFormValues) {
    const supabase = createClient();
    const { data: group, error } = await supabase
      .rpc("create_group", {
        p_name: v.name.trim(),
        p_description: v.description.trim() || null,
        p_course_code: v.course?.code ?? null,
        p_visibility: v.visibility,
        p_location: v.location.trim() || null,
        p_event_date: v.eventDate || null,
        p_event_time: v.eventTime || null,
        p_max_members: v.maxMembers ? Number(v.maxMembers) : null,
      })
      .single();

    if (error || !group) return error?.message ?? t("common.somethingWrong");

    router.push(`/groups/${(group as Group).id}`);
    router.refresh();
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-5">
      <Link
        href="/groups"
        className="text-sm font-medium text-muted transition hover:text-foreground"
      >
        {t("group.backToMine")}
      </Link>

      <h1 className="mb-5 mt-3 text-xl font-semibold">{t("group.create")}</h1>

      <GroupForm
        initial={EMPTY_GROUP_FORM}
        priorityCodes={priorityCodes}
        submitLabel={t("group.createSubmit")}
        savingLabel={t("group.creating")}
        onSubmit={create}
      />
    </div>
  );
}
