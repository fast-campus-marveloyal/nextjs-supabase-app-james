# Development Guidelines

이 문서는 AI Agent가 이 저장소에서 코드를 수정/추가할 때 반드시 지켜야 할 **이 프로젝트 고유의 규칙**만 다룬다. Next.js/Supabase/RLS의 일반 개념 설명은 포함하지 않는다.

## 1. 프로젝트 개요

- Next.js 15.5.3 App Router + Supabase Auth(`@supabase/ssr`) + React 19 + Tailwind + shadcn/ui(`new-york` 스타일) + CVA 기반 스타터킷
- 현재 구현된 도메인: 인증(`profiles` 1:1 `auth.users`)뿐. `docs/PRD.md`(v0.2)와 `docs/ROADMAP.md`에 "모임 이벤트 관리" 도메인(이벤트/공지/참여자/카풀/정산)이 다음 개발 대상으로 기획되어 있음
- **디렉토리에 `src/`는 존재하지 않는다.** `app/`, `components/`, `lib/`, `types/`는 모두 저장소 루트에 직접 위치한다. `docs/guides/project-structure.md`는 `src/app` 구조로 서술되어 있으나 이는 실제 코드와 다른 오래된 가이드이므로 **따르지 말 것** — 실제 디렉토리 배치를 기준으로 작업할 것

## 2. 프로젝트 아키텍처 (실제 디렉토리)

```
app/
  auth/**            # 로그인/가입/비밀번호 재설정 (공개)
  protected/**        # 인증 필요 영역 (layout.tsx가 접근 제어 전제)
  page.tsx            # 홈 (hasEnvVars 조건부 렌더링)
components/
  ui/**               # shadcn primitives (badge, button, card, checkbox, dropdown-menu, input, label)
  tutorial/**          # 스타터 튜토리얼 전용 잔재 — 신규 기능 설계 시 참고 금지 (§9)
  *.tsx (최상위)       # 실제 기능 컴포넌트 (login-form, sign-up-form, auth-button 등)
lib/
  supabase/client.ts   # 브라우저(클라이언트 컴포넌트) 전용
  supabase/server.ts   # 서버 컴포넌트·Route Handler 전용 (쿠키 기반)
  supabase/proxy.ts    # updateSession() — proxy.ts(루트 미들웨어)에서만 호출
  utils.ts             # cn(), hasEnvVars 등 공용 유틸
types/database.types.ts # Supabase 자동 생성 타입 — 수동 편집 금지 (§4)
docs/
  PRD.md               # 기능 명세 단일 진실 공급원(SoT)
  ROADMAP.md           # Task 단위 진행 상태 (`- [ ]` / `- [x]`)
  guides/**            # 참고용 가이드 (project-structure.md 예외는 §1 참고)
proxy.ts               # 루트 미들웨어 (middleware.ts 대신 이 이름 사용, config.matcher 보유)
```

## 3. 코드 규칙 (CLAUDE.md 보강, 중복 서술 없음)

- 신규 폼 컴포넌트는 이 저장소의 기존 패턴을 따른다: `'use client'` + `useState`로 필드/에러/로딩 상태 관리 (예: `components/login-form.tsx`). `docs/guides/forms-react-hook-form.md`는 참고 가이드일 뿐 **현재 코드베이스에 react-hook-form은 도입되어 있지 않다** — 기존 컴포넌트와 다른 폼 라이브러리를 새로 도입하지 말 것
- 새 UI가 필요하면 먼저 `components/ui/`에 이미 있는 컴포넌트(badge, button, card, checkbox, dropdown-menu, input, label)를 재사용하고, 없으면 shadcn MCP(`mcp__shadcn__*`)로 추가할 것. 직접 스타일링한 원시 `<div>`/`<button>`으로 대체하지 말 것

## 4. 기능 구현 표준 — 신규 도메인 테이블 추가 절차

`docs/PRD.md` §5에 정의된 7개 테이블(`events`, `notices`, `participants`, `carpool_offers`, `carpool_requests`, `settlements`, `settlement_shares`) 등 신규 테이블을 추가할 때는 **반드시 아래 순서**를 지킬 것:

1. Supabase MCP `apply_migration`으로 마이그레이션 작성/적용 (PRD §5의 SQL 정의를 그대로 따름 — 컬럼/체크 제약을 임의로 변경하지 말 것)
2. 같은 마이그레이션 또는 후속 마이그레이션에서 RLS 정책 작성: `organizer_id = auth.uid()` (하위 테이블은 `events` 조인 경유) 기준 CRUD 허용
3. Supabase MCP `generate_typescript_types` 실행 → `types/database.types.ts` 덮어쓰기
4. **`types/database.types.ts`를 手동으로 편집하지 말 것** — 항상 3번 단계의 재생성 결과로만 갱신
5. `docs/ROADMAP.md`에서 해당 Task를 `- [x]`로 갱신

## 5. Supabase 연동 표준 — 클라이언트 사용처 규칙

