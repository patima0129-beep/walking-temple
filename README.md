# walking-temple-app

여의도순복음경인교회 중고등부 셀프 스터디 웹앱. 매주 다른 게임(설문형, 미니게임 등)을
같은 링크로 배포하고, 선생님이 관리자 페이지에서 게임(주차)별로 학생 제출을
아카이빙해서 볼 수 있게 만든 프로젝트.

- 학생용: `https://youth-self-study.onrender.com/`
- 관리자용: `https://youth-self-study.onrender.com/admin.html`

---

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 서버 | Node.js + Express |
| 프론트엔드 | Vanilla JS / HTML / CSS (프레임워크 없음) |
| DB | Supabase (Postgres) |
| 배포 | Render (무료 웹서비스) |
| 버전 관리 | GitHub (로컬에 git 미설치, **웹 업로드 방식**으로 관리 — 아래 "배포 방법" 참고) |

---

## 폴더 구조

```
walking-temple-app/
├── server.js              # Express 서버, /api/* 라우트 전체
├── package.json
├── package-lock.json
├── schema.sql              # Supabase에 실행한 스키마 기록용 (코드에서 직접 안 씀)
└── public/
    ├── index.html          # 학생용 페이지. 제목/메타태그는 고정, 게임 내용만 app.js가 그림
    ├── app.js               # ⚠️ 이번 주 게임 로직. 매주 이 파일만 교체하면 됨
    ├── style.css             # 공통 스타일 (픽셀 아트 톤). 매주 게임에 새 컴포넌트 필요하면 여기 추가
    ├── admin.html
    ├── admin.js              # 관리자 페이지. 게임 종류에 상관없이 동작하는 범용 코드 — 평소엔 안 건드림
    ├── preview.png           # 링크 공유 시 미리보기 이미지 (카카오톡 등). public 루트에 위치
    └── images/                # 이번 주 게임 안에서 쓰는 캐릭터 이미지
        ├── day1-friend.png
        ├── day2-freetime.png
        ├── day3-family.png
        ├── day4-churchfriend.png
        ├── day5-stranger.png
        ├── day6-freetime.png
        └── day7-jesus.png
```

---

## DB 구조 (Supabase)

```sql
-- 게임(주차) 목록. 학생이 그 게임에 처음 제출하는 순간 자동으로 한 줄 생김.
-- 선생님이 따로 등록할 필요 없음.
games (
  id text primary key,       -- 게임 고유 식별자. app.js의 GAME_ID와 정확히 일치해야 함
  title text not null,
  category text,
  created_at timestamptz default now()
)

-- 학생 제출. 게임 종류가 달라도 answers(jsonb)에 자유 형식으로 담김 → 관리자 페이지 코드 수정 불필요
submissions (
  id uuid primary key,
  game_id text references games(id),
  name text not null,
  submitted_at timestamptz not null,
  summary text,               -- 목록에 바로 보이는 한 줄 요약
  answers jsonb                -- [{ "label": "...", "value": "..." }, ...]
)
```

`schema.sql`에 원본 CREATE TABLE 문 있음. Supabase SQL Editor에서 실행 시 RLS 경고 뜨는데,
**"Run without RLS"** 선택하는 게 맞음 — 서버가 `service_role` 키로만 접근하고, 그 키는
절대 프론트엔드 코드에 노출되지 않기 때문에 RLS 없이도 안전함.

---

## API

| 메서드 | 경로 | 용도 |
|---|---|---|
| POST | `/api/submit` | 학생 제출 저장. body: `{ gameId, gameTitle, category, name, summary, answers[] }` |
| GET | `/api/games?password=` | (관리자) 게임 목록 + 게임별 제출 수 |
| GET | `/api/games/:gameId/submissions?password=` | (관리자) 특정 게임의 제출 목록 |
| DELETE | `/api/submissions/:id?password=` | (관리자) 제출 하나 삭제 |

`checkAdminPassword` 미들웨어가 쿼리 `password` 또는 헤더 `x-admin-password`를 확인함.

---

## 환경변수

Render 대시보드 → 서비스 → **Environment** 탭에 등록되어 있음. 로컬 테스트 시에는
터미널 세션마다 따로 설정해야 함(터미널 새로 열면 초기화됨):

```
set SUPABASE_URL=https://oazpjgylernbqvcocrrz.supabase.co
set SUPABASE_SERVICE_KEY=<Supabase Settings → API Keys → Legacy anon, service_role API keys 탭에서 service_role 값 복사>
```

- `ADMIN_PASSWORD` : 관리자 로그인 비밀번호. 미설정 시 코드 기본값(`temple2026`) 사용 — 운영 중이면 Render에 별도로 설정해두는 걸 권장.
- `PORT` : Render가 자동으로 설정함, 로컬에서는 기본 3000.

---

## 로컬 실행

