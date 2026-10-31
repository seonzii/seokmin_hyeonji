import { redirect } from "next/navigation";
import { currentMonthKey, shiftMonth } from "@/lib/month";
import { createClient } from "@/lib/supabase/server";

/** 로그인한 사람과 그 사람의 집. 집에 연결이 안 돼 있으면 null */
export async function getHousehold() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("household_members")
    .select("household_id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    supabase,
    householdId: (data?.household_id as string | undefined) ?? null,
    me: (data?.display_name as string | undefined) ?? null,
  };
}

/** 정산 화면을 처음 열 때 그 달 행을 만든다 */
export async function ensureMonth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  month: string,
) {
  await supabase
    .from("months")
    .upsert(
      { household_id: householdId, month },
      { onConflict: "household_id,month", ignoreDuplicates: true },
    );
}

/**
 * 지금 정산할 달: 마지막으로 마감한 달의 다음 달.
 * 마감한 달이 없거나 그보다 이번 달이 늦으면 이번 달.
 */
export async function workingMonthKey(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
): Promise<string> {
  const now = currentMonthKey();
  const { data } = await supabase
    .from("months")
    .select("month")
    .eq("household_id", householdId)
    .eq("status", "closed")
    .order("month", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return now;
  const next = shiftMonth((data.month as string).slice(0, 7), 1);
  return next > now ? next : now;
}
