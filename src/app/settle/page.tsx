import { redirect } from "next/navigation";
import { currentMonthKey } from "@/lib/month";

export const dynamic = "force-dynamic";

export default function SettleIndex() {
  redirect(`/settle/${currentMonthKey()}`);
}
