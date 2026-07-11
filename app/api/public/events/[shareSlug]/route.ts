import { NextResponse } from 'next/server'

// Phase 0 placeholder — Service Role 기반 실제 조회 로직은 Task 012에서 구현
export async function GET() {
  return NextResponse.json({ todo: true }, { status: 501 })
}
