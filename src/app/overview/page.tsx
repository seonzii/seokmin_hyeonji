import Link from "next/link";
import {
  BottomNav,
  Card,
  CardTitle,
  NotLinked,
  PageHeader,
  Row,
} from "@/components/ui";
import { bookBalances } from "@/lib/balances";
import { getHousehold } from "@/lib/household";
import { won } from "@/lib/money";
import {
  currentMonthKey,
  monthDate,
  monthParts,
  shiftMonth,
} from "@/lib/month";
import { spending, type MonthSummary } from "@/lib/summary";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const key = currentMonthKey();
  const { year, month, en } = monthParts(key);
  const { supabase, householdId } = await getHousehold();

  const header = (
    <PageHeader
      eyebrow={`${year} · ${en}`}
      title={`${month}월의 살림`}
    />
  );

  if (!householdId) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 px-5 pt-6 pb-24">
        {header}
        <NotLinked />
      </main>
    );
  }

  const from = shiftMonth(key, -5);
  const { data } = await supabase
    .from("month_summary")
    .select("*")
    .eq("household_id", householdId)
    .gte("month", monthDate(from))
    .lte("month", monthDate(key))
    .order("month");
  const rows = (data ?? []) as MonthSummary[];
  const books = await bookBalances(supabase, householdId, monthDate(key));
  const now = rows.find((r) => r.month === monthDate(key));

  const bars = Array.from({ length: 6 }, (_, i) => {
    const k = shiftMonth(from, i);
    const r = rows.find((x) => x.month === monthDate(k));
    return { key: k, label: monthParts(k).month, total: r ? spending(r) : 0 };
  });
  const max = Math.max(1, ...bars.map((b) => b.total));

  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 px-5 pt-6 pb-24">
      {header}

      <section className="rounded-2xl bg-brown p-5 text-paper">
        <div className="text-xs opacity-80">{month}월에 쓴 돈 (지출 + 고정 + 축의금)</div>
        <div className="mt-1 font-serif text-[30px] font-semibold tracking-[-0.5px]">
          {won(now ? spending(now) : 0)}원
        </div>
        {books.length > 0 && (
          <div className="mt-3 flex flex-col gap-1 border-t border-paper/25 pt-3 text-[13px]">
            {books.map(({ account, book }) => (
              <div key={account.id} className="flex justify-between">
                <span className="opacity-80">{account.name} 장부</span>
                <span>{won(book)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 text-xs opacity-80">
          {now?.status === "closed" ? "마감한 달이에요" : "정산 중이에요"}
        </div>
      </section>

      <Card>
        <CardTitle>{month}월 요약</CardTitle>
        <Row label="수입" value={`+${won(now?.income)}`} />
        <Row label="지출 (생활비 포함)" value={`−${won(now?.expense)}`} />
        <Row label="고정지출" value={`−${won(now?.fixed)}`} />
        <Row label="축의금 (현금)" value={`−${won(now?.gift_cash)}`} />
        <Row
          label="저축 · 투자"
          value={won(Number(now?.saving ?? 0) + Number(now?.investment ?? 0))}
        />
      </Card>

      <Card>
        <CardTitle right={<span className="text-xs font-normal text-muted">단위 만원</span>}>
          월별 소비 (지출 + 고정)
        </CardTitle>
        <div className="flex h-28 items-end justify-between gap-2 px-1">
          {bars.map((b, i) => (
            <div key={b.key} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10.5px] text-muted">
                {b.total ? Math.round(b.total / 10000) : ""}
              </span>
              <div
                className={`w-[18px] rounded ${i === bars.length - 1 ? "bg-caramel" : "bg-line-strong"}`}
                style={{ height: `${Math.round((b.total / max) * 68)}px` }}
              />
              <span className="text-[11px] text-muted">{b.label}월</span>
            </div>
          ))}
        </div>
      </Card>

      <Link
        href={`/settle/${key}`}
        className="flex h-12 items-center justify-center rounded-xl bg-brown text-sm font-medium text-paper"
      >
        {month}월 정산 {now ? "이어하기" : "시작하기"}
      </Link>

      <BottomNav active="/overview" />
    </main>
  );
}
