"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import type { ActionResult } from "@/lib/action";

type Props = {
  action: (fd: FormData) => Promise<ActionResult>;
  children: ReactNode;
  className?: string;
  /** 성공하면 입력칸 비우기 (추가 폼) */
  resetOnSuccess?: boolean;
};

/**
 * 서버 액션 폼. 실패하면 아래에 이유를 보여주고,
 * 성공하면(추가 폼이면) 입력칸을 비운다. 화면 위치는 그대로.
 */
export function ActionForm({ action, children, className, resetOnSuccess }: Props) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, fd: FormData) => action(fd),
    null as ActionResult | null,
  );

  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className} aria-busy={pending}>
      {children}
      {state && !state.ok && (
        <p role="alert" className="col-span-2 rounded-lg bg-warn-tint px-3 py-2 text-[13px] text-warn">
          {state.error}
        </p>
      )}
    </form>
  );
}
