// server.js
// "걸어 다니는 교회" 셀프 스터디 웹앱 서버
// 학생 제출을 data/submissions.json 파일에 저장하고,
// 선생님이 /admin 페이지에서 결과를 조회할 수 있도록 API를 제공합니다.

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ 선생님 전용 관리자 비밀번호입니다. 배포 전에 꼭 바꿔주세요!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "temple2026";

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "submissions.json");

// 데이터 파일/폴더가 없으면 생성
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");

function readSubmissions() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("데이터 파일을 읽는 중 오류:", err);
    return [];
  }
}

function writeSubmissions(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
}

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// 학생 제출 저장
app.post("/api/submit", (req, res) => {
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

  const submissions = readSubmissions();

  const entry = {
    id: crypto.randomUUID(),
    name: name.trim(),
    submittedAt: new Date().toISOString(),
    scenarioAnswers,
    selfStudy1: selfStudy1 || { checked: [], other: "" },
    selfStudy2: selfStudy2.trim(),
  };

  submissions.push(entry);
  writeSubmissions(submissions);

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
app.get("/api/submissions", checkAdminPassword, (req, res) => {
  const submissions = readSubmissions();
  // 최신 제출이 위로 오도록 정렬
  submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  res.json({ ok: true, submissions });
});

// 특정 제출 삭제 (선생님 전용, 필요 시 정리용)
app.delete("/api/submissions/:id", checkAdminPassword, (req, res) => {
  const submissions = readSubmissions();
  const filtered = submissions.filter((s) => s.id !== req.params.id);
  writeSubmissions(filtered);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`\n✝ 걸어 다니는 교회 서버가 실행되었습니다!`);
  console.log(`   학생용 페이지:   http://localhost:${PORT}`);
  console.log(`   선생님용 페이지: http://localhost:${PORT}/admin.html\n`);
});
