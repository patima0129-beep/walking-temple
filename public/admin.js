// admin.js — 선생님 전용 제출 현황 페이지 로직

const wrap = document.getElementById("adminWrap");
let adminPassword = sessionStorage.getItem("wt_admin_pw") || "";
let submissions = [];

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
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
      <p>걸어 다니는 교회 · 제출 현황</p>
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
  const ok = await loadSubmissions();
  if (ok) {
    sessionStorage.setItem("wt_admin_pw", adminPassword);
    renderList();
  } else {
    renderLogin("비밀번호가 올바르지 않아요. 다시 확인해 주세요.");
  }
}

async function loadSubmissions() {
  try {
    const res = await fetch(`/api/submissions?password=${encodeURIComponent(adminPassword)}`);
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.ok) return false;
    submissions = data.submissions;
    return true;
  } catch (err) {
    return false;
  }
}

function renderList() {
  const rows = submissions
    .map(
      (s) => `
      <tr>
        <td>${s.name}</td>
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
      <h1 style="font-size:1.6rem;">걸어 다니는 교회</h1>
      <p>선생님 전용 제출 현황</p>
    </div>
    <div class="admin-header" style="margin-top:20px;">
      <h1>학생 제출 목록</h1>
      <span class="stat-pill">총 ${submissions.length}명 제출</span>
    </div>
    ${
      submissions.length === 0
        ? `<div class="empty-state">아직 제출한 학생이 없어요.</div>`
        : `<table class="submission-table">
            <thead><tr><th>이름</th><th>제출 시각</th><th>보기</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`
    }
    <p class="footer-note" style="margin-top:24px;">
      <a href="/" style="color:rgba(250,246,238,0.5);">학생용 페이지로 이동</a>
    </p>
  `;

  wrap.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => showDetail(btn.dataset.id));
  });
  wrap.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteSubmission(btn.dataset.id));
  });
}

function showDetail(id) {
  const s = submissions.find((x) => x.id === id);
  if (!s) return;

  const scenarioHtml = s.scenarioAnswers
    .map(
      (a) =>
        `<div class="detail-block"><div class="q">${a.title}</div><div class="a">${a.choiceText}</div></div>`
    )
    .join("");

  const ss1Text =
    [...(s.selfStudy1?.checked || []), s.selfStudy1?.other].filter(Boolean).join(", ") || "(작성 없음)";

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" id="closeModal">✕ 닫기</button>
      <h3>${s.name} 님의 응답</h3>
      <p class="hint" style="margin-top:-6px;">제출 시각: ${fmtDate(s.submittedAt)}</p>
      ${scenarioHtml}
      <div class="detail-block">
        <div class="q">셀프 스터디 ① 정리가 필요한 성전</div>
        <div class="a">${ss1Text}</div>
      </div>
      <div class="detail-block">
        <div class="q">셀프 스터디 ② 예수님의 도우심이 필요한 연약함</div>
        <div class="a">${s.selfStudy2}</div>
      </div>
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
  await loadSubmissions();
  renderList();
}

// 초기 진입
(async function init() {
  if (adminPassword) {
    const ok = await loadSubmissions();
    if (ok) return renderList();
  }
  renderLogin();
})();
