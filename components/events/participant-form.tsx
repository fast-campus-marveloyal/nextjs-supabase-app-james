'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RSVP_STATUSES } from '@/lib/constants/event'
import { createParticipant } from '@/app/protected/events/[eventId]/participant-actions'

const RSVP_LABEL: Record<string, string> = {
  confirmed: '확정',
  pending: '대기',
  declined: '불참',
}

export function ParticipantForm({ eventId }: { eventId: string }) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState<string>('confirmed')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData()
    formData.set('name', name)
    formData.set('contact', contact)
    formData.set('rsvp_status', rsvpStatus)

    const result = await createParticipant(eventId, formData)

    if ('error' in result) {
      setError(result.error)
    } else {
      setName('')
      setContact('')
      setRsvpStatus('confirmed')
    }
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">참여자 등록</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div className="grid gap-2">
            <Label htmlFor="participant-name">이름</Label>
            <Input
              id="participant-name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="participant-contact">연락처</Label>
            <Input
              id="participant-contact"
              value={contact}
              onChange={e => setContact(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="participant-status">참여 상태</Label>
            <Select value={rsvpStatus} onValueChange={setRsvpStatus}>
              <SelectTrigger id="participant-status" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RSVP_STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {RSVP_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '등록 중...' : '참여자 등록'}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  )
}
