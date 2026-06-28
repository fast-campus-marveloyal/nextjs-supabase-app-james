# 노션 기반 견적서 관리 시스템 MVP PRD

## 🎯 핵심 정보

**목적**: 노션 데이터베이스를 견적서 저장소로 활용하여, 클라이언트가 별도 로그인 없이 고유 URL로 견적서를 조회·다운로드할 수 있는 시스템  
**사용자**: 견적서를 작성·발행하는 프리랜서/소규모 기업 관리자 및 견적서를 받아 확인하는 클라이언트

---

## 🚶 사용자 여정

### 관리자 흐름

```
1. Notion DB에 견적서 입력
   ↓ 페이지 ID가 자동으로 고유 식별자로 사용됨

2. 관리자 로그인 (admin-login 페이지)
   ↓ 환경변수 ADMIN_PASSWORD 검증 성공

3. 견적서 목록 페이지
   ↓ 검색·필터·정렬로 원하는 견적서 확인

4. 링크 복사 버튼 클릭 → 클라이언트에게 URL 전달 완료
```

### 클라이언트 흐름

```
1. 관리자로부터 URL 수신 (예: https://domain.com/invoice/{notionPageId})
   ↓ 브라우저에서 URL 접근

2. 견적서 조회 페이지
   ├─ Notion에 해당 ID가 존재함 → 견적서 상세 렌더링
   └─ ID가 존재하지 않음 → 404 에러 페이지

3. 견적서 내용 확인 (번호, 클라이언트명, 발행일, 유효기간, 항목, 총액, 상태)
   ↓ PDF 다운로드 버튼 클릭

4. POST /api/generate-pdf → PDF 파일 다운로드 완료
```

---

## ⚡ 기능 명세

### 1. MVP 핵심 기능

| ID       | 기능명             | 설명                                                                   | MVP 필수 이유                                                      | 관련 페이지        |
| -------- | ------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------ |
| **F001** | 견적서 조회        | Notion Page ID로 견적서 데이터를 조회하여 웹 페이지로 렌더링           | 서비스의 유일한 클라이언트 접점                                    | 견적서 조회 페이지 |
| **F002** | PDF 다운로드       | `@react-pdf/renderer`로 견적서를 PDF 파일로 생성하여 다운로드          | 클라이언트가 견적서를 오프라인 보관·공유하는 핵심 수단             | 견적서 조회 페이지 |
| **F003** | Notion 데이터 파싱 | Notion API 응답을 `Invoice` / `InvoiceItem` 타입으로 변환              | 데이터 계층 없이 Notion을 DB로 직접 사용하기 위한 필수 변환 레이어 | (서버 내부 로직)   |
| **F004** | 고유 URL 생성      | Notion Page ID를 기반으로 `/invoice/{id}` 형태의 URL 생성 및 복사      | URL이 곧 견적서 식별자이자 공유 수단                               | 견적서 목록 페이지 |
| **F005** | 견적서 목록 조회   | Notion 데이터베이스의 전체 견적서를 페이지네이션·정렬·검색·필터로 조회 | 관리자가 발행 현황을 파악하는 유일한 대시보드                      | 견적서 목록 페이지 |

### 2. MVP 필수 지원 기능

| ID       | 기능명         | 설명                                                                      | MVP 필수 이유                                      | 관련 페이지                  |
| -------- | -------------- | ------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------- |
| **F010** | 관리자 인증    | 환경변수(`ADMIN_PASSWORD`) 기반 패스워드 로그인 및 세션 관리              | 관리자 전용 기능(목록·링크 복사)을 외부로부터 보호 | 관리자 로그인 페이지         |
| **F011** | 에러 처리      | 존재하지 않는 ID 접근 시 404, API 오류 시 에러 페이지 표시                | 잘못된 URL 접근 시 명확한 피드백 제공              | 404 에러 페이지, 에러 페이지 |
| **F012** | 캐싱·중복 제거 | `unstable_cache`(60초) + Request Deduplication으로 Notion API 호출 최소화 | Notion API Rate Limit 회피 및 응답 속도 개선       | (서버 내부 로직)             |

### 3. MVP 이후 기능 (제외)

- 견적서 작성 UI (웹 폼 기반 견적서 생성 — Notion에서 직접 입력)
- 클라이언트 승인/거절 액션 (상태 변경은 Notion에서 직접 처리)
- 이메일·메신저 자동 발송 (mailto 링크 또는 API 연동)
- 견적서 버전 관리 및 수정 이력 추적
- 회원가입 및 일반 사용자 계정 시스템
- 실시간 알림 (견적서 조회 이벤트 알림 등)
- 분석 대시보드 (조회수, 다운로드 통계)

