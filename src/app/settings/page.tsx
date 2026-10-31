import Link from "next/link";
import { BottomNav, Card, CardTitle, GhostButton, PageHeader, Row } from "@/components/ui";
import { getHousehold } from "@/lib/household";
import { currentLoginPhoto } from "@/lib/photo";
import { logout } from "../login/actions";
import { PhotoUpload } from "./photo-upload";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [{ me }, photo] = await Promise.all([getHousehold(), currentLoginPhoto()]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-4 px-5 pt-6 pb-24">
      <PageHeader eyebrow="SETTINGS" title="설정" />

      <Card>
        <CardTitle>로그인 화면 사진</CardTitle>
        <div className="mb-3 flex h-56 items-center justify-center overflow-hidden rounded-t-[110px] rounded-b-md bg-[#dcd5c6] text-xs text-muted">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="지금 로그인 사진" className="h-full w-full object-cover" />
          ) : (
            "아직 사진이 없어요"
          )}
        </div>
        <PhotoUpload />
      </Card>

      <Link href="/settings/manage" className="flex items-center justify-between rounded-2xl border border-line bg-card p-4 text-sm">
        <span>
          계좌 · 카드 · 고정지출 관리
          <span className="mt-0.5 block text-xs text-muted">새 카드나 고정지출이 생기면 여기서 추가해요</span>
        </span>
        <span className="text-brown">›</span>
      </Link>

      <Card>
        <CardTitle>계정</CardTitle>
        <Row label="지금 로그인" value={me ?? "—"} />
        <form action={logout} className="mt-2">
          <GhostButton type="submit" className="w-full">로그아웃</GhostButton>
        </form>
      </Card>

      <BottomNav active="/settings" />
    </main>
  );
}
