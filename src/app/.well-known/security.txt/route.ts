import { CONTACT_EMAIL } from "@/lib/privacy";

// https://securitytxt.org: where security researchers report problems.
// Needs NEXT_PUBLIC_CONTACT_EMAIL; without an address there is nothing to publish.
export function GET() {
  if (!CONTACT_EMAIL) return new Response("Not found", { status: 404 });

  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const body = [
    `Contact: mailto:${CONTACT_EMAIL}`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: no, en",
    "Canonical: https://kollokvie-ifi.no/.well-known/security.txt",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
