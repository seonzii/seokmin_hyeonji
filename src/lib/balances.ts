import type { createClient } from "@/lib/supabase/server";
import { spending, type MonthSummary } from "@/lib/summary";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type BookAccount = {
  id: string;
  name: string;
  kind: string;
  opening_balance: number;
  opening_month: string | null;
};

/**
 * 대조 대상 계좌(카뱅, 결혼하자)의 그 달 말 장부 잔액.
 * 엑셀 총자산 현황과 같은 규칙:
 *   원천 통장 = 이전 + 수입 − 지출 − 고정 − 축의금 − 이 통장에서 빠진 저축·투자 + 보정
 *   그 외     = 이전 + 들어온 저축·투자 − 빠진 저축·투자 + 보정
 */
export async function bookBalances(
  supabase: Supabase,
  householdId: string,
  month: string,
): Promise<{ account: BookAccount; book: number }[]> {
  const { data: accData } = await supabase
    .from("accounts")
    .select("id, name, kind, opening_balance, opening_month")
    .eq("household_id", householdId)
    .eq("reconcile", true)
    .order("sort_order");
  const accounts = (accData ?? []) as BookAccount[];
  if (!accounts.length) return [];

  const start = accounts
    .map((a) => a.opening_month ?? month)
    .reduce((a, b) => (a < b ? a : b));

  const [sum, inc, sav, adj] = await Promise.all([
    supabase.from("month_summary").select("*").eq("household_id", householdId).gte("month", start).lte("month", month),
    supabase.from("incomes").select("month, amount, account_id").eq("household_id", householdId).gte("month", start).lte("month", month),
    supabase.from("savings").select("month, amount, from_account_id, to_account_id").eq("household_id", householdId).gte("month", start).lte("month", month),
    supabase.from("adjustments").select("month, amount, account_id").eq("household_id", householdId).gte("month", start).lte("month", month),
  ]);
  const summaries = (sum.data ?? []) as MonthSummary[];
  const incomes = (inc.data ?? []) as { month: string; amount: number; account_id: string | null }[];
  const savings = (sav.data ?? []) as { month: string; amount: number; from_account_id: string; to_account_id: string }[];
  const adjustments = (adj.data ?? []) as { month: string; amount: number; account_id: string }[];

  const source = accounts.find((a) => a.kind === "source");

  return accounts.map((a) => {
    const from = a.opening_month ?? month;
    const inRange = (m: string) => m >= from && m <= month;
    let book = Number(a.opening_balance);

    if (a.id === source?.id) {
      for (const s of summaries) if (inRange(s.month)) book -= spending(s);
    }
    for (const i of incomes) {
      if (!inRange(i.month)) continue;
      // 계좌를 안 고른 수입은 원천 통장으로 들어온 것으로 본다
      if (i.account_id === a.id || (!i.account_id && a.id === source?.id)) book += Number(i.amount);
    }
    for (const s of savings) {
      if (!inRange(s.month)) continue;
      if (s.from_account_id === a.id) book -= Number(s.amount);
      if (s.to_account_id === a.id) book += Number(s.amount);
    }
    for (const j of adjustments) {
      if (inRange(j.month) && j.account_id === a.id) book += Number(j.amount);
    }
    return { account: a, book };
  });
}
