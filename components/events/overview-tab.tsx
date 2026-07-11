import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Event } from '@/types/domain'

const STATUS_LABEL: Record<Event['status'], string> = {
  recruiting: '모집중',
  closed: '마감',
  ended: '종료',
}

export function OverviewTab({ event }: { event: Event }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle>{event.title}</CardTitle>
        <Badge variant="secondary">{event.category}</Badge>
        <Badge>{STATUS_LABEL[event.status]}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <p>{event.description}</p>
        <p>일시: {new Date(event.event_date).toLocaleString('ko-KR')}</p>
        <p>장소: {event.location}</p>
        <p className="text-muted-foreground">
          공유 링크: /e/{event.share_slug}
        </p>
      </CardContent>
    </Card>
  )
}
