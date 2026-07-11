'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { EVENT_CATEGORIES, EVENT_STATUSES } from '@/lib/constants/event'
import {
  updateEvent,
  deleteEvent,
} from '@/app/protected/events/[eventId]/actions'
import type { Event } from '@/types/domain'

const STATUS_LABEL: Record<string, string> = {
  recruiting: '모집중',
  closed: '마감',
  ended: '종료',
}

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EventEditForm({ event }: { event: Event }) {
  const [title, setTitle] = useState(event.title)
  const [category, setCategory] = useState(event.category)
  const [eventDate, setEventDate] = useState(
    toDatetimeLocalValue(event.event_date)
  )
  const [location, setLocation] = useState(event.location ?? '')
  const [description, setDescription] = useState(event.description ?? '')
  const [status, setStatus] = useState(event.status)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('category', category)
    formData.set('event_date', eventDate)
    formData.set('location', location)
    formData.set('description', description)
    formData.set('status', status)

    const result = await updateEvent(event.id, formData)

    if ('error' in result) {
      setError(result.error)
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteEvent(event.id)
    if (result?.error) {
      setError(result.error)
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">이벤트 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">제목</Label>
            <Input
              id="edit-title"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-category">카테고리</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-status">상태</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="edit-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-event_date">일시</Label>
            <Input
              id="edit-event_date"
              type="datetime-local"
              required
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-location">장소</Label>
            <Input
              id="edit-location"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">설명</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-between gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="destructive">
                  이벤트 삭제
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>이벤트를 삭제하시겠습니까?</DialogTitle>
                  <DialogDescription>
                    공지·참여자 등 하위 데이터가 모두 함께 삭제되며 되돌릴 수
                    없습니다.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? '삭제 중...' : '삭제'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
