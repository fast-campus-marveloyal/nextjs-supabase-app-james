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
import { EVENT_CATEGORIES } from '@/lib/constants/event'
import { createEvent } from '@/app/protected/events/new/actions'

export function EventForm() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('category', category)
    formData.set('event_date', eventDate)
    formData.set('location', location)
    formData.set('description', description)

    const result = await createEvent(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">카테고리</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="카테고리를 선택해주세요" />
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
        <Label htmlFor="event_date">일시</Label>
        <Input
          id="event_date"
          type="datetime-local"
          required
          value={eventDate}
          onChange={e => setEventDate(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">장소</Label>
        <Input
          id="location"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '생성 중...' : '이벤트 생성'}
      </Button>
    </form>
  )
}