```
cd 프로젝트폴더경로
set SUPABASE_URL=...
set SUPABASE_SERVICE_KEY=...
npm install          # 최초 1회 또는 의존성 추가 시
npm start             # 또는 node server.js
```

`http://localhost:3000` (학생용), `http://localhost:3000/admin.html` (관리자용)

---

## 배포 방법 (git 없이 GitHub 웹 업로드)

이 컴퓨터엔 git이 설치되어 있지 않아서, 커밋은 **GitHub 웹사이트에서 직접 업로드**하는 방식으로 진행함.

1. GitHub 저장소(`patima0129-beep/walking-temple`) 접속
2. 바뀐 파일이 있는 위치로 이동 (`server.js`는 루트, 나머지는 `public/`)
3. **Add file → Upload files** → 바뀐 파일 드래그 → **Commit changes**
4. Render가 GitHub 커밋을 감지해서 **자동 재배포** (Render 대시보드에서 진행 상황 확인 가능)

⚠️ `node_modules` 폴더는 절대 업로드하지 않음 (용량 크고 불필요, `package.json` 기준으로 Render가 알아서 설치함).

### Render 무료 플랜 관련 주의사항

- 파일시스템이 **휘발성**이라 로컬 파일 기반 저장은 안 됨 (이게 최초에 겪었던 버그의 원인 — 서버 재시작/슬립 때마다 데이터 날아감). 반드시 Supabase 같은 외부 DB 사용.
- 15분간 요청 없으면 슬립 → 다음 요청 시 깨어나는 데 최대 50초 지연 가능.

---

## 매주 새 게임 추가하는 방법

게임 종류(설문형, 사다리타기, 미니게임 등)가 매주 달라져도 **서버/DB/관리자 페이지 코드는
전혀 안 건드림**. 아래만 바꾸면 됨:

1. `public/app.js`를 그 주의 게임 로직으로 교체
2. 파일 맨 위 상수들을 새로 지정:
   ```js
   const GAME_ID = "2026-w38-xxxxx";   // 매주 고유하게! 겹치면 이전 주차 데이터랑 합쳐짐
   const GAME_TITLE = "게임 이름";
   const GAME_CATEGORY = "카테고리";
   ```
3. 제출 시 `/api/submit`으로 보내는 body 형식만 지키면 됨:
   ```js
   { gameId: GAME_ID, gameTitle: GAME_TITLE, category: GAME_CATEGORY,
     name: 학생이름, summary: "한 줄 요약(선택)", answers: [{label, value}, ...] }
   ```
4. 캐릭터 이미지가 필요하면 `public/images/`에 추가 (파일명은 자유, `app.js`의 `img:` 경로만 맞으면 됨)
5. `index.html`, `style.css`, `admin.js`, `server.js`는 그대로 두고 **`app.js`(+이미지)만** GitHub에 업로드

첫 제출이 들어오는 순간 `games` 테이블에 자동 등록되고, 관리자 페이지에 새 카드로 나타남.

---

## 현재(이번 주) 게임: 마음을 드리는 자 · KINGDOM BANK

- 본문: 누가복음 21:1-4 (과부의 두 렙돈), 마무리 말씀: 사무엘상 16:7
- 구조: 월~토 6일 동안 TIME/HEART 100씩을 친구·가족·교회친구·낯선 이·자유시간에
  나눠 쓰고, 일요일에 예수님을 만남
- 선택마다: 슬라이더로 양 결정 → 행동 서술 + 캐릭터 대사(또는 독백) + 성찰 멘트가
  타이핑 애니메이션으로 한 화면에 표시
- 예수님 장면: 얼마를 드리든 상관없이 항상 100으로 채워주심 (게이지 애니메이션) —
  "돕기 vs 예수님께 드리기"가 제로섬 경쟁처럼 읽히지 않도록 의도적으로 설계함
- 은행 명세서 페이지: 인쇄되듯 타이핑되는 연출, 시간 블록 전체 → 마음 블록 전체 순서,
  마지막에 "BONUS: Just Think" 성찰 문구(선택지 없이 텍스트만)
- 마지막 페이지: 기도제목/전도사님께 하고 싶은 말 (선택 입력) → 제출

---

## 알아두면 좋은 사소한 함정들

- **윈도우 탐색기 확장자 숨김**: 이미지 파일 이름 바꿀 때 확장자가 이중으로 붙는 경우 있음
  (예: `day1-friend.png.jpg`). "보기 → 파일 확장명 표시" 켜고 확인할 것.
- **cmd에서 set 변수는 세션마다 초기화됨**: 터미널 새로 열면 `SUPABASE_URL` 등 환경변수 다시 설정해야 함.
- **cmd 붙여넣기**: Ctrl+V 안 먹히면 마우스 오른쪽 클릭으로 붙여넣기.
