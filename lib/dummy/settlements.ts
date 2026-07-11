import type { Settlement, SettlementShare } from '@/types/domain'

const DUMMY_SETTLEMENTS: Settlement[] = [
  {
    id: 'stl-1',
    event_id: 'evt-1',
    title: '수영장 대관료',
    total_amount: 60000,
    created_at: '2026-07-03T12:00:00+09:00',
  },
]

const DUMMY_SETTLEMENT_SHARES: SettlementShare[] = [
  {
    id: 'sts-1',
    settlement_id: 'stl-1',
    participant_id: 'ptc-1',
    amount: 20000,
    paid: true,
    paid_at: '2026-07-03T13:00:00+09:00',
    created_at: '2026-07-03T12:00:00+09:00',
  },
  {
    id: 'sts-2',
    settlement_id: 'stl-1',
    participant_id: 'ptc-2',
    amount: 20000,
    paid: false,
    paid_at: null,
    created_at: '2026-07-03T12:00:00+09:00',
  },
  {
    id: 'sts-3',
    settlement_id: 'stl-1',
    participant_id: 'ptc-3',
    amount: 20000,
    paid: false,
    paid_at: null,
    created_at: '2026-07-03T12:00:00+09:00',
  },
]

export function getDummySettlements(eventId: string): Settlement[] {
  return DUMMY_SETTLEMENTS.filter(settlement => settlement.event_id === eventId)
}

export function getDummySettlementShares(
  settlementId: string
): SettlementShare[] {
  return DUMMY_SETTLEMENT_SHARES.filter(
    share => share.settlement_id === settlementId
  )
}
