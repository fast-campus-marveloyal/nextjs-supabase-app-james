import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDummySettlementShares } from '@/lib/dummy/settlements'
import type { Participant, Settlement } from '@/types/domain'

export function SettlementTab({
  settlements,
  participants,
}: {
  settlements: Settlement[]
  participants: Pick<Participant, 'id' | 'name'>[]
}) {
  if (settlements.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        등록된 정산 항목이 없습니다.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {settlements.map(settlement => {
        const shares = getDummySettlementShares(settlement.id)
        const paidCount = shares.filter(share => share.paid).length

        return (
          <Card key={settlement.id}>
            <CardHeader>
              <CardTitle className="text-base">{settlement.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p>
                총액 {settlement.total_amount.toLocaleString()}원 ÷{' '}
                {shares.length}명 = 1인당{' '}
                {(shares[0]?.amount ?? 0).toLocaleString()}원
              </p>
              <p className="text-muted-foreground">
                입금 완료 {paidCount}/{shares.length}명
              </p>
              <div className="flex flex-col gap-1">
                {shares.map(share => {
                  const participant = participants.find(
                    p => p.id === share.participant_id
                  )
                  return (
                    <div
                      key={share.id}
                      className="flex items-center justify-between"
                    >
                      <span>{participant?.name ?? '알 수 없음'}</span>
                      <Badge variant={share.paid ? 'default' : 'outline'}>
                        {share.paid ? '입금 완료' : '미입금'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
