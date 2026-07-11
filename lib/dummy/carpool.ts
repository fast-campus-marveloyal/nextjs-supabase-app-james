import type { CarpoolOffer, CarpoolRequest } from '@/types/domain'

const DUMMY_CARPOOL_OFFERS: CarpoolOffer[] = [
  {
    id: 'cpo-1',
    event_id: 'evt-1',
    driver_name: '김민준',
    departure_location: '강남역 11번 출구',
    departure_time: '2026-07-18T08:30:00+09:00',
    seat_count: 3,
    created_at: '2026-07-02T10:00:00+09:00',
  },
]

const DUMMY_CARPOOL_REQUESTS: CarpoolRequest[] = [
  {
    id: 'cpr-1',
    carpool_offer_id: 'cpo-1',
    requester_name: '박도윤',
    status: 'pending',
    created_at: '2026-07-03T09:00:00+09:00',
  },
]

export function getDummyCarpoolOffers(eventId: string): CarpoolOffer[] {
  return DUMMY_CARPOOL_OFFERS.filter(offer => offer.event_id === eventId)
}

export function getDummyCarpoolRequests(
  carpoolOfferId: string
): CarpoolRequest[] {
  return DUMMY_CARPOOL_REQUESTS.filter(
    request => request.carpool_offer_id === carpoolOfferId
  )
}
