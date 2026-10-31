"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-center gap-3.5">
        <label htmlFor="password" className="sr-only">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호"
          required
          className="h-12 min-w-0 flex-1 border-0 border-b border-ink bg-transparent px-0.5 text-base outline-none placeholder:text-[#8a8478] focus:border-caramel"
        />
        <button
          type="submit"
          aria-label="들어가기"
          disabled={pending}
          className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-brown text-paper transition-opacity disabled:opacity-60"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <p role="alert" className="min-h-5 text-[13px] text-warn">
        {state.error}
      </p>
    </form>
  );
}
