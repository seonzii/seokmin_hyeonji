"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

/**
 * 로그인 화면에는 비밀번호 칸만 있다.
 * 두 사람의 계정 이메일을 차례로 시도해서, 맞는 쪽으로 로그인한다.
 * 그래서 두 사람의 비밀번호는 서로 달라야 한다.
 */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "비밀번호를 입력해 주세요." };

  const emails = (process.env.MEMBER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (emails.length === 0) {
    return { error: "MEMBER_EMAILS 환경변수가 설정되지 않았어요." };
  }

  const supabase = await createClient();
  for (const email of emails) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) redirect("/");
  }

  return { error: "비밀번호가 맞지 않아요." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
