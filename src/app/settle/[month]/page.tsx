import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { AmountInput } from "@/components/amount-input";
import { AutoSaveField } from "@/components/auto-save";
import { DeleteButton, UndoProvider } from "@/components/undo-delete";
import {
  BottomNav,
  Card,
  CardTitle,
  GhostButton,
  inputClass,
  NotLinked,
  PageHeader,
  PrimaryButton,
  Row,
  selectClass,
} from "@/components/ui";
import { bookBalances } from "@/lib/balances";
import { ensureMonth, getHousehold } from "@/lib/household";
import { won } from "@/lib/money";
import { isMonthKey, monthDate, monthParts, shiftMonth } from "@/lib/month";
import {
  addCardItem,
  addIncome,
  addAdjustment,
  addSaving,
  confirmFixed,
  deleteRow,
  restoreRow,
  saveBalance,
  saveCardTotal,
  saveCash,
  setMonthStatus,
} from "./actions";

export const dynamic = "force-dynamic";

type Account = { id: string; name: string; kind: string };
type CardRow = { id: string; name: string; owner_name: string; payment_account_id: string | null };
type Template = {
  id: string;
  title: string;
  default_amount: number;
  owner_name: string | null;
  card_id: string | null;
  account_id: string | null;
};
type Income = { id: string; owner_name: string; kind: string; title: string; amount: number };
type Bill = { id: string; card_id: string; total: number };
type Item = {
  id: string;
  kind: "expense" | "fixed";
  title: string;
  amount: number;
  card_bill_id: string | null;
  account_id: string | null;
  owner_name: string | null;
  template_id: string | null;
};
type Saving = {
  id: string;
  owner_name: string;
  kind: "saving" | "investment";
  amount: number;
  from_account_id: string;
  to_account_id: string;
};

const OWNERS = ["석민", "현지"];
const INCOME_KIND: Record<string, string> = { salary: "월급", dutch: "더치", other: "기타" };
const SECTIONS = [
  ["income", "수입"],
  ["cards", "카드"],
  ["fixed", "고정지출"],
  ["saving", "저축"],
  ["cash", "현금"],
  ["check", "대조·마감"],
] as const;

