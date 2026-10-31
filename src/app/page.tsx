import Link from "next/link";
import { ArchPhoto, DdayRow } from "@/components/cover";
import { BottomNav } from "@/components/ui";
import { currentMonthKey, monthParts } from "@/lib/month";
import { currentLoginPhoto } from "@/lib/photo";

export const dynamic = "force-dynamic";

/** 로그인 화면과 같은 표지. 비밀번호 칸 대신 바로가기 */
export default async function Home() {
  const photo = await currentLoginPhoto();
  const key = currentMonthKey();
  const { month } = monthParts(key);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-[22px] px-7 pt-12 pb-24">
      <DdayRow />
      <ArchPhoto photo={photo} />

      <h1 className="flex flex-col font-serif text-[28px] leading-[1.22] font-semibold tracking-[-0.5px]">
        <span>석민과 현지의</span>
        <span>
          부자되기 프로젝트 1단계<span className="text-caramel">.</span>
        </span>
      </h1>

      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/overview"
          className="flex h-12 items-center justify-center rounded-xl border border-brown text-sm text-brown"
        >
          정산개요
        </Link>
        <Link
          href={`/settle/${key}`}
          className="flex h-12 items-center justify-center rounded-xl bg-brown text-sm font-medium text-paper"
        >
          {month}월 정산하기
        </Link>
      </div>

      <BottomNav active="/" />
    </main>
  );
}
