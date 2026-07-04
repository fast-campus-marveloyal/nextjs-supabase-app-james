# 모임 이벤트 관리 웹 MVP 개발 로드맵

카카오톡 단톡방으로 수동 처리하던 공지·참여자·카풀·정산 업무를, 주최자 1인이 쓰는 가벼운 운영 도구로 대체한다.

## 개요

본 프로젝트는 수영/헬스/취미 소모임을 운영하는 **주최자 1인**을 위한 운영 도구로, 다음 기능을 제공합니다:

- **이벤트 관리**: 모임 생성/수정/삭제 + 고유 공유 링크(slug) 자동 발급, 상태(모집중/마감/종료) 관리
- **공지 관리**: 공지 CRUD + 상단 고정, 참여자는 공유 링크에서 시간순 조회
- **참여자 관리**: 주최자 직접 등록(이름·연락처·참여 상태), 셀프 등록 없음 (MVP 스코프)
- **정산**: 총액 ÷ 대상 인원 균등 분배 계산 + 입금 체크리스트 + 카톡 공유용 요약 뷰 (PG 연동 없음)
- **카풀(수동 매칭)**: 운전자 등록 → 참여자 비로그인 탑승 신청 → 주최자 승인/거절

### 전제 (이미 구현되어 재사용)

- 인증 플로우(`/auth/*`), `profiles` 테이블(`auth.users` 1:1), `proxy.ts` 세션 미들웨어, `/protected/*` 접근 제어
- Supabase 클라이언트 3종: `lib/supabase/{client,server,proxy}.ts`
- Path alias `@/*`, `types/database.types.ts` 자동 생성 타입

### 아키텍처 원칙 (CLAUDE.md 준수)

- **Server Components 기본** — `'use client'`는 상태·이벤트 핸들러가 필요한 폼/인터랙션에만
- **Next.js 15 async params** — `params`, `searchParams`, `cookies()` 모두 `await`
- **RLS** — 주최자 CRUD는 `organizer_id = auth.uid()` 기준. 공개 조회(`/e/[shareSlug]`)·비로그인 탑승신청은 **Route Handler + Service Role 키**로 서버에서만 처리 (클라이언트 서비스 키 노출 금지)
- **share_slug** — nanoid 등 추측 불가능한 랜덤 문자열로 사실상의 비공개 링크 운용
- **컴포넌트 300줄 이하**, 단일 책임, CVA 패턴

## 개발 워크플로우

1. **작업 계획** — 기존 코드베이스 파악 후 `ROADMAP.md` 갱신, 완료 작업 다음에 우선순위 작업 삽입
2. **작업 생성** — `/tasks` 디렉토리에 `XXX-description.md` 형식으로 작업 파일 생성. 명세·관련 파일·수락 기준·구현 단계 포함. **API/비즈니스 로직 작업은 `## 테스트 체크리스트` 섹션 필수(Playwright MCP 시나리오)**
3. **작업 구현** — 명세 구현 후 **반드시 Playwright MCP로 테스트**. 정상/오류/엣지 케이스 검증. **테스트 실패 시 원인 수정 후 재테스트 — 실패 상태로 다음 단계 진행 불가.** 각 단계 후 작업 파일 갱신하고 중단
4. **로드맵 업데이트** — 완료된 작업을 `- [x]`로 표시

> 🧪 **테스트 필수 원칙**: 마이그레이션/RLS/Route Handler/폼 검증/공개 조회/탑승 신청 등 모든 기능 구현 후 Playwright MCP 브라우저 검증을 통과해야만 다음 Task로 진행합니다.

---

## 개발 단계

### Phase 0: 도메인 골격 구축 (구조 우선)

전체 라우트/타입/공통 컴포넌트 골격을 먼저 세워 Phase 1~3이 병렬 개발 가능하도록 준비.

- [ ] **Task 001: 전체 라우트 골격 및 빈 페이지 생성** — 우선순위
  - `app/protected/dashboard/page.tsx` (내 이벤트 목록) 빈 껍데기
  - `app/protected/events/new/page.tsx` (이벤트 생성 폼) 빈 껍데기
  - `app/protected/events/[eventId]/page.tsx` + 탭 구조(개요/공지/참여자/카풀/정산) 골격
  - `app/e/[shareSlug]/page.tsx` (참여자 공개 조회) 빈 껍데기
  - `app/api/public/**` Route Handler 디렉토리 골격 (공개 조회·탑승 신청용)

- [ ] **Task 002: 도메인 타입 정의 및 공유 유틸 골격**
  - PRD §5 7개 테이블 기준 TypeScript 인터페이스 초안(`types/domain.ts` 또는 database.types 재생성 전 임시 타입)
  - `share_slug` 생성 유틸(nanoid) 및 Service Role 클라이언트 헬퍼(`lib/supabase/service.ts`) 골격
  - 카테고리/상태/참여상태 등 enum 상수(`lib/constants/event.ts`)

