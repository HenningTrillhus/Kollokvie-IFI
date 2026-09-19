import Link from "next/link";

export default function NotFoundView({
  href,
  label,
  fullScreen,
}: {
  href: string;
  label: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center px-6 py-16 text-center ${
        fullScreen ? "min-h-screen" : ""
      }`}
    >
      <p className="text-6xl font-semibold tracking-tight text-accent">404</p>
      <h1 className="mt-4 text-lg font-semibold">Fant ikke siden</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Siden finnes ikke, eller den er flyttet. Kollokviegruppen du leter etter
        kan også være slettet eller privat.
      </p>
      <Link
        href={href}
        className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-95"
      >
        {label}
      </Link>
    </div>
  );
}