| 상황                                                                                     | 사용할 클라이언트                                                                                                                                                          |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 클라이언트 컴포넌트(`'use client'`) 내부                                                 | `lib/supabase/client.ts`의 `createClient()`                                                                                                                                |
| 서버 컴포넌트 / Route Handler (인증 사용자 컨텍스트)                                     | `lib/supabase/server.ts`의 `createClient()`                                                                                                                                |
| 루트 미들웨어(`proxy.ts`)                                                                | `lib/supabase/proxy.ts`의 `updateSession()` — 다른 곳에서 호출 금지                                                                                                        |
| `docs/PRD.md`의 공개 조회(`/e/[shareSlug]`)·비로그인 탑승 신청 등 RLS 우회가 필요한 작업 | 신규 Service Role 전용 서버 클라이언트(예: `lib/supabase/service.ts`)를 Route Handler 안에서만 생성. **service role 키를 클라이언트 컴포넌트나 브라우저 번들에 노출 금지** |

- `/protected/*` 외부에 인증이 필요한 신규 페이지를 추가하지 말 것. 인증이 필요한 화면은 항상 `app/protected/**` 하위에 배치
- `docs/PRD.md`가 정의한 공개 경로(`/e/[shareSlug]`, `app/api/public/**`)를 추가할 경우, **`lib/supabase/proxy.ts`의 미인증 리다이렉트 예외 조건문(`request.nextUrl.pathname.startsWith(...)` 목록)에도 해당 경로를 함께 추가할 것** — 이 두 파일은 반드시 동시에 수정 (하나만 고치면 공개 페이지가 로그인 리다이렉트에 걸림)

## 6. 워크플로우 표준

1. 새 기능을 시작하기 전 `docs/PRD.md`(무엇을) → `docs/ROADMAP.md`(어떤 Task 순서로)를 먼저 확인
2. `docs/ROADMAP.md`에 없는 기능을 임의로 추가하지 말 것. 범위를 벗어난 요구가 들어오면 먼저 PRD/ROADMAP 갱신 여부를 확인
3. Task 구현 완료 후 `docs/ROADMAP.md`의 해당 체크박스를 `- [x]`로 갱신
4. 커밋/브랜치/PR 작업은 `.claude/commands/git/{commit,branch,merge,pr}.md`에 정의된 컨벤션(이모지 + Conventional Commits)을 따를 것

## 7. 핵심 파일 상호작용 표준

| 수정 대상                                | 동시에 확인/수정해야 하는 파일                                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| DB 스키마(신규 테이블/컬럼)              | `types/database.types.ts` (MCP 재생성), 관련 RLS 정책, `docs/ROADMAP.md` 체크박스                              |
| 공개(비로그인) 라우트 추가               | `lib/supabase/proxy.ts`의 리다이렉트 예외 조건                                                                 |
| `docs/PRD.md`의 스코프 결정 변경         | `docs/ROADMAP.md`의 해당 Phase/Task 설명 (스코프와 로드맵 불일치 방지)                                         |
| `components/ui/`에 없는 UI 컴포넌트 필요 | shadcn MCP로 추가 후 `components.json`의 `aliases` 규칙(`@/components`, `@/lib`, `@/hooks`)에 맞는 경로에 생성 |

## 8. AI 의사결정 기준

- 기능 범위가 애매하면 **`docs/PRD.md` → `docs/ROADMAP.md` 순으로 우선 참조**하여 판단. 두 문서에도 답이 없으면 임의로 확장하지 말고 사용자에게 확인
- 참여자(비로그인) 관련 기능을 구현할 때는 `docs/PRD.md` §2 "설계 결정"을 기준으로 삼는다: 참여자는 원칙적으로 조회만 가능, 카풀 탑승 신청만 예외적으로 비로그인 액션 허용, 참여자 셀프 RSVP 등록은 Phase 4 전까지 구현하지 않는다
- `docs/guides/*.md`와 실제 코드가 상충하면 **실제 코드를 우선**하고, 상충 사실을 사용자에게 알릴 것 (예: `project-structure.md`의 `src/app` 서술)

## 9. 금지 행위

- `types/database.types.ts` 수동 편집 금지 (항상 MCP 재생성)
- `components/tutorial/**`의 패턴을 신규 기능 컴포넌트 설계 근거로 참고하는 것 금지 (스타터킷 튜토리얼 전용 잔재)
- Service Role 키를 `'use client'` 컴포넌트, 클라이언트 번들, 공개 응답에 노출하는 것 금지
- `lib/supabase/proxy.ts`의 `updateSession()`을 미들웨어(`proxy.ts`) 이외의 위치(서버 컴포넌트, Route Handler 등)에서 호출하는 것 금지 — 해당 상황에는 `lib/supabase/server.ts` 사용
- `docs/PRD.md`에 없는 기능(예: 실제 PG 결제 연동, 지도 기반 카풀 자동 매칭, 참여자 셀프 RSVP)을 사용자 확인 없이 구현하는 것 금지 — 이들은 PRD §3 "Out of Scope"에 명시적으로 제외됨
