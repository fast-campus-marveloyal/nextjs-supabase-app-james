# 배포 체크리스트

노션 기반 견적서 관리 시스템 MVP를 Vercel에 배포하기 위한 단계별 가이드입니다.

## Vercel 배포 단계

### 1. GitHub 저장소 연결

1. [Vercel 대시보드](https://vercel.com/dashboard)에 접속합니다.
2. **Add New → Project** 클릭합니다.
3. GitHub 저장소(`invoice-web`)를 선택하고 **Import** 클릭합니다.
4. Framework Preset이 **Next.js**로 자동 감지되는지 확인합니다.

### 2. 환경변수 설정

**Settings → Environment Variables**에서 아래 5개 환경변수를 추가합니다.

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NOTION_API_KEY` | Notion Integration 시크릿 키 | `secret_xxxxxx` |
| `NOTION_DATABASE_ID` | 견적서 데이터베이스 Notion ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호 | 충분히 복잡한 문자열 사용 |
| `SESSION_SECRET` | JWT 서명용 시크릿 (최소 32자) | `openssl rand -base64 32`로 생성 |
| `NEXT_PUBLIC_BASE_URL` | 배포된 프로덕션 도메인 URL | `https://your-app.vercel.app` |

> `SESSION_SECRET`은 반드시 32자 이상의 무작위 문자열을 사용합니다. `openssl rand -base64 32` 명령어로 생성할 수 있습니다.

### 3. 배포 실행

1. **Deploy** 버튼을 클릭합니다.
2. 빌드 로그를 확인하여 오류가 없는지 확인합니다.
3. 배포 완료 후 Vercel이 제공하는 도메인(예: `https://invoice-web.vercel.app`)을 확인합니다.
4. `NEXT_PUBLIC_BASE_URL` 환경변수를 실제 도메인으로 업데이트합니다.
5. 환경변수 변경 후 **Redeploy**를 실행합니다.

### 4. Notion Integration 권한 확인

- Notion Integration이 해당 데이터베이스에 **읽기 권한**이 부여되어 있는지 확인합니다.
- 데이터베이스 페이지 → **Share** → Integration 추가 순으로 설정합니다.

---

## 배포 후 MVP 성공 기준 재검증

배포 완료 후 아래 5개 항목을 순서대로 검증합니다.

- [ ] **F001 견적서 조회**: `https://your-app.vercel.app/invoice/{실제_페이지_ID}` 접근 → 견적서 번호, 클라이언트명, 총액, 항목 목록이 정상 렌더링되는지 확인
- [ ] **F002 PDF 다운로드**: 견적서 페이지에서 "PDF 다운로드" 클릭 → `invoice-{번호}.pdf` 파일이 다운로드되고 한글이 깨지지 않는지 확인
- [ ] **F004 URL 공유**: 관리자 목록에서 "링크 복사" 클릭 → 복사된 URL로 클라이언트가 견적서에 정상 접근 가능한지 확인
- [ ] **F005 관리자 대시보드**: `/admin-login`에서 로그인 → 견적서 목록 조회, 검색, 필터, 정렬 기능이 정상 동작하는지 확인
- [ ] **F010 관리자 인증**: 잘못된 비밀번호 입력 시 에러 토스트 표시, 올바른 비밀번호 입력 시 `/admin`으로 리다이렉트 확인
