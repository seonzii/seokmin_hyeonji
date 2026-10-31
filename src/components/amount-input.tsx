"use client";

import type { ComponentProps } from "react";

function format(v: string) {
  const neg = v.trim().startsWith("-");
  const digits = v.replace(/[^\d]/g, "");
  if (!digits) return neg ? "-" : "";
  return (neg ? "-" : "") + Number(digits).toLocaleString("ko-KR");
}

/** 숫자를 치면 쉼표가 자동으로 붙는 금액 칸 */
export function AmountInput({ onChange, ...props }: ComponentProps<"input">) {
  return (
    <input
      inputMode="numeric"
      autoComplete="off"
      {...props}
      onChange={(e) => {
        const el = e.currentTarget;
        const next = format(el.value);
        if (next !== el.value) el.value = next;
        onChange?.(e);
      }}
    />
  );
}
