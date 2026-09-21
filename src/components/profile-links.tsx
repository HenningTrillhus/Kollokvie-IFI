import { safeLinkUrl } from "@/lib/profiles";

// GitHub and LinkedIn as round logos, the same size, one for each link the
// person has added. Nothing at all is drawn if they have added neither.
export default function ProfileLinks({
  githubUrl,
  linkedinUrl,
}: {
  githubUrl: string | null;
  linkedinUrl: string | null;
}) {
  const links = [
    { name: "GitHub", href: safeLinkUrl("github", githubUrl), src: "/icons/github.png", darkInvert: true },
    { name: "LinkedIn", href: safeLinkUrl("linkedin", linkedinUrl), src: "/icons/linkedin.png", darkInvert: false },
  ].filter((l) => l.href);
  if (links.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          title={link.name}
          className="block h-11 w-11 shrink-0 rounded-full transition duration-200 hover:scale-110 hover:shadow-md active:scale-95"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small static logos */}
          <img
            src={link.src}
            alt=""
            width={128}
            height={128}
            draggable={false}
            className={`h-full w-full select-none ${link.darkInvert ? "invert-in-dark" : ""}`}
          />
        </a>
      ))}
    </div>
  );
}
