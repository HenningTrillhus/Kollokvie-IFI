import { safeLinkUrl } from "@/lib/profiles";

export default function ProfileLinks({
  githubUrl,
  linkedinUrl,
}: {
  githubUrl: string | null;
  linkedinUrl: string | null;
}) {
  githubUrl = safeLinkUrl("github", githubUrl);
  linkedinUrl = safeLinkUrl("linkedin", linkedinUrl);
  if (!githubUrl && !linkedinUrl) return null;

  return (
    <div className="flex gap-2">
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium transition hover:bg-accent-soft"
        >
          GitHub
        </a>
      )}
      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium transition hover:bg-accent-soft"
        >
          LinkedIn
        </a>
      )}
    </div>
  );
}
