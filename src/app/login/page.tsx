import { ArchPhoto, DdayRow } from "@/components/cover";
import { currentLoginPhoto } from "@/lib/photo";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const photo = await currentLoginPhoto();

  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col gap-[22px] px-7 pt-12 pb-7">
      <DdayRow />
      <ArchPhoto photo={photo} />

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
