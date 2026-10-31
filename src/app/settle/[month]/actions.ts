"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fail, OK, type ActionResult } from "@/lib/action";
import { getHousehold } from "@/lib/household";
import { parseWon } from "@/lib/money";
import { isMonthKey, monthDate } from "@/lib/month";

type Ctx = {
  supabase: Awaited<ReturnType<typeof getHousehold>>["supabase"];
  householdId: string;
  key: string;
  month: string;
};

async function context(fd: FormData): Promise<Ctx | ActionResult> {
  const key = String(fd.get("month") ?? "");
  if (!isMonthKey(key)) return fail("잘못된 달이에요");
  const { supabase, householdId } = await getHousehold();
  if (!householdId) return fail("우리 집에 연결되지 않았어요");
  return { supabase, householdId, key, month: monthDate(key) };
}

function isCtx(c: Ctx | ActionResult): c is Ctx {
  return "supabase" in c;
}

function done(key: string) {
  revalidatePath(`/settle/${key}`);
  revalidatePath("/");
  revalidatePath("/overview");
}

function text(fd: FormData, name: string) {
  return String(fd.get(name) ?? "").trim();
}

/** 서버 액션 공통 틀: 달 확인 → 작업 → 화면 갱신. 예외는 안내문으로 */
async function run(fd: FormData, work: (c: Ctx) => Promise<ActionResult | void>): Promise<ActionResult> {
  const c = await context(fd);
  if (!isCtx(c)) return c;
  try {
    const r = await work(c);
    if (r && !r.ok) return r;
    done(c.key);
    return r ?? OK;
  } catch (e) {
    return fail(e instanceof Error ? { message: e.message } : null);
  }
}

export async function addIncome(fd: FormData) {
  return run(fd, async ({ supabase, householdId, month }) => {
    const amount = parseWon(fd.get("amount"));
    const title = text(fd, "title");
    if (amount === null || amount < 0) return fail("금액을 숫자로 넣어 주세요");
    if (!title) return fail("항목 이름을 넣어 주세요");
    const { error } = await supabase.from("incomes").insert({
      household_id: householdId,
      month,
      owner_name: text(fd, "owner"),
      kind: text(fd, "kind"),
      title,
      amount,
    });
    if (error) return fail(error);
  });
}

const DELETABLE = ["incomes", "expense_items", "savings", "adjustments"];

/** 지우기 전에 그 줄을 읽어 두었다가 돌려준다 (되돌리기용) */
export async function deleteRow(fd: FormData) {
  const c = await context(fd);
  if (!isCtx(c)) return c;
  const table = text(fd, "table");
  const id = text(fd, "id");
  if (!DELETABLE.includes(table)) return fail("지울 수 없는 항목이에요");
  const { data: row, error: readError } = await c.supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .eq("household_id", c.householdId)
    .maybeSingle();
  if (readError) return fail(readError);
  if (!row) return fail("이미 지워진 항목이에요");
  const { error } = await c.supabase.from(table).delete().eq("id", id).eq("household_id", c.householdId);
  if (error) return fail(error);
  done(c.key);
  return { ok: true as const, deleted: { table, row: row as Record<string, unknown> } };
}

/** 되돌리기: 지웠던 줄을 같은 id로 다시 넣는다 */
export async function restoreRow(fd: FormData): Promise<ActionResult> {
  const table = text(fd, "table");
  if (!DELETABLE.includes(table)) return fail("되돌릴 수 없는 항목이에요");
  let row: Record<string, unknown>;
  try {
    row = JSON.parse(text(fd, "row"));
  } catch {
    return fail("되돌릴 정보가 없어요");
  }
  const { supabase, householdId } = await getHousehold();
  if (!householdId || row.household_id !== householdId) return fail("되돌릴 수 없어요");
  const { error } = await supabase.from(table).insert(row);
  if (error) return fail(error);
  done(String(row.month).slice(0, 7));
  return OK;
}

/** 그 달 카드 청구 행이 없으면 0원으로 만들고 id를 돌려준다 */
async function billId({ supabase, householdId, month }: Ctx, cardId: string): Promise<string | null> {
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
  return run(fd, async (c) => {
    const total = parseWon(fd.get("total")) ?? 0;
    if (total < 0) return fail("청구 총액은 0 이상이어야 해요");
    const { error } = await c.supabase.from("card_bills").upsert(
      { household_id: c.householdId, month: c.month, card_id: text(fd, "card_id"), total },
      { onConflict: "household_id,month,card_id" },
    );
    if (error) return fail(error);
  });
}