---

## 📱 메뉴 구조

```
[공개 접근 — 인증 불필요]
├── 견적서 조회 페이지   /invoice/{notionPageId}
│   └── 기능: F001 (견적서 렌더링), F002 (PDF 다운로드)
└── 404 에러 페이지     /invoice/{id}/not-found
    └── 기능: F011 (에러 처리)

[관리자 전용 — 인증 필요]
├── 관리자 로그인 페이지  /(auth)/admin-login
│   └── 기능: F010 (패스워드 인증)
├── 관리자 홈           /admin
│   └── 기능: F005 (견적서 목록 요약)
└── 견적서 목록 페이지   /admin/invoices
    └── 기능: F004 (URL 생성·복사), F005 (목록·검색·필터)
```

---

## 📄 페이지별 상세 기능

### 견적서 조회 페이지

> **구현 기능:** `F001`, `F002` | **접근 방식:** 공개 URL, 인증 불필요

| 항목            | 내용                                                                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **역할**        | 클라이언트가 견적서를 확인하는 유일한 공개 접점 페이지                                                                                                                                                                                                                         |
| **진입 경로**   | 관리자가 공유한 URL(`/invoice/{notionPageId}`) 직접 접근                                                                                                                                                                                                                       |
| **사용자 행동** | 견적서 번호·클라이언트명·발행일·유효기간·항목·총액·상태를 확인하고 PDF를 다운로드                                                                                                                                                                                              |
| **주요 기능**   | • Notion Page ID로 견적서 데이터 조회 (캐싱 + 중복 제거 적용)<br>• 견적서 헤더(번호, 상태 배지) 렌더링<br>• 클라이언트 정보 및 견적 항목 테이블 렌더링<br>• 총액 요약 표시<br>• **PDF 다운로드** 버튼 (`POST /api/generate-pdf` 호출)<br>• 로딩 중 스켈레톤 UI 표시 (Suspense) |
| **다음 이동**   | ID 미존재 → 404 에러 페이지, API 오류 → 에러 페이지                                                                                                                                                                                                                            |

---

### 404 에러 페이지

> **구현 기능:** `F011` | **접근 방식:** 자동 리디렉션 (notFound() 호출)

| 항목            | 내용                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| **역할**        | 존재하지 않는 견적서 URL 접근 시 명확한 피드백 제공                                                                |
| **진입 경로**   | 견적서 조회 페이지에서 Notion ID가 없을 때 자동 전환                                                               |
| **사용자 행동** | 오류 메시지 확인 후 발행자에게 올바른 URL을 요청                                                                   |
| **주요 기능**   | • "견적서를 찾을 수 없습니다" 안내 메시지 표시<br>• 발행자 연락 안내 문구<br>• Next.js `not-found.tsx` 파일로 구현 |
| **다음 이동**   | 사용자가 올바른 URL로 재접근                                                                                       |

---

### 관리자 로그인 페이지

> **구현 기능:** `F010` | **접근 방식:** `/admin/*` 접근 시 미들웨어가 자동 리디렉션

| 항목            | 내용                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **역할**        | 관리자 전용 기능 접근을 위한 인증 게이트                                                                                                                           |
| **진입 경로**   | `/admin` 이하 경로 접근 시 미들웨어(`middleware.ts`)가 자동 리디렉션                                                                                               |
| **사용자 행동** | 비밀번호 입력 후 관리자 영역 진입                                                                                                                                  |
| **주요 기능**   | • 비밀번호 입력 폼 (React Hook Form + Zod 검증)<br>• Server Action으로 `ADMIN_PASSWORD` 환경변수 검증<br>• 인증 성공 시 암호화 세션 쿠키 발급<br>• **로그인** 버튼 |
| **다음 이동**   | 성공 → 견적서 목록 페이지, 실패 → 오류 메시지 표시                                                                                                                 |

---

### 견적서 목록 페이지

> **구현 기능:** `F004`, `F005` | **인증:** 관리자 세션 필수

