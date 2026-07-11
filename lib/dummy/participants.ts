import type { Participant } from '@/types/domain'

const DUMMY_PARTICIPANTS: Participant[] = [
  {
    id: 'ptc-1',
    event_id: 'evt-1',
    name: '김민준',
    contact: '010-1111-2222',
    rsvp_status: 'confirmed',
    created_at: '2026-07-02T10:00:00+09:00',
  },
  {
    id: 'ptc-2',
    event_id: 'evt-1',
    name: '이서연',
    contact: '010-3333-4444',
    rsvp_status: 'confirmed',
    created_at: '2026-07-02T11:00:00+09:00',
  },
  {
    id: 'ptc-3',
    event_id: 'evt-1',
    name: '박도윤',
    contact: '010-5555-6666',
    rsvp_status: 'pending',
    created_at: '2026-07-03T09:00:00+09:00',
  },
]

export function getDummyParticipants(eventId: string): Participant[] {
  return DUMMY_PARTICIPANTS.filter(
    participant => participant.event_id === eventId
  )
}
