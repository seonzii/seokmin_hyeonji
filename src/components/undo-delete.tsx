"use client";

import { createContext, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import type { ActionResult } from "@/lib/action";

export type DeletedRow = { table: string; row: Record<string, unknown> };
type DeleteResult = ActionResult | { ok: true; deleted: DeletedRow };

type Ctx = {
  remove: (fd: FormData) => void;
};
const UndoCtx = createContext<Ctx | null>(null);

const UNDO_MS = 6000;

/**
 * 삭제하면 아래에 "삭제했어요 · 되돌리기"를 몇 초 보여준다.
 * 목록이 서버에서 다시 그려져도 안내는 이 컴포넌트가 들고 있어서 사라지지 않는다.
 */
export function UndoProvider({
  deleteAction,
  restoreAction,
  children,
}: {
  deleteAction: (fd: FormData) => Promise<DeleteResult>;
  restoreAction: (fd: FormData) => Promise<ActionResult>;
  children: ReactNode;
}) {
  const [toast, setToast] = useState<{ text: string; undo?: DeletedRow; error?: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, start] = useTransition();

  function show(t: typeof toast) {
    if (timer.current) clearTimeout(timer.current);
    setToast(t);
    timer.current = setTimeout(() => setToast(null), UNDO_MS);
  }
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function remove(fd: FormData) {
    start(async () => {
      const r = await deleteAction(fd);
      if (!r.ok) return show({ text: r.error, error: true });
      show({ text: "삭제했어요", undo: "deleted" in r ? r.deleted : undefined });
    });
  }

  function undo() {
    const u = toast?.undo;
    if (!u) return;
    setToast(null);
    const fd = new FormData();
    fd.set("table", u.table);
    fd.set("row", JSON.stringify(u.row));
    start(async () => {
      const r = await restoreAction(fd);
      if (!r.ok) show({ text: r.error, error: true });
    });
  }

  return (
    <UndoCtx.Provider value={{ remove }}>
      {children}
      {toast && (
        <div
          role="status"
          className={`fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom)+12px)] z-40 mx-auto flex w-[calc(100%-40px)] max-w-[390px] items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ${
            toast.error ? "bg-warn-tint text-warn" : "bg-ink text-paper"
          }`}
        >
          <span>{toast.text}</span>
          {toast.undo && (
            <button type="button" onClick={undo} className="font-semibold text-caramel-tint underline underline-offset-2">
              되돌리기
            </button>
          )}
        </div>
      )}
    </UndoCtx.Provider>
  );
}

/** 목록 한 줄의 × 버튼. 눌러서 지우고, 몇 초 안에 되돌릴 수 있다 */
export function DeleteButton({ fields, disabled }: { fields: Record<string, string>; disabled?: boolean }) {
  const ctx = useContext(UndoCtx);
  return (
    <button
      type="button"
      aria-label="삭제"
      disabled={disabled || !ctx}
      onClick={() => {
        const fd = new FormData();
        for (const [k, v] of Object.entries(fields)) fd.set(k, v);
        ctx?.remove(fd);
      }}
      className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-caramel-tint hover:text-caramel-deep disabled:opacity-40"
    >
      ×
    </button>
  );
}
