import { notFound } from 'next/navigation'
import { OverviewTab } from '@/components/events/overview-tab'
import { NoticesTab } from '@/components/events/notices-tab'
import { ParticipantsTab } from '@/components/events/participants-tab'
import { CarpoolTab } from '@/components/events/carpool-tab'
import { SettlementTab } from '@/components/events/settlement-tab'
import { getDummyEventBySlug } from '@/lib/dummy/events'
import { getDummyNotices } from '@/lib/dummy/notices'
import { getDummyParticipants } from '@/lib/dummy/participants'
import { getDummyCarpoolOffers } from '@/lib/dummy/carpool'
import { getDummySettlements } from '@/lib/dummy/settlements'

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ shareSlug: string }>
}) {
  const { shareSlug } = await params
  const event = getDummyEventBySlug(shareSlug)

  if (!event) {
    notFound()
  }

  const participants = getDummyParticipants(event.id)

  return (
    <div className="flex flex-col gap-6">
      <OverviewTab event={event} />
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">공지</h2>
        <NoticesTab notices={getDummyNotices(event.id)} />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">참여자 명단</h2>
        {/* 참여자 공개 페이지에서는 연락처를 노출하지 않는다 (docs/PRD.md §3) */}
        <ParticipantsTab participants={participants} hideContact />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">카풀</h2>
        <CarpoolTab offers={getDummyCarpoolOffers(event.id)} />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">정산 요약</h2>
        <SettlementTab
          settlements={getDummySettlements(event.id)}
          participants={participants}
        />
      </section>
    </div>
  )
}
