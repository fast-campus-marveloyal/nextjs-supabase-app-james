# 모임 이벤트 관리 웹 MVP — PRD

> 작성일: 2026-07-04
> 버전: v0.2 (MVP, 설계 결정 반영)

---

## 1. 문제 정의

수영, 헬스, 친구 모임 등 **정기/비정기 소모임**을 운영하는 주최자는 매번 아래 업무를 반복한다.

- 공지사항을 단톡방에 흩뿌려서 전달 (묻히고, 검색 안 됨)
- 참여 인원 파악을 위해 "참여하실 분 손✋" 방식의 수동 집계
- 카풀 수요/공급을 단톡방 텍스트로 매칭 (누가 신청했는지 스크롤로 추적)
- 대관료·회식비 등을 인원수로 나눠 정산하고, 누가 냈는지 일일이 확인

이 모든 게 **카카오톡 단톡방**이라는, 검색·집계·상태관리에 취약한 도구 위에서 수동으로 이루어지고 있다. MVP는 이 반복 업무를 **주최자 1인이 쓰는 가벼운 운영 도구**로 대체하는 것을 목표로 한다.

## 2. 타겟 사용자

| 구분                           | 설명                                                                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **주 타겟 (Primary)**          | 수영/헬스/취미 소모임을 정기적으로 운영하는 주최자 1인. 비개발자, 비전문 관리자. 카카오톡 단톡방으로 모임을 운영해왔고 반복 업무에 피로를 느낌 |
| **참여자 (Secondary, 비계정)** | 모임원. **Supabase 계정 없이** 주최자가 공유한 링크로 공지·카풀·정산 현황을 조회                                                               |

### MVP 스코프 확정 사항 (사용자 확인 완료)

- **주최자 전용 도구**: 로그인·계정 관리는 주최자만 해당. 참여자는 회원가입 없음
- **정산**: 금액 계산 + 입금 여부 체크리스트까지만. 실제 PG/송금 연동 없음 (송금은 카톡/계좌이체로 사용자가 직접)
- **카풀**: 수동 매칭. 지도 기반 자동 매칭·경로 최적화 없음

### ✅ 설계 결정: 참여자의 "조회"와 "액션" 범위

"참여자는 로그인 없이 공유 링크로 조회"를 아래와 같이 확정합니다.

- 참여자는 **공유 링크(토큰 기반 URL)** 로 이벤트 페이지에 접속해 공지·참여자 명단·카풀 현황·정산 현황을 **조회**만 할 수 있음 (기본 원칙)
- **예외 — 카풀 탑승 신청만 참여자 액션 허용**: 참여자가 공유 링크의 비로그인 폼(이름 입력)으로 "탑승 신청" → 주최자가 대시보드에서 승인/거절. (이미 확정된 스코프이므로 그대로 반영)
- **참여자 명단(RSVP) 자체는 셀프 등록을 MVP에서 제외**하고, 주최자가 직접 입력(카톡으로 취합한 이름을 앱에 등록)하는 것만 지원. 셀프 등록 폼은 Phase 4로 이연 (§6)

> **결정 근거**: 참여자 액션 창구를 여러 개(RSVP 신청 + 카풀 신청) 동시에 만들면 입력 검증·중복 이름 처리 등 MVP치고 관리 부담이 커짐. 이미 스코프로 확정된 카풀 신청 외에는 입력 경로를 "주최자 단일 입력"으로 단순화하는 것이 1인 개발 MVP에 더 적합.

---

## 3. MVP 기능 명세

### 3.1 이벤트(모임) 관리

- 이벤트 생성/수정/삭제 (제목, 카테고리(수영/헬스/기타), 일시, 장소, 설명)
- 이벤트별 고유 공유 링크(slug) 자동 생성 — 참여자에게 카톡으로 전달
- 이벤트 상태: 모집중 / 마감 / 종료

### 3.2 공지 관리

- 공지 작성/수정/삭제 (제목, 본문)
- 상단 고정(pinned) 기능
- 참여자는 공유 링크에서 공지 목록을 시간순으로 조회

### 3.3 참여자 관리

- 주최자가 참여자 등록 (이름, 연락처, 참여 상태: 확정/대기/불참) — **MVP는 주최자 직접 입력만 지원** (셀프 등록 없음, §2 결정 참고)
- 참여자 목록 테이블에서 상태 일괄 관리 (인라인 수정/삭제)
- 참여자는 공유 링크에서 명단을 **읽기 전용**으로 조회 가능 (이름, 참여 상태만 노출, 연락처는 비노출)

### 3.4 카풀 (수동 매칭)

- 운전자 등록: 출발지, 출발 시각, 좌석 수
- 참여자(비로그인)가 공유 링크에서 카풀 목록을 보고 이름 입력 후 "탑승 신청"
- 주최자가 신청 승인/거절 (좌석 수 초과 시 경고 표시)
- 지도 연동, 자동 경로 매칭 없음 — 텍스트 기반 정보만

### 3.5 정산 (계산·기록만)

- 정산 항목 생성 (제목, 총액 입력) + **정산 대상 참여자 선택** (기본값: 참여 상태 '확정'인 참여자 전체, 체크박스로 개별 제외 가능)
- 총액 ÷ 선택된 대상 인원수 = 1인당 금액 자동 계산 (균등 분배만, MVP 기준) → 대상 인원만큼 `settlement_shares` 레코드 자동 생성
- 참여자별 "입금 완료" 체크박스 (주최자가 확인 후 체크)
- 정산 요약을 텍스트로 복사해 카톡 공유 가능한 요약 뷰 제공
- 실제 결제/송금 연동 없음

