'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { RSVP_STATUSES, type RsvpStatus } from '@/lib/constants/event'

type ActionResult = { error: string } | { success: true }

export async function createParticipant(
  eventId: string,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get('name') as string)?.trim()
  const contact = (formData.get('contact') as string)?.trim()
  const rsvpStatus = formData.get('rsvp_status') as string

  if (!name) return { error: '이름을 입력해주세요.' }
  if (!RSVP_STATUSES.includes(rsvpStatus as RsvpStatus)) {
    return { error: '참여 상태를 선택해주세요.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('participants').insert({
    event_id: eventId,
    name,
    contact: contact || null,
    rsvp_status: rsvpStatus,
  })

  if (error) {
    return { error: '참여자 등록에 실패했습니다. 다시 시도해주세요.' }
  }

  revalidatePath(`/protected/events/${eventId}`)
  return { success: true }
}

export async function updateParticipantStatus(
  eventId: string,
  participantId: string,
  rsvpStatus: string
): Promise<ActionResult> {
  if (!RSVP_STATUSES.includes(rsvpStatus as RsvpStatus)) {
    return { error: '유효하지 않은 참여 상태입니다.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('participants')
    .update({ rsvp_status: rsvpStatus })
    .eq('id', participantId)

  if (error) {
    return { error: '참여 상태 변경에 실패했습니다.' }
  }

  revalidatePath(`/protected/events/${eventId}`)
  return { success: true }
}

export async function deleteParticipant(
  eventId: string,
  participantId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', participantId)

  if (error) {
    return { error: '참여자 삭제에 실패했습니다. 다시 시도해주세요.' }
  }

  revalidatePath(`/protected/events/${eventId}`)
  return { success: true }
}
