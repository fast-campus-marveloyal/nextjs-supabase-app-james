import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Service Role 클라이언트 — 공개 조회(/e/[shareSlug])·비로그인 탑승 신청 등 RLS 우회가
// 필요한 Route Handler 및 공용 쿼리 함수(lib/queries/*) 전용.
// 절대 'use client' 컴포넌트나 브라우저 번들에서 import하지 말 것 (shrimp-rules.md §9).
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
