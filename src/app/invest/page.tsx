import Link from "next/link";
import {
  BottomNav,
  Card,
  CardTitle,
  GhostButton,
  inputClass,
  NotLinked,
  PageHeader,
  PrimaryButton,
  selectClass,
} from "@/components/ui";
import { getHousehold } from "@/lib/household";
import { won } from "@/lib/money";
import { currentMonthKey, monthParts } from "@/lib/month";
import { addInvestAccount, saveSnapshots } from "./actions";

export const dynamic = "force-dynamic";

type Account = { id: string; name: string; owner_name: string | null };
type Snap = { account_id: string; month: string; principal: number | null; valuation: number };

const OWNERS = ["현지", "석민"];

function rate(s: Snap | undefined) {
  if (!s?.principal) return null;
  return ((Number(s.valuation) - Number(s.principal)) / Number(s.principal)) * 100;
}

export default async function InvestPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const editing = (await searchParams).edit === "1";
  const key = currentMonthKey();
  const { month } = monthParts(key);
  const { supabase, householdId } = await getHousehold();

  if (!householdId) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 px-5 pt-6 pb-24">
        <PageHeader eyebrow="INVESTMENT" title="투자 현황" />
        <NotLinked />
        <BottomNav active="/invest" />
      </main>
    );
  }

  const [acc, snp] = await Promise.all([
    supabase.from("accounts").select("id, name, owner_name").eq("household_id", householdId).eq("kind", "investment").eq("active", true).order("sort_order"),
    supabase.from("investment_snapshots").select("account_id, month, principal, valuation").eq("household_id", householdId).order("month", { ascending: false }),
  ]);
  const accounts = (acc.data ?? []) as Account[];
  const snaps = (snp.data ?? []) as Snap[];

  // 계좌마다 가장 최근 기록, 그리고 그 직전 기록
  const latest = new Map<string, Snap>();
  for (const s of snaps) if (!latest.has(s.account_id)) latest.set(s.account_id, s);
  const months = [...new Set(snaps.map((s) => s.month))];
  const lastMonth = months[0];
  const prevMonth = months[1];
  const totalAt = (m: string | undefined) => {
    if (!m) return 0;
    let t = 0;
    for (const a of accounts) {
      const s = snaps.find((x) => x.account_id === a.id && x.month <= m);
      if (s) t += Number(s.valuation);
    }
    return t;
  };
  const total = totalAt(lastMonth);
  const change = prevMonth ? total - totalAt(prevMonth) : null;

  const owners = [...OWNERS, ...new Set(accounts.map((a) => a.owner_name ?? "공동").filter((o) => !OWNERS.includes(o)))];

  const list = owners.map((o) => {
    const accs = accounts.filter((a) => (a.owner_name ?? "공동") === o);
    return { owner: o, accs, total: accs.reduce((t, a) => t + Number(latest.get(a.id)?.valuation ?? 0), 0) };
  }).filter((g) => g.accs.length);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 px-5 pt-6 pb-24">
      <PageHeader
        eyebrow="INVESTMENT"
        title="투자 현황"
        right={
          <span className="pb-1 text-xs text-muted">
            {editing ? `${month}월 평가금액 입력 중` : lastMonth ? `${lastMonth.slice(0, 4)}년 ${Number(lastMonth.slice(5, 7))}월 기록 기준` : ""}
          </span>
        }
      />

      <section className="rounded-2xl bg-brown p-5 text-paper">
        <div className="text-xs opacity-80">투자 평가금액 합계</div>
        <div className="mt-1 font-serif text-[30px] font-semibold tracking-[-0.5px]">{won(total)}원</div>
        {change !== null && (
          <div className="mt-2 text-xs opacity-80">
            {Number(prevMonth!.slice(5, 7))}월 기록 대비 {change >= 0 ? "+" : "−"}
            {won(Math.abs(change))}
          </div>
        )}
      </section>

      <form action={saveSnapshots} className="flex flex-col gap-4">
        <input type="hidden" name="month" value={key} />
        {list.map((g) => (
          <Card key={g.owner}>
            <CardTitle right={won(g.total)}>{g.owner}</CardTitle>
            {g.accs.map((a) => {
              const s = latest.get(a.id);
              const r = rate(s);
              return (
                <div key={a.id} className="border-t border-line py-2.5 first-of-type:border-t-0">
                  <div className="flex items-baseline justify-between text-sm">
                    <span>{a.name}</span>
                    {!editing && (
                      <span className={r === null ? "text-[13px] text-muted" : "text-[13px] font-bold text-caramel"}>
                        {r === null ? "—" : `${r >= 0 ? "+" : ""}${r.toFixed(1)}%`}
                      </span>
                    )}
                  </div>
                  {editing ? (
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <input name={`principal_${a.id}`} inputMode="numeric" placeholder={s?.principal ? won(s.principal) : "원금"} aria-label={`${a.name} 원금`} className={inputClass} />
                      <input name={`value_${a.id}`} inputMode="numeric" placeholder={s ? won(s.valuation) : "평가금액"} aria-label={`${a.name} 평가금액`} className={inputClass} />
                    </div>
                  ) : (
                    <div className="mt-0.5 flex justify-between text-xs text-muted">
                      <span>원금 {s?.principal ? won(s.principal) : "미기록"}</span>
                      <span>평가 {s ? won(s.valuation) : "—"}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        ))}
        {editing && (
          <>
            <PrimaryButton type="submit">{month}월 기록 저장</PrimaryButton>
            <p className="px-1 text-xs text-muted">
              입력칸에는 지난 기록이 흐리게 보여요. 바뀐 계좌만 입력하면 나머지는 그대로 이어져요.
            </p>
          </>
        )}
      </form>

      {editing ? (
        <>
          <Link href="/invest" className="text-center text-sm text-muted">취소</Link>
          <Card>
            <CardTitle>투자 계좌 추가</CardTitle>
            <form action={addInvestAccount} className="grid grid-cols-[auto_1fr] gap-2">
              <select name="owner" className={selectClass} aria-label="누구">
                {OWNERS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <input name="name" placeholder="계좌 이름" className={inputClass} required />
              <GhostButton type="submit" className="col-span-2">+ 추가</GhostButton>
            </form>
          </Card>
        </>
      ) : (
        <Link href="/invest?edit=1" className="flex h-12 items-center justify-center rounded-xl bg-brown text-sm font-medium text-paper">
          {month}월 평가금액 입력하기
        </Link>
      )}

      <BottomNav active="/invest" />
    </main>
  );
}
