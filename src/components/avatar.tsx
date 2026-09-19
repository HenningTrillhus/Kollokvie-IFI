import { avatarSrc } from "@/lib/avatars";
import { avatarStyle, type Profile } from "@/lib/profiles";

type AvatarProfile = Pick<Profile, "id" | "full_name" | "username" | "accent_color"> & {
  avatar?: string | null;
};

// The round profile picture: the user's picture or icon if they have one,
// otherwise their initial on their accent color. `className` sets the size
// (e.g. "h-9 w-9 text-sm").
export default function Avatar({
  profile,
  className = "h-9 w-9 text-sm",
  colorOverride,
}: {
  profile: AvatarProfile | null;
  className?: string;
  colorOverride?: string;
}) {
  const src = profile ? avatarSrc(profile.id, profile.avatar) : null;
  const initial = (profile?.full_name || profile?.username || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <span
      style={src ? undefined : avatarStyle(colorOverride ?? profile?.accent_color)}
      className={`inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny, already-sized images
        <img
          src={src}
          alt=""
          width={256}
          height={256}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
}
