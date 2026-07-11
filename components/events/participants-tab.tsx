'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RSVP_STATUSES } from '@/lib/constants/event'
import {
  updateParticipantStatus,
  deleteParticipant,
} from '@/app/protected/events/[eventId]/participant-actions'
import type { Participant } from '@/types/domain'

const RSVP_LABEL: Record<string, string> = {
  confirmed: '확정',
  pending: '대기',
  declined: '불참',
}

// 공개 조회(/e/[shareSlug])는 contact를 아예 쿼리하지 않으므로 optional로 둔다 (docs/PRD.md §3).
type ParticipantRowData = Pick<Participant, 'id' | 'name' | 'rsvp_status'> & {
  contact?: Participant['contact']
}

function ParticipantRow({
  eventId,
  participant,
  hideContact,
  editable,
}: {
  eventId: string
  participant: ParticipantRowData
  hideContact: boolean
  editable: boolean
}) {
  const [status, setStatus] = useState(participant.rsvp_status)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleStatusChange = async (value: string) => {
    setStatus(value)
    await updateParticipantStatus(eventId, participant.id, value)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteParticipant(eventId, participant.id)
  }

  return (
    <TableRow>
      <TableCell>{participant.name}</TableCell>
      {!hideContact && <TableCell>{participant.contact}</TableCell>}
      <TableCell>
        {editable ? (
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger size="sm" className="w-24">
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
        ) : (
          <Badge variant="secondary">{RSVP_LABEL[status]}</Badge>
        )}
      </TableCell>
      {editable && (
        <TableCell>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm">
                삭제
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>참여자를 삭제하시겠습니까?</DialogTitle>
                <DialogDescription>
                  {participant.name}님을 목록에서 제거합니다. 되돌릴 수
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
        </TableCell>
      )}
    </TableRow>
  )
}

// hideContact: 참여자 공개 페이지(/e/[shareSlug])에서는 연락처를 노출하지 않는다 (docs/PRD.md §3).
// editable: 주최자 관리 화면에서만 상태 인라인 수정/삭제를 노출한다.
export function ParticipantsTab({
  eventId,
  participants,
  hideContact = false,
  editable = false,
}: {
  eventId?: string
  participants: ParticipantRowData[]
  hideContact?: boolean
  editable?: boolean
}) {
  if (participants.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">등록된 참여자가 없습니다.</p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          {!hideContact && <TableHead>연락처</TableHead>}
          <TableHead>참여 상태</TableHead>
          {editable && <TableHead>관리</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map(participant => (
          <ParticipantRow
            key={participant.id}
            eventId={eventId ?? ''}
            participant={participant}
            hideContact={hideContact}
            editable={editable}
          />
        ))}
      </TableBody>
    </Table>
  )
}
