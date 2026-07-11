import { NextResponse } from 'next/server'
import { getPublicEventBySlug } from '@/lib/queries/public-event'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareSlug: string }> }
) {
  const { shareSlug } = await params
  const data = await getPublicEventBySlug(shareSlug)

  if (!data) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
