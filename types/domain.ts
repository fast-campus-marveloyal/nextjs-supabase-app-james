// 임시 타입 — Phase 1에서 각 테이블 마이그레이션 적용 후 Supabase MCP generate_typescript_types로
// types/database.types.ts에 동일 테이블 타입이 생성되면, 이 파일은 Tables<'events'> 등으로 대체하고 삭제할 예정.
// (docs/PRD.md §5 SQL 정의와 1:1 대응, shrimp-rules.md §2 참고)

import type {
  CarpoolRequestStatus,
  EventCategory,
  EventStatus,
  RsvpStatus,
} from '@/lib/constants/event'

export interface Event {
  id: string
  organizer_id: string
  title: string
  category: EventCategory
  description: string | null
  event_date: string
  location: string | null
  share_slug: string
  status: EventStatus
  created_at: string
  updated_at: string
}

export interface Notice {
  id: string
  event_id: string
  title: string
  content: string
  pinned: boolean
  created_at: string
}

export interface Participant {
  id: string
  event_id: string
  name: string
  contact: string | null
  rsvp_status: RsvpStatus
  created_at: string
}

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
