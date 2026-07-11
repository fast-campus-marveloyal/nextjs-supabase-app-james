'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  createNotice,
  updateNotice,
  toggleNoticePinned,
  deleteNotice,
} from '@/app/protected/events/[eventId]/notice-actions'
import type { Notice } from '@/types/domain'

function NoticeCreateForm({ eventId }: { eventId: string }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('content', content)

    const result = await createNotice(eventId, formData)

    if ('error' in result) {
      setError(result.error)
    } else {
      setTitle('')
      setContent('')
    }
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">공지 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label htmlFor="notice-title">제목</Label>
            <Input
              id="notice-title"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notice-content">내용</Label>
            <Textarea
              id="notice-content"
              required
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="self-start">
            {isSubmitting ? '작성 중...' : '공지 등록'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function NoticeManageItem({
  eventId,
  notice,
}: {
  eventId: string
  notice: Notice
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(notice.title)
  const [content, setContent] = useState(notice.content)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPinning, setIsPinning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('content', content)

    const result = await updateNotice(eventId, notice.id, formData)

    if ('error' in result) {
      setError(result.error)
    } else {
      setIsEditing(false)
    }
    setIsSaving(false)
  }

  const handleTogglePinned = async () => {
    setIsPinning(true)
    await toggleNoticePinned(eventId, notice.id, !notice.pinned)
    setIsPinning(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteNotice(eventId, notice.id)
    if ('error' in result) {
      setError(result.error)
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? '저장 중...' : '저장'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="text-base">{notice.title}</CardTitle>
        {notice.pinned && <Badge variant="secondary">고정</Badge>}
      </CardHeader>
      <CardContent className="text-sm">{notice.content}</CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTogglePinned}
          disabled={isPinning}
        >
          {notice.pinned ? '고정 해제' : '상단 고정'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
        >
          수정
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="destructive" size="sm">
              삭제
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>공지를 삭제하시겠습니까?</DialogTitle>
              <DialogDescription>삭제 후 되돌릴 수 없습니다.</DialogDescription>
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
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardFooter>
    </Card>
  )
}

export function NoticeForm({
  eventId,
  notices,
}: {
  eventId: string
  notices: Notice[]
}) {
  const sorted = [...notices].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned)
  )

  return (
    <div className="flex flex-col gap-4">
      <NoticeCreateForm eventId={eventId} />
      {sorted.map(notice => (
        <NoticeManageItem key={notice.id} eventId={eventId} notice={notice} />
      ))}
    </div>
  )
}
