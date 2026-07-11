'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { error: string } | { success: true }

export async function createNotice(
  eventId: string,
  formData: FormData
): Promise<ActionResult> {
  const title = (formData.get('title') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()

  if (!title) return { error: '제목을 입력해주세요.' }
  if (!content) return { error: '내용을 입력해주세요.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('notices')
    .insert({ event_id: eventId, title, content })

  if (error) {
    return { error: '공지 작성에 실패했습니다. 다시 시도해주세요.' }
  }

  revalidatePath(`/protected/events/${eventId}`)
  return { success: true }
}

export async function updateNotice(
  eventId: string,
  noticeId: string,
  formData: FormData
): Promise<ActionResult> {
  const title = (formData.get('title') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()

  if (!title) return { error: '제목을 입력해주세요.' }
  if (!content) return { error: '내용을 입력해주세요.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('notices')
    .update({ title, content })
    .eq('id', noticeId)

  if (error) {
    return { error: '공지 수정에 실패했습니다. 다시 시도해주세요.' }
  }

  revalidatePath(`/protected/events/${eventId}`)
  return { success: true }
}

export async function toggleNoticePinned(
  eventId: string,
  noticeId: string,
  pinned: boolean
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notices')
    .update({ pinned })
    .eq('id', noticeId)

  if (error) {
    return { error: '고정 상태 변경에 실패했습니다.' }
  }

  revalidatePath(`/protected/events/${eventId}`)
  return { success: true }
}

export async function deleteNotice(
  eventId: string,
  noticeId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('notices').delete().eq('id', noticeId)

  if (error) {
    return { error: '공지 삭제에 실패했습니다. 다시 시도해주세요.' }
  }

  revalidatePath(`/protected/events/${eventId}`)
  return { success: true }
}
