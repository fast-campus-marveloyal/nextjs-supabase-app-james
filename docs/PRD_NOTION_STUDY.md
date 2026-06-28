# 노션 기반 팀 스터디 자료실 MVP PRD

## 🎯 핵심 정보

**목적**: 노션 데이터베이스에 등록된 팀 학습 자료(아티클·도서·영상·문서 링크)를 웹에서 통합 검색·조회할 수 있는 단일 진실 공급원(SSoT) 구축  
**사용자**: 노션에 학습 자료를 등록·태깅하는 팀원 및 웹에서 자료를 검색·열람하여 학습에 활용하는 팀원

---

## 🚶 사용자 여정

### 자료 등록자 흐름

```
1. Notion DB에 학습 자료 입력
   (제목, URL, 설명, 카테고리, 추천 사유, 기여자명 직접 입력)
   ↓ 노션 페이지 저장 완료

2. 팀원에게 웹 자료실 URL 공유
   ↓ 팀 슬랙·메신저 등을 통해 전달

3. 자료실 웹에서 등록 결과 확인
   ↓ 자료 목록 페이지에서 카드로 노출되는지 확인

4. 완료 — 팀원들이 자료를 검색·열람
```

### 자료 열람자 흐름

```
1. 자료실 웹 URL 접근 → 팀 패스워드 입력
   ↓ 인증 성공 → 세션 쿠키 발급

2. 자료 목록 페이지
   ↓ 키워드 검색으로 원하는 자료 탐색

   자료 발견 → 자료 상세 페이지 이동 → 원본 링크 클릭
   자료 없음 → 검색어 변경 후 재검색
   ↓

3. 자료 상세 페이지
   ↓ 제목·설명·추천 사유·기여자·원본 URL 확인

4. 완료 → 원본 링크 새 탭으로 열어 학습
```

---

## ⚡ 기능 명세

### 1. MVP 핵심 기능

| ID       | 기능명         | 설명                                                                          | MVP 필수 이유                                              | 관련 페이지                        |
| -------- | -------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------- |
| **F001** | 자료 목록 조회 | Notion DB의 학습 자료를 카드 형태로 표시, 제목·기여자·카테고리·등록일 노출    | 서비스의 핵심 가치인 자료 탐색의 진입점                    | 자료 목록 페이지                   |
| **F002** | 자료 상세 조회 | 개별 자료의 제목·URL·설명·추천 사유·기여자·등록일 전체 표시 및 원본 링크 이동 | 등록 정보를 온전히 확인하고 원본으로 이동하는 핵심 동선    | 자료 상세 페이지                   |
| **F003** | 키워드 검색    | 제목·설명 기반 클라이언트 사이드 필터링으로 입력 즉시 결과 갱신               | 자료가 누적될수록 탐색 없이는 활용 불가 — 검색이 곧 생산성 | 자료 목록 페이지                   |
| **F004** | 기여자 표시    | 각 자료 카드 및 상세 페이지에 등록자/추천자 이름 노출                         | 자료 출처 신뢰도 확보 및 팀 기여 가시화                    | 자료 목록 페이지, 자료 상세 페이지 |

### 2. MVP 필수 지원 기능

| ID       | 기능명             | 설명                                                                     | MVP 필수 이유                                                      | 관련 페이지      |
| -------- | ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------- |
| **F010** | 팀 인증            | 환경변수(`TEAM_PASSWORD`) 기반 팀 공용 패스워드 로그인 및 세션 쿠키 관리 | 내부 자료를 외부 공개로부터 보호하는 유일한 접근 제어              | 로그인 페이지    |
| **F011** | 에러 처리          | 존재하지 않는 자료 ID 접근 시 404, Notion API 오류 시 에러 페이지 표시   | 잘못된 접근에 명확한 피드백 제공 및 앱 크래시 방지                 | 404 에러 페이지  |
| **F012** | Notion 데이터 파싱 | Notion API 응답을 `StudyMaterial` 타입으로 변환 및 60초 캐싱 적용        | Notion을 DB로 직접 사용하기 위한 필수 변환 레이어, Rate Limit 회피 | (서버 내부 로직) |

### 3. MVP 이후 기능 (제외)

- 태그/카테고리 필터링 — 자료가 충분히 누적된 후 Phase 2에서 구현
- 자료 북마크/저장 기능 — 개인화 기능은 MVP 범위 초과
- 댓글·평점·반응 이모지 — 소셜 인터랙션은 MVP 이후
- 개별 사용자 계정 관리 — 팀 공용 패스워드로 충분
- 자료 조회수·통계 대시보드 — 누적 데이터 확보 후 의미 있음
- 실시간 알림 (신규 자료 등록 알림) — MVP 이후 자동화 단계

