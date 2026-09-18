import { cache } from "react";
import { createClient } from "./server";

// Every Server Component that needs the current user calls this instead of
// supabase.auth.getUser() directly.
//
// Two things make this fast:
// 1. getClaims() verifies the JWT locally against the project's cached
//    public signing key (this project uses asymmetric ES256 keys), instead
//    of getUser()'s round trip to the Auth server on every single call.
// 2. cache() dedupes calls with identical arguments within one request, so
//    the layout and every page under it share a single verification instead
//    of each paying the cost separately.
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;

  const claims = data.claims;
  return {
    id: claims.sub as string,
    email: claims.email as string | undefined,
  };
});
