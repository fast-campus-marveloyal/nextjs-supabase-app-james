import type { Notice } from '@/types/domain'

const DUMMY_NOTICES: Notice[] = [
  {
    id: 'ntc-1',
    event_id: 'evt-1',
    title: '주차 안내',
    content: '수영장 지하주차장 2시간 무료입니다. 입구에서 도장 받아주세요.',
    pinned: true,
    created_at: '2026-07-02T10:00:00+09:00',
  },
  {
    id: 'ntc-2',
    event_id: 'evt-1',
    title: '준비물 안내',
    content: '수영모, 수경은 개인 지참입니다.',
    pinned: false,
    created_at: '2026-07-03T10:00:00+09:00',
  },
  {
    id: 'ntc-3',
    event_id: 'evt-2',
    title: '모임 종료 안내',
    content: '이번 달 정기모임은 마감되었습니다.',
    pinned: false,
    created_at: '2026-06-25T10:00:00+09:00',
  },
]

export function getDummyNotices(eventId: string): Notice[] {
  return DUMMY_NOTICES.filter(notice => notice.event_id === eventId)
}