---

## 📱 메뉴 구조

```
[비로그인 상태 — 인증 필요]
└── 로그인 페이지
    └── 기능: F010 (팀 패스워드 인증)

[로그인 상태 — 세션 쿠키 유효]
├── 자료 목록 페이지  (홈, 기본 진입점)
│   └── 기능: F001 (자료 목록), F003 (키워드 검색), F004 (기여자 표시)
├── 자료 상세 페이지  (목록에서 카드 클릭)
│   └── 기능: F002 (자료 상세), F004 (기여자 표시)
└── 404 에러 페이지  (존재하지 않는 ID 접근 시 자동 전환)
    └── 기능: F011 (에러 처리)

[공통]
└── 로그아웃 (헤더 내 버튼 — 세션 쿠키 삭제 후 로그인 페이지로 이동)
```

---

## 📄 페이지별 상세 기능

### 로그인 페이지

> **구현 기능:** `F010` | **접근 방식:** 미인증 상태로 모든 경로 접근 시 미들웨어가 자동 리디렉션

| 항목            | 내용                                                                                                                                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **역할**        | 팀 내부 인증 게이트 — 올바른 팀 패스워드 입력 시에만 자료실 진입 허용                                                                                                                                                         |
| **진입 경로**   | 비로그인 상태에서 임의 경로 접근 시 `middleware.ts`가 자동 리디렉션                                                                                                                                                           |
| **사용자 행동** | 팀 공용 패스워드 입력 후 로그인 버튼 클릭                                                                                                                                                                                     |
| **주요 기능**   | • 패스워드 입력 폼 (React Hook Form + Zod 검증)<br>• Server Action으로 `TEAM_PASSWORD` 환경변수 검증<br>• 인증 성공 시 iron-session 기반 암호화 세션 쿠키 발급<br>• 인증 실패 시 인라인 오류 메시지 표시<br>• **로그인** 버튼 |
| **다음 이동**   | 성공 → 자료 목록 페이지, 실패 → 오류 메시지 표시 후 폼 유지                                                                                                                                                                   |

---

### 자료 목록 페이지

> **구현 기능:** `F001`, `F003`, `F004` | **접근 방식:** 로그인 세션 필수, 기본 진입점

| 항목            | 내용                                                                                                                                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **역할**        | 팀의 모든 학습 자료를 탐색하는 통합 허브                                                                                                                                                                                                                                            |
| **진입 경로**   | 로그인 성공 후 자동 이동, 또는 헤더 로고/홈 버튼 클릭                                                                                                                                                                                                                               |
| **사용자 행동** | 키워드를 입력하여 원하는 자료를 검색하고, 카드를 클릭하여 상세 페이지로 이동                                                                                                                                                                                                        |
| **주요 기능**   | • Notion DB 전체 자료 카드 그리드 표시 (제목·카테고리·기여자·등록일)<br>• 키워드 검색 입력창 — 제목·설명 기반 클라이언트 사이드 실시간 필터링<br>• 검색 결과 없음 안내 메시지<br>• 각 카드에 기여자 이름 표시 (F004)<br>• 로딩 중 스켈레톤 UI (Suspense)<br>• 헤더 내 로그아웃 버튼 |
| **다음 이동**   | 카드 클릭 → 자료 상세 페이지, 로그아웃 → 로그인 페이지                                                                                                                                                                                                                              |

---

### 자료 상세 페이지

> **구현 기능:** `F002`, `F004` | **접근 방식:** 로그인 세션 필수, 목록 카드 클릭으로 진입

| 항목            | 내용                                                                                                                                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **역할**        | 개별 학습 자료의 전체 정보를 표시하고 원본 링크로 이동시키는 페이지                                                                                                                                                                              |
| **진입 경로**   | 자료 목록 페이지의 카드 클릭 또는 직접 URL 접근                                                                                                                                                                                                  |
| **사용자 행동** | 자료 제목·설명·추천 사유·기여자 정보를 확인하고 원본 링크를 클릭하여 학습                                                                                                                                                                        |
| **주요 기능**   | • 자료 제목·카테고리·등록일 헤더 표시<br>• 설명 및 추천 사유 본문 표시<br>• 기여자(등록자) 이름 표시 (F004)<br>• **원본 링크 열기** 버튼 (새 탭, `rel="noopener noreferrer"`)<br>• 목록으로 돌아가기 링크<br>• Notion ID 미존재 시 자동 404 전환 |
| **다음 이동**   | 원본 링크 클릭 → 새 탭으로 외부 URL, 뒤로 가기 → 자료 목록 페이지, ID 없음 → 404 에러 페이지                                                                                                                                                     |

