import { notFound } from 'next/navigation'
import { EventDetailTabs } from '@/components/events/event-detail-tabs'
import { OverviewTab } from '@/components/events/overview-tab'
import { NoticesTab } from '@/components/events/notices-tab'
import { ParticipantsTab } from '@/components/events/participants-tab'
import { CarpoolTab } from '@/components/events/carpool-tab'
import { SettlementTab } from '@/components/events/settlement-tab'
import { getDummyEventById } from '@/lib/dummy/events'
import { getDummyNotices } from '@/lib/dummy/notices'
import { getDummyParticipants } from '@/lib/dummy/participants'
import { getDummyCarpoolOffers } from '@/lib/dummy/carpool'
import { getDummySettlements } from '@/lib/dummy/settlements'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const event = getDummyEventById(eventId)

  if (!event) {
    notFound()
  }

  const participants = getDummyParticipants(event.id)

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <EventDetailTabs
        overview={<OverviewTab event={event} />}
        notices={<NoticesTab notices={getDummyNotices(event.id)} />}
        participants={<ParticipantsTab participants={participants} />}
        carpool={<CarpoolTab offers={getDummyCarpoolOffers(event.id)} />}
        settlement={
          <SettlementTab
            settlements={getDummySettlements(event.id)}
            participants={participants}
          />
        }
      />
    </div>
  )
}
