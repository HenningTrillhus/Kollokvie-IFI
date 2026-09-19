import { notFound } from "next/navigation";

// Catch-all so unknown URLs render the 404 inside the app shell (top bar and
// tab bar stay), instead of the bare root not-found page.
export default function CatchAll() {
  notFound();
}
