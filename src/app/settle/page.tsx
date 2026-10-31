import { redirect } from "next/navigation";
import { getHousehold, workingMonthKey } from "@/lib/household";
import { currentMonthKey } from "@/lib/month";

export const dynamic = "force-dynamic";

export default async function SettleIndex() {
  const { supabase, householdId } = await getHousehold();
  const key = householdId ? await workingMonthKey(supabase, householdId) : currentMonthKey();
  redirect(`/settle/${key}`);
}
