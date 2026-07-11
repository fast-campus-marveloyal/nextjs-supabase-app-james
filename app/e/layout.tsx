// 참여자 공개 조회 전용 레이아웃 — 인증 네비게이션(AuthButton 등) 없이 최소 UI만 제공
export default function PublicEventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full max-w-3xl flex-1 flex-col gap-8 p-5">
        {children}
      </div>
    </main>
  )
}
