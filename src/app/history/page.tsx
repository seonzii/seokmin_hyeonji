import Link from "next/link";
import type { ReactNode } from "react";
import { BottomNav, Card, CardTitle, inputClass, NotLinked, PageHeader, Row } from "@/components/ui";
import { getHousehold } from "@/lib/household";
import { won } from "@/lib/money";
import { currentMonthKey, isMonthKey, monthDate, monthParts, shiftMonth } from "@/lib/month";
import { MonthPicker, YearPicker as YearSelect } from "@/components/month-picker";
import type { MonthSummary } from "@/lib/summary";

export const dynamic = "force-dynamic";

type Search = { tab?: string; m?: string; y?: string; q?: string };
type Item = { title: string; amount: number; kind: string; month: string; owner_name: string | null; card_bill_id: string | null };

const TABS = [
  ["month", "월별"],
  ["year", "연도별"],
  ["item", "항목별"],
] as const;

const man = (n: number) => Math.round(Number(n) / 10000).toLocaleString("ko-KR");

export default async function HistoryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const tab = TABS.some(([t]) => t === sp.tab) ? sp.tab! : "month";
  const { supabase, householdId } = await getHousehold();

  const shell = (body: ReactNode) => (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 px-5 pt-6 pb-24">
      <PageHeader eyebrow="HISTORY" title="정산 내역 조회" />
      <nav className="grid grid-cols-3 gap-1 rounded-xl bg-line p-1">
        {TABS.map(([t, label]) => (
          <Link
            key={t}
            href={`/history?tab=${t}`}
            className={`flex h-10 items-center justify-center rounded-[9px] text-sm ${
              t === tab ? "bg-card font-bold text-ink" : "text-muted"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {body}
      <BottomNav active="/history" />
    </main>
  );

  if (!householdId) return shell(<NotLinked />);

  /* ---------- 연도별 ---------- */
  if (tab === "year") {
    const year = Number(sp.y) || monthParts(currentMonthKey()).year;
    const { data } = await supabase
      .from("month_summary")
      .select("*")
      .eq("household_id", householdId)
      .gte("month", `${year}-01-01`)
      .lte("month", `${year}-12-01`)
      .order("month");
    const rows = (data ?? []) as MonthSummary[];
    const total = (f: (r: MonthSummary) => number) => rows.reduce((s, r) => s + f(r), 0);
    return shell(
      <>
        <YearPicker year={year} />
        <Card className="px-3">
          <table className="w-full text-right text-[13px]">
            <thead className="text-xs text-muted">
              <tr>
                <th className="py-2 text-left font-normal">월</th>
                <th className="font-normal">수입</th>
                <th className="font-normal">지출</th>
                <th className="font-normal">고정</th>
                <th className="font-normal">저축</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const k = r.month.slice(0, 7);
                return (
                  <tr key={r.month} className="border-t border-line">
                    <td className="py-2.5 text-left">
                      <Link href={`/history?tab=month&m=${k}`} className="text-caramel-deep underline-offset-2 hover:underline">
                        {monthParts(k).month}월
                      </Link>
                    </td>
                    <td>{man(r.income)}</td>
                    <td>{man(r.expense)}</td>
                    <td>{man(r.fixed)}</td>
                    <td>{man(Number(r.saving) + Number(r.investment))}</td>
                  </tr>
                );
              })}
              {rows.length > 0 && (
                <tr className="border-t border-ink font-semibold">
                  <td className="py-2.5 text-left">합계</td>
                  <td>{man(total((r) => Number(r.income)))}</td>
                  <td>{man(total((r) => Number(r.expense)))}</td>
                  <td>{man(total((r) => Number(r.fixed)))}</td>
                  <td>{man(total((r) => Number(r.saving) + Number(r.investment)))}</td>
                </tr>
              )}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-6 text-center text-sm text-muted">{year}년 기록이 없어요</p>}
        </Card>
        <p className="px-1 text-xs text-muted">단위 만원. 월을 누르면 그 달 상세로 가요.</p>
      </>,
    );
  }

  /* ---------- 항목별 ---------- */
  if (tab === "item") {
    const year = Number(sp.y) || monthParts(currentMonthKey()).year;
    const q = (sp.q ?? "").trim();
    const { data: tpl } = await supabase
      .from("fixed_templates")
      .select("title")
      .eq("household_id", householdId)
      .eq("active", true)
      .order("sort_order");
    const chips = [...new Set(((tpl ?? []) as { title: string }[]).map((t) => t.title))].slice(0, 8);

    let items: Item[] = [];
    if (q) {
      const { data } = await supabase
        .from("expense_items")
        .select("title, amount, kind, month, owner_name, card_bill_id")
        .eq("household_id", householdId)
        .gte("month", `${year}-01-01`)
        .lte("month", `${year}-12-01`)
        .ilike("title", `%${q.replace(/[%_]/g, "")}%`)
        .order("month");
      items = (data ?? []) as Item[];
    }
    const byMonth = new Map<string, number>();
    for (const i of items) byMonth.set(i.month, (byMonth.get(i.month) ?? 0) + Number(i.amount));
    const sum = items.reduce((s, i) => s + Number(i.amount), 0);

    return shell(
      <>
        <form className="flex gap-2">
          <input type="hidden" name="tab" value="item" />
          <select name="y" defaultValue={year} aria-label="연도" className={`${inputClass} w-24 px-2`}>
            {Array.from({ length: monthParts(currentMonthKey()).year + 1 - 2024 + 1 }, (_, i) => 2024 + i).map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <input name="q" defaultValue={q} placeholder="항목 검색 (관리비, 쿠팡…)" className={`${inputClass} flex-1`} />
          <button className="h-11 rounded-xl bg-brown px-4 text-sm text-paper">검색</button>
        </form>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
          {chips.map((c) => (
            <Link
              key={c}
              href={`/history?tab=item&y=${year}&q=${encodeURIComponent(c)}`}
              className={`flex h-10 shrink-0 items-center rounded-full border px-4 text-[13px] ${
                c === q ? "border-caramel bg-caramel-tint font-bold text-caramel-deep" : "border-line-strong bg-card text-muted"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
        {q && (
          <Card>
            <CardTitle right={won(sum)}>
              {q} · {year}년
            </CardTitle>
            {[...byMonth].map(([m, v]) => (
              <Row key={m} label={`${monthParts(m.slice(0, 7)).month}월`} value={won(v)} />
            ))}
            {items.length === 0 && <p className="py-4 text-center text-sm text-muted">찾은 항목이 없어요</p>}
          </Card>
        )}
      </>,
    );
  }

  /* ---------- 월별 ---------- */
  const key = sp.m && isMonthKey(sp.m) ? sp.m : currentMonthKey();
  const m = monthDate(key);
  const [inc, itm, bil, sav, acc, sum] = await Promise.all([
    supabase.from("incomes").select("owner_name, title, amount").eq("household_id", householdId).eq("month", m),
    supabase.from("expense_items").select("title, amount, kind, month, owner_name, card_bill_id").eq("household_id", householdId).eq("month", m),
    supabase.from("card_bills").select("id, total").eq("household_id", householdId).eq("month", m),
    supabase.from("savings").select("owner_name, kind, amount, to_account_id").eq("household_id", householdId).eq("month", m),
    supabase.from("accounts").select("id, name").eq("household_id", householdId),
    supabase.from("month_summary").select("*").eq("household_id", householdId).eq("month", m).maybeSingle(),
  ]);
  const s = sum.data as MonthSummary | null;
  const items = (itm.data ?? []) as Item[];
  const billTotal = ((bil.data ?? []) as { total: number }[]).reduce((a, b) => a + Number(b.total), 0);
  const detailOnCards = items.filter((i) => i.card_bill_id).reduce((a, i) => a + Number(i.amount), 0);
  const living = billTotal - detailOnCards;
  const accName = new Map(((acc.data ?? []) as { id: string; name: string }[]).map((a) => [a.id, a.name]));
  const cardCount = (bil.data ?? []).length;
  const desc = (a: { amount: number }, b: { amount: number }) => Number(b.amount) - Number(a.amount);

  const expenseRows = [
    ...(cardCount ? [{ title: `생활비 (카드 ${cardCount}장)`, amount: living }] : []),
    ...items.filter((i) => i.kind === "expense"),
  ].sort(desc);
  const fixedRows = items.filter((i) => i.kind === "fixed").sort(desc);

  return shell(
    <>
      <div className="flex items-center justify-between">
        <Link href={`/history?tab=month&m=${shiftMonth(key, -1)}`} className="flex size-11 items-center justify-center text-brown" aria-label="이전 달">‹</Link>
        <MonthPicker value={key} from={2024} href="/history?tab=month&m=" />
        <Link href={`/history?tab=month&m=${shiftMonth(key, 1)}`} className="flex size-11 items-center justify-center text-brown" aria-label="다음 달">›</Link>
      </div>
      {!s ? (
        <Card className="py-8 text-center text-sm text-muted">이 달은 기록이 없어요</Card>
      ) : (
        <>
          <Card>
            <CardTitle right={won(s.income)}>수입</CardTitle>
            {((inc.data ?? []) as { owner_name: string; title: string; amount: number }[]).sort(desc).map((r, i) => (
              <Row key={i} label={`${r.title} · ${r.owner_name}`} value={won(r.amount)} />
            ))}
          </Card>
          <ListCard title="지출" total={s.expense} rows={expenseRows.map((r) => ({ label: r.title, value: r.amount }))} />
          <ListCard
            title="고정지출"
            total={s.fixed}
            rows={fixedRows.map((r) => ({ label: r.owner_name ? `${r.title} · ${r.owner_name}` : r.title, value: r.amount }))}
          />
          <Card>
            <CardTitle right={won(Number(s.saving) + Number(s.investment))}>저축 · 투자</CardTitle>
            {((sav.data ?? []) as { owner_name: string; kind: string; amount: number; to_account_id: string }[]).map((r, i) => (
              <Row
                key={i}
                label={`${accName.get(r.to_account_id) ?? ""} ${r.kind === "investment" ? "투자" : "저축"} (${r.owner_name})`}
                value={won(r.amount)}
              />
            ))}
          </Card>
          {Number(s.gift_cash) > 0 && (
            <Card>
              <CardTitle right={won(s.gift_cash)}>축의금 (현금)</CardTitle>
            </Card>
          )}
          <Link href={`/settle/${key}`} className="text-center text-sm text-caramel-deep underline underline-offset-2">
            이 달 정산 화면으로
          </Link>
        </>
      )}
    </>,
  );
}

function ListCard({ title, total, rows }: { title: string; total: number; rows: { label: string; value: number }[] }) {
  const head = rows.slice(0, 7);
  const rest = rows.slice(7);
  return (
    <Card>
      <CardTitle right={won(total)}>{title}</CardTitle>
      {head.map((r, i) => (
        <Row key={i} label={r.label} value={won(r.value)} />
      ))}
      {rest.length > 0 && (
        <details>
          <summary className="cursor-pointer border-t border-line py-2.5 text-sm text-caramel-deep">외 {rest.length}건 더보기</summary>
          {rest.map((r, i) => (
            <Row key={i} label={r.label} value={won(r.value)} />
          ))}
        </details>
      )}
    </Card>
  );
}

function YearPicker({ year }: { year: number }) {
  return (
    <div className="flex items-center justify-between">
      <Link href={`/history?tab=year&y=${year - 1}`} className="flex size-11 items-center justify-center text-brown" aria-label="이전 해">‹</Link>
      <YearSelect value={year} from={2024} to={monthParts(currentMonthKey()).year + 1} href="/history?tab=year&y=" />
      <Link href={`/history?tab=year&y=${year + 1}`} className="flex size-11 items-center justify-center text-brown" aria-label="다음 해">›</Link>
    </div>
  );
}