---

### 404 에러 페이지

> **구현 기능:** `F011` | **접근 방식:** 자동 리디렉션 (`notFound()` 호출)

| 항목            | 내용                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| **역할**        | 존재하지 않는 자료 ID 접근 또는 잘못된 URL 진입 시 명확한 피드백 제공                                         |
| **진입 경로**   | 자료 상세 페이지에서 Notion ID가 없을 때 자동 전환, 또는 잘못된 경로 직접 입력                                |
| **사용자 행동** | 오류 메시지 확인 후 자료 목록으로 복귀                                                                        |
| **주요 기능**   | • "자료를 찾을 수 없습니다" 안내 메시지<br>• 자료 목록 페이지로 이동 버튼<br>• Next.js `not-found.tsx`로 구현 |
| **다음 이동**   | 목록으로 버튼 클릭 → 자료 목록 페이지                                                                         |

---

## 🗄️ 데이터 모델

> Notion 자체가 데이터베이스이므로 별도 DB 스키마 없음. 아래는 Notion 프로퍼티와 TypeScript 타입의 매핑 관계임.

### StudyMaterials (학습 자료 — Notion 데이터베이스 단일 테이블)

| 필드         | Notion 프로퍼티명 | 타입/관계                                   |
| ------------ | ----------------- | ------------------------------------------- |
| id           | (Page ID)         | UUID — URL 식별자로 사용                    |
| title        | 제목              | title (기본 필드)                           |
| url          | URL               | url                                         |
| description  | 설명              | rich_text                                   |
| category     | 카테고리          | select (아티클 / 도서 / 영상 / 문서 / 기타) |
| contributor  | 기여자            | rich_text (등록자/추천자 이름)              |
| registeredAt | 등록일            | created_time (자동 생성)                    |
| reason       | 추천 사유         | rich_text                                   |

```
StudyMaterials (Notion DB)
  ├── title          (title)         — 자료 제목
  ├── url            (url)           — 원본 링크
  ├── description    (rich_text)     — 자료 설명
  ├── category       (select)        — 아티클 | 도서 | 영상 | 문서 | 기타
  ├── contributor    (rich_text)     — 등록자/추천자 이름
  ├── reason         (rich_text)     — 추천 사유
  └── registeredAt   (created_time)  — 자동 생성
```

---

## 🛠️ 기술 스택 (최신 버전)

### 프론트엔드 프레임워크

- **Next.js 15.5.3** (App Router + Turbopack) — React 풀스택 프레임워크
- **React 19.1.0** — UI 라이브러리 (Server Components, Suspense 활용)
- **TypeScript 5** — 타입 안전성 보장

### 스타일링 & UI

- **TailwindCSS v4** (설정 파일 없는 새로운 엔진) — 유틸리티 CSS
- **shadcn/ui** (new-york style) — 고품질 React 컴포넌트
- **Radix UI** — 접근성 기반 헤드리스 컴포넌트
- **Lucide React** — 아이콘 라이브러리

### 폼 & 검증

- **React Hook Form 7.x** — 로그인 폼 상태 관리
- **Zod** — 패스워드 입력 스키마 검증
- **Next.js Server Actions** — 서버 사이드 인증 처리

### 외부 API & 인증

- **@notionhq/client ^5.2.0** — Notion API SDK (v5, `data_source_id` 기반 쿼리)
- **iron-session** — 암호화 세션 쿠키 관리

### 배포 & 인프라

- **Vercel** — Next.js 15 최적화 배포 플랫폼
- **npm** — 패키지 관리

---

## 🔑 Notion API 설정 가이드

### 1단계: 인테그레이션 생성 및 데이터베이스 연결

1. [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) 접속 → "새 인테그레이션" 생성
2. 발급된 시크릿 키(`secret_...` 또는 `ntn_...`) 복사
3. Notion 스터디 자료 데이터베이스 페이지 → "연결" → 생성한 인테그레이션 추가
4. 데이터베이스 URL에서 32자 ID 추출 (`notion.so/.../{DATABASE_ID}?v=...`)

### 2단계: Notion 데이터베이스 프로퍼티 구성