### Out of Scope (차기 버전 고려)

- 실제 결제(PG) 연동, 계좌 자동 이체
- 지도 기반 카풀 자동 매칭
- 참여자 개인 계정/알림(푸시, 문자, 카카오톡 알림톡)
- 반복 모임 템플릿, 회비 자동 정기 징수
- 정산 항목별 차등 분배(1/N이 아닌 개별 금액 지정)
- **참여자 셀프 RSVP 등록 폼** (공유 링크에서 참여자가 직접 참여 신청) — MVP는 주최자 직접 입력만 지원, Phase 4에서 검토

---

## 4. 정보 구조 / 화면 플로우

### 4.1 주최자 (인증 필요, `/protected/*`)

```
/protected/dashboard
  └─ 내 이벤트 목록 (생성/카테고리별 필터)

/protected/events/new
  └─ 이벤트 생성 폼

/protected/events/[eventId]
  ├─ 개요 탭: 이벤트 정보, 공유 링크 복사
  ├─ 공지 탭: 공지 CRUD
  ├─ 참여자 탭: 참여자 등록/수정/삭제, 참여 상태 관리
  ├─ 카풀 탭: 운전자 등록, 탑승 신청 승인/거절
  └─ 정산 탭: 정산 항목 생성 및 대상자 선택, 1인당 금액 계산, 입금 체크리스트
```

### 4.2 참여자 (비로그인, 공개 경로)

```
/e/[shareSlug]
  ├─ 이벤트 개요 + 공지 목록 (읽기 전용)
  ├─ 참여자 명단 조회 (읽기 전용 — 이름·참여 상태만 노출, 셀프 등록 없음)
  ├─ 카풀 목록 조회 + 탑승 신청 폼 (이름 입력 → 주최자 승인 대기)
  └─ 정산 요약 조회 (이름 목록에서 본인 이름 선택 → 개인 입금 여부 확인. 별도 인증 없음 — 금액·입금여부는 민감정보가 아니므로 MVP 허용)
```

---

## 5. DB 스키마 설계 (Supabase / Postgres)

기존 `profiles` 테이블(주최자 계정, `auth.users` 1:1)을 그대로 활용하고, 아래 테이블을 신규 추가합니다.

```sql
-- 이벤트(모임)
create table events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  category text not null check (category in ('수영', '헬스', '모임', '기타')),
  description text,
  event_date timestamptz not null,
  location text,
  share_slug text not null unique,
  status text not null default 'recruiting' check (status in ('recruiting', 'closed', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 공지
create table notices (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  content text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- 참여자 (MVP: 주최자가 직접 등록. 셀프 등록은 Phase 4에서 컬럼 추가 예정)
create table participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  contact text,
  rsvp_status text not null default 'pending' check (rsvp_status in ('pending', 'confirmed', 'declined')),
  created_at timestamptz not null default now()
);

-- 카풀 등록(운전자)
create table carpool_offers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  driver_name text not null,
  departure_location text not null,
  departure_time timestamptz not null,
  seat_count int not null check (seat_count > 0),
  created_at timestamptz not null default now()
);

-- 카풀 탑승 신청
create table carpool_requests (
  id uuid primary key default gen_random_uuid(),
  carpool_offer_id uuid not null references carpool_offers(id) on delete cascade,
  requester_name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- 정산 항목
create table settlements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  total_amount numeric(12, 0) not null check (total_amount >= 0),
  created_at timestamptz not null default now()
);

-- 정산 인당 분담 내역
create table settlement_shares (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlements(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  amount numeric(12, 0) not null,
  paid boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
```

### RLS 정책 방향

- `events` 및 하위 테이블(공지/참여자/카풀/정산) 전체: `organizer_id = auth.uid()` (조인 경유)일 때만 CRUD 허용
- 공개 조회(`/e/[shareSlug]`)와 비로그인 액션(탑승 신청)은 RLS를 우회해야 하므로 **Route Handler + Service Role 키**로 서버에서만 처리 (클라이언트에 서비스 키 노출 금지)
- `share_slug`는 추측 불가능한 랜덤 문자열(nanoid 등)로 생성해 사실상의 비공개 링크로 운용

---

## 6. 개발 우선순위 로드맵

| Phase                            | 범위                                                                         | 목표                                             |
| -------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| **Phase 1**                      | 이벤트 생성/관리, 공지 CRUD, 참여자 관리(주최자 등록), 공유 링크 조회 페이지 | 카톡 단톡방을 대체하는 "공지판 + 명단" 최소 기능 |
| **Phase 2**                      | 정산 기능 (금액 계산, 입금 체크, 요약 공유)                                  | 반복적으로 가장 번거로운 정산 업무 자동화        |
| **Phase 3**                      | 카풀 기능 (등록/신청/승인)                                                   | 카풀 매칭을 단톡방 스크롤에서 앱으로 이관        |
| **Phase 4 (향후)**               | 참여자 셀프 등록 폼, 정산 차등 분배, 반복 모임 템플릿                        | 사용성 확장                                      |
| **Phase 5 (향후, Out of Scope)** | 카카오 알림톡 연동, PG 결제 연동, 지도 기반 카풀 매칭                        | 별도 검증 후 진행                                |
