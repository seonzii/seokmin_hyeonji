"use server";

import { revalidatePath } from "next/cache";
import { getHousehold } from "@/lib/household";
import { parseWon } from "@/lib/money";
import { isMonthKey, monthDate } from "@/lib/month";

async function context(fd: FormData) {
  const key = String(fd.get("month") ?? "");
  if (!isMonthKey(key)) throw new Error("잘못된 달");
  const { supabase, householdId } = await getHousehold();
  if (!householdId) throw new Error("우리 집에 연결되지 않았어요");
  return { supabase, householdId, key, month: monthDate(key) };
}

function done(key: string) {
  revalidatePath(`/settle/${key}`);
  revalidatePath("/");
}

function text(fd: FormData, name: string) {
  return String(fd.get(name) ?? "").trim();
}

export async function addIncome(fd: FormData) {
  const { supabase, householdId, key, month } = await context(fd);
  const amount = parseWon(fd.get("amount"));
  const title = text(fd, "title");
  if (amount === null || amount < 0 || !title) return;
  await supabase.from("incomes").insert({
    household_id: householdId,
    month,
    owner_name: text(fd, "owner"),
    kind: text(fd, "kind"),
    title,
    amount,
  });
  done(key);
}

export async function deleteRow(fd: FormData) {
  const { supabase, householdId, key } = await context(fd);
  const table = text(fd, "table");
  if (!["incomes", "expense_items", "savings"].includes(table)) return;
  await supabase
    .from(table)
    .delete()
    .eq("id", text(fd, "id"))
    .eq("household_id", householdId);
  done(key);
}

/** 그 달 카드 청구 행이 없으면 0원으로 만들고 id를 돌려준다 */
async function billId(
  ctx: Awaited<ReturnType<typeof context>>,
  cardId: string,
): Promise<string | null> {
  const { supabase, householdId, month } = ctx;
  await supabase
    .from("card_bills")
    .upsert(
      { household_id: householdId, month, card_id: cardId, total: 0 },
      { onConflict: "household_id,month,card_id", ignoreDuplicates: true },
    );
  const { data } = await supabase
    .from("card_bills")
    .select("id")
    .eq("household_id", householdId)
    .eq("month", month)
    .eq("card_id", cardId)
    .single();
  return (data?.id as string | undefined) ?? null;
}

export async function saveCardTotal(fd: FormData) {
  const ctx = await context(fd);
  const total = parseWon(fd.get("total"));
  if (total === null || total < 0) return;
  await ctx.supabase.from("card_bills").upsert(
    {
      household_id: ctx.householdId,
      month: ctx.month,
      card_id: text(fd, "card_id"),
      total,
    },
    { onConflict: "household_id,month,card_id" },
  );
  done(ctx.key);
}

export async function addCardItem(fd: FormData) {
  const ctx = await context(fd);
  const amount = parseWon(fd.get("amount"));
  const title = text(fd, "title");
  if (amount === null || amount < 0 || !title) return;
  const bill = await billId(ctx, text(fd, "card_id"));
  if (!bill) return;
  await ctx.supabase.from("expense_items").insert({
    household_id: ctx.householdId,
    month: ctx.month,
    kind: text(fd, "kind") === "fixed" ? "fixed" : "expense",
    title,
    amount,
    card_bill_id: bill,
  });
  done(ctx.key);
}

/** 고정지출 확정: 그 달 템플릿 항목을 지우고 입력한 금액으로 다시 쓴다 */
export async function confirmFixed(fd: FormData) {
  const ctx = await context(fd);
  const { supabase, householdId, month } = ctx;

  const { data: templates } = await supabase
    .from("fixed_templates")
    .select("id, title, owner_name, card_id, account_id")
    .eq("household_id", householdId)
    .eq("active", true);

  const rows = [];
  for (const t of templates ?? []) {
    const amount = parseWon(fd.get(`amount_${t.id}`));
    if (amount === null || amount <= 0) continue;
    rows.push({
      household_id: householdId,
      month,
      kind: "fixed",
      title: t.title,
      amount,
      owner_name: t.owner_name,
      template_id: t.id,
      card_bill_id: t.card_id ? await billId(ctx, t.card_id) : null,
      account_id: t.card_id ? null : t.account_id,
    });
  }

  await supabase
    .from("expense_items")
    .delete()
    .eq("household_id", householdId)
    .eq("month", month)
    .not("template_id", "is", null);
  if (rows.length) await supabase.from("expense_items").insert(rows);
  done(ctx.key);
}

export async function addSaving(fd: FormData) {
  const { supabase, householdId, key, month } = await context(fd);
  const amount = parseWon(fd.get("amount"));
  if (amount === null || amount <= 0) return;
  await supabase.from("savings").insert({
    household_id: householdId,
    month,
    owner_name: text(fd, "owner"),
    kind: text(fd, "kind") === "investment" ? "investment" : "saving",
    amount,
    from_account_id: text(fd, "from"),
    to_account_id: text(fd, "to"),
  });
  done(key);
}

export async function saveCash(fd: FormData) {
  const { supabase, householdId, key, month } = await context(fd);
  await supabase
    .from("months")
    .update({
      gift_cash: parseWon(fd.get("gift_cash")) ?? 0,
      new_cash: parseWon(fd.get("new_cash")) ?? 0,
      note: text(fd, "note") || null,
    })
    .eq("household_id", householdId)
    .eq("month", month);
  done(key);
}
