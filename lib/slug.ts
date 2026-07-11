import { nanoid } from 'nanoid'

// 추측 불가능한 길이로 생성해 사실상의 비공개 링크로 운용 (docs/PRD.md §5)
export function generateShareSlug(): string {
  return nanoid(10)
}
