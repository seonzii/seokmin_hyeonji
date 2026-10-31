"use client";

import { useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/action";
import { AmountInput } from "./amount-input";

type Props = {
  action: (fd: FormData) => Promise<ActionResult>;
  /** 같이 보낼 숨은 값 (month, card_id ...) */
  fields: Record<string, string>;
  name: string;
  defaultValue: string;
  placeholder?: string;
  className?: string;
  amount?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
};

/**
 * 입력하고 다른 곳을 누르면(또는 Enter) 바로 저장되는 칸.
 * 저장 버튼이 없고, 화면도 그 자리에 머문다.
 */
export function AutoSaveField({ action, fields, name, defaultValue, amount, className, ...rest }: Props) {
  const last = useRef(defaultValue);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function save(value: string) {
    if (value === last.current) return;
    last.current = value;
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    fd.set(name, value);
    start(async () => {
      const r = await action(fd);
      if (r.ok) {
        setStatus("saved");
        setError(null);
        setTimeout(() => setStatus("idle"), 1500);
      } else {
        setStatus("error");
        setError(r.error);
      }
    });
  }

  const Input = amount ? AmountInput : "input";
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="relative">
        <Input
          name={name}
          defaultValue={defaultValue}
          className={`${className ?? ""} w-full ${status === "error" ? "border-warn" : ""}`}
          onBlur={(e) => save(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          {...rest}
        />
        <span
          aria-live="polite"
          className={`pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[11px] transition-opacity ${
            pending || status === "saved" ? "opacity-100" : "opacity-0"
          } ${pending ? "text-muted" : "text-caramel-deep"}`}
        >
          {pending ? "저장 중" : "저장됨"}
        </span>
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-warn-tint px-3 py-1.5 text-[12px] text-warn">
          {error}
        </p>
      )}
    </div>
  );
}
