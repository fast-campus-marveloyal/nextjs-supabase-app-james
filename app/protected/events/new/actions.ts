'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateShareSlug } from '@/lib/slug'
import { EVENT_CATEGORIES, type EventCategory } from '@/lib/constants/event'

export async function createEvent(
  formData: FormData
): Promise<{ error: string } | undefined> {
  const title = (formData.get('title') as string)?.trim()
  const category = formData.get('category') as string
  const eventDate = formData.get('event_date') as string
  const location = (formData.get('location') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()

  if (!title) {
    return { error: '제목을 입력해주세요.' }
  }
  if (!EVENT_CATEGORIES.includes(category as EventCategory)) {
    return { error: '카테고리를 선택해주세요.' }
  }
  if (!eventDate) {
    return { error: '일시를 입력해주세요.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      organizer_id: user.id,
      title,
      category,
      event_date: new Date(eventDate).toISOString(),
      location: location || null,
      description: description || null,
      share_slug: generateShareSlug(),
    })
    .select('id')
    .single()

  if (error || !data) {
    return { error: '이벤트 생성에 실패했습니다. 다시 시도해주세요.' }
  }

  redirect(`/protected/events/${data.id}`)
}
