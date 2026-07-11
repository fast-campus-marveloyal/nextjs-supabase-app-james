import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Participant } from '@/types/domain'

const RSVP_LABEL: Record<Participant['rsvp_status'], string> = {
  confirmed: '확정',
  pending: '대기',
  declined: '불참',
}

// hideContact: 참여자 공개 페이지(/e/[shareSlug])에서는 연락처를 노출하지 않는다 (docs/PRD.md §3).
export function ParticipantsTab({
  participants,
  hideContact = false,
}: {
  participants: Participant[]
  hideContact?: boolean
}) {
  if (participants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">등록된 참여자가 없습니다.</p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          {!hideContact && <TableHead>연락처</TableHead>}
          <TableHead>참여 상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map(participant => (
          <TableRow key={participant.id}>
            <TableCell>{participant.name}</TableCell>
            {!hideContact && <TableCell>{participant.contact}</TableCell>}
            <TableCell>
              <Badge variant="secondary">
                {RSVP_LABEL[participant.rsvp_status]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
