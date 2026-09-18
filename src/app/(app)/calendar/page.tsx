import { getAuthUser } from "@/lib/supabase/get-user";
import MonthCalendar from "@/components/month-calendar";

export default async function CalendarPage() {
  const user = await getAuthUser();
  if (!user) return null;

  return <MonthCalendar currentUserId={user.id} />;
}