export default async function SettlePage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month: key } = await params;
  if (!isMonthKey(key)) notFound();
  const { year, month, en } = monthParts(key);
  const m = monthDate(key);
  const prev = monthDate(shiftMonth(key, -1));

  const { supabase, householdId } = await getHousehold();
  const header = (
    <PageHeader
      eyebrow={`${year} · ${en}`}
      title={`${month}월 정산`}
      right={
        <div className="flex gap-1 text-sm text-brown">
          <Link className="flex size-11 items-center justify-center" href={`/settle/${shiftMonth(key, -1)}`} aria-label="이전 달">‹</Link>
          <Link className="flex size-11 items-center justify-center" href={`/settle/${shiftMonth(key, 1)}`} aria-label="다음 달">›</Link>
        </div>
      }
    />
  );
  if (!householdId) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 px-5 pt-6 pb-24">
        {header}
        <NotLinked />
        <BottomNav active="/settle" />
      </main>
    );
  }

  await ensureMonth(supabase, householdId, m);
  const h = householdId;
  const [acc, crd, tpl, inc, bil, itm, prevItm, sav, mon, chk, adj, books] = await Promise.all([
    supabase.from("accounts").select("id, name, kind").eq("household_id", h).eq("active", true).order("sort_order"),
    supabase.from("cards").select("id, name, owner_name, payment_account_id").eq("household_id", h).eq("active", true).order("sort_order"),
    supabase.from("fixed_templates").select("*").eq("household_id", h).eq("active", true).order("sort_order"),
    supabase.from("incomes").select("*").eq("household_id", h).eq("month", m).order("created_at"),
    supabase.from("card_bills").select("id, card_id, total").eq("household_id", h).eq("month", m),
    supabase.from("expense_items").select("*").eq("household_id", h).eq("month", m).order("created_at"),
    supabase.from("expense_items").select("template_id, amount").eq("household_id", h).eq("month", prev).not("template_id", "is", null),
    supabase.from("savings").select("*").eq("household_id", h).eq("month", m),
    supabase.from("months").select("gift_cash, new_cash, note, status").eq("household_id", h).eq("month", m).single(),
    supabase.from("balance_checks").select("account_id, actual").eq("household_id", h).eq("month", m),
    supabase.from("adjustments").select("id, account_id, amount, memo").eq("household_id", h).eq("month", m),
    bookBalances(supabase, h, m),
  ]);

  const accounts = (acc.data ?? []) as Account[];
  const cards = (crd.data ?? []) as CardRow[];
  const templates = (tpl.data ?? []) as Template[];
  const incomes = (inc.data ?? []) as Income[];
  const bills = (bil.data ?? []) as Bill[];
  const items = (itm.data ?? []) as Item[];
  const savings = (sav.data ?? []) as Saving[];
  const monthRow = mon.data as { gift_cash: number; new_cash: number; note: string | null; status: string } | null;
  const closed = monthRow?.status === "closed";
  const checks = new Map(
    ((chk.data ?? []) as { account_id: string; actual: number }[]).map((c) => [c.account_id, Number(c.actual)]),
  );
  const adjustments = (adj.data ?? []) as { id: string; account_id: string; amount: number; memo: string }[];

  const accName = (id: string | null) => accounts.find((a) => a.id === id)?.name ?? "";
  const cardName = (id: string | null) => cards.find((c) => c.id === id)?.name ?? "";

  const incomeTotal = incomes.reduce((s, r) => s + Number(r.amount), 0);
  const thisFixed = new Map(items.filter((i) => i.template_id).map((i) => [i.template_id!, Number(i.amount)]));
  const prevFixed = new Map(
    ((prevItm.data ?? []) as { template_id: string; amount: number }[]).map((i) => [i.template_id, Number(i.amount)]),
  );
  const fixedConfirmed = thisFixed.size > 0;
  const fixedTotal = items.filter((i) => i.kind === "fixed").reduce((s, i) => s + Number(i.amount), 0);
  const savingTotal = savings.reduce((s, r) => s + Number(r.amount), 0);
  const kakao = accounts.find((a) => a.kind === "source");

  let cardExpense = 0;
  const cardViews = cards.map((c) => {
    const bill = bills.find((b) => b.card_id === c.id);
    const its = bill ? items.filter((i) => i.card_bill_id === bill.id) : [];
    const detail = its.reduce((s, i) => s + Number(i.amount), 0);
    const total = Number(bill?.total ?? 0);
    const living = total - detail;
    cardExpense += living + its.filter((i) => i.kind === "expense").reduce((s, i) => s + Number(i.amount), 0);
    return { card: c, bill, items: its, total, living };
  });

  const hidden = <input type="hidden" name="month" value={key} />;
  const del = (table: string, id: string) => (
    <DeleteButton fields={{ month: key, table, id }} disabled={closed} />
  );

  return (
    <UndoProvider deleteAction={deleteRow} restoreAction={restoreRow}>
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 px-5 pt-6 pb-24">
      {header}

      <nav className="-mx-5 flex gap-2 overflow-x-auto px-5">
        {SECTIONS.map(([id, label], i) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex h-9 shrink-0 items-center rounded-full border border-line-strong bg-card px-3.5 text-[13px] text-muted"
          >
            {i + 1}. {label}
          </a>
        ))}
      </nav>

      {closed && (
        <div className="rounded-xl bg-caramel-tint px-4 py-3 text-sm text-caramel-deep">
          {month}월은 마감했어요. 고치려면 맨 아래에서 마감을 풀어 주세요.
        </div>
      )}

      <fieldset disabled={closed} className="contents">
      {/* 1. 수입 */}
      <Card id="income" className="scroll-mt-4">
        <CardTitle right={won(incomeTotal)}>1. 수입</CardTitle>
        {incomes.map((r) => (
          <Row
            key={r.id}
            label={r.title}
            sub={`${r.owner_name} · ${INCOME_KIND[r.kind] ?? r.kind}`}
            value={won(r.amount)}
            action={del("incomes", r.id)}
          />
        ))}
        <ActionForm action={addIncome} resetOnSuccess className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
          {hidden}
          <select name="owner" className={selectClass} aria-label="누구">
            {OWNERS.map((o) => <option key={o}>{o}</option>)}
          </select>
          <select name="kind" className={selectClass} aria-label="종류">
            {Object.entries(INCOME_KIND).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input name="title" placeholder="항목 (월급, 더치…)" className={inputClass} required />
          <AmountInput name="amount" placeholder="금액" className={inputClass} required />
          <GhostButton type="submit" className="col-span-2">+ 수입 추가</GhostButton>
        </ActionForm>
      </Card>

      {/* 2. 카드 */}
      <section id="cards" className="flex scroll-mt-4 flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-[15px] font-semibold">2. 카드</h2>
          <span className="text-xs text-muted">청구 총액과 큰 항목만 입력</span>
        </div>
        {cardViews.map(({ card, items: its, total, living }) => (
          <Card key={card.id}>
            <CardTitle right={won(total)}>
              {card.name}
              <span className="ml-1.5 text-xs font-normal text-muted">
                {card.owner_name} · {accName(card.payment_account_id)}
              </span>
            </CardTitle>
            <div className="mb-2 flex gap-2">
              <AutoSaveField
                action={saveCardTotal}
                fields={{ month: key, card_id: card.id }}
                name="total"
                amount
                defaultValue={total ? won(total) : ""}
                placeholder="청구 총액 (입력하면 저장돼요)"
                aria-label={`${card.name} 청구 총액`}
                className={inputClass}
                disabled={closed}
              />
            </div>
            {its.map((i) => (
              <Row
                key={i.id}
                label={i.title}
                sub={i.kind === "fixed" ? "고정지출" : undefined}
                value={won(i.amount)}
                action={i.template_id ? undefined : del("expense_items", i.id)}
              />
            ))}
            <ActionForm action={addCardItem} resetOnSuccess className="mt-2 flex flex-wrap gap-2">
              {hidden}
              <input type="hidden" name="card_id" value={card.id} />
              <input type="hidden" name="kind" value="expense" />
              <input name="title" placeholder="큰 항목" className={`${inputClass} min-w-0 flex-1`} required />
              <AmountInput name="amount" placeholder="금액" className={`${inputClass} w-28`} required />
              <GhostButton type="submit" aria-label="큰 항목 추가">+</GhostButton>
            </ActionForm>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-caramel-tint px-3 py-2.5 text-sm text-caramel-deep">
              <span>생활비 (자동 계산)</span>
              <span className={living < 0 ? "text-warn" : ""}>{won(living)}</span>
            </div>
          </Card>
        ))}
        <div className="flex items-center justify-between rounded-2xl bg-brown px-4 py-3.5 text-paper">
          <span className="text-sm">카드 지출 합계 (고정 제외)</span>
          <span className="font-semibold">{won(cardExpense)}</span>
        </div>
      </section>

      {/* 3. 고정지출 */}
      <Card id="fixed" className="scroll-mt-4">
        <CardTitle right={won(fixedTotal)}>3. 고정지출</CardTitle>
        <p className="mb-2 text-xs text-muted">
          {fixedConfirmed
            ? "확정했어요. 금액을 고치고 다시 확정할 수 있어요."
            : "지난달 금액을 채워 뒀어요. 바뀐 것만 고치고 확정하세요."}
        </p>
        <ActionForm action={confirmFixed}>
          {hidden}
          {templates.map((t) => {
            const v = thisFixed.get(t.id) ?? prevFixed.get(t.id) ?? Number(t.default_amount);
            return (
              <div key={t.id} className="flex min-h-12 items-center gap-2 border-t border-line py-1.5 first-of-type:border-t-0">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{t.title}</div>
                  <div className="truncate text-xs text-muted">
                    {t.owner_name} · {t.card_id ? cardName(t.card_id) : accName(t.account_id)}
                  </div>
                </div>
                <AmountInput
                  name={`amount_${t.id}`}
                  defaultValue={v ? won(v) : ""}
                  aria-label={`${t.title} 금액`}
                  className={`${inputClass} w-32 text-right`}
                />
              </div>
            );
          })}
          <PrimaryButton type="submit" className="mt-3 w-full">
            {fixedConfirmed ? "다시 확정" : `${month}월 고정지출 확정`}
          </PrimaryButton>
        </ActionForm>
      </Card>

      {/* 4. 저축 · 투자 */}
      <Card id="saving" className="scroll-mt-4">
        <CardTitle right={won(savingTotal)}>4. 저축 · 투자</CardTitle>
        {savings.map((s) => (
          <Row
            key={s.id}
            label={`${s.kind === "investment" ? "투자" : "저축"} · ${accName(s.to_account_id)}`}
            sub={`${s.owner_name} · ${accName(s.from_account_id)}에서`}
            value={won(s.amount)}
            action={del("savings", s.id)}
          />
        ))}
        <ActionForm action={addSaving} resetOnSuccess className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
          {hidden}
          <select name="owner" className={selectClass} aria-label="누구">
            {OWNERS.map((o) => <option key={o}>{o}</option>)}
          </select>
          <select name="kind" className={selectClass} aria-label="종류">
            <option value="saving">저축</option>
            <option value="investment">투자</option>
          </select>
          <label className="col-span-2 flex flex-col gap-1 text-xs text-muted">
            빠진 계좌
            <select name="from" defaultValue={kakao?.id} className={selectClass}>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label className="col-span-2 flex flex-col gap-1 text-xs text-muted">
            들어간 계좌
            <select name="to" className={selectClass}>
              {accounts
                .filter((a) => a.kind === "saving" || a.kind === "investment")
                .map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <AmountInput name="amount" placeholder="금액" className={`${inputClass} col-span-2`} required />
          <GhostButton type="submit" className="col-span-2">+ 저축 · 투자 추가</GhostButton>
        </ActionForm>
      </Card>

      {/* 5. 현금 */}
      <Card id="cash" className="scroll-mt-4">
        <CardTitle>5. 현금</CardTitle>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="shrink-0">축의금 (현금 지출)</span>
            <div className="w-40">
              <AutoSaveField action={saveCash} fields={{ month: key }} name="gift_cash" amount defaultValue={monthRow?.gift_cash ? won(monthRow.gift_cash) : ""} placeholder="0" aria-label="축의금" className={`${inputClass} text-right`} disabled={closed} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="shrink-0">집 보관 현금 증감</span>
            <div className="w-40">
              <AutoSaveField action={saveCash} fields={{ month: key }} name="new_cash" amount defaultValue={monthRow?.new_cash ? won(monthRow.new_cash) : ""} placeholder="0" aria-label="집 보관 현금 증감" className={`${inputClass} text-right`} disabled={closed} />
            </div>
          </div>
          <AutoSaveField action={saveCash} fields={{ month: key }} name="note" defaultValue={monthRow?.note ?? ""} placeholder="메모" aria-label="메모" className={inputClass} disabled={closed} />
          <p className="text-xs text-muted">입력하고 다른 곳을 누르면 저장돼요.</p>
        </div>
      </Card>

      </fieldset>

      {/* 6. 잔액 대조 · 마감 */}
      <Card id="check" className="scroll-mt-4">
        <CardTitle>6. 잔액 대조 · 마감</CardTitle>
        <p className="mb-3 text-xs text-muted">
          은행 앱의 실제 잔액을 입력하면 장부와 차이를 보여줘요.
        </p>
        {books.map(({ account, book }) => {
          const actual = checks.get(account.id);
          const diff = actual === undefined ? null : actual - book;
          return (
            <div key={account.id} className="border-t border-line py-3 first-of-type:border-t-0">
              <div className="flex items-baseline justify-between text-sm">
                <span>{account.name}</span>
                <span className="text-muted">장부 {won(book)}</span>
              </div>
              <div className="mt-2 flex gap-2">
                <AutoSaveField
                  action={saveBalance}
                  fields={{ month: key, account_id: account.id }}
                  name="actual"
                  amount
                  defaultValue={actual === undefined ? "" : won(actual)}
                  placeholder="실제 잔액 (입력하면 저장돼요)"
                  aria-label={`${account.name} 실제 잔액`}
                  className={inputClass}
                />
              </div>
              <div
                className={`mt-2 rounded-lg px-3 py-2 text-[13px] ${
                  diff === null
                    ? "bg-paper text-muted"
                    : diff === 0
                      ? "bg-caramel-tint text-caramel-deep"
                      : "bg-warn-tint text-warn"
                }`}
              >
                {diff === null
                  ? "실제 잔액을 입력하세요"
                  : diff === 0
                    ? "일치해요"
                    : `차이 ${diff > 0 ? "+" : "−"}${won(Math.abs(diff))}원 · 빠진 항목이 있는지 확인하거나 보정을 넣으세요`}
              </div>
            </div>
          );
        })}

        <details className="mt-2 border-t border-line pt-3">
          <summary className="cursor-pointer text-sm text-caramel-deep">
            보정 {adjustments.length ? `${adjustments.length}건` : "추가"} (대출 상환처럼 장부 밖에서 오간 돈)
          </summary>
          {adjustments.map((j) => (
            <Row
              key={j.id}
              label={j.memo}
              sub={accName(j.account_id)}
              value={`${j.amount > 0 ? "+" : "−"}${won(Math.abs(j.amount))}`}
              action={closed ? undefined : del("adjustments", j.id)}
            />
          ))}
          <ActionForm action={addAdjustment} resetOnSuccess className="mt-2 grid grid-cols-2 gap-2">
            {hidden}
            <select name="account_id" className={`${selectClass} col-span-2`} aria-label="계좌">
              {books.map(({ account }) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
            <AmountInput name="amount" placeholder="금액 (빠지면 -)" className={inputClass} required disabled={closed} />
            <input name="memo" placeholder="메모" className={inputClass} required disabled={closed} />
            <GhostButton type="submit" className="col-span-2" disabled={closed}>+ 보정 추가</GhostButton>
          </ActionForm>
        </details>

        <ActionForm action={setMonthStatus} className="mt-4">
          {hidden}
          <input type="hidden" name="status" value={closed ? "draft" : "closed"} />
          {closed ? (
            <GhostButton type="submit" className="w-full">마감 풀기</GhostButton>
          ) : (
            <PrimaryButton type="submit" className="w-full">{month}월 마감하기</PrimaryButton>
          )}
          <p className="mt-2 text-center text-xs text-muted">
            마감하면 {month}월은 잠기고, 장부 잔액이 다음 달로 이어져요
          </p>
        </ActionForm>
      </Card>

      <BottomNav active="/settle" />
    </main>
    </UndoProvider>
  );
}
