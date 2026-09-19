"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserCourses, type Course } from "@/lib/courses";
import CourseSingleSelect from "@/components/course-single-select";
import type { Group, Visibility } from "@/lib/groups";

export default function GroupSettingsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const groupId = params.id;

  const [loading, setLoading] = useState(true);
  const [notOwner, setNotOwner] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [priorityCodes, setPriorityCodes] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      setName(g.name);
      setDescription(g.description ?? "");
      setVisibility(g.visibility);
      setLocation(g.location ?? "");
      setEventDate(g.event_date ?? "");
      setEventTime(g.event_time ?? "");
      setMaxMembers(g.max_members ? String(g.max_members) : "");

      if (g.course_code) {
        const { data: courseRow } = await supabase
          .from("courses")
          .select("*")
          .eq("code", g.course_code)
          .maybeSingle();
        setCourse(courseRow as Course | null);
      }

      const myCourses = await getUserCourses(supabase, user.id);
      setPriorityCodes(myCourses.map((c) => c.code));
      setLoading(false);
    })();
  }, [groupId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setErrorMessage("");
    setSaved(false);

    const supabase = createClient();
    const { error } = await supabase.rpc("update_group", {
      gid: groupId,
      p_name: name.trim(),
      p_description: description.trim() || null,
      p_course_code: course?.code ?? null,
      p_visibility: visibility,
      p_location: location.trim() || null,
      p_event_date: eventDate || null,
      p_event_time: eventTime || null,
      p_max_members: maxMembers ? Number(maxMembers) : null,
    });

    setSaving(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-sm px-6 py-10 text-sm text-muted">
        Laster…
      </div>
    );
  }

  if (notOwner) {
    return (
      <div className="mx-auto w-full max-w-sm px-6 py-10">
        <p className="text-sm text-muted">
          Bare den som lagde kollokviegruppa kan endre innstillingene.
        </p>
        <Link
          href={`/groups/${groupId}`}
          className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover"
        >
          ← Tilbake til kollokviegruppa
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-10">
      <Link
        href={`/groups/${groupId}`}
        className="text-sm font-medium text-muted transition hover:text-foreground"
      >
        ← Tilbake til kollokviegruppa
      </Link>

      <h1 className="mt-4 text-xl font-semibold">
        Innstillinger for kollokviegruppa
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Navn
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Emne</label>
          <CourseSingleSelect
            value={course}
            onChange={setCourse}
            priorityCodes={priorityCodes}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium"
          >
            Beskrivelse
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Synlighet</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                visibility === "public"
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-card-border hover:bg-accent-soft/60"
              }`}
            >
              Offentlig
            </button>
            <button
              type="button"
              onClick={() => setVisibility("private")}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                visibility === "private"
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-card-border hover:bg-accent-soft/60"
              }`}
            >
              Privat
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="mb-1.5 block text-sm font-medium">
            Rom
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="date" className="mb-1.5 block text-sm font-medium">
              Dato
            </label>
            <input
              id="date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
          </div>
          <div>
            <label htmlFor="time" className="mb-1.5 block text-sm font-medium">
              Tid
            </label>
            <input
              id="time"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="maxMembers"
            className="mb-1.5 block text-sm font-medium"
          >
            Maks antall personer
          </label>
          <input
            id="maxMembers"
            type="number"
            min={1}
            placeholder="Valgfritt"
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </div>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        {saved && <p className="text-sm text-accent">Lagret.</p>}

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? "Lagrer…" : "Lagre"}
        </button>
      </form>
    </div>
  );
}
