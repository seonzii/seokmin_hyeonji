import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { AmountInput } from "@/components/amount-input";
import { BottomNav, Card, CardTitle, GhostButton, inputClass, NotLinked, PageHeader, PrimaryButton, selectClass } from "@/components/ui";
import { getHousehold } from "@/lib/household";
import { won } from "@/lib/money";
import { addAccount, addCard, addTemplate, setActive, updateAccount, updateCard, updateTemplate } from "./actions";

export const dynamic = "force-dynamic";

type Account = { id: string; name: string; owner_name: string | null; kind: string; reconcile: boolean; active: boolean };
type CardRow = { id: string; name: string; owner_name: string; payment_account_id: string | null; active: boolean };
type Template = {
  id: string;
  title: string;
  default_amount: number;
  owner_name: string | null;
  card_id: string | null;
  account_id: string | null;
  active: boolean;
};

const OWNERS = ["석민", "현지"];
const KIND_LABEL: Record<string, string> = {
  source: "원천 통장",
  payment: "결제계좌",
  saving: "저축",
  investment: "투자",
  cash: "현금",
};
const TABS = [
  ["accounts", "계좌"],
  ["cards", "카드"],
  ["fixed", "고정지출"],
] as const;

export default async function ManagePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams;
  const tab = TABS.some(([t]) => t === sp.tab) ? sp.tab! : "accounts";
  const { supabase, householdId } = await getHousehold();

  const shell = (body: React.ReactNode) => (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 px-5 pt-6 pb-24">
      <PageHeader
        eyebrow="SETTINGS"
        title="계좌 · 카드 · 고정지출"
        right={<Link href="/settings" className="pb-1 text-sm text-brown">← 설정</Link>}
      />
      <nav className="grid grid-cols-3 gap-1 rounded-xl bg-line p-1">
        {TABS.map(([t, label]) => (
          <Link
            key={t}
            href={`/settings/manage?tab=${t}`}
            className={`flex h-10 items-center justify-center rounded-[9px] text-sm ${t === tab ? "bg-card font-bold text-ink" : "text-muted"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {body}
      <p className="px-1 text-xs text-muted">
        지우는 대신 <b>숨기기</b>를 써요. 지난 달 기록이 그 계좌·카드를 가리키고 있을 수 있어서요.
      </p>
      <BottomNav active="/settings" />
    </main>
  );

  if (!householdId) return shell(<NotLinked />);

  const [acc, crd, tpl] = await Promise.all([
    supabase.from("accounts").select("id, name, owner_name, kind, reconcile, active").eq("household_id", householdId).order("active", { ascending: false }).order("sort_order").order("name"),
    supabase.from("cards").select("id, name, owner_name, payment_account_id, active").eq("household_id", householdId).order("active", { ascending: false }).order("sort_order").order("name"),
    supabase.from("fixed_templates").select("id, title, default_amount, owner_name, card_id, account_id, active").eq("household_id", householdId).order("active", { ascending: false }).order("sort_order").order("title"),
  ]);
  const accounts = (acc.data ?? []) as Account[];
  const cards = (crd.data ?? []) as CardRow[];
  const templates = (tpl.data ?? []) as Template[];

  const toggle = (table: string, id: string, active: boolean) => (
    <ActionForm action={setActive} className="contents">
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={active ? "false" : "true"} />
      <button type="submit" className="h-9 rounded-lg px-2 text-xs text-muted underline underline-offset-2">
        {active ? "숨기기" : "다시 보이기"}
      </button>
    </ActionForm>
  );

  const ownerSelect = (name: string, value: string | null, allowNone?: boolean) => (
    <select name={name} defaultValue={value ?? ""} className={selectClass} aria-label="누구">
      {allowNone && <option value="">공동</option>}
      {OWNERS.map((o) => <option key={o}>{o}</option>)}
    </select>
  );

  /* ---------- 계좌 ---------- */
  if (tab === "accounts") {
    const form = (a?: Account) => (
      <ActionForm action={a ? updateAccount : addAccount} resetOnSuccess={!a} className="grid grid-cols-2 gap-2">
        {a && <input type="hidden" name="id" value={a.id} />}
        {a && !a.active && <input type="hidden" name="active" value="off" />}
        <input name="name" defaultValue={a?.name} placeholder="계좌 이름" className={`${inputClass} col-span-2`} required />
        {ownerSelect("owner", a?.owner_name ?? null, true)}
        <select name="kind" defaultValue={a?.kind ?? "payment"} className={selectClass} aria-label="종류">
          {Object.entries(KIND_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <label className="col-span-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="reconcile" defaultChecked={a?.reconcile ?? false} className="size-4 accent-brown" />
          월 마감 때 잔액 대조하는 통장
        </label>
        {a ? (
          <div className="col-span-2 flex items-center justify-between">
            {toggle("accounts", a.id, a.active)}
            <GhostButton type="submit">저장</GhostButton>
          </div>
        ) : (
          <PrimaryButton type="submit" className="col-span-2">+ 계좌 추가</PrimaryButton>
        )}
      </ActionForm>
    );
    return shell(
      <>
        <Card>
          <CardTitle>새 계좌</CardTitle>
          {form()}
        </Card>
        {accounts.map((a) => (
          <details key={a.id} className={`rounded-2xl border border-line bg-card ${a.active ? "" : "opacity-60"}`}>
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm">
              <span>
                {a.name}
                <span className="ml-2 text-xs text-muted">{a.owner_name ?? "공동"} · {KIND_LABEL[a.kind] ?? a.kind}{a.reconcile ? " · 대조" : ""}</span>
              </span>
              <span className="text-xs text-muted">{a.active ? "고치기" : "숨김"}</span>
            </summary>
            <div className="border-t border-line p-4">{form(a)}</div>
          </details>
        ))}
      </>,
    );
  }

  /* ---------- 카드 ---------- */
  if (tab === "cards") {
    const payAccounts = accounts.filter((a) => a.active && (a.kind === "payment" || a.kind === "source"));
    const form = (c?: CardRow) => (
      <ActionForm action={c ? updateCard : addCard} resetOnSuccess={!c} className="grid grid-cols-2 gap-2">
        {c && <input type="hidden" name="id" value={c.id} />}
        {c && !c.active && <input type="hidden" name="active" value="off" />}
        <input name="name" defaultValue={c?.name} placeholder="카드 이름" className={`${inputClass} col-span-2`} required />
        {ownerSelect("owner", c?.owner_name ?? OWNERS[0])}
        <select name="payment_account_id" defaultValue={c?.payment_account_id ?? ""} className={selectClass} aria-label="결제계좌">
          <option value="">결제계좌 없음</option>
          {payAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {c ? (
          <div className="col-span-2 flex items-center justify-between">
            {toggle("cards", c.id, c.active)}
            <GhostButton type="submit">저장</GhostButton>
          </div>
        ) : (
          <PrimaryButton type="submit" className="col-span-2">+ 카드 추가</PrimaryButton>
        )}
      </ActionForm>
    );
    const accName = (id: string | null) => accounts.find((a) => a.id === id)?.name ?? "결제계좌 없음";
    return shell(
      <>
        <Card>
          <CardTitle>새 카드</CardTitle>
          {form()}
        </Card>
        {cards.map((c) => (
          <details key={c.id} className={`rounded-2xl border border-line bg-card ${c.active ? "" : "opacity-60"}`}>
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm">
              <span>
                {c.name}
                <span className="ml-2 text-xs text-muted">{c.owner_name} · {accName(c.payment_account_id)}</span>
              </span>
              <span className="text-xs text-muted">{c.active ? "고치기" : "숨김"}</span>
            </summary>
            <div className="border-t border-line p-4">{form(c)}</div>
          </details>
        ))}
      </>,
    );
  }

  /* ---------- 고정지출 ---------- */
  const viaOptions = [
    ...cards.filter((c) => c.active).map((c) => ({ value: `card:${c.id}`, label: `${c.name} (${c.owner_name})` })),
    ...accounts.filter((a) => a.active && a.kind !== "investment").map((a) => ({ value: `account:${a.id}`, label: `${a.name} 자동이체` })),
  ];
  const viaLabel = (t: Template) => viaOptions.find((o) => o.value === (t.card_id ? `card:${t.card_id}` : `account:${t.account_id}`))?.label ?? "";
  const form = (t?: Template) => (
    <ActionForm action={t ? updateTemplate : addTemplate} resetOnSuccess={!t} className="grid grid-cols-2 gap-2">
      {t && <input type="hidden" name="id" value={t.id} />}
      {t && !t.active && <input type="hidden" name="active" value="off" />}
      <input name="title" defaultValue={t?.title} placeholder="항목 (관리비, 보험료…)" className={inputClass} required />
      <AmountInput name="default_amount" defaultValue={t?.default_amount ? won(t.default_amount) : ""} placeholder="기본 금액" className={inputClass} />
      {ownerSelect("owner", t?.owner_name ?? null, true)}
      <select name="via" defaultValue={t ? (t.card_id ? `card:${t.card_id}` : `account:${t.account_id}`) : viaOptions[0]?.value} className={selectClass} aria-label="어디서 빠지나">
        {viaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {t ? (
        <div className="col-span-2 flex items-center justify-between">
          {toggle("fixed_templates", t.id, t.active)}
          <GhostButton type="submit">저장</GhostButton>
        </div>
      ) : (
        <PrimaryButton type="submit" className="col-span-2">+ 고정지출 추가</PrimaryButton>
      )}
    </ActionForm>
  );
  return shell(
    <>
      <Card>
        <CardTitle>새 고정지출</CardTitle>
        <p className="mb-2 text-xs text-muted">다음 달 정산부터 고정지출 목록에 나와요. 지난 달 기록은 그대로예요.</p>
        {form()}
      </Card>
      {templates.map((t) => (
        <details key={t.id} className={`rounded-2xl border border-line bg-card ${t.active ? "" : "opacity-60"}`}>
          <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3.5 text-sm">
            <span className="min-w-0 truncate">
              {t.title}
              <span className="ml-2 text-xs text-muted">{t.owner_name ?? "공동"} · {viaLabel(t)}</span>
            </span>
            <span className="shrink-0 text-xs text-muted">{t.active ? won(t.default_amount) : "숨김"}</span>
          </summary>
          <div className="border-t border-line p-4">{form(t)}</div>
        </details>
      ))}
    </>,
  );
}
