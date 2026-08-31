-- ⚠️ 기존 submissions 테이블을 새 구조로 교체합니다.
-- 지금 테이블이 비어있거나(테스트 데이터만 있음) 별로 중요하지 않다면 그대로 실행하세요.
-- 만약 꼭 보존해야 할 제출 데이터가 있다면, 먼저 Table Editor에서 내용을 백업(캡처/복사)해두세요.

drop table if exists submissions;
drop table if exists games;

-- 게임(주차) 목록. 매주 새 게임을 배포하면 자동으로 한 줄씩 추가됩니다.
create table games (
  id text primary key,           -- 예: "2026-w36-ladder" 같은 고유 코드 (게임마다 다르게)
  title text not null,           -- 예: "사다리타기 - 이번 주 순종"
  category text,                 -- 예: "설문형", "미니게임" 등 자유롭게
  created_at timestamptz not null default now()
);

-- 학생 제출 데이터. 게임 종류가 달라도 answers(jsonb)에 자유 형식으로 담깁니다.
create table submissions (
  id uuid primary key,
  game_id text not null references games(id),
  name text not null,
  submitted_at timestamptz not null,
  summary text,                  -- 목록에서 바로 보이는 한 줄 요약 (예: "온전히 마음을 드린 하루")
  answers jsonb                  -- [{ "label": "질문", "value": "답변" }, ...] 형태의 자유 데이터
);

create index submissions_game_id_idx on submissions (game_id);
