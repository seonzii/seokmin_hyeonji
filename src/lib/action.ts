export type ActionResult = { ok: true } | { ok: false; error: string };

export const OK: ActionResult = { ok: true };

/** Supabase 오류를 사람이 읽을 안내로 */
export function fail(e: { code?: string; message?: string } | string | null | undefined): ActionResult {
  if (typeof e === "string") return { ok: false, error: e };
  const code = e?.code ?? "";
  const msg = e?.message ?? "";
  if (code === "42501" || /row-level security/i.test(msg)) {
    return { ok: false, error: "마감한 달이라 고칠 수 없어요. 아래에서 마감을 풀어 주세요." };
  }
  if (/fetch failed|network|ECONN|ETIMEDOUT/i.test(msg)) {
    return { ok: false, error: "인터넷 연결을 확인해 주세요." };
  }
  return { ok: false, error: `저장하지 못했어요${msg ? `: ${msg}` : ""}` };
}
