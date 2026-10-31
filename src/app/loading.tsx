/** 탭을 누르자마자 보이는 자리 표시. 서버에서 데이터를 받는 동안 */
export default function Loading() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 px-5 pt-6 pb-24" aria-busy>
      <div className="h-[62px] animate-pulse border-b border-line-strong" />
      <div className="h-32 animate-pulse rounded-2xl bg-line/70" />
      <div className="h-48 animate-pulse rounded-2xl bg-card" />
      <div className="h-40 animate-pulse rounded-2xl bg-card" />
    </main>
  );
}
