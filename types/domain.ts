// 임시 타입 — Phase 1에서 각 테이블 마이그레이션 적용 후 Supabase MCP generate_typescript_types로
// types/database.types.ts에 동일 테이블 타입이 생성되면, 이 파일은 Tables<'...'> 등으로 대체하고 삭제할 예정.
// (docs/PRD.md §5 SQL 정의와 1:1 대응, shrimp-rules.md §2 참고)

import type { Tables } from './database.types'
import type { CarpoolRequestStatus } from '@/lib/constants/event'

// events/notices/participants는 각각 Task004/008/010 마이그레이션 완료로 Supabase 생성 타입을 그대로 재노출한다.
export type Event = Tables<'events'>
export type Notice = Tables<'notices'>
export type Participant = Tables<'participants'>

export interface CarpoolOffer {
  id: string
  event_id: string
  driver_name: string
  departure_location: string
  departure_time: string
  seat_count: number
  created_at: string
}

export interface CarpoolRequest {
  id: string
  carpool_offer_id: string
  requester_name: string
  status: CarpoolRequestStatus
  created_at: string
}

export interface Settlement {
  id: string
  event_id: string
  title: string
  total_amount: number
  created_at: string
}

export interface SettlementShare {
  id: string
  settlement_id: string
  participant_id: string
  amount: number
  paid: boolean
  paid_at: string | null
  created_at: string
}
