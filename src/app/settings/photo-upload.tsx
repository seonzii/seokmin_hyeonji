"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOGIN_PHOTO_PATH } from "@/lib/photo";
import { createClient } from "@/lib/supabase/client";

/** 휴대폰 사진은 커서, 긴 변 1600px JPEG로 줄여서 올린다 */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("변환 실패"))), "image/jpeg", 0.85),
  );
}

export function PhotoUpload() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("올리는 중…");
    try {
      const blob = await shrink(file);
      const { error } = await createClient()
        .storage.from("photos")
        .upload(LOGIN_PHOTO_PATH, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "60" });
      if (error) throw error;
      setStatus("바꿨어요. 로그인 화면에서 확인해 보세요.");
      router.refresh();
    } catch (err) {
      setStatus(`실패했어요: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl bg-brown text-sm font-medium text-paper">
        사진 고르기
        <input type="file" accept="image/*" onChange={onChange} className="sr-only" />
      </label>
      <p role="status" className="min-h-5 text-center text-xs text-muted">
        {status}
      </p>
    </div>
  );
}
