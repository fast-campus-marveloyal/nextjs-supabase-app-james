'use client'

import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 탭 전환만 담당하는 클라이언트 셸 — 실제 탭 콘텐츠는 상위 Server Component가
// 렌더링해 props로 전달한다 (자체 데이터 fetch 없음).
export function EventDetailTabs({
  overview,
  notices,
  participants,
  carpool,
  settlement,
}: {
  overview: ReactNode
  notices: ReactNode
  participants: ReactNode
  carpool: ReactNode
  settlement: ReactNode
}) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">개요</TabsTrigger>
        <TabsTrigger value="notices">공지</TabsTrigger>
        <TabsTrigger value="participants">참여자</TabsTrigger>
        <TabsTrigger value="carpool">카풀</TabsTrigger>
        <TabsTrigger value="settlement">정산</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">{overview}</TabsContent>
      <TabsContent value="notices">{notices}</TabsContent>
      <TabsContent value="participants">{participants}</TabsContent>
      <TabsContent value="carpool">{carpool}</TabsContent>
      <TabsContent value="settlement">{settlement}</TabsContent>
    </Tabs>
  )
}
