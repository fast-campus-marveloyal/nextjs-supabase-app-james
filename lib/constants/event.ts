// docs/PRD.md §5의 check 제약과 동일한 값. Phase 1 마이그레이션 시에도 이 값을 그대로 사용할 것 — 임의 변경 금지.

export const EVENT_CATEGORIES = ['수영', '헬스', '모임', '기타'] as const
export type EventCategory = (typeof EVENT_CATEGORIES)[number]

export const EVENT_STATUSES = ['recruiting', 'closed', 'ended'] as const
export type EventStatus = (typeof EVENT_STATUSES)[number]

export const RSVP_STATUSES = ['pending', 'confirmed', 'declined'] as const
export type RsvpStatus = (typeof RSVP_STATUSES)[number]

export const CARPOOL_REQUEST_STATUSES = [
  'pending',
  'approved',
  'rejected',
] as const
export type CarpoolRequestStatus = (typeof CARPOOL_REQUEST_STATUSES)[number]
