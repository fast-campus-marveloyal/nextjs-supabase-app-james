import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { getDummyEvents } from '@/lib/dummy/events'

const STATUS_LABEL: Record<string, string> = {
  recruiting: '모집중',
  closed: '마감',
  ended: '종료',
}

export default function DashboardPage() {
  const events = getDummyEvents()

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-2xl font-bold">내 이벤트 목록</h1>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          아직 생성한 이벤트가 없습니다.
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
    </div>
  )
}
