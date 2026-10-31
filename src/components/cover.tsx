import { MARRIED_ON, MET_ON, daysSince, formatDotDate } from "@/lib/dday";

/** 로그인 화면과 홈 화면이 같이 쓰는 위쪽 D-day 줄 */
export function DdayRow() {
  const met = daysSince(MET_ON).toLocaleString("ko-KR");
  const married = daysSince(MARRIED_ON).toLocaleString("ko-KR");
  return (
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
  );
}

/** 아치 모양 우리 사진. 사진이 없으면 자리 표시 */
export function ArchPhoto({ photo }: { photo: string | null }) {
  return (
  <div className="relative h-[420px] shrink-0">
    <div
      aria-hidden
      className="absolute top-3.5 right-[-2px] bottom-[-2px] left-3.5 rounded-t-[167px] rounded-b-md border border-caramel"
    />
    {photo ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt="우리 사진"
        className="absolute top-0 right-3.5 bottom-3.5 left-0 h-[calc(100%-14px)] w-[calc(100%-14px)] rounded-t-[160px] rounded-b-md object-cover"
      />
    ) : (
      <div
        role="img"
        aria-label="우리 사진 자리"
        className="absolute top-0 right-3.5 bottom-3.5 left-0 flex flex-col items-center justify-center gap-1 rounded-t-[160px] rounded-b-md bg-[#dcd5c6] text-muted"
      >
        <span className="text-[12.5px] font-medium">[우리 사진]</span>
        <span className="text-[11px]">설정에서 바꿀 수 있어요</span>
      </div>
    )}
  </div>
  );
}
