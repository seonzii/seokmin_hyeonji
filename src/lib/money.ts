export function won(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("ko-KR");
}

/** "1,234,000" 같은 입력을 정수로. 비었거나 숫자가 아니면 null */
export function parseWon(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").replace(/[,\s원]/g, "");
  if (!/^-?\d+$/.test(s)) return null;
  return Number(s);
}
