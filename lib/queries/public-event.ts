import { createServiceClient } from '@/lib/supabase/service'
import type { Event, Notice } from '@/types/domain'

// 공개 조회 응답의 참여자는 이름·참여 상태만 노출한다. 연락처(contact)는 절대 포함하지 않는다 (docs/PRD.md §3, §5).
export type PublicParticipant = {
  id: string
  name: string
  rsvp_status: string
}

export type PublicEventData = {
  event: Event
  notices: Notice[]
  participants: PublicParticipant[]
}

// Route Handler(app/api/public/events/[shareSlug]/route.ts)와 공개 페이지(app/e/[shareSlug]/page.tsx)가
// 함께 호출하는 공용 함수 — 페이지가 자신의 Route Handler를 셀프 fetch하지 않도록 한다.
export async function getPublicEventBySlug(
  shareSlug: string
): Promise<PublicEventData | null> {
  const supabase = createServiceClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('share_slug', shareSlug)
    .single()

  if (!event) {
    return null
  }

  const [{ data: notices }, { data: participants }] = await Promise.all([
    supabase
      .from('notices')
      .select('*')
      .eq('event_id', event.id)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('participants')
      .select('id,name,rsvp_status')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false }),
  ])

  return {
    event,
    notices: notices ?? [],
    participants: participants ?? [],
  }
}
