# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 시작
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

## Architecture

**Next.js 15.5.3 App Router** + **Supabase Auth** + **React 19** 기반 스타터킷.

### 라우트 구조

- `/` — 홈(온보딩/튜토리얼). 환경변수 설정 여부에 따라 조건부 렌더링(`hasEnvVars`)
- `/auth/*` — 로그인·가입·비밀번호 재설정 등 인증 플로우 (공개)
- `/protected/*` — 인증 필요 영역. `proxy.ts`의 `updateSession()`이 미인증 사용자를 `/auth/login`으로 리다이렉트

### Supabase 클라이언트 3종

| 파일                     | 용도                                               |
| ------------------------ | -------------------------------------------------- |
| `lib/supabase/client.ts` | 클라이언트 컴포넌트 (`'use client'`)               |
| `lib/supabase/server.ts` | 서버 컴포넌트·Route Handler (쿠키 기반)            |
| `lib/supabase/proxy.ts`  | 미들웨어 역할 — 모든 요청의 세션 갱신 및 접근 제어 |

`proxy.ts`는 middleware.ts 대신 사용하는 패턴이며, 요청마다 새 클라이언트를 생성한다 (Fluid compute 환경 대응).

### 인증 흐름

1. 모든 요청 → `proxy.ts`의 `updateSession()` 실행
2. `supabase.auth.getClaims()`로 세션 검증
3. 미인증 + `/protected` 경로 → `/auth/login` 리다이렉트
4. 쿠키 자동 동기화 (`@supabase/ssr`)

### TypeScript 타입

Supabase 자동 생성 타입은 `types/database.types.ts`에 위치. 클라이언트 제네릭으로 활용:

```ts
import { Database } from '@/types/database.types'
createBrowserClient<Database>(url, key)
```

## 핵심 규칙 (`docs/guides/` 참고)

- **Server Components 기본** — `'use client'`는 상태·이벤트 핸들러가 실제로 필요한 경우에만
- **Next.js 15 async params** — `params`, `searchParams`, `cookies()` 모두 `await` 필수
- **컴포넌트 크기** — 300줄 이하 유지, 단일 책임 원칙
- **CVA 패턴** — UI 변형은 `class-variance-authority`로 정의 (`components/ui/` 참고)
- **Path alias** — `@/*`는 프로젝트 루트 기준 (`@/components`, `@/lib`, `@/types`)

## DB 스키마

현재 테이블: `profiles` (Supabase `auth.users`와 1:1, RLS 활성화)  
신규 가입 시 `on_auth_user_created` 트리거로 자동 생성됨.

스키마 변경 시 타입 재생성: Supabase MCP `generate_typescript_types` → `types/database.types.ts` 덮어쓰기.

## 커스텀 Agents / Commands

`.claude/agents/` 아래에 전문 에이전트 정의 파일이 있음:

- **nextjs-app-developer** — 페이지·라우팅·레이아웃 설계
- **ui-markup-specialist** — 정적 마크업·Tailwind 스타일링 전용
- **starter-cleaner** — 스타터킷 보일러플레이트 제거
- **code-reviewer** — 코드 품질 리뷰
- **prd-generator / prd-validator** — 요구사항 문서화

`.claude/commands/git/` — `commit`, `branch`, `merge`, `pr` 커맨드로 일관된 Git 워크플로 유지.