- [ ] **Task 003: 공통 UI 컴포넌트 및 더미 데이터 준비**
  - shadcn/ui 기반 공통 컴포넌트 확인/추가(Table, Tabs, Dialog, Badge, Checkbox 등)
  - 이벤트/공지/참여자/카풀/정산 더미 데이터 픽스처(`lib/dummy/*.ts`)
  - Phase 1~3 UI가 더미 데이터로 먼저 렌더링되도록 구성

### Phase 1: 이벤트·공지·참여자·공유 링크 (PRD Phase 1)

"공지판 + 명단" 최소 기능. 카톡 단톡방 대체.

#### 1-A. 이벤트 관리

- [ ] **Task 004: `events` 테이블 마이그레이션 및 RLS + 타입 재생성** — 우선순위
  - PRD §5 `events` 스키마 마이그레이션 작성 (category check: 수영/헬스/모임/기타, status: recruiting/closed/ended, share_slug unique)
  - RLS: `organizer_id = auth.uid()` 기준 CRUD 정책
  - Supabase MCP `generate_typescript_types` → `types/database.types.ts` 갱신
  - `## 테스트 체크리스트` 포함 (RLS 격리 검증)

- [ ] **Task 005: `/protected/events/new` 이벤트 생성 폼 구현**
  - 제목/카테고리/일시/장소/설명 입력 폼 (Server Action 또는 Route Handler)
  - `share_slug` 자동 생성, 생성 후 `/protected/events/[eventId]` 리다이렉트
  - 폼 검증(필수값, 일시 형식)
  - `## 테스트 체크리스트` 포함

- [ ] **Task 006: `/protected/dashboard` 이벤트 목록 + 카테고리 필터**
  - 로그인 주최자의 이벤트 목록 조회 (Server Component)
  - 카테고리별 필터, 상태 배지 표시
  - 빈 상태(첫 이벤트 생성 유도) 처리

- [ ] **Task 007: `/protected/events/[eventId]` 개요 탭 + 이벤트 수정/삭제 + 상태 변경**
  - 개요 탭: 이벤트 정보 표시, 공유 링크(`/e/[shareSlug]`) 복사 버튼
  - 이벤트 수정 폼, 삭제(cascade 확인), 상태 전환(모집중/마감/종료)
  - `## 테스트 체크리스트` 포함

#### 1-B. 공지 관리

- [ ] **Task 008: `notices` 테이블 마이그레이션 및 RLS + 타입 재생성**
  - PRD §5 `notices` 스키마 (event_id FK, pinned)
  - RLS: 이벤트 organizer 조인 경유 CRUD
  - 타입 재생성
  - `## 테스트 체크리스트` 포함

- [ ] **Task 009: 공지 탭 CRUD + 상단 고정(pinned)**
  - 공지 작성/수정/삭제 (제목·본문)
  - pinned 토글, pinned 우선 + 시간순 정렬
  - `## 테스트 체크리스트` 포함

#### 1-C. 참여자 관리

- [ ] **Task 010: `participants` 테이블 마이그레이션 및 RLS + 타입 재생성**
  - PRD §5 `participants` 스키마 (name, contact, rsvp_status: pending/confirmed/declined)
  - RLS: 이벤트 organizer 조인 경유 CRUD
  - 타입 재생성
  - `## 테스트 체크리스트` 포함

- [ ] **Task 011: 참여자 탭 등록/인라인 수정/삭제 + 상태 관리**
  - 주최자 직접 등록(이름·연락처·참여 상태) — 셀프 등록 없음
  - 목록 테이블 인라인 상태 수정/삭제
  - `## 테스트 체크리스트` 포함

#### 1-D. 공유 링크 공개 조회

- [ ] **Task 012: 공개 조회 Route Handler (Service Role) — 이벤트/공지/참여자**
  - `app/api/public/events/[shareSlug]/route.ts`: slug로 이벤트+공지+참여자 조회 (Service Role, RLS 우회)
  - 참여자 명단은 이름·참여 상태만 반환, **연락처 비노출**
  - 존재하지 않는 slug 처리(404)
  - `## 테스트 체크리스트` 포함 (연락처 미노출 검증 필수)

- [ ] **Task 013: `/e/[shareSlug]` 공개 페이지 — 개요·공지·명단 (읽기 전용)**
  - 이벤트 개요 + 공지 목록(시간순) + 참여자 명단(읽기 전용)
  - 비로그인 접근 가능 확인(proxy 미들웨어 매처에서 `/e/*` 제외 검증)
  - `## 테스트 체크리스트` 포함 (비로그인 접근 E2E)

- [ ] **Task 013-1: Phase 1 통합 테스트 (Happy Path 전체)**
  - 이벤트 생성 → 공지 작성 → 참여자 등록 → 공유 링크 조회까지 전체 사용자 플로우 E2E
  - 주최자/비로그인 참여자 관점 각각 검증
  - 에러/엣지(빈 이벤트, 삭제된 이벤트 slug 접근) 케이스

### Phase 2: 정산 (PRD Phase 2)

반복적으로 가장 번거로운 정산 업무 자동화.

