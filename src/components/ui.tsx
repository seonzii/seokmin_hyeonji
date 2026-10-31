import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Card({
  className = "",
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      className={`rounded-2xl border border-line bg-card p-4 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-[15px] font-semibold">{children}</h2>
      {right && <div className="text-[15px] font-semibold">{right}</div>}
    </div>
  );
}

export function Row({
  label,
  sub,
  value,
  action,
}: {
  label: ReactNode;
  sub?: ReactNode;
  value: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-11 items-center gap-2 border-t border-line py-2 first:border-t-0">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{label}</div>
        {sub && <div className="truncate text-xs text-muted">{sub}</div>}
      </div>
      <div className="text-sm">{value}</div>
      {action}
    </div>
  );
}

export const inputClass =
  "h-11 min-w-0 rounded-lg border border-line-strong bg-card px-3 text-base outline-none focus:border-caramel";

export const selectClass = `${inputClass} pr-2`;

export function PrimaryButton({
  className = "",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      className={`h-11 rounded-xl bg-brown px-4 text-sm font-medium text-paper disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}

export function GhostButton({
  className = "",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      className={`h-11 rounded-xl border border-brown px-3 text-sm text-brown ${className}`}
      {...props}
    />
  );
}

export function DeleteButton() {
  return (
    <button
      type="submit"
      aria-label="삭제"
      className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-caramel-tint hover:text-caramel-deep"
    >
      ×
    </button>
  );
}

export function PageHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-3 border-b border-ink pb-3.5">
      <div className="flex flex-col gap-1">
        <span className="text-[10.5px] tracking-[2.5px] text-muted">
          {eyebrow}
        </span>
        <h1 className="font-serif text-[26px] font-semibold tracking-[-0.5px]">
          {title}
        </h1>
      </div>
      {right}
    </header>
  );
}

const TABS = [
  { href: "/", label: "홈" },
  { href: "/settle", label: "월 정산" },
] as const;

export function BottomNav({ active }: { active: "/" | "/settle" }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-[430px]">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`flex h-14 flex-1 items-center justify-center text-sm ${
              t.href === active ? "font-semibold text-ink" : "text-muted"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function NotLinked() {
  return (
    <Card className="text-sm leading-relaxed text-muted">
      로그인은 됐는데 아직 &lsquo;우리 집&rsquo;에 연결되지 않았어요. Supabase
      SQL Editor에서 두 사람을 연결하는 SQL을 먼저 실행해 주세요.
    </Card>
  );
}
