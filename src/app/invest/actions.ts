"use server";

import { revalidatePath } from "next/cache";
import { getHousehold } from "@/lib/household";
import { parseWon } from "@/lib/money";
import { isMonthKey, monthDate } from "@/lib/month";

/** 그 달 평가금액 기록. 비워 둔 계좌는 건너뛰어서 지난 기록이 그대로 이어진다 */
export async function saveSnapshots(fd: FormData) {
  const key = String(fd.get("month") ?? "");
  if (!isMonthKey(key)) return;
  const { supabase, householdId } = await getHousehold();
  if (!householdId) return;

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id")
    .eq("household_id", householdId)
    .eq("kind", "investment");

  const rows = [];
  for (const a of accounts ?? []) {
    const valuation = parseWon(fd.get(`value_${a.id}`));
    if (valuation === null) continue;
    rows.push({
      household_id: householdId,
      month: monthDate(key),
      account_id: a.id,
      valuation,
      principal: parseWon(fd.get(`principal_${a.id}`)),
    });
  }
  if (rows.length) {
    await supabase
      .from("investment_snapshots")
      .upsert(rows, { onConflict: "household_id,month,account_id" });
  }
  revalidatePath("/invest");
}

export async function addInvestAccount(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const owner = String(fd.get("owner") ?? "");
  if (!name) return;
  const { supabase, householdId } = await getHousehold();
  if (!householdId) return;
  await supabase.from("accounts").insert({
    household_id: householdId,
    name,
    owner_name: owner,
    kind: "investment",
    sort_order: 50,
  });
  revalidatePath("/invest");
}
