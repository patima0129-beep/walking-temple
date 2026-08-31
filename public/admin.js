// admin.js — 선생님 전용 제출 현황 페이지 로직 (게임/주차별 아카이브)

const wrap = document.getElementById("adminWrap");
let adminPassword = sessionStorage.getItem("wt_admin_pw") || "";
let games = [];
let currentGameId = null;
let submissions = [];

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderLogin(errorMsg) {
  wrap.innerHTML = `
    <div class="masthead" style="margin-top:60px;">
      <h1>선생님 전용</h1>
      <p>제출 현황 아카이브</p>
    </div>
    <div class="card admin-login">
      <div class="eyebrow">관리자 로그인</div>
      <h2>비밀번호를 입력해 주세요</h2>
      <input type="text" id="pwInput" placeholder="관리자 비밀번호" />
      ${errorMsg ? `<div class="error-msg">${errorMsg}</div>` : ""}
      <div class="btn-row">
        <button class="btn-primary" id="loginBtn" style="flex:1;">확인</button>
      </div>
    </div>
  `;
  const input = document.getElementById("pwInput");
  input.type = "password";
  document.getElementById("loginBtn").addEventListener("click", () => tryLogin(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryLogin(input.value);
  });
}

async function tryLogin(pw) {
  adminPassword = pw;
  const ok = await loadGames();
  if (ok) {
    sessionStorage.setItem("wt_admin_pw", adminPassword);
    renderGameList();
  } else {
    renderLogin("비밀번호가 올바르지 않아요. 다시 확인해 주세요.");
  }
}

async function loadGames() {
  try {
    const res = await fetch(`/api/games?password=${encodeURIComponent(adminPassword)}`);
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.ok) return false;
    games = data.games;
    return true;
  } catch (err) {
    return false;
  }
}

async function loadSubmissions(gameId) {
  try {
    const res = await fetch(
      `/api/games/${encodeURIComponent(gameId)}/submissions?password=${encodeURIComponent(adminPassword)}`
    );
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.ok) return false;
    submissions = data.submissions;
    return true;
  } catch (err) {
    return false;
  }
}

// ---------------------------------------------------------
// 화면: 게임(주차) 목록 — 아카이브 첫 화면
// ---------------------------------------------------------
function renderGameList() {
  const cardsHtml = games
    .map(
      (g) => `
      <div class="game-card" data-id="${g.id}">
        <div class="game-card-top">
          <span class="game-title">${g.title}</span>
          ${g.category ? `<span class="stat-pill">${g.category}</span>` : ""}
        </div>
        <div class="game-card-meta">
          <span>${g.submissionCount}명 제출</span>
          <span>${fmtDate(g.createdAt)} 등록</span>
        </div>
      </div>`
    )
    .join("");

  wrap.innerHTML = `
    <div class="masthead" style="margin-top:24px; margin-bottom:4px;">
      <h1 style="font-size:1.6rem;">선생님 전용</h1>
      <p>게임(주차)별 제출 아카이브</p>
    </div>
    ${
      games.length === 0
        ? `<div class="empty-state">아직 등록된 게임이 없어요. 학생이 첫 제출을 하면 자동으로 여기 나타나요.</div>`
        : `<div class="game-grid">${cardsHtml}</div>`
    }
  `;

  wrap.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("click", () => openGame(card.dataset.id));
  });
}

async function openGame(gameId) {
  currentGameId = gameId;
  const ok = await loadSubmissions(gameId);
  if (ok) renderSubmissionList();
}

// ---------------------------------------------------------
// 화면: 특정 게임의 제출 목록
// ---------------------------------------------------------
function renderSubmissionList() {
  const game = games.find((g) => g.id === currentGameId);
  const rows = submissions
    .map(
      (s) => `
      <tr>
        <td>${s.name}</td>
        <td>${s.summary || "-"}</td>
        <td>${fmtDate(s.submittedAt)}</td>
        <td>
          <button class="view-btn" data-id="${s.id}">보기</button>
          <button class="delete-btn" data-id="${s.id}">삭제</button>
        </td>
      </tr>`
    )
    .join("");

  wrap.innerHTML = `
    <div class="masthead" style="margin-top:24px; margin-bottom:4px;">
      <h1 style="font-size:1.6rem;">${game ? game.title : ""}</h1>
      <p>선생님 전용 제출 현황</p>
    </div>
    <p class="footer-note" style="margin-bottom:12px;">
      <a href="#" id="backToGames" style="color:rgba(250,246,238,0.6);">&larr; 전체 게임 목록으로</a>
    </p>
    <div class="admin-header" style="margin-top:8px;">
      <h1>학생 제출 목록</h1>
      <span class="stat-pill">총 ${submissions.length}명 제출</span>
    </div>
    ${
      submissions.length === 0
        ? `<div class="empty-state">아직 제출한 학생이 없어요.</div>`
        : `<table class="submission-table">
            <thead><tr><th>이름</th><th>요약</th><th>제출 시각</th><th>보기</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`
    }
  `;

  document.getElementById("backToGames").addEventListener("click", (e) => {
    e.preventDefault();
    renderGameList();
  });
  wrap.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => showDetail(btn.dataset.id));
  });
  wrap.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteSubmission(btn.dataset.id));
  });
}

// 게임 종류에 상관없이 answers 배열을 그냥 나열해서 보여줌 (범용 상세보기)
function showDetail(id) {
  const s = submissions.find((x) => x.id === id);
  if (!s) return;

  const answersHtml = (s.answers || [])
    .map((a) => `<div class="detail-block"><div class="q">${a.label}</div><div class="a">${a.value}</div></div>`)
    .join("") || `<div class="detail-block"><div class="a">(추가 데이터 없음)</div></div>`;

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" id="closeModal">✕ 닫기</button>
      <h3>${s.name} 님의 응답</h3>
      <p class="hint" style="margin-top:-6px;">
        제출 시각: ${fmtDate(s.submittedAt)}${s.summary ? ` · ${s.summary}` : ""}
      </p>
      ${answersHtml}
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.remove();
  });
  document.getElementById("closeModal").addEventListener("click", () => backdrop.remove());
}

async function deleteSubmission(id) {
  const s = submissions.find((x) => x.id === id);
  if (!s) return;
  if (!confirm(`${s.name} 님의 제출 내용을 삭제할까요? 되돌릴 수 없어요.`)) return;
  await fetch(`/api/submissions/${id}?password=${encodeURIComponent(adminPassword)}`, {
    method: "DELETE",
  });
  await loadSubmissions(currentGameId);
  renderSubmissionList();
}

// 초기 진입
(async function init() {
  if (adminPassword) {
    const ok = await loadGames();
    if (ok) return renderGameList();
  }
  renderLogin();
})();