export async function addCardItem(fd: FormData) {
  return run(fd, async (c) => {
    const amount = parseWon(fd.get("amount"));
    const title = text(fd, "title");
    if (amount === null || amount < 0) return fail("금액을 숫자로 넣어 주세요");
    if (!title) return fail("항목 이름을 넣어 주세요");
    const bill = await billId(c, text(fd, "card_id"));
    if (!bill) return fail("카드 청구 행을 만들지 못했어요");
    const { error } = await c.supabase.from("expense_items").insert({
      household_id: c.householdId,
      month: c.month,
      kind: text(fd, "kind") === "fixed" ? "fixed" : "expense",
      title,
      amount,
      card_bill_id: bill,
    });
    if (error) return fail(error);
  });
}

/** 고정지출 확정: 그 달 템플릿 항목을 지우고 입력한 금액으로 다시 쓴다 */
export async function confirmFixed(fd: FormData) {
  return run(fd, async (c) => {
    const { supabase, householdId, month } = c;
    const { data: templates, error: tErr } = await supabase
      .from("fixed_templates")
      .select("id, title, owner_name, card_id, account_id")
      .eq("household_id", householdId)
      .eq("active", true);
    if (tErr) return fail(tErr);

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
        card_bill_id: t.card_id ? await billId(c, t.card_id) : null,
        account_id: t.card_id ? null : t.account_id,
      });
    }

    const { error: dErr } = await supabase
      .from("expense_items")
      .delete()
      .eq("household_id", householdId)
      .eq("month", month)
      .not("template_id", "is", null);
    if (dErr) return fail(dErr);
    if (rows.length) {
      const { error } = await supabase.from("expense_items").insert(rows);
      if (error) return fail(error);
    }
  });
}

export async function addSaving(fd: FormData) {
  return run(fd, async ({ supabase, householdId, month }) => {
    const amount = parseWon(fd.get("amount"));
    if (amount === null || amount <= 0) return fail("금액을 숫자로 넣어 주세요");
    const from = text(fd, "from");
    const to = text(fd, "to");
    if (!from || !to) return fail("계좌를 골라 주세요");
    if (from === to) return fail("빠진 계좌와 들어간 계좌가 같아요");
    const { error } = await supabase.from("savings").insert({
      household_id: householdId,
      month,
      owner_name: text(fd, "owner"),
      kind: text(fd, "kind") === "investment" ? "investment" : "saving",
      amount,
      from_account_id: from,
      to_account_id: to,
    });
    if (error) return fail(error);
  });
}

/** 현금 칸: 보낸 값만 고친다 (칸마다 따로 자동 저장) */
export async function saveCash(fd: FormData) {
  return run(fd, async ({ supabase, householdId, month }) => {
    const patch: Record<string, unknown> = {};
    if (fd.has("gift_cash")) patch.gift_cash = parseWon(fd.get("gift_cash")) ?? 0;
    if (fd.has("new_cash")) patch.new_cash = parseWon(fd.get("new_cash")) ?? 0;
    if (fd.has("note")) patch.note = text(fd, "note") || null;
    if (!Object.keys(patch).length) return;
    const { error } = await supabase
      .from("months")
      .update(patch)
      .eq("household_id", householdId)
      .eq("month", month);
    if (error) return fail(error);
  });
}

export async function saveBalance(fd: FormData) {
  return run(fd, async ({ supabase, householdId, month }) => {
    const actual = parseWon(fd.get("actual"));
    const accountId = text(fd, "account_id");
    const q =
      actual === null
        ? supabase
            .from("balance_checks")
            .delete()
            .eq("household_id", householdId)
            .eq("month", month)
            .eq("account_id", accountId)
        : supabase.from("balance_checks").upsert(
            { household_id: householdId, month, account_id: accountId, actual, checked_at: new Date().toISOString() },
            { onConflict: "household_id,month,account_id" },
          );
    const { error } = await q;
    if (error) return fail(error);
  });
}

export async function addAdjustment(fd: FormData) {
  return run(fd, async ({ supabase, householdId, month }) => {
    const amount = parseWon(fd.get("amount"));
    const memo = text(fd, "memo");
    if (amount === null || amount === 0) return fail("금액을 넣어 주세요 (빠지면 -)");
    if (!memo) return fail("메모를 넣어 주세요");
    const { error } = await supabase.from("adjustments").insert({
      household_id: householdId,
      month,
      account_id: text(fd, "account_id"),
      amount,
      memo,
    });
    if (error) return fail(error);
  });
}

export async function setMonthStatus(fd: FormData) {
  const closed = text(fd, "status") === "closed";
  const r = await run(fd, async ({ supabase, householdId, month }) => {
    const { error } = await supabase
      .from("months")
      .update({ status: closed ? "closed" : "draft", closed_at: closed ? new Date().toISOString() : null })
      .eq("household_id", householdId)
      .eq("month", month);
    if (error) return fail(error);
    revalidatePath("/history");
  });
  // 마감하면 정산개요가 다음 달을 보여준다
  if (r.ok && closed) redirect("/overview");
  return r;
}
