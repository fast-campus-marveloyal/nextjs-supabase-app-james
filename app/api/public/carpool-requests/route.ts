import { NextResponse } from 'next/server'

// Phase 0 placeholder — Service Role 기반 비로그인 탑승 신청 INSERT 로직은 Task 020에서 구현
export async function POST() {
  return NextResponse.json({ todo: true }, { status: 501 })
}
