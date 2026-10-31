"use client";

import { useRouter } from "next/navigation";

const selectClass = "h-10 rounded-lg border border-line-strong bg-card px-2 font-serif text-base font-semibold text-ink";

/** 연·월을 바로 고르는 칸 (어느 폰에서나 같은 모양). 고르면 그 달로 이동 */
export function MonthPicker({ value, from, hrefFor }: { value: string; from: number; hrefFor: (key: string) => string }) {
  const router = useRouter();
  const [y, m] = value.split("-").map(Number);
  const to = new Date().getFullYear() + 1;
  const years = [];
  for (let yy = to; yy >= from; yy--) years.push(yy);
  const go = (year: number, month: number) => router.push(hrefFor(`${year}-${String(month).padStart(2, "0")}`));
  return (
    <div className="flex items-center gap-1.5">
      <select value={y} aria-label="연도" onChange={(e) => go(Number(e.target.value), m)} className={selectClass}>
        {years.map((yy) => <option key={yy} value={yy}>{yy}년</option>)}
      </select>
      <select value={m} aria-label="월" onChange={(e) => go(y, Number(e.target.value))} className={selectClass}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((mm) => <option key={mm} value={mm}>{mm}월</option>)}
      </select>
    </div>
  );
}

export function YearPicker({ value, from, to, hrefFor }: { value: number; from: number; to: number; hrefFor: (year: number) => string }) {
  const router = useRouter();
  const years = [];
  for (let y = to; y >= from; y--) years.push(y);
  return (
    <select value={value} aria-label="연도 고르기" onChange={(e) => router.push(hrefFor(Number(e.target.value)))} className={selectClass}>
      {years.map((y) => <option key={y} value={y}>{y}년</option>)}
    </select>
  );
}
