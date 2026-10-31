"use client";

import { useRouter } from "next/navigation";

/** 연·월을 바로 고르는 칸. 고르면 그 달로 이동 */
export function MonthPicker({ value, hrefFor }: { value: string; hrefFor: (key: string) => string }) {
  const router = useRouter();
  return (
    <input
      type="month"
      value={value}
      aria-label="연도와 월 고르기"
      onChange={(e) => {
        if (/^\d{4}-\d{2}$/.test(e.target.value)) router.push(hrefFor(e.target.value));
      }}
      className="h-10 rounded-lg border border-line-strong bg-card px-2 font-serif text-base font-semibold text-ink"
    />
  );
}

export function YearPicker({ value, from, to, hrefFor }: { value: number; from: number; to: number; hrefFor: (year: number) => string }) {
  const router = useRouter();
  const years = [];
  for (let y = to; y >= from; y--) years.push(y);
  return (
    <select
      value={value}
      aria-label="연도 고르기"
      onChange={(e) => router.push(hrefFor(Number(e.target.value)))}
      className="h-10 rounded-lg border border-line-strong bg-card px-2 font-serif text-base font-semibold text-ink"
    >
      {years.map((y) => <option key={y} value={y}>{y}년</option>)}
    </select>
  );
}