StudyMaterials 데이터베이스에 다음 프로퍼티를 추가:

| 프로퍼티명 | 타입   | 비고                               |
| ---------- | ------ | ---------------------------------- |
| 제목       | 제목   | 기본 title 필드                    |
| URL        | URL    | 원본 링크                          |
| 설명       | 텍스트 | 자료 요약                          |
| 카테고리   | 선택   | 아티클 / 도서 / 영상 / 문서 / 기타 |
| 기여자     | 텍스트 | 등록자/추천자 이름                 |
| 추천 사유  | 텍스트 | 이 자료를 추천하는 이유            |

### 3단계: 환경변수 설정

```env
# .env.local

# Notion API
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # 32자, 하이픈 제외

# 팀 인증
TEAM_PASSWORD=team_secure_password_min8chars
SESSION_SECRET=exactly32charsecretkey12345678ab  # 정확히 32자

# 앱 URL
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

---

## 📦 핵심 구현 로직

### Notion 자료 목록 조회 (Server Component, v5 API)

```typescript
// src/lib/services/study-material.service.ts
import { notion } from '@/lib/notion'
import { unstable_cache } from 'next/cache'
import type { StudyMaterial } from '@/types/study-material'

async function fetchAllMaterials(): Promise<StudyMaterial[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    // @notionhq/client v5: data_source_id 파라미터 자동 처리
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  })

  return response.results.map(page => transformNotionToMaterial(page))
}

// 60초 캐싱 적용 (Notion API Rate Limit 회피)
export const getMaterials = unstable_cache(
  fetchAllMaterials,
  ['study-materials'],
  { revalidate: 60 }
)

// src/app/(protected)/page.tsx — Server Component
export default async function MaterialListPage() {
  const materials = await getMaterials()
  return <MaterialGrid materials={materials} />
}
```

### 키워드 검색 로직 (클라이언트 사이드 필터링)

```typescript
// src/components/MaterialSearch.tsx
'use client'

import { useState, useMemo } from 'react'
import type { StudyMaterial } from '@/types/study-material'

interface Props {
  materials: StudyMaterial[]
}

export function MaterialSearch({ materials }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return materials
    const q = query.toLowerCase()
    return materials.filter(
      m =>
        m.title.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
    )
  }, [query, materials])

  return (
    <>
      <input
        type="search"
        placeholder="제목 또는 설명으로 검색..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <MaterialGrid materials={filtered} />
    </>
  )
}
```

### 세션 쿠키 기반 인증 미들웨어 패턴

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/types/session'

const SESSION_OPTIONS = {
  cookieName: 'study-room-session',
  password: process.env.SESSION_SECRET!,
  cookieOptions: { secure: process.env.NODE_ENV === 'production' },
}

export async function middleware(req: NextRequest) {
  // 로그인 페이지는 인증 불필요
  if (req.nextUrl.pathname === '/login') return NextResponse.next()

  const res = NextResponse.next()
  const session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS)

  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## ✅ MVP 성공 기준

1. Notion DB에 학습 자료를 입력하면 웹 자료 목록 페이지에 카드로 노출된다
2. 키워드 검색 입력 시 제목·설명이 일치하는 자료만 즉시 필터링된다
3. 자료 카드 클릭 시 상세 페이지에서 원본 URL 링크가 동작한다
4. 팀 패스워드 미입력 상태에서 임의 URL 접근 시 로그인 페이지로 리디렉션된다
5. 존재하지 않는 자료 ID 접근 시 앱 크래시 없이 404 에러 페이지가 표시된다

---

## 🚀 향후 개선 방향 (MVP 이후)

### Phase 2: 자료 탐색 강화

- 태그/카테고리 필터링 (select 필드 기반 다중 필터)
- 자료 유형별 탭 분리 (아티클 / 도서 / 영상 / 문서)
- 최신순·등록자순·카테고리순 정렬 옵션

### Phase 3: 개인화 & 인터랙션

- 자료 북마크/저장 기능 (로컬스토리지 기반)
- 댓글 또는 한줄 메모 기능
- 자료별 조회수 표시

### Phase 4: 자동화 & 알림

- 신규 자료 등록 시 Slack/Teams 웹훅 자동 알림
- 주간 자료 요약 리포트 자동 발송
- 자료 조회수·검색어 통계 대시보드

---

> **문서 버전**: v1.0  
> **작성일**: 2026-05-23  
> **목표**: 노션을 DB로 활용한 팀 스터디 자료 통합 검색·조회 시스템 최소 기능 완성
