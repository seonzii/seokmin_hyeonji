"use server";

import { revalidatePath } from "next/cache";
import { fail, OK, type ActionResult } from "@/lib/action";
import { getHousehold } from "@/lib/household";
import { parseWon } from "@/lib/money";

const ACCOUNT_KINDS = ["source", "payment", "saving", "investment", "cash"];

function text(fd: FormData, name: string) {
  return String(fd.get(name) ?? "").trim();
}

function refresh() {
  revalidatePath("/settings/manage");
  revalidatePath("/settle", "layout");
  revalidatePath("/invest");
}

async function household(): Promise<{ supabase: Awaited<ReturnType<typeof getHousehold>>["supabase"]; householdId: string } | ActionResult> {
  const { supabase, householdId } = await getHousehold();
  if (!householdId) return fail("우리 집에 연결되지 않았어요");
  return { supabase, householdId };
}

function isHousehold<T extends { householdId: string }>(h: T | ActionResult): h is T {
  return "householdId" in h;
}

/* ---------- 계좌 ---------- */

function accountPatch(fd: FormData) {
  const name = text(fd, "name");
  const kind = text(fd, "kind");
  if (!name) return fail("계좌 이름을 넣어 주세요");
  if (!ACCOUNT_KINDS.includes(kind)) return fail("계좌 종류를 골라 주세요");
  return {
    name,
    kind,
    owner_name: text(fd, "owner") || null,
    reconcile: fd.get("reconcile") === "on",
    active: fd.get("active") !== "off",
  };
}

export async function addAccount(fd: FormData): Promise<ActionResult> {
  const h = await household();
  if (!isHousehold(h)) return h;
  const patch = accountPatch(fd);
  if ("ok" in patch) return patch;
  const { error } = await h.supabase.from("accounts").insert({ ...patch, household_id: h.householdId, sort_order: 50 });
  if (error) return fail(error);
  refresh();
  return OK;
}

export async function updateAccount(fd: FormData): Promise<ActionResult> {
  const h = await household();
  if (!isHousehold(h)) return h;
  const patch = accountPatch(fd);
  if ("ok" in patch) return patch;
  const { error } = await h.supabase.from("accounts").update(patch).eq("id", text(fd, "id")).eq("household_id", h.householdId);
  if (error) return fail(error);
  refresh();
  return OK;
}

/* ---------- 카드 ---------- */

function cardPatch(fd: FormData) {
  const name = text(fd, "name");
  if (!name) return fail("카드 이름을 넣어 주세요");
  return {
    name,
    owner_name: text(fd, "owner"),
    payment_account_id: text(fd, "payment_account_id") || null,
    active: fd.get("active") !== "off",
  };
}

export async function addCard(fd: FormData): Promise<ActionResult> {
  const h = await household();
  if (!isHousehold(h)) return h;
  const patch = cardPatch(fd);
  if ("ok" in patch) return patch;
  const { error } = await h.supabase.from("cards").insert({ ...patch, household_id: h.householdId, sort_order: 50 });
  if (error) return fail(error);
  refresh();
  return OK;
}

export async function updateCard(fd: FormData): Promise<ActionResult> {
  const h = await household();
  if (!isHousehold(h)) return h;
  const patch = cardPatch(fd);
  if ("ok" in patch) return patch;
  const { error } = await h.supabase.from("cards").update(patch).eq("id", text(fd, "id")).eq("household_id", h.householdId);
  if (error) return fail(error);
  refresh();
  return OK;
}

/* ---------- 고정지출 ---------- */

function templatePatch(fd: FormData) {
  const title = text(fd, "title");
  if (!title) return fail("항목 이름을 넣어 주세요");
  const amount = parseWon(fd.get("default_amount")) ?? 0;
  // "card:<id>" 또는 "account:<id>"
  const [via, id] = text(fd, "via").split(":");
  if (!id || (via !== "card" && via !== "account")) return fail("어디서 빠지는지 골라 주세요");
  return {
    title,
    default_amount: amount,
    owner_name: text(fd, "owner") || null,
    card_id: via === "card" ? id : null,
    account_id: via === "account" ? id : null,
    active: fd.get("active") !== "off",
  };
}

export async function addTemplate(fd: FormData): Promise<ActionResult> {
  const h = await household();
  if (!isHousehold(h)) return h;
  const patch = templatePatch(fd);
  if ("ok" in patch) return patch;
  const { error } = await h.supabase.from("fixed_templates").insert({ ...patch, household_id: h.householdId, sort_order: 50 });
  if (error) return fail(error);
  refresh();
  return OK;
}

export async function updateTemplate(fd: FormData): Promise<ActionResult> {
  const h = await household();
  if (!isHousehold(h)) return h;
  const patch = templatePatch(fd);
  if ("ok" in patch) return patch;
  const { error } = await h.supabase.from("fixed_templates").update(patch).eq("id", text(fd, "id")).eq("household_id", h.householdId);
  if (error) return fail(error);
  refresh();
  return OK;
}

/** 숨기기 / 다시 보이기 (지우지 않는다: 지난 달 기록이 가리키고 있을 수 있어서) */
export async function setActive(fd: FormData): Promise<ActionResult> {
  const h = await household();
  if (!isHousehold(h)) return h;
  const table = text(fd, "table");
  if (!["accounts", "cards", "fixed_templates"].includes(table)) return fail("잘못된 요청이에요");
  const { error } = await h.supabase
    .from(table)
    .update({ active: text(fd, "active") === "true" })
    .eq("id", text(fd, "id"))
    .eq("household_id", h.householdId);
  if (error) return fail(error);
  refresh();
  return OK;
}