| 항목            | 내용                                                                                                                                                                                                                                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **역할**        | 관리자가 Notion DB의 전체 견적서를 검색·조회·링크 공유하는 통합 대시보드                                                                                                                                                                                                                                               |
| **진입 경로**   | 로그인 성공 후 자동 이동, 또는 관리자 네비게이션에서 "견적서 목록" 클릭                                                                                                                                                                                                                                                |
| **사용자 행동** | 검색어·상태·날짜 범위로 필터링하여 원하는 견적서를 찾고, 링크를 복사하여 클라이언트에게 전달                                                                                                                                                                                                                           |
| **주요 기능**   | • Notion 데이터베이스에서 견적서 목록 조회 (페이지당 10건)<br>• 클라이언트명·견적서 번호 키워드 검색<br>• 상태(대기/승인/거절) 필터링<br>• 발행일 날짜 범위 필터링<br>• 발행일·총액 기준 정렬<br>• 각 견적서의 고유 URL 생성 및 클립보드 **복사** 버튼<br>• 커서 기반 페이지네이션<br>• 로딩 중 스켈레톤 UI (Suspense) |
| **다음 이동**   | 링크 복사 → 클립보드에 URL 저장, 로그아웃 → 로그인 페이지                                                                                                                                                                                                                                                              |

---

## 🗄️ 데이터 모델

> Notion 자체가 데이터베이스이므로 별도 DB 스키마 없음. 아래는 Notion 프로퍼티와 TypeScript 타입의 매핑 관계임.

### Invoices (견적서 — Notion 데이터베이스 페이지)

| 필드          | Notion 프로퍼티명 | 타입/관계                |
| ------------- | ----------------- | ------------------------ |
| id            | (Page ID)         | UUID — URL 식별자로 사용 |
| invoiceNumber | 견적서 번호       | title                    |
| clientName    | 클라이언트명      | rich_text                |
| issueDate     | 발행일            | date                     |
| validUntil    | 유효기간          | date                     |
| status        | 상태              | select (대기/승인/거절)  |
| items         | 항목              | relation → Items         |

### Items (견적 항목 — 연관 Notion 페이지)

| 필드        | Notion 프로퍼티명 | 타입/관계             |
| ----------- | ----------------- | --------------------- |
| id          | (Page ID)         | UUID                  |
| description | 항목명            | title                 |
| quantity    | 수량              | number                |
| unitPrice   | 단가              | number                |
| amount      | 금액              | formula (수량 × 단가) |

```
Invoices
  ├── invoiceNumber  (title)
  ├── clientName     (rich_text)
  ├── issueDate      (date)
  ├── validUntil     (date)
  ├── status         (select: 대기 | 승인 | 거절)
  └── items          (relation) ─┐
                                 ▼
                              Items
                                ├── description  (title)
                                ├── quantity     (number)
                                ├── unitPrice    (number)
                                └── amount       (formula)
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

- **React Hook Form 7.x** — 폼 상태 관리
- **Zod** — 스키마 검증 (환경변수 + 폼 입력 모두 적용)
- **Next.js Server Actions** — 서버 사이드 폼 처리

### 외부 API & PDF

- **@notionhq/client ^5.2.0** — Notion API SDK (v5, `data_source_id` 기반)
- **@react-pdf/renderer ^4.3.1** — 서버 사이드 PDF 생성

### 배포 & 인프라

- **Vercel** — Next.js 15 최적화 배포 플랫폼
- **npm** — 패키지 관리

---

## 🔑 Notion API 설정 가이드

### 1단계: 인테그레이션 생성 및 데이터베이스 연결

1. [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) 접속 → "새 인테그레이션" 생성
2. 발급된 시크릿 키(`secret_...` 또는 `ntn_...`) 복사
3. Notion 견적서 데이터베이스 페이지 → "연결" → 생성한 인테그레이션 추가
4. 데이터베이스 URL에서 32자 ID 추출 (`notion.so/.../{DATABASE_ID}?v=...`)

### 2단계: Notion 데이터베이스 프로퍼티 구성

Invoices 데이터베이스에 다음 프로퍼티 추가:

| 프로퍼티명   | 타입   | 비고                    |
| ------------ | ------ | ----------------------- |
| 견적서 번호  | 제목   | 기본 title 필드         |
| 클라이언트명 | 텍스트 |                         |
| 발행일       | 날짜   |                         |
| 유효기간     | 날짜   |                         |
| 상태         | 선택   | 대기 / 승인 / 거절      |
| 항목         | 관계형 | Items 데이터베이스 연결 |

### 3단계: 환경변수 설정

```env
# .env.local
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # 32자, 하이픈 제외

# 관리자 인증
ADMIN_PASSWORD=my_secure_password_min8chars
SESSION_SECRET=exactly32charsecretkey12345678ab  # 정확히 32자

# 앱 URL
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

