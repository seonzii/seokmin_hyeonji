import { MARRIED_ON, MET_ON, daysSince, formatDotDate } from "@/lib/dday";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const met = daysSince(MET_ON).toLocaleString("ko-KR");
  const married = daysSince(MARRIED_ON).toLocaleString("ko-KR");

  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-[22px] px-7 pt-12 pb-7">
      <div className="grid grid-cols-2 border-b border-line-strong pb-3.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-base text-caramel" aria-label="만난 지">
              ♥
            </span>
            <span className="font-serif text-[22px] leading-none tracking-[-0.3px]">
              +{met}
            </span>
            <span className="font-serif text-[13px] text-muted">일</span>
          </div>
          <span className="text-[10.5px] tracking-[2px] text-muted">
            SINCE {formatDotDate(MET_ON)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5 border-l border-line-strong">
          <div className="flex items-baseline gap-2">
            <span className="text-base" aria-label="결혼한 지">
              💍
            </span>
            <span className="font-serif text-[22px] leading-none tracking-[-0.3px]">
              +{married}
            </span>
            <span className="font-serif text-[13px] text-muted">일</span>
          </div>
          <span className="text-[10.5px] tracking-[2px] text-muted">
            SINCE {formatDotDate(MARRIED_ON)}
          </span>
        </div>
      </div>

      {/* 사진 업로드(설정 화면)는 다음 단계에서 붙인다 */}
      <div className="relative h-[420px] shrink-0">
        <div
          aria-hidden
          className="absolute top-3.5 right-[-2px] bottom-[-2px] left-3.5 rounded-t-[167px] rounded-b-md border border-caramel"
        />
        <div
          role="img"
          aria-label="우리 사진 자리"
          className="absolute top-0 right-3.5 bottom-3.5 left-0 flex flex-col items-center justify-center gap-1 rounded-t-[160px] rounded-b-md bg-[#dcd5c6] text-muted"
        >
          <span className="text-[12.5px] font-medium">[우리 사진]</span>
          <span className="text-[11px]">설정에서 바꿀 수 있어요</span>
        </div>
      </div>

      <h1 className="flex flex-col font-serif text-[28px] leading-[1.22] font-semibold tracking-[-0.5px]">
        <span>석민과 현지의</span>
        <span>
          살림 기록<span className="text-caramel">.</span>
        </span>
      </h1>

      <LoginForm />
    </main>
  );
}
