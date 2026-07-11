import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Notice } from '@/types/domain'

export function NoticesTab({ notices }: { notices: Notice[] }) {
  const sorted = [...notices].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned)
  )

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">등록된 공지가 없습니다.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(notice => (
        <Card key={notice.id}>
          <CardHeader className="flex flex-row items-center gap-2">
            <CardTitle className="text-base">{notice.title}</CardTitle>
            {notice.pinned && <Badge variant="secondary">고정</Badge>}
          </CardHeader>
          <CardContent className="text-sm">{notice.content}</CardContent>
        </Card>
      ))}
    </div>
  )
}
