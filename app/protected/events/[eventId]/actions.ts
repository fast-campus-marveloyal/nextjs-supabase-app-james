'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  EVENT_CATEGORIES,
  EVENT_STATUSES,
  type EventCategory,
  type EventStatus,
} from '@/lib/constants/event'

export async function updateEvent(
  eventId: string,
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const title = (formData.get('title') as string)?.trim()
  const category = formData.get('category') as string
  const eventDate = formData.get('event_date') as string
  const location = (formData.get('location') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const status = formData.get('status') as string

  if (!title) {
    return { error: '제목을 입력해주세요.' }
  }
  if (!EVENT_CATEGORIES.includes(category as EventCategory)) {
    return { error: '카테고리를 선택해주세요.' }
  }
  if (!eventDate) {
    return { error: '일시를 입력해주세요.' }
  }
  if (!EVENT_STATUSES.includes(status as EventStatus)) {
    return { error: '상태를 선택해주세요.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('events')
    .update({
      title,
      category,
      event_date: new Date(eventDate).toISOString(),
      location: location || null,
      description: description || null,
      status,
    })
    .eq('id', eventId)

  if (error) {
    return { error: '이벤트 수정에 실패했습니다. 다시 시도해주세요.' }
  }

  revalidatePath(`/protected/events/${eventId}`)
  revalidatePath('/protected/dashboard')
  return { success: true }
}

export async function deleteEvent(
  eventId: string
): Promise<{ error: string } | undefined> {
  const supabase = await createClient()
  const { error } = await supabase.from('events').delete().eq('id', eventId)

  if (error) {
    return { error: '이벤트 삭제에 실패했습니다. 다시 시도해주세요.' }
  }

  revalidatePath('/protected/dashboard')
  redirect('/protected/dashboard')
}
