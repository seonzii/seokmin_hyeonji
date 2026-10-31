# 석민과 현지의 살림 기록

엑셀로 매달 정리하던 부부 가계부를 옮긴 앱이에요. 두 사람만 로그인할 수 있고, 휴대폰 홈 화면에 앱처럼 설치해서 써요.

- Next.js (App Router) + Tailwind
- Supabase (로그인, DB, 사진 저장)
- Vercel 배포, PWA 설치

## 처음 한 번만 하는 설정

### 1. Supabase

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만들어요. 지역은 Seoul(ap-northeast-2).
2. **Authentication > Sign In / Providers**에서 *Allow new users to sign up*을 꺼요. 아무나 가입하지 못하게.
3. **Authentication > Users > Add user**로 두 사람 계정을 만들어요. 이메일 + 비밀번호, *Auto Confirm User* 체크.
   - 로그인 화면에는 비밀번호 칸만 있어서, **두 사람 비밀번호는 서로 달라야 해요.**
4. **SQL Editor**에 `supabase/migrations/0001_init.sql` 내용을 붙여넣고 실행해요.
5. 같은 SQL Editor에서 우리 집과 두 사람을 연결해요.

   ```sql
   with h as (insert into households (name) values ('석민과 현지') returning id)
   insert into household_members (household_id, user_id, display_name)
   select h.id, u.id, case u.email when '석민 이메일' then '석민' else '현지' end
   from h, auth.users u
   where u.email in ('석민 이메일', '현지 이메일');
   ```

### 2. 환경 변수

`.env.example`을 `.env.local`로 복사하고 채워요.

| 이름 | 어디서 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 같은 곳의 anon public key |
| `MEMBER_EMAILS` | 3번에서 만든 두 이메일, 쉼표로 구분 |

### 3. Vercel

1. [vercel.com](https://vercel.com)에서 이 GitHub 저장소를 Import 해요.
2. 위 세 환경 변수를 그대로 넣고 Deploy.
3. 휴대폰에서 주소를 열고 *홈 화면에 추가* 하면 앱처럼 써져요.

## 개발

```bash
npm install
npm run dev
```

## 구조

- `src/app/login` 로그인 화면 (D-day, 사진, 비밀번호)
- `src/middleware.ts` 로그인 안 하면 `/login`으로 보냄
- `supabase/migrations` DB 테이블과 접근 규칙(RLS). 두 사람만 읽고 쓸 수 있어요.
