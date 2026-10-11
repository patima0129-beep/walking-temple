// server.js
// 매주 다른 게임(설문형, 사다리타기, 미니게임 등)을 같은 링크로 배포하고,
// 선생님 관리자 페이지에서는 게임(주차)별로 제출 데이터를 아카이빙해서 볼 수 있도록 하는 서버입니다.
//
// 데이터는 Supabase(Postgres)에 저장합니다. (Render 무료 플랜은 파일시스템이 휘발성이라 로컬 파일 저장 X)

const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ 선생님 전용 관리자 비밀번호입니다. 필요하면 Render 환경변수 ADMIN_PASSWORD로 바꿔주세요!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "temple2026";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn(
    "⚠️ SUPABASE_URL / SUPABASE_SERVICE_KEY 환경변수가 설정되지 않았어요. Render의 Environment 탭에서 추가해 주세요."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

app.use(express.json({ limit: "1mb" }));
// 매주 app.js를 바꿔 올리므로, html/js/css는 브라우저가 매번 서버에 "바뀌었는지" 확인하게 한다.
// (안 바뀌었으면 304로 짧게 응답하니 느려지지 않음. 이미지는 평소처럼 캐시)
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders(res, filePath) {
      if (/\.(html|js|css)$/.test(filePath)) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

// ---------------------------------------------------------
// 학생 제출 저장 (모든 게임 종류 공통)
// ---------------------------------------------------------
// 프론트엔드(그 주의 게임 app.js)는 아래 형식으로 보내면 됩니다:
// {
//   gameId: "2026-w36-ladder",      // 게임마다 고유한 코드 (필수, 겹치면 같은 게임으로 취급됨)
//   gameTitle: "사다리타기",         // 화면에 보일 이름 (필수)
//   category: "미니게임",           // 자유 카테고리 (선택)
//   name: "학생 이름",              // 필수
//   summary: "결과 한 줄 요약",      // 목록에 바로 보임 (선택)
//   answers: [{ label: "...", value: "..." }, ...]  // 상세보기에 보일 자유 데이터 (선택)
// }
app.post("/api/submit", async (req, res) => {
  const { gameId, gameTitle, category, name, summary, answers } = req.body || {};

  if (!gameId || typeof gameId !== "string" || !gameId.trim()) {
    return res.status(400).json({ ok: false, error: "게임 식별자(gameId)가 없습니다." });
  }
  if (!gameTitle || typeof gameTitle !== "string" || !gameTitle.trim()) {
    return res.status(400).json({ ok: false, error: "게임 제목(gameTitle)이 없습니다." });
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ ok: false, error: "이름을 입력해 주세요." });
  }

  // 게임이 처음 제출되는 거라면 games 테이블에 자동 등록 (이미 있으면 제목/카테고리 최신값으로 갱신)
  const { error: gameError } = await supabase
    .from("games")
    .upsert(
      { id: gameId.trim(), title: gameTitle.trim(), category: category || null },
      { onConflict: "id" }
    );

  if (gameError) {
    console.error("게임 등록 중 오류:", gameError);
    return res.status(500).json({ ok: false, error: "게임 등록 중 오류가 발생했어요." });
  }

  const entry = {
    id: crypto.randomUUID(),
    game_id: gameId.trim(),
    name: name.trim(),
    submitted_at: new Date().toISOString(),
    summary: summary || null,
    answers: Array.isArray(answers) ? answers : [],
  };

  const { error } = await supabase.from("submissions").insert(entry);

  if (error) {
    console.error("제출 저장 중 오류:", error);
    return res.status(500).json({ ok: false, error: "제출 저장 중 오류가 발생했어요." });
  }

  res.json({ ok: true, id: entry.id });
});

// 간단한 관리자 인증 미들웨어
function checkAdminPassword(req, res, next) {
  const password = req.query.password || req.headers["x-admin-password"];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: "비밀번호가 올바르지 않습니다." });
  }
  next();
}

// ---------------------------------------------------------
// 게임(주차) 목록 조회 — 각 게임의 제출 수도 같이 반환
// ---------------------------------------------------------
app.get("/api/games", checkAdminPassword, async (req, res) => {
  const { data: games, error: gamesError } = await supabase
    .from("games")
    .select("*")
    .order("created_at", { ascending: false });

  if (gamesError) {
    console.error("게임 목록 조회 중 오류:", gamesError);
    return res.status(500).json({ ok: false, error: "게임 목록을 불러오는 중 오류가 발생했어요." });
  }

  const { data: counts, error: countError } = await supabase
    .from("submissions")
    .select("game_id");

  if (countError) {
    console.error("제출 수 집계 중 오류:", countError);
    return res.status(500).json({ ok: false, error: "제출 수를 불러오는 중 오류가 발생했어요." });
  }

  const countMap = {};
  (counts || []).forEach((row) => {
    countMap[row.game_id] = (countMap[row.game_id] || 0) + 1;
  });

  const result = (games || []).map((g) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    createdAt: g.created_at,
    submissionCount: countMap[g.id] || 0,
  }));

  res.json({ ok: true, games: result });
});

// ---------------------------------------------------------
// 특정 게임의 제출 목록 조회
// ---------------------------------------------------------
app.get("/api/games/:gameId/submissions", checkAdminPassword, async (req, res) => {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("game_id", req.params.gameId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("제출 목록 조회 중 오류:", error);
    return res.status(500).json({ ok: false, error: "제출 목록을 불러오는 중 오류가 발생했어요." });
  }

  const submissions = (data || []).map((s) => ({
    id: s.id,
    name: s.name,
    submittedAt: s.submitted_at,
    summary: s.summary,
    answers: s.answers,
  }));

  res.json({ ok: true, submissions });
});

// 특정 제출 삭제
app.delete("/api/submissions/:id", checkAdminPassword, async (req, res) => {
  const { error } = await supabase.from("submissions").delete().eq("id", req.params.id);

  if (error) {
    console.error("제출 삭제 중 오류:", error);
    return res.status(500).json({ ok: false, error: "삭제 중 오류가 발생했어요." });
  }

  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✝ 서버가 실행되었습니다!`);
  console.log(`   포트: ${PORT}`);
  console.log(`   학생용 페이지:   http://localhost:${PORT}`);
  console.log(`   선생님용 페이지: http://localhost:${PORT}/admin.html\n`);
});
