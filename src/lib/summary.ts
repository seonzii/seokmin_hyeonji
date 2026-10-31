export type MonthSummary = {
  month: string;
  status: "draft" | "closed";
  income: number;
  expense: number;
  fixed: number;
  gift_cash: number;
  saving: number;
  investment: number;
  new_cash: number;
};

export function spending(s: MonthSummary): number {
  return Number(s.expense) + Number(s.fixed) + Number(s.gift_cash);
}
