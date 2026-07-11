'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ShareLinkButton({ shareSlug }: { shareSlug: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/e/${shareSlug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button type="button" variant="outline" onClick={handleCopy}>
      {copied ? '복사됨!' : '공유 링크 복사'}
    </Button>
  )
}