- [ ] **Task 014: `settlements` / `settlement_shares` 마이그레이션 및 RLS + 타입 재생성** — 우선순위
  - PRD §5 두 테이블 스키마 (total_amount numeric(12,0) >= 0, share의 amount/paid/paid_at)
  - RLS: 이벤트 organizer 조인 경유 CRUD
  - 타입 재생성
  - `## 테스트 체크리스트` 포함

- [ ] **Task 015: 정산 항목 생성 + 대상자 선택 + 균등 분배 계산**
  - 정산 탭: 제목·총액 입력, 대상 참여자 선택(기본값 '확정' 전체, 체크박스로 개별 제외)
  - 총액 ÷ 선택 인원 = 1인당 금액 계산 → 대상 인원만큼 `settlement_shares` 자동 생성
  - 나눗셈 나머지 처리 정책(반올림/잔액 배분) 정의 및 검증
  - `## 테스트 체크리스트` 포함 (경계값: 1명, 0원, 나머지 발생 케이스)

- [ ] **Task 016: 입금 체크리스트 + 카톡 공유용 요약 뷰**
  - 참여자별 "입금 완료" 체크박스(paid, paid_at 갱신)
  - 정산 요약 텍스트 복사(카톡 공유) 뷰
  - `## 테스트 체크리스트` 포함

- [ ] **Task 017: `/e/[shareSlug]` 정산 요약 공개 조회 (Route Handler)**
  - 공개 조회 Route Handler에 정산 요약 추가 (Service Role)
  - 참여자가 이름 선택 → 본인 입금 여부 확인 (별도 인증 없음, MVP 허용)
  - `## 테스트 체크리스트` 포함

- [ ] **Task 017-1: Phase 2 통합 테스트**
  - 정산 생성 → 대상자 선택 → 계산 → 입금 체크 → 공유 요약 조회 전체 플로우 E2E
  - 참여자 상태 변경이 정산 대상 기본값에 반영되는지 검증

### Phase 3: 카풀 (PRD Phase 3)

카풀 매칭을 단톡방 스크롤에서 앱으로 이관.

- [ ] **Task 018: `carpool_offers` / `carpool_requests` 마이그레이션 및 RLS + 타입 재생성** — 우선순위
  - PRD §5 두 테이블 스키마 (offer: driver_name/departure_location/departure_time/seat_count>0, request: requester_name/status)
  - RLS: offer는 organizer 조인 경유 CRUD. request의 비로그인 INSERT는 Route Handler(Service Role)로 처리
  - 타입 재생성
  - `## 테스트 체크리스트` 포함

- [ ] **Task 019: 카풀 탭 — 운전자(offer) 등록/수정/삭제**
  - 출발지·출발 시각·좌석 수 입력, 목록 표시
  - `## 테스트 체크리스트` 포함

- [ ] **Task 020: `/e/[shareSlug]` 카풀 목록 조회 + 비로그인 탑승 신청 폼 (Route Handler)**
  - 공개 페이지에 카풀 목록 표시 + 이름 입력 탑승 신청 폼
  - `app/api/public/carpool-requests/route.ts`: Service Role로 request INSERT
  - 입력 검증(빈 이름), 중복/스팸 최소 방어
  - `## 테스트 체크리스트` 포함 (비로그인 신청 E2E)

- [ ] **Task 021: 카풀 탭 — 탑승 신청 승인/거절 + 좌석 초과 경고**
  - 주최자가 신청 목록에서 승인/거절(status 변경)
  - 승인 인원이 seat_count 초과 시 경고 표시
  - `## 테스트 체크리스트` 포함 (좌석 초과 경계값)

- [ ] **Task 021-1: Phase 3 통합 테스트**
  - 운전자 등록 → 비로그인 탑승 신청 → 주최자 승인/거절 → 좌석 초과 경고 전체 플로우 E2E
  - 정상/거절/초과 케이스 각각 검증

### Phase 4: 사용성 확장 (향후, PRD Phase 4)

- [ ] **Task 022: 참여자 셀프 RSVP 등록 폼** — 공유 링크에서 참여자 직접 참여 신청 (participants 컬럼/정책 확장)
- [ ] **Task 023: 정산 차등 분배** — 1/N이 아닌 항목별 개별 금액 지정
- [ ] **Task 024: 반복 모임 템플릿** — 정기 모임 복제 생성

### Phase 5: 아웃 오브 스코프 (별도 검증 후, PRD Phase 5)

- [ ] **Task 025: 카카오 알림톡 연동** — 참여자 알림
- [ ] **Task 026: PG 결제/계좌 자동 이체 연동**
- [ ] **Task 027: 지도 기반 카풀 자동 매칭·경로 최적화**

---

## 상태 범례

- `- [ ]` 미완료 / `- [x]` 완료
- **우선순위**: 해당 Phase에서 즉시 시작해야 하는 Task (주로 마이그레이션·타입 재생성 선행 작업)
- 완료 시 각 Task에 `See: /tasks/XXX-description.md` 참조 추가
