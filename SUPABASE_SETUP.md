# Supabase Guestbook Setup

## 1) 프로젝트 연결

```bash
npm install -g supabase
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
```

## 2) DB 스키마 반영

```bash
supabase db push
```

또는 Supabase SQL Editor에서 `supabase/migrations/20260331_guestbook.sql` 내용을 실행해도 됩니다.

## 3) Edge Function 배포

```bash
supabase functions deploy create-guestbook-entry
supabase functions deploy delete-guestbook-entry
```

## 4) 프론트 환경변수 설정

`.env.example`을 복사해서 `.env` 파일을 만들고 값을 채우세요.

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

GitHub Pages 배포 시에는 Repository Secrets/Variables에 같은 값을 넣어 빌드 환경변수로 주입하세요.
