export const LOGIN_PHOTO_PATH = "login.jpg";

export function loginPhotoUrl(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${LOGIN_PHOTO_PATH}`;
}

/** 사진이 올라가 있으면 바뀐 시각을 붙인 주소, 없으면 null */
export async function currentLoginPhoto(): Promise<string | null> {
  try {
    const res = await fetch(loginPhotoUrl(), { method: "HEAD", cache: "no-store" });
    if (!res.ok) return null;
    const v = res.headers.get("last-modified") ?? res.headers.get("etag") ?? "";
    return `${loginPhotoUrl()}?v=${encodeURIComponent(v)}`;
  } catch {
    return null;
  }
}
