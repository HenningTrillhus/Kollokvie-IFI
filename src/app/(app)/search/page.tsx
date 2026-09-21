import { getAuthUser } from "@/lib/supabase/get-user";
import SearchClient from "@/components/search-client";

// The search (text, tab and page) lives in the URL, so going back from a
// profile lands on the same search, page and position.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string; page?: string }>;
}) {
  const user = await getAuthUser();
  if (!user) return null;

  const { q, mode, page } = await searchParams;
  const pageNumber = Math.max(1, Math.min(1000, Number(page) || 1));

  return (
    <SearchClient
      currentUserId={user.id}
      initialQuery={typeof q === "string" ? q.slice(0, 100) : ""}
      initialMode={mode === "groups" ? "groups" : "people"}
      initialPage={pageNumber}
    />
  );
}
