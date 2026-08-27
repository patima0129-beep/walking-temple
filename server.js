// server.js
// "걸어 다니는 교회" 셀프 스터디 웹앱 서버
// 학생 제출을 Supabase(Postgres) 에 저장하고,
// 선생님이 /admin 페이지에서 결과를 조회할 수 있도록 API를 제공합니다.
//
// ※ Render 무료 플랜은 파일시스템이 휘발성(재시작/슬립 시 초기화)이라
//    로컬 파일 대신 Supabase 같은 외부 DB에 저장하도록 바꿨습니다.

const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ 선생님 전용 관리자 비밀번호입니다. 배포 전에 꼭 바꿔주세요!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "temple2026";

// Supabase 연결 정보 (Render 환경변수에서 읽어옵니다)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn(
    "⚠️ SUPABASE_URL / SUPABASE_SERVICE_KEY 환경변수가 설정되지 않았어요. Render의 Environment 탭에서 추가해 주세요."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// 학생 제출 저장
app.post("/api/submit", async (req, res) => {
  const { name, scenarioAnswers, selfStudy1, selfStudy2 } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ ok: false, error: "이름을 입력해 주세요." });
  }
  if (!Array.isArray(scenarioAnswers)) {
    return res.status(400).json({ ok: false, error: "시나리오 응답 형식이 올바르지 않습니다." });
  }
  if (!selfStudy2 || typeof selfStudy2 !== "string" || !selfStudy2.trim()) {
    return res.status(400).json({ ok: false, error: "셀프 스터디 ②를 작성해 주세요." });
  }

  const entry = {
    id: crypto.randomUUID(),
    name: name.trim(),
    submitted_at: new Date().toISOString(),
    scenario_answers: scenarioAnswers,
    self_study1: selfStudy1 || { checked: [], other: "" },
    self_study2: selfStudy2.trim(),
  };

  const { error } = await supabase.from("submissions").insert(entry);

  if (error) {
    console.error("제출 저장 중 오류:", error);
    return res.status(500).json({ ok: false, error: "제출 저장 중 오류가 발생했어요." });
  }

  res.json({ ok: true, id: entry.id });
});

// 간단한 관리자 인증 미들웨어 (쿼리 또는 헤더의 비밀번호 확인)
function checkAdminPassword(req, res, next) {
  const password = req.query.password || req.headers["x-admin-password"];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: "비밀번호가 올바르지 않습니다." });
  }
  next();
}

// 전체 제출 목록 조회 (선생님 전용)
app.get("/api/submissions", checkAdminPassword, async (req, res) => {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("제출 목록 조회 중 오류:", error);
    return res.status(500).json({ ok: false, error: "제출 목록을 불러오는 중 오류가 발생했어요." });
  }

  // 프론트엔드(admin.js)가 기대하는 camelCase 형태로 변환
  const submissions = (data || []).map((s) => ({
    id: s.id,
    name: s.name,
    submittedAt: s.submitted_at,
    scenarioAnswers: s.scenario_answers,
    selfStudy1: s.self_study1,
    selfStudy2: s.self_study2,
  }));

  res.json({ ok: true, submissions });
});

// 특정 제출 삭제 (선생님 전용, 필요 시 정리용)
app.delete("/api/submissions/:id", checkAdminPassword, async (req, res) => {
  const { error } = await supabase.from("submissions").delete().eq("id", req.params.id);

  if (error) {
    console.error("제출 삭제 중 오류:", error);
    return res.status(500).json({ ok: false, error: "삭제 중 오류가 발생했어요." });
  }

  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✝ 걸어 다니는 교회 서버가 실행되었습니다!`);
  console.log(`   포트: ${PORT}`);
  console.log(`   학생용 페이지:   http://localhost:${PORT}`);
  console.log(`   선생님용 페이지: http://localhost:${PORT}/admin.html\n`);
});
