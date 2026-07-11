import Link from 'next/link'
import { Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { EVENT_CATEGORIES, type EventCategory } from '@/lib/constants/event'

const STATUS_LABEL: Record<string, string> = {
  recruiting: '모집중',
  closed: '마감',
  ended: '종료',
}

function isEventCategory(value: string): value is EventCategory {
  return (EVENT_CATEGORIES as readonly string[]).includes(value)
}

async function EventList({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const activeCategory = category && isEventCategory(category) ? category : null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user!.id)
    .order('created_at', { ascending: false })

  if (activeCategory) {
    query = query.eq('category', activeCategory)
  }

  const { data: events } = await query

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link href="/protected/dashboard">
          <Badge variant={activeCategory === null ? 'default' : 'secondary'}>
            전체
          </Badge>
        </Link>
        {EVENT_CATEGORIES.map(c => (
          <Link key={c} href={`/protected/dashboard?category=${c}`}>
            <Badge variant={activeCategory === c ? 'default' : 'secondary'}>
              {c}
            </Badge>
          </Link>
        ))}
      </div>

      {!events || events.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {activeCategory
            ? '해당 카테고리의 이벤트가 없습니다.'
            : '아직 생성한 이벤트가 없습니다. 첫 이벤트를 만들어보세요.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {events.map(event => (
            <Link key={event.id} href={`/protected/events/${event.id}`}>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <Badge variant="secondary">{event.category}</Badge>
                  <Badge>{STATUS_LABEL[event.status]}</Badge>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 이벤트 목록</h1>
        <Link href="/protected/events/new">
          <Button>새 이벤트 만들기</Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">불러오는 중...</p>
        }
      >
        <EventList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
