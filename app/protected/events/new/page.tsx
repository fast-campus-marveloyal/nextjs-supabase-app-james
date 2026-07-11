import { EventForm } from '@/components/events/event-form'

export default function NewEventPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-2xl font-bold">이벤트 생성</h1>
      <EventForm />
    </div>
  )
}
