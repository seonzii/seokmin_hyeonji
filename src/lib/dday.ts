export const MET_ON = "2021-04-11";
export const MARRIED_ON = "2025-09-27";

/** 서울 기준 오늘 날짜를 YYYY-MM-DD로 */
function todayInSeoul(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** 커플 앱 방식: 시작한 날을 1일로 센다 */
export function daysSince(isoDate: string, now = new Date()): number {
  const start = Date.parse(`${isoDate}T00:00:00Z`);
  const today = Date.parse(`${todayInSeoul(now)}T00:00:00Z`);
  return Math.floor((today - start) / 86_400_000) + 1;
}

export function formatDotDate(isoDate: string): string {
  return isoDate.replaceAll("-", ".");
}
