import type { Event } from '@/types/domain'

// Phase 0 더미 데이터 — Task 004 이후 Supabase 쿼리로 1:1 대체 예정
const DUMMY_EVENTS: Event[] = [
  {
    id: 'evt-1',
    organizer_id: 'dummy-organizer',
    title: '주말 수영 모임',
    category: '수영',
    description: '매주 토요일 아침 자유수영 모임입니다.',
    event_date: '2026-07-18T09:00:00+09:00',
    location: '올림픽수영장',
    share_slug: 'swim-abc123',
    status: 'recruiting',
    created_at: '2026-07-01T00:00:00+09:00',
    updated_at: '2026-07-01T00:00:00+09:00',
  },
  {
    id: 'evt-2',
    organizer_id: 'dummy-organizer',
    title: '헬스 정기모임',
    category: '헬스',
    description: '평일 저녁 헬스장 동행 모임입니다.',
    event_date: '2026-07-10T19:00:00+09:00',
    location: '강남 스포애니',
    share_slug: 'gym-xyz789',
    status: 'closed',
    created_at: '2026-06-20T00:00:00+09:00',
    updated_at: '2026-06-25T00:00:00+09:00',
  },
]

export function getDummyEvents(): Event[] {
  return DUMMY_EVENTS
}

export function getDummyEventById(eventId: string): Event | undefined {
  return DUMMY_EVENTS.find(event => event.id === eventId)
}

export function getDummyEventBySlug(shareSlug: string): Event | undefined {
  return DUMMY_EVENTS.find(event => event.share_slug === shareSlug)
}
