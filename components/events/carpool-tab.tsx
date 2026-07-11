import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDummyCarpoolRequests } from '@/lib/dummy/carpool'
import type { CarpoolOffer } from '@/types/domain'

export function CarpoolTab({ offers }: { offers: CarpoolOffer[] }) {
  if (offers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">등록된 카풀이 없습니다.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {offers.map(offer => {
        const requests = getDummyCarpoolRequests(offer.id)
        const approvedCount = requests.filter(
          request => request.status === 'approved'
        ).length

        return (
          <Card key={offer.id}>
            <CardHeader className="flex flex-row items-center gap-2">
              <CardTitle className="text-base">{offer.driver_name}</CardTitle>
              <Badge variant="secondary">
                {approvedCount}/{offer.seat_count}석
              </Badge>
              {approvedCount > offer.seat_count && (
                <Badge variant="destructive">좌석 초과</Badge>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <p>출발지: {offer.departure_location}</p>
              <p>
                출발 시각:{' '}
                {new Date(offer.departure_time).toLocaleString('ko-KR')}
              </p>
              <p className="text-muted-foreground">
                신청 {requests.length}건 (대기{' '}
                {requests.filter(r => r.status === 'pending').length}건)
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