---

## 📦 핵심 구현 로직

### Notion 견적서 조회

```typescript
// src/lib/services/invoice.service.ts
import { notion, getDataSourceId } from '@/lib/notion'
import { transformNotionToInvoice } from '@/lib/utils/notion-parser'
import type { Invoice } from '@/types/invoice'

export async function getInvoiceFromNotion(pageId: string): Promise<Invoice> {
  // 1. 견적서 페이지 조회 (object_not_found → 404)
  const page = await notion.pages.retrieve({ page_id: pageId })

  // 2. 관련 항목 ID 추출 (relation 프로퍼티)
  const itemIds = page.properties['항목']?.relation?.map(r => r.id) ?? []

  // 3. 항목 병렬 조회 (Promise.allSettled로 부분 실패 허용)
  const itemResults = await Promise.allSettled(
    itemIds.map(id => notion.pages.retrieve({ page_id: id }))
  )
  const items = itemResults
    .filter(
      (r): r is PromiseFulfilledResult<PageObjectResponse> =>
        r.status === 'fulfilled'
    )
    .map(r => r.value)

  // 4. Notion 응답 → Invoice 타입 변환
  return transformNotionToInvoice(page, items)
}

// 60초 캐싱 + Request Deduplication 적용
export const getOptimizedInvoice = (pageId: string) =>
  getInvoiceWithDedup(pageId, createCachedInvoiceFetcher(getInvoiceFromNotion))
```

### PDF 생성 API Route

```typescript
// src/app/api/generate-pdf/route.ts
import ReactPDF from '@react-pdf/renderer'
import { InvoicePDFDocument } from '@/components/pdf/InvoiceTemplate'
import type { Invoice } from '@/types/invoice'

export async function POST(req: NextRequest) {
  const { invoice }: { invoice: Invoice } = await req.json()

  // @react-pdf/renderer로 서버에서 PDF Blob 생성
  const pdfDoc = createElement(InvoicePDFDocument, { invoice })
  const blob = await ReactPDF.pdf(pdfDoc).toBlob()
  const buffer = Buffer.from(await blob.arrayBuffer())

  const filename = `invoice-${invoice.invoiceNumber}.pdf`
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
```

### URL 구조 및 링크 생성

```typescript
// src/lib/utils/link-generator.ts
// URL 구조: {NEXT_PUBLIC_BASE_URL}/invoice/{notionPageId}
// notionPageId = Notion 페이지의 UUID (32자, 하이픈 포함 시 36자)

export function generateInvoiceUrl(invoiceId: string): string {
  return `${env.NEXT_PUBLIC_BASE_URL}/invoice/${invoiceId}`
}

// 사용 예: generateInvoiceUrl('a1b2c3d4e5f6...')
// → 'https://your-domain.vercel.app/invoice/a1b2c3d4-e5f6-...'
```

---

## ✅ MVP 성공 기준

1. Notion DB에 견적서를 입력하면 `/invoice/{notionPageId}` URL로 웹 조회가 가능하다
2. 조회 페이지에서 PDF 다운로드 버튼 클릭 시 올바른 내용의 PDF 파일이 저장된다
3. 존재하지 않는 ID로 접근 시 404 에러 페이지가 표시된다
4. 관리자 로그인 후 견적서 목록에서 링크 복사 버튼으로 URL을 클립보드에 저장할 수 있다
5. Notion API 응답이 없거나 오류가 발생해도 애플리케이션이 크래시 없이 에러 페이지를 표시한다

---

## 🚀 향후 개선 방향 (MVP 이후)

### Phase 2: 관리자 경험 강화

- 견적서별 고유 URL QR 코드 생성 및 다운로드
- 이메일 링크 공유 (`mailto:` 연동)
- 견적서 조회 이벤트 로깅 (조회 시각, IP 등)

### Phase 3: 클라이언트 인터랙션

- 클라이언트 견적서 승인/거절 액션 (Notion 상태 자동 업데이트)
- 클라이언트 디지털 서명 기능
- 견적서 유효기간 만료 시 접근 차단

### Phase 4: 자동화 & 분석

- 견적서 발행 시 클라이언트 이메일 자동 발송
- 관리자 통계 대시보드 (월별 발행 건수, 승인율, 평균 금액)
- Next.js 다크모드 지원 (`next-themes` 연동)

---

> **문서 버전**: v1.0  
> **작성일**: 2026-05-23  
> **목표**: Notion을 DB로 활용한 최소 기능 견적서 공유 시스템 완성
