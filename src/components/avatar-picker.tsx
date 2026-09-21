"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/avatar";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import ColorSwatchInput from "@/components/color-swatch-input";
import {
  AvatarImageError,
  AvatarUploadError,
  PRESET_AVATARS,
  avatarSrc,
  prepareAvatarImage,
  uploadAvatar,
} from "@/lib/avatars";
import { ACCENT_COLORS, type Profile } from "@/lib/profiles";

type PickerProfile = Pick<Profile, "id" | "full_name" | "username" | "accent_color">;

// Changes are saved straight away (no need to press the form's Save button).
export default function AvatarPicker({
  profile,
  value,
  onChange,
  onColorChange,
}: {
  profile: PickerProfile;
  value: string | null;
  onChange: (value: string | null) => void;
  onColorChange: (color: string) => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [showIcons, setShowIcons] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(next: string | null) {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar: next })
      .eq("id", profile.id);
    if (updateError) throw updateError;
    onChange(next);
    router.refresh();
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      // Say what was wrong with the picture, in plain words.
      const reason =
        e instanceof AvatarImageError
          ? e.reason
          : e instanceof AvatarUploadError
            ? e.status === 413
              ? "too-large"
              : e.status === 415
                ? "type"
                : e.status === 429
                  ? "rate"
                  : null
            : null;
      setError(
        reason === "too-large" || reason === "pixels"
          ? t("settings.photoTooLarge")
          : reason === "type" || reason === "corrupt"
            ? t("settings.photoBadType")
            : reason === "rate"
              ? t("rate.limited")
              : t("settings.photoError")
      );
    } finally {
      setBusy(false);
    }
  }

  function chooseColor(color: string) {
    const previous = profile.accent_color;
    onColorChange(color); // instant preview
    return run(async () => {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ accent_color: color })
        .eq("id", profile.id);
      if (updateError) {
        onColorChange(previous);
        throw updateError;
      }
      router.refresh();
    });
  }

  function choosePreset(preset: string) {
    setShowIcons(false);
    return run(() => save(preset));
  }

  function removePhoto() {
    return run(() => save(null));
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow picking the same file again
    if (!file) return;

    await run(async () => {
      // Checked and shrunk here, checked again and re-encoded on the server.
      const blob = await prepareAvatarImage(file);
      await uploadAvatar(blob);
      setShowIcons(false);
      await save(`upload:${Date.now()}`);
    });
  }

  const buttonClass =
    "rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium transition hover:bg-accent-soft disabled:opacity-60";

  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar
          profile={{ ...profile, avatar: value }}
          className={`h-16 w-16 text-2xl transition ${busy ? "opacity-50" : ""}`}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
            className={buttonClass}
          >
            {t("settings.photoUpload")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowIcons((v) => !v)}
            aria-expanded={showIcons}
            className={buttonClass}
          >
            {t("settings.photoChoose")}
          </button>
          {value && (
            <button
              type="button"
              disabled={busy}
              onClick={removePhoto}
              className={`${buttonClass} text-muted`}
            >
              {t("settings.photoRemove")}
            </button>
          )}
        </div>
      </div>

      {/* accept="image/*" makes phones offer the photo library and the camera */}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {showIcons && (
        // Its own scroll box. The grid sits inside it at its natural size, so the
        // icons never get squeezed to fit.
        <div className="mt-3 max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-card-border bg-background p-3">
        <div
          role="listbox"
          aria-label={t("settings.photoChoose")}
          className="grid grid-cols-5 gap-3 sm:grid-cols-7"
        >
          {PRESET_AVATARS.map((preset, i) => {
            const selected = value === preset;
            return (
              <button
                key={preset}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={t("settings.iconLabel", { n: i + 1 })}
                disabled={busy}
                onClick={() => choosePreset(preset)}
                className={`aspect-square w-full shrink-0 overflow-hidden rounded-full transition active:scale-90 ${
                  selected
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                    : "hover:scale-105"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- tiny local icons */}
                <img
                  src={avatarSrc(profile.id, preset) ?? ""}
                  alt=""
                  width={96}
                  height={96}
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
        </div>
      )}

      {/* The color only matters for the initial, so hide it behind a picture. */}
      {!value && (
        <div className="mt-4 border-t border-card-border pt-4">
          <p className="mb-2 text-sm font-medium">{t("settings.color")}</p>
          <div className="flex flex-wrap items-center gap-2.5">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => chooseColor(color.value)}
                title={t(color.key)}
                aria-label={t(color.key)}
                aria-pressed={profile.accent_color === color.value}
                style={{ backgroundColor: color.value }}
                className={`h-8 w-8 rounded-full transition active:scale-90 ${
                  profile.accent_color === color.value
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-card"
                    : "hover:scale-110"
                }`}
              />
            ))}
            <ColorSwatchInput
              className="h-8 w-8"
              value={profile.accent_color}
              active={!ACCENT_COLORS.some((c) => c.value === profile.accent_color)}
              onCommit={chooseColor}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
