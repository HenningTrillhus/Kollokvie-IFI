"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserCourses, type Course } from "@/lib/courses";
import GroupForm, { type GroupFormValues } from "@/components/group-form";
import { useI18n } from "@/lib/i18n/client";
import type { Group } from "@/lib/groups";

export default function GroupSettingsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const groupId = params.id;

  const [loading, setLoading] = useState(true);
  const [notOwner, setNotOwner] = useState(false);
  const [initial, setInitial] = useState<GroupFormValues | null>(null);
  const [priorityCodes, setPriorityCodes] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: group } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .maybeSingle();

      if (!group || (group as Group).owner_id !== user.id) {
        setNotOwner(true);
        setLoading(false);
        return;
      }

      const g = group as Group;
      let course: Course | null = null;
      if (g.course_code) {
        const { data: courseRow } = await supabase
          .from("courses")
          .select("*")
          .eq("code", g.course_code)
          .maybeSingle();
        course = courseRow as Course | null;
      }

      setInitial({
        name: g.name,
        description: g.description ?? "",
        course,
        visibility: g.visibility,
        location: g.location ?? "",
        eventDate: g.event_date ?? "",
        eventTime: g.event_time ?? "",
        maxMembers: g.max_members ? String(g.max_members) : "",
      });

      const myCourses = await getUserCourses(supabase, user.id);
      setPriorityCodes(myCourses.map((c) => c.code));
      setLoading(false);
    })();
  }, [groupId]);

  async function save(v: GroupFormValues) {
    const supabase = createClient();
    const { error } = await supabase.rpc("update_group", {
      gid: groupId,
      p_name: v.name.trim(),
      p_description: v.description.trim() || null,
      p_course_code: v.course?.code ?? null,
      p_visibility: v.visibility,
      p_location: v.location.trim() || null,
      p_event_date: v.eventDate || null,
      p_event_time: v.eventTime || null,
      p_max_members: v.maxMembers ? Number(v.maxMembers) : null,
    });

    if (error) return t("common.somethingWrong");
    router.refresh();
    return null;
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-6 text-sm text-muted">
        {t("common.loading")}
      </div>
    );
  }

  if (notOwner || !initial) {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-6">
        <p className="text-sm text-muted">{t("group.onlyOwner")}</p>
        <Link
          href={`/groups/${groupId}`}
          className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover"
        >
          {t("group.backToGroup")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-5">
      <Link
        href={`/groups/${groupId}`}
        className="text-sm font-medium text-muted transition hover:text-foreground"
      >
        {t("group.backToGroup")}
      </Link>

      <h1 className="mb-5 mt-3 text-xl font-semibold">{t("group.settingsTitle")}</h1>

      <GroupForm
        initial={initial}
        priorityCodes={priorityCodes}
        submitLabel={t("common.save")}
        savingLabel={t("common.saving")}
        showSaved
        onSubmit={save}
      />
    </div>
  );
}
