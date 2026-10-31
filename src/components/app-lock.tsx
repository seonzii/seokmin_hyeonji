"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/login/actions";

/** 앱을 내려두고 이만큼 지나면 다시 비밀번호를 묻는다 */
const LOCK_AFTER_MS = 3 * 60 * 1000;
const UNLOCKED = "salim:unlocked";
const HIDDEN_AT = "salim:hiddenAt";

/** 로그인할 때 부른다. 이 탭(앱 실행)이 열려 있는 동안만 유효 */
export function markUnlocked() {
  try {
    sessionStorage.setItem(UNLOCKED, "1");
    sessionStorage.removeItem(HIDDEN_AT);
  } catch {}
}

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * 로그인 쿠키는 오래 남기 때문에, 앱을 껐다 켜거나(새 실행이면 sessionStorage가 비어 있음)
 * 오래 내려뒀다 돌아오면 로그아웃시켜서 비밀번호 화면으로 보낸다.
 */
export function AppLock() {
  const pathname = usePathname();
  const onLogin = pathname === "/login";
  const [locked, setLocked] = useState(!onLogin);

  useEffect(() => {
    if (onLogin) return;

    const lock = () => {
      setLocked(true);
      try {
        sessionStorage.removeItem(UNLOCKED);
      } catch {}
      void logout();
    };

    if (read(UNLOCKED) !== "1") {
      lock();
      return;
    }
    setLocked(false);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        try {
          sessionStorage.setItem(HIDDEN_AT, String(Date.now()));
        } catch {}
        return;
      }
      const hiddenAt = Number(read(HIDDEN_AT) ?? 0);
      if (hiddenAt && Date.now() - hiddenAt > LOCK_AFTER_MS) lock();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [onLogin]);

  if (onLogin || !locked) return null;
  return <div aria-hidden className="fixed inset-0 z-50 bg-paper" />;
}
