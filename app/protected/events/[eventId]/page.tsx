import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { EventDetailTabs } from '@/components/events/event-detail-tabs'
import { OverviewTab } from '@/components/events/overview-tab'
import { NoticesTab } from '@/components/events/notices-tab'
import { ParticipantsTab } from '@/components/events/participants-tab'
import { CarpoolTab } from '@/components/events/carpool-tab'
import { SettlementTab } from '@/components/events/settlement-tab'
import { EventEditForm } from '@/components/events/event-edit-form'
import { ShareLinkButton } from '@/components/events/share-link-button'
import { NoticeForm } from '@/components/events/notice-form'
import { ParticipantForm } from '@/components/events/participant-form'
import { createClient } from '@/lib/supabase/server'
import { getDummyCarpoolOffers } from '@/lib/dummy/carpool'
import { getDummySettlements } from '@/lib/dummy/settlements'

async function EventDetailContent({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (!event) {
    notFound()
  }

  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .eq('event_id', event.id)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <ShareLinkButton shareSlug={event.share_slug} />
      </div>
      <EventDetailTabs
        overview={
          <div className="flex flex-col gap-4">
            <OverviewTab event={event} />
            <EventEditForm event={event} />
          </div>
        }
        notices={
          <div className="flex flex-col gap-4">
            <NoticesTab notices={notices ?? []} />
            <NoticeForm eventId={event.id} notices={notices ?? []} />
          </div>
        }
        participants={
          <div className="flex flex-col gap-4">
            <ParticipantsTab
              eventId={event.id}
              participants={participants ?? []}
              editable
            />
            <ParticipantForm eventId={event.id} />
          </div>
        }
        carpool={<CarpoolTab offers={getDummyCarpoolOffers(event.id)} />}
        settlement={
          <SettlementTab
            settlements={getDummySettlements(event.id)}
            participants={participants ?? []}
          />
        }
      />
    </>
  )
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">불러오는 중...</p>
        }
      >
        <EventDetailContent params={params} />
      </Suspense>
    </div>
  )
}
