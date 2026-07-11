// Service Role 클라이언트 골격 — 공개 조회(/e/[shareSlug])·비로그인 탑승 신청 등 RLS 우회가
// 필요한 Route Handler 전용. 실제 SUPABASE_SERVICE_ROLE_KEY 사용 로직은 Task 012에서 구현한다.
// 절대 'use client' 컴포넌트나 브라우저 번들에서 import하지 말 것 (shrimp-rules.md §9).
export function createServiceClient(): never {
  throw new Error('createServiceClient() is not implemented yet — see Task 012')
}
