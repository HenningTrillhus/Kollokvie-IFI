import { getAuthUser } from "@/lib/supabase/get-user";
import SearchClient from "@/components/search-client";

export default async function SearchPage() {
  const user = await getAuthUser();
  if (!user) return null;

  return <SearchClient currentUserId={user.id} />;
}
