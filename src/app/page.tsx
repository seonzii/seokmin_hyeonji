import { logout } from "./login/actions";

export const dynamic = "force-dynamic";

const MONTHS_EN = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

export default function Home() {
  const [year, month] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  })
    .format(new Date())
    .split("-")
    .map(Number);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 px-5 pt-6 pb-24">
      <header className="flex items-end justify-between border-b border-ink pb-3.5">
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] tracking-[2.5px] text-muted">
            {year} · {MONTHS_EN[month - 1]}
          </span>
          <h1 className="font-serif text-[26px] font-semibold tracking-[-0.5px]">
            {month}월의 살림
          </h1>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="h-11 rounded-full border border-brown px-3 text-xs text-brown"
          >
            로그아웃
          </button>
        </form>
      </header>

      <section className="rounded-2xl border border-line bg-card p-5 text-sm text-muted">
        홈 요약, 월 정산, 조회, 투자 현황 화면은 다음 작업에서 이 자리에
        채워져요.
      </section>
    </main>
  );
}
