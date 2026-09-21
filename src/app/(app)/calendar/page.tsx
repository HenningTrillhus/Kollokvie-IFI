import { getAuthUser } from "@/lib/supabase/get-user";
import CalendarView from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  const user = await getAuthUser();
  if (!user) return null;

  return <CalendarView currentUserId={user.id} />;
}
