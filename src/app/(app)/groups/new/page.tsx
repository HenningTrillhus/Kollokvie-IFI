"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getUserCourses, type Course } from "@/lib/courses";
import CourseSingleSelect from "@/components/course-single-select";
import type { Group, Visibility } from "@/lib/groups";

export default function NewGroupPage() {
  const router = useRouter();
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
  const [errorMessage, setErrorMessage] = useState("");

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setErrorMessage("");

    const supabase = createClient();

    const { data: group, error } = await supabase
      .rpc("create_group", {
        p_name: name.trim(),
        p_description: description.trim() || null,
        p_course_code: course?.code ?? null,
        p_visibility: visibility,
        p_location: location.trim() || null,
        p_event_date: eventDate || null,
        p_event_time: eventTime || null,
        p_max_members: maxMembers ? Number(maxMembers) : null,
      })
      .single();

    if (error || !group) {
      setSaving(false);
      setErrorMessage(error?.message ?? "Noe gikk galt.");
      return;
    }

    const newGroup = group as Group;
    router.push(`/groups/${newGroup.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-10">
      <Link
        href="/groups"
        className="text-sm font-medium text-muted transition hover:text-foreground"
      >
        ← Mine kollokviegrupper
      </Link>

      <h1 className="mt-4 text-xl font-semibold">Lag kollokviegruppe</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Navn
          </label>
          <input
            id="name"
            type="text"
            required
            autoFocus
            placeholder="Kollokvie i algoritmer"
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
            placeholder="Hva skal dere gjøre sammen?"
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
          <p className="mt-1 text-xs text-muted">
            {visibility === "public"
              ? "Alle kan se og bli med i kollokviegruppa. Vises under Utforsk."
              : "Bare folk du følger eller som følger deg kan bli med."}
          </p>
        </div>

        <div>
          <label htmlFor="location" className="mb-1.5 block text-sm font-medium">
            Rom
          </label>
          <input
            id="location"
            type="text"
            placeholder="Ada Lovelaces hus, rom 2439"
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

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? "Oppretter…" : "Opprett kollokviegruppe"}
        </button>
      </form>
    </div>
  );
}
