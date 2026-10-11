// app.js — 학생용 "복음팔찌 · 우리 가족 인생네컷" 미니게임 로직
// 전도 훈련 1주차 학습지(복음팔찌 4영리)를 한 번 더 점검하고, 가족과 인생네컷을 찍은 뒤
// 소감과 기도제목을 적어 제출하는 구조입니다.
// 인트로 → ① 팔찌 꿰기(구슬 순서) → ② 4영리 퀴즈 → ③ 가족 인생네컷 → ④ 소감·기도제목 → 완료(사도행전 1:8)
// (지난주 KINGDOM BANK 게임은 archive/2026-w37-kingdom-bank/app.js 에 보관되어 있어요)

const GAME_ID = "2026-w41-gospel-bracelet";
const GAME_TITLE = "복음팔찌 · 우리 가족 인생네컷";
const GAME_CATEGORY = "미니게임";

const STEP_LABELS = ["팔찌", "퀴즈", "네컷", "소감"];

// GIF 인코더 (움짤 저장 버튼을 누를 때만 불러옵니다)
const GIFENC_URL = "https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js";

// ---------------------------------------------------------
// 학습지 내용 (인쇄본과 똑같이 맞춰 두었어요)
// ---------------------------------------------------------
const BEADS = [
  {
    key: "yellow",
    name: "노랑",
    color: "#ffd43b",
    say: "거룩하신 하나님이 나를 만드시고 사랑하세요. 나는 하나님을 위해 지음받았어요.",
    verse: "하나님이 나를 자기 영광을 위해 지으셨다",
    ref: "이사야 43:7",
  },
  {
    key: "black",
    name: "검정",
    color: "#222222",
    say: "나는 하나님을 거역한 죄인이고 심판을 받아야 해요. 착한 일로는 해결 못 해요.",
    verse: "죄의 삯은 사망이다",
    ref: "로마서 6:23",
  },
  {
    key: "red",
    name: "빨강",
    color: "#e5383b",
    say: "예수님이 내가 받을 벌을 십자가에서 대신 받으시고 다시 살아나셨어요.",
    verse: "우리가 죄인일 때 그리스도께서 우리를 위해 죽으셨다",
    ref: "로마서 5:8",
  },
  {
    key: "white",
    name: "하양",
    color: "#ffffff",
    say: "성령님이 회개와 믿음을 주세요. 예수님을 구주와 주님으로 믿으면 깨끗해져요. 그 믿음도 하나님의 선물이에요.",
    verse: "구원은 은혜로, 믿음으로 받는 하나님의 선물이다",
    ref: "에베소서 2:8",
  },
  {
    key: "green",
    name: "초록",
    color: "#2fb36d",
    say: "구원은 끝이 아니라 시작이에요. 교회에서 예수님의 제자로 자라요.",
    verse: "그리스도 안에 있으면 새로운 피조물이다",
    ref: "고린도후서 5:17",
  },
];

const beadByKey = (key) => BEADS.find((b) => b.key === key);

// type: "bead" (구슬 고르기) | "choice" (보기 고르기)
const QUIZ = [
  ...BEADS.map((b) => ({
    type: "bead",
    q: `📖 “${b.verse}” (${b.ref})<br />이 말씀은 어떤 구슬의 말씀일까요?`,
    answer: b.key,
    explain: `${b.name} 구슬 — ${b.say}`,
  })),
  {
    type: "bead",
    q: "가족이 “착하게 살면 되잖아?” 하고 물어봤어요.<br />어떤 구슬로 돌아가서 설명하면 좋을까요?",
    answer: "black",
    explain: "검정 구슬로 돌아가요. 죄는 하나님을 거역한 상태라 착한 일로 못 덮어요.",
  },
  {
    type: "bead",
    q: "“왜 꼭 예수님이야?” 하고 물어보면<br />어떤 구슬로 설명할까요?",
    answer: "red",
    explain: "빨강 구슬. 벌을 대신 받고 다시 살아나신 분은 예수님뿐이에요.",
  },
  {
    type: "choice",
    q: "O / X 퀴즈!<br />“기도문을 따라 하면, 그 기도문이 우리를 구원한다.”",
    options: ["⭕ 맞아요", "❌ 아니에요"],
    answer: 1,
    explain:
      "기도문이 우리를 구원하는 게 아니에요. 우리를 구원하는 건 예수님이 십자가에서 하신 일이에요. 이 기도는 하나님이 주신 회개와 믿음을 하나님께 고백하는 거예요.",
  },
  {
    type: "choice",
    q: "설명하다가 내가 모르는 질문이 나왔어요!<br />어떻게 하면 좋을까요?",
    options: [
      "아는 척 대충 대답한다",
      "“선생님께 물어보고 알려 드릴게요.”라고 말한다",
      "당황해서 대화를 끝낸다",
    ],
    answer: 1,
    explain: "“선생님께 물어보고 알려 드릴게요.” 괜찮아요. 모르는 건 모른다고 해도 돼요.",
  },
];

// ---------------------------------------------------------
// 인생네컷 프레임 테마
// ---------------------------------------------------------
const THEMES = [
  { key: "strawberry", label: "🍓 딸기우유", bg: "#ffd6e3", dot: "#ffeaf1", accent: "#ff7aa2", text: "#7a2e4a", cell: "#ffffff", stickers: ["🎀", "💗", "🍓", "✨"] },
  { key: "soda", label: "🫧 하늘소다", bg: "#cdeeff", dot: "#e8f7ff", accent: "#3aa8ea", text: "#1d4c78", cell: "#ffffff", stickers: ["☁️", "💙", "🫧", "⭐"] },
  { key: "banana", label: "🍌 바나나우유", bg: "#fff1b8", dot: "#fff8da", accent: "#f2b705", text: "#7a5a00", cell: "#ffffff", stickers: ["🌼", "💛", "🐥", "✨"] },
  { key: "mint", label: "🌿 민트", bg: "#d4f5e6", dot: "#ebfbf3", accent: "#2fb38a", text: "#1f5c47", cell: "#ffffff", stickers: ["🌷", "💚", "🍀", "⭐"] },
  { key: "classic", label: "🖤 클래식", bg: "#2b2b2f", dot: "#38383e", accent: "#ffd6e3", text: "#ffffff", cell: "#ffffff", stickers: ["🎀", "🤍", "✨", "💫"] },
];

// 움짤 만드는 동안 번갈아 뜨는 멘트
const GIF_LOADING_LINES = [
  "🎞️ 네 컷을 한 줄로 이어 붙이는 중…",
  "🎀 리본 예쁘게 묶는 중…",
  "✨ 반짝이 솔솔 뿌리는 중…",
  "📸 가족 미소 꾹꾹 눌러 담는 중…",
  "💛 사랑 한 스푼 넣는 중…",
  "🍬 달콤하게 굽는 중… 거의 다 됐어요!",
];

// 프레임 모양: cols 1 = 세로 한 줄(1×4, 가로로 긴 칸), cols 2 = 두 칸씩 두 줄(2×2, 세로로 긴 칸)
// style lovely = 물방울+스티커, film = 필름 구멍 뚫린 심플 스타일
const FRAMES = [
  { key: "strip-lovely", label: "1×4 러블리", cols: 1, style: "lovely" },
  { key: "strip-film", label: "1×4 필름", cols: 1, style: "film" },
  { key: "grid-lovely", label: "2×2 러블리", cols: 2, style: "lovely" },
  { key: "grid-film", label: "2×2 필름", cols: 2, style: "film" },
];

// 레이아웃 기준값 (가로 600 기준, 저장할 때 배율을 곱해서 그림)
function getLayout(frame) {
  if (frame.cols === 1) {
    const L = { W: 600, PAD: 30, TOP: 44, CELL_W: 540, CELL_H: 405, GAP: 16, BOTTOM: 176, pngScale: 1.6, gifScale: 0.6 };
    L.H = L.TOP + L.CELL_H * 4 + L.GAP * 3 + L.BOTTOM;
    L.cells = [0, 1, 2, 3].map((i) => ({ x: L.PAD, y: L.TOP + i * (L.CELL_H + L.GAP), w: L.CELL_W, h: L.CELL_H }));
    return L;
  }
  const L = { W: 600, PAD: 30, TOP: 64, GAP: 14, BOTTOM: 176, pngScale: 1.6, gifScale: 0.8 };
  L.CELL_W = (L.W - L.PAD * 2 - L.GAP) / 2;
  L.CELL_H = Math.round((L.CELL_W * 4) / 3);
  L.H = L.TOP + L.CELL_H * 2 + L.GAP + L.BOTTOM;
  L.cells = [0, 1, 2, 3].map((i) => ({
    x: L.PAD + (i % 2) * (L.CELL_W + L.GAP),
    y: L.TOP + Math.floor(i / 2) * (L.CELL_H + L.GAP),
    w: L.CELL_W,
    h: L.CELL_H,
  }));
  return L;
}

const BURST_COUNT = 8; // 한 컷마다 움짤용으로 찍어두는 프레임 수
// 사진은 원본 비율 그대로 저장해두고, 프레임 칸 모양에 맞춰 가운데를 잘라 그림 (나중에 프레임을 바꿔도 되도록)
const STILL_MAX = 1440;
const BURST_MAX = 480;

// ---------------------------------------------------------
// 상태 관리
// step: 0 인트로, 1 팔찌, 2 퀴즈, 3 네컷, 4 소감·기도제목, 5 완료
// ---------------------------------------------------------
const state = {
  step: 0,
  name: "",
  // 팔찌
  beadPool: [],
  beadProgress: 0,
  beadMistakes: 0,
  // 퀴즈
  quizIndex: 0,
  quizTried: false,
  quizFirstTry: 0,
  // 네컷
  photo: {
    stills: [],
    bursts: [],
    frame: "strip-lovely",
    theme: "strawberry",
    caption: "우리 가족 인생네컷",
    source: "",
    skipped: false,
    pngUrl: "",
    pngBlob: null,
    gifBlob: null,
    gifUrl: "",
  },
  // 소감
  family: "",
  reflection: "",
  prayerRequest: "",
};

let camera = { stream: null, facing: "user", busy: false };

const screenEl = document.getElementById("screen");
const pathEl = document.getElementById("steppingPath");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function goTo(step) {
  if (state.step === 3 && step !== 3) stopCamera();
  state.step = step;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  renderStepTrack();
  screenEl.innerHTML = "";

  if (state.step === 0) return renderIntro();
  if (state.step === 1) return renderBracelet();
  if (state.step === 2) return renderQuiz();
  if (state.step === 3) return renderPhoto();
  if (state.step === 4) return renderReflection();
  if (state.step === 5) return renderDone();
}

function renderStepTrack() {
  if (!pathEl) return;
  if (state.step === 0 || state.step > STEP_LABELS.length) {
    pathEl.style.visibility = "hidden";
    pathEl.innerHTML = "";
    return;
  }
  pathEl.style.visibility = "visible";
  pathEl.innerHTML = `
    <div class="weekday-track">
      ${STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        let cls = "weekday-dot";
        if (stepNum < state.step) cls += " done";
        if (stepNum === state.step) cls += " current";
        return `<div class="${cls}">${label}</div>`;
      }).join("")}
    </div>
  `;
}

function beadDotHtml(bead, size = 30) {
  return `<span class="bead-dot bead-${bead.key}" style="width:${size}px;height:${size}px;background:${bead.color};"></span>`;
}

// ---------------------------------------------------------
// 화면: 인트로
// ---------------------------------------------------------
function renderIntro() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">전도 훈련 1주차</div>
    <h2>📿 복음팔찌 미션</h2>
    <div class="bead-row-mini">${BEADS.map((b) => beadDotHtml(b, 22)).join("")}</div>
    <div class="verse-box">
      학습지로 배운 복음팔찌, 기억나나요?<br /><br />
      <b>①</b> 구슬을 순서대로 꿰면서 4영리를 다시 점검하고<br />
      <b>②</b> 가족에게 복음을 전한 뒤 우리 가족 인생네컷을 찍고<br />
      <b>③</b> 소감과 기도제목을 남겨요.<br /><br />
      시작하는 말:<br />
      “제가 교회에서 복음을 팔찌로 배웠는데, 한번 들어봐 주실래요?”
    </div>
    <label class="field-label" for="nameInput">이름을 알려주세요</label>
    <input type="text" id="nameInput" placeholder="예: 김은혜" maxlength="20" />
    <div class="hint">선생님이 제출 결과를 확인할 때 사용돼요.</div>
    <div class="btn-row">
      <button class="btn-primary" id="startBtn">미션 시작하기</button>
    </div>
  `;
  screenEl.appendChild(wrap);

  const input = document.getElementById("nameInput");
  const startBtn = document.getElementById("startBtn");
  input.value = state.name;
  startBtn.disabled = !input.value.trim();
  input.addEventListener("input", () => {
    startBtn.disabled = !input.value.trim();
  });

  startBtn.addEventListener("click", () => {
    state.name = input.value.trim();
    if (!state.name) return;
    goTo(1);
  });
}

// ---------------------------------------------------------
// 화면: ① 팔찌 꿰기 — 구슬을 순서대로 눌러 팔찌를 완성하며 내용 점검
// ---------------------------------------------------------
function renderBracelet() {
  if (state.beadPool.length === 0) state.beadPool = shuffle(BEADS.map((b) => b.key));

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">점검 1 · 구슬 하나, 복음 한 마디</div>
    <h2>순서대로 구슬을 꿰어<br />팔찌를 완성해요!</h2>
    <div class="bracelet" id="bracelet"></div>
    <div id="beadPool" class="bead-pool"></div>
    <div id="beadMsg"></div>
    <div id="beadReview"></div>
    <div class="btn-row" id="beadNextRow" style="display:none;">
      <button class="btn-primary" id="beadNextBtn">퀴즈 풀러 가기</button>
    </div>
  `;
  screenEl.appendChild(wrap);
  document.getElementById("beadNextBtn").addEventListener("click", () => goTo(2));
  updateBracelet();
}

function updateBracelet(lastKey) {
  const bracelet = document.getElementById("bracelet");
  bracelet.innerHTML = `
    <div class="bracelet-string"></div>
    ${BEADS.map((b, i) => {
      const filled = i < state.beadProgress;
      const pop = filled && b.key === lastKey ? " pop" : "";
      return filled
        ? `<span class="bead-slot filled${pop} bead-${b.key}" style="background:${b.color};"></span>`
        : `<span class="bead-slot${i === state.beadProgress ? " next" : ""}">${i + 1}</span>`;
    }).join("")}
  `;

  const pool = document.getElementById("beadPool");
  const remaining = state.beadPool.filter((key) => BEADS.findIndex((b) => b.key === key) >= state.beadProgress);
  pool.innerHTML = remaining
    .map((key) => {
      const b = beadByKey(key);
      return `<button class="bead-btn" data-key="${b.key}">${beadDotHtml(b, 34)}<span>${b.name}</span></button>`;
    })
    .join("");

  pool.querySelectorAll(".bead-btn").forEach((btn) => {
    btn.addEventListener("click", () => pickBead(btn));
  });

  const review = document.getElementById("beadReview");
  if (state.beadProgress > 0) {
    const b = BEADS[state.beadProgress - 1];
    review.innerHTML = `
      <div class="feedback-box bead-review">
        <div class="feedback-action">${beadDotHtml(b, 18)} ${b.name} — 이렇게 말해요</div>
        <div class="feedback-dialogue">“${b.say}”</div>
        <div class="feedback-reflect">📖 ${b.verse} (${b.ref})</div>
      </div>
    `;
  }

  if (state.beadProgress >= BEADS.length) {
    document.getElementById("beadMsg").innerHTML = `<div class="mini-cheer">🎉 팔찌 완성! 노랑 → 검정 → 빨강 → 하양 → 초록</div>`;
    document.getElementById("beadNextRow").style.display = "flex";
  }
}

function pickBead(btn) {
  const key = btn.dataset.key;
  const expected = BEADS[state.beadProgress];
  const msg = document.getElementById("beadMsg");

  if (key === expected.key) {
    state.beadProgress += 1;
    msg.innerHTML = "";
    updateBracelet(key);
    return;
  }

  state.beadMistakes += 1;
  btn.classList.remove("shake");
  void btn.offsetWidth;
  btn.classList.add("shake");
  const hints = [
    "처음은 우리를 만드신 하나님 이야기부터!",
    "하나님을 떠난 우리의 모습은?",
    "그 죄를 대신 해결해 주신 분은?",
    "성령님이 주시는 회개와 믿음의 선물은?",
    "구원은 끝이 아니라 시작! 그다음은?",
  ];
  msg.innerHTML = `<div class="mini-hint">앗, ${state.beadProgress + 1}번째 구슬이 아니에요 🙈 힌트: ${hints[state.beadProgress]}</div>`;
}

// ---------------------------------------------------------
// 화면: ② 4영리 퀴즈
// ---------------------------------------------------------
function renderQuiz() {
  const item = QUIZ[state.quizIndex];
  state.quizTried = false;

  const wrap = document.createElement("div");
  const optionsHtml =
    item.type === "bead"
      ? `<div class="bead-pool">${BEADS.map(
          (b) => `<button class="bead-btn" data-answer="${b.key}">${beadDotHtml(b, 34)}<span>${b.name}</span></button>`
        ).join("")}</div>`
      : `<div class="choice-list">${item.options
          .map(
            (opt, i) =>
              `<button class="choice-btn" data-answer="${i}"><span class="choice-letter">${"ABC"[i]}</span><span>${opt}</span></button>`
          )
          .join("")}</div>`;

  wrap.innerHTML = `
    <div class="eyebrow">점검 2 · 퀴즈 ${state.quizIndex + 1} / ${QUIZ.length}</div>
    <div class="quiz-progress"><div class="quiz-progress-fill" style="width:${(state.quizIndex / QUIZ.length) * 100}%"></div></div>
    <div class="scene-text quiz-q">${item.q}</div>
    ${optionsHtml}
    <div id="quizFeedback"></div>
    <div class="btn-row" id="quizNextRow" style="display:none;">
      <button class="btn-primary" id="quizNextBtn">${state.quizIndex + 1 < QUIZ.length ? "다음 문제" : "인생네컷 찍으러 가기"}</button>
    </div>
  `;
  screenEl.appendChild(wrap);

  const buttons = wrap.querySelectorAll("[data-answer]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const raw = btn.dataset.answer;
      const correct = item.type === "bead" ? raw === item.answer : Number(raw) === item.answer;
      const fb = document.getElementById("quizFeedback");

      if (correct) {
        if (!state.quizTried) state.quizFirstTry += 1;
        buttons.forEach((b) => (b.disabled = true));
        btn.classList.add("selected");
        fb.innerHTML = `
          <div class="feedback-box">
            <div class="feedback-action">딩동댕! 🎉</div>
            <div class="feedback-reflect">${item.explain}</div>
          </div>
        `;
        document.getElementById("quizNextRow").style.display = "flex";
      } else {
        state.quizTried = true;
        btn.disabled = true;
        btn.classList.add("wrong", "shake");
        fb.innerHTML = `<div class="mini-hint">음… 다시 한 번 생각해 볼까요? 학습지를 떠올려 봐요 📖</div>`;
      }
    });
  });

  document.getElementById("quizNextBtn").addEventListener("click", () => {
    if (state.quizIndex + 1 < QUIZ.length) {
      state.quizIndex += 1;
      render();
    } else {
      goTo(3);
    }
  });
}

// ---------------------------------------------------------
// 화면: ③ 우리 가족 인생네컷
// ---------------------------------------------------------
function renderPhoto() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">미션 · 가족과 함께</div>
    <h2>우리 가족 인생네컷 📸</h2>
    <div class="hint photo-hint">
      가족에게 복음팔찌를 보여주며 4영리를 전했다면, 다 같이 네 컷을 찍어요!
      사진에 나와도 괜찮은지 먼저 물어봐요. 사진은 서버로 보내지지 않고 <b>내 폰에만</b> 저장돼요.
    </div>
    <div id="photoArea"></div>
  `;
  screenEl.appendChild(wrap);

  if (state.photo.stills.length === 4) renderPhotoResult();
  else renderCamera();
}

function currentFrame() {
  return FRAMES.find((f) => f.key === state.photo.frame) || FRAMES[0];
}

// 프레임 모양 고르기 버튼들 (작은 미리보기 아이콘 포함)
function framePickerHtml() {
  return `
    <label class="field-label">프레임 모양</label>
    <div class="frame-picker">
      ${FRAMES.map(
        (f) => `
        <button class="frame-opt${f.key === state.photo.frame ? " selected" : ""}" data-key="${f.key}">
          <span class="frame-icon cols-${f.cols} style-${f.style}">${"<i></i>".repeat(4)}</span>
          <span>${f.label}</span>
        </button>`
      ).join("")}
    </div>
  `;
}

function bindFramePicker(onChange) {
  document.querySelectorAll(".frame-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (camera.busy) return;
      state.photo.frame = btn.dataset.key;
      document.querySelectorAll(".frame-opt").forEach((b) => b.classList.toggle("selected", b === btn));
      onChange();
    });
  });
}

// 카메라 화면과 썸네일을 지금 고른 프레임의 칸 모양(가로형/세로형)에 맞춘다
function applyCellShape() {
  const portrait = currentFrame().cols === 2;
  const box = document.getElementById("camBox");
  const thumbs = document.getElementById("camThumbs");
  if (box) box.classList.toggle("portrait", portrait);
  if (thumbs) thumbs.classList.toggle("portrait", portrait);
}

function renderCamera() {
  const area = document.getElementById("photoArea");
  area.innerHTML = `
    ${framePickerHtml()}
    <div class="hint">찍은 뒤에도 프레임 모양과 색깔을 바꿀 수 있어요.</div>
    <div class="cam-box" id="camBox">
      <video id="camVideo" playsinline muted autoplay></video>
      <div class="cam-msg" id="camMsg">카메라를 켜는 중…</div>
      <div class="cam-count" id="camCount"></div>
      <div class="cam-flash" id="camFlash"></div>
      <div class="cam-badge" id="camBadge">${state.photo.stills.length} / 4</div>
    </div>
    <div class="cam-thumbs" id="camThumbs"></div>
    <div class="btn-row">
      <button class="btn-secondary" id="flipBtn" style="flex:0 0 auto;">🔄</button>
      <button class="btn-primary" id="shootBtn" disabled>📸 촬영 시작 (3초 타이머)</button>
    </div>
    <div class="cam-alt">
      카메라가 안 켜지거나 이미 찍은 사진이 있다면?<br />
      <label class="btn-secondary cam-upload">🖼️ 앨범에서 사진 고르기
        <input type="file" id="albumInput" accept="image/*" multiple hidden />
      </label>
      <div class="cam-alt-note">카카오톡에서 열었다면 오른쪽 위 ⋮ → <b>다른 브라우저로 열기</b>를 하면 카메라가 잘 켜져요.</div>
      <button class="link-btn" id="skipPhotoBtn">이번엔 사진 없이 넘어갈게요</button>
    </div>
  `;
  renderThumbs();
  applyCellShape();
  bindFramePicker(applyCellShape);

  document.getElementById("flipBtn").addEventListener("click", () => {
    if (camera.busy) return;
    camera.facing = camera.facing === "user" ? "environment" : "user";
    startCamera();
  });
  document.getElementById("shootBtn").addEventListener("click", shootSequence);
  document.getElementById("albumInput").addEventListener("change", (e) => addAlbumPhotos(e.target.files));
  document.getElementById("skipPhotoBtn").addEventListener("click", () => {
    state.photo.skipped = true;
    goTo(4);
  });

  startCamera();
}

function renderThumbs() {
  const thumbs = document.getElementById("camThumbs");
  if (!thumbs) return;
  thumbs.innerHTML = [0, 1, 2, 3]
    .map((i) => {
      const c = state.photo.stills[i];
      return c
        ? `<img class="cam-thumb" src="${c.toDataURL("image/jpeg", 0.6)}" alt="${i + 1}번째 컷" />`
        : `<div class="cam-thumb empty">${i + 1}</div>`;
    })
    .join("");
  const badge = document.getElementById("camBadge");
  if (badge) badge.textContent = `${state.photo.stills.length} / 4`;
}

async function startCamera() {
  stopCamera();
  const video = document.getElementById("camVideo");
  const msg = document.getElementById("camMsg");
  const shootBtn = document.getElementById("shootBtn");
  if (!video) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    msg.innerHTML = "<div>이 브라우저에서는 카메라를 쓸 수 없어요 😢<br />아래 <b>앨범에서 사진 고르기</b>를 이용해 주세요.</div>";
    return;
  }
  msg.style.display = "flex";
  msg.textContent = "카메라를 켜는 중…";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: camera.facing, width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false,
    });
    // 기다리는 사이 화면이 바뀌었으면 바로 끈다
    if (state.step !== 3 || !document.getElementById("camVideo")) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    camera.stream = stream;
    video.srcObject = stream;
    video.classList.toggle("mirror", camera.facing === "user");
    await video.play().catch(() => {});
    msg.style.display = "none";
    shootBtn.disabled = false;
  } catch (err) {
    msg.style.display = "flex";
    msg.innerHTML = "<div>카메라를 켤 수 없어요 😢<br />카메라 권한을 허용했는지 확인하거나,<br />아래 <b>앨범에서 사진 고르기</b>를 이용해 주세요.</div>";
  }
}

function stopCamera() {
  if (camera.stream) {
    camera.stream.getTracks().forEach((t) => t.stop());
    camera.stream = null;
  }
}

// source를 dw×dh 영역에 꽉 차게(cover) 그린다
function drawCover(ctx, source, sw, sh, dx, dy, dw, dh, mirror) {
  const scale = Math.max(dw / sw, dh / sh);
  const cw = dw / scale;
  const ch = dh / scale;
  const sx = (sw - cw) / 2;
  const sy = (sh - ch) / 2;
  ctx.save();
  if (mirror) {
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(source, sx, sy, cw, ch, 0, 0, dw, dh);
  } else {
    ctx.drawImage(source, sx, sy, cw, ch, dx, dy, dw, dh);
  }
  ctx.restore();
}

// 원본 비율 그대로, 긴 변이 maxSide가 되도록 줄여서 캔버스에 담는다
function grabFrame(source, sw, sh, maxSide, mirror) {
  const k = Math.min(1, maxSide / Math.max(sw, sh));
  const c = document.createElement("canvas");
  c.width = Math.round(sw * k);
  c.height = Math.round(sh * k);
  drawCover(c.getContext("2d"), source, sw, sh, 0, 0, c.width, c.height, mirror);
  return c;
}

async function shootSequence() {
  const video = document.getElementById("camVideo");
  if (!camera.stream || camera.busy) return;
  camera.busy = true;
  const shootBtn = document.getElementById("shootBtn");
  const flipBtn = document.getElementById("flipBtn");
  shootBtn.disabled = true;
  flipBtn.disabled = true;
  shootBtn.textContent = "찰칵찰칵 찍는 중…";

  const countEl = document.getElementById("camCount");
  const flashEl = document.getElementById("camFlash");
  const mirror = camera.facing === "user";
  state.photo.source = "camera";

  while (state.photo.stills.length < 4) {
    if (!document.getElementById("camVideo")) break;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    countEl.textContent = "3";
    countEl.classList.add("show");
    await sleep(1000);
    countEl.textContent = "2";
    await sleep(1000);
    countEl.textContent = "1";

    // 마지막 1초 동안 움짤용 프레임을 연속으로 찍어둔다
    const burst = [];
    for (let i = 0; i < BURST_COUNT; i++) {
      burst.push(grabFrame(video, vw, vh, BURST_MAX, mirror));
      await sleep(1000 / BURST_COUNT);
    }
    countEl.classList.remove("show");
    const still = grabFrame(video, vw, vh, STILL_MAX, mirror);
    burst.push(grabFrame(video, vw, vh, BURST_MAX, mirror));

    flashEl.classList.remove("go");
    void flashEl.offsetWidth;
    flashEl.classList.add("go");

    state.photo.stills.push(still);
    state.photo.bursts.push(burst);
    renderThumbs();
    await sleep(900);
  }

  camera.busy = false;
  if (state.photo.stills.length === 4 && state.step === 3) {
    stopCamera();
    renderPhotoResult();
  }
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 열 수 없어요"));
    };
    img.src = url;
  });
}

async function addAlbumPhotos(fileList) {
  const files = Array.from(fileList || []);
  const msg = document.getElementById("camMsg");
  for (const file of files) {
    if (state.photo.stills.length >= 4) break;
    try {
      const { img, url } = await loadImageFile(file);
      state.photo.stills.push(grabFrame(img, img.naturalWidth, img.naturalHeight, STILL_MAX, false));
      state.photo.bursts.push([grabFrame(img, img.naturalWidth, img.naturalHeight, BURST_MAX, false)]);
      URL.revokeObjectURL(url);
    } catch (e) {
      // 열 수 없는 파일은 건너뛴다
    }
  }
  state.photo.source = state.photo.source || "album";
  renderThumbs();

  if (state.photo.stills.length >= 4) {
    stopCamera();
    renderPhotoResult();
  } else if (msg) {
    msg.style.display = "flex";
    msg.innerHTML = `<div>${4 - state.photo.stills.length}장 더 골라주세요 (또는 카메라로 이어서 찍어도 돼요)</div>`;
    if (camera.stream) setTimeout(() => (msg.style.display = "none"), 2200);
  }
}

// ---------- 프레임 합성 ----------
function currentTheme() {
  return THEMES.find((t) => t.key === state.photo.theme) || THEMES[0];
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function formatToday() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

// scale: 저장 배율, frame: 움짤 프레임 번호(-1이면 정지 사진), phase: 반짝이 애니메이션 위상(0~1)
function drawStrip(ctx, scale, frame, phase) {
  const t = currentTheme();
  const f = currentFrame();
  const L = getLayout(f);
  const film = f.style === "film";
  ctx.save();
  ctx.scale(scale, scale);

  // 배경: 러블리는 물방울 무늬, 필름은 양옆에 필름 구멍
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, L.W, L.H);
  if (film) {
    ctx.fillStyle = t.key === "classic" ? "#f4f4f4" : "#ffffff";
    for (let y = 14; y < L.H - 14; y += 30) {
      roundRectPath(ctx, 8, y, 13, 17, 3);
      ctx.fill();
      roundRectPath(ctx, L.W - 21, y, 13, 17, 3);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = t.dot;
    for (let y = 18; y < L.H; y += 36) {
      for (let x = (y / 36) % 2 ? 18 : 36; x < L.W; x += 36) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 위쪽 작은 글씨 (필름은 깜빡이는 REC 표시)
  ctx.fillStyle = t.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${f.cols === 2 ? 20 : 16}px Galmuri11, 'Apple SD Gothic Neo', sans-serif`;
  if (film) {
    const filmTitle = "FAMILY FILM  ·  4 CUTS";
    ctx.fillText(filmTitle, L.W / 2, L.TOP / 2 + 2);
    if (frame < 0 || Math.sin(phase * Math.PI * 4) > -0.3) {
      ctx.fillStyle = "#ff4d4d";
      ctx.beginPath();
      ctx.arc(L.W / 2 - ctx.measureText(filmTitle).width / 2 - 14, L.TOP / 2 + 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillText("♡  4 CUTS  ♡", L.W / 2, L.TOP / 2 + 2);
  }

  // 네 컷
  L.cells.forEach((cell, i) => {
    const { x, y, w, h } = cell;
    if (!film) {
      ctx.fillStyle = t.cell;
      roundRectPath(ctx, x - 5, y - 5, w + 10, h + 10, 18);
      ctx.fill();
    }
    ctx.save();
    roundRectPath(ctx, x, y, w, h, film ? 4 : 14);
    ctx.clip();
    let src = state.photo.stills[i];
    if (frame >= 0) {
      const burst = state.photo.bursts[i] || [];
      if (burst.length) src = burst[Math.min(frame, burst.length - 1)];
    }
    if (src) drawCover(ctx, src, src.width, src.height, x, y, w, h, false);
    ctx.restore();
  });

  if (!film) {
    // 스티커 (움짤에서는 콩콩 뛰도록)
    const stickerSpots = [
      { cell: 0, x: 0.02, y: 0.04, r: -0.25 },
      { cell: 1, x: 0.98, y: 0.06, r: 0.2 },
      { cell: 2, x: 0.03, y: 0.96, r: 0.15 },
      { cell: 3, x: 0.97, y: 0.94, r: -0.2 },
    ];
    stickerSpots.forEach((sp, i) => {
      const cell = L.cells[sp.cell];
      const bob = Math.sin((phase + i * 0.25) * Math.PI * 2);
      ctx.save();
      ctx.translate(cell.x + sp.x * cell.w, cell.y + sp.y * cell.h - bob * 4);
      ctx.rotate(sp.r + bob * 0.08);
      ctx.font = `${f.cols === 2 ? 46 : 54}px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif`;
      ctx.fillText(t.stickers[i % t.stickers.length], 0, 0);
      ctx.restore();
    });

    // 반짝이 (양옆 여백을 따라)
    const count = f.cols === 2 ? 6 : 8;
    for (let i = 0; i < count; i++) {
      const x = i % 2 ? L.W - 14 : 14;
      const y = L.TOP + 40 + ((L.H - L.TOP - L.BOTTOM - 80) * i) / (count - 1);
      ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((phase + i / count) * Math.PI * 2));
      ctx.fillStyle = t.accent;
      ctx.font = "700 20px sans-serif";
      ctx.fillText("✦", x, y);
    }
    ctx.globalAlpha = 1;
  }

  // 아래쪽: 복음팔찌 구슬 + 문구 + 날짜
  const baseY = L.H - L.BOTTOM;
  const beadY = baseY + 40;
  const gap = 38;
  const startX = L.W / 2 - gap * 2;
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(startX - 34, beadY);
  ctx.quadraticCurveTo(L.W / 2, beadY + 14, startX + gap * 4 + 34, beadY);
  ctx.stroke();
  BEADS.forEach((b, i) => {
    const bob = frame >= 0 ? Math.sin((phase + i * 0.2) * Math.PI * 2) * 2 : 0;
    const bx = startX + i * gap;
    const by = beadY + Math.sin((i / 4) * Math.PI) * 6 - bob;
    ctx.beginPath();
    ctx.arc(bx, by, 13, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = t.key === "classic" ? "#ffffff" : "#33333366";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bx - 4, by - 4, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fill();
  });

  ctx.fillStyle = t.text;
  ctx.font = "700 32px Galmuri11, 'Apple SD Gothic Neo', sans-serif";
  ctx.fillText(state.photo.caption || "우리 가족 인생네컷", L.W / 2, baseY + 96);
  ctx.font = "700 17px Galmuri11, 'Apple SD Gothic Neo', sans-serif";
  ctx.globalAlpha = 0.8;
  ctx.fillText(`${formatToday()} · 경인 중고등부 복음팔찌 미션`, L.W / 2, baseY + 136);
  ctx.globalAlpha = 1;

  ctx.restore();
}

async function ensureFonts() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.race([document.fonts.load("700 32px Galmuri11"), sleep(1500)]);
  } catch (e) {
    // 폰트가 없어도 기본 글꼴로 그린다
  }
}

async function buildPng() {
  await ensureFonts();
  const L = getLayout(currentFrame());
  const scale = L.pngScale;
  const c = document.createElement("canvas");
  c.width = Math.round(L.W * scale);
  c.height = Math.round(L.H * scale);
  drawStrip(c.getContext("2d"), scale, -1, 0.15);
  const blob = await new Promise((r) => c.toBlob(r, "image/png"));
  if (state.photo.pngUrl) URL.revokeObjectURL(state.photo.pngUrl);
  state.photo.pngBlob = blob;
  state.photo.pngUrl = URL.createObjectURL(blob);
}

function resetGif() {
  if (state.photo.gifUrl) URL.revokeObjectURL(state.photo.gifUrl);
  state.photo.gifBlob = null;
  state.photo.gifUrl = "";
}

async function buildGif() {
  const { GIFEncoder, quantize, applyPalette } = await import(GIFENC_URL);
  await ensureFonts();

  const L = getLayout(currentFrame());
  const scale = L.gifScale;
  const w = Math.round(L.W * scale);
  const h = Math.round(L.H * scale);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });

  // 카메라로 찍었으면 연속 프레임을 앞뒤로 재생(핑퐁), 앨범 사진이면 스티커만 콩콩
  const maxBurst = Math.max(...state.photo.bursts.map((b) => b.length));
  let frames;
  let delay;
  if (maxBurst > 1) {
    const forward = Array.from({ length: maxBurst }, (_, i) => i);
    frames = forward.concat(forward.slice(1, -1).reverse());
    delay = 110;
  } else {
    frames = Array.from({ length: 8 }, () => 0);
    delay = 160;
  }

  const gif = GIFEncoder();
  for (let k = 0; k < frames.length; k++) {
    drawStrip(ctx, scale, frames[k], k / frames.length);
    const { data } = ctx.getImageData(0, 0, w, h);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, w, h, { palette, delay });
    await sleep(0); // 멘트 애니메이션이 멈추지 않도록 한 프레임마다 숨 고르기
  }
  gif.finish();
  return new Blob([gif.bytes()], { type: "image/gif" });
}

async function saveBlob(blob, filename) {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS && navigator.canShare) {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function fileBaseName() {
  return `우리가족_인생네컷_${(state.name || "").replace(/[\\/:*?"<>|\s]/g, "")}`;
}

async function renderPhotoResult() {
  const area = document.getElementById("photoArea");
  if (!area) return;
  area.innerHTML = `
    ${framePickerHtml()}
    <label class="field-label">프레임 색깔</label>
    <div class="theme-chips">
      ${THEMES.map(
        (t) => `<button class="theme-chip${t.key === state.photo.theme ? " selected" : ""}" data-key="${t.key}" style="--chip:${t.bg};">${t.label}</button>`
      ).join("")}
    </div>
    <label class="field-label" for="captionInput">프레임 아래 문구</label>
    <input type="text" id="captionInput" maxlength="14" value="${escapeHtml(state.photo.caption)}" />
    <div class="strip-wrap" id="stripWrap"><div class="strip-loading">프레임 꾸미는 중…</div></div>
    <div class="hint" style="text-align:center;">저장이 안 되면 사진을 꾹 눌러서 저장해도 돼요.</div>
    <div class="btn-row">
      <button class="btn-secondary" id="savePngBtn">💾 사진 저장</button>
      <button class="btn-secondary" id="makeGifBtn">🎞️ 움짤 만들기</button>
    </div>
    <div id="gifArea"></div>
    <div class="btn-row">
      <button class="btn-secondary" id="retakeBtn" style="flex:0 0 auto;">🔁 다시 찍기</button>
      <button class="btn-primary" id="photoNextBtn">다음</button>
    </div>
  `;

  const refreshPreview = async () => {
    resetGif();
    document.getElementById("gifArea").innerHTML = "";
    await buildPng();
    const wrap = document.getElementById("stripWrap");
    if (wrap) wrap.innerHTML = `<img class="strip-img cols-${currentFrame().cols}" src="${state.photo.pngUrl}" alt="우리 가족 인생네컷" />`;
  };

  bindFramePicker(refreshPreview);

  area.querySelectorAll(".theme-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.photo.theme = chip.dataset.key;
      area.querySelectorAll(".theme-chip").forEach((c) => c.classList.toggle("selected", c === chip));
      refreshPreview();
    });
  });

  let captionTimer;
  document.getElementById("captionInput").addEventListener("input", (e) => {
    state.photo.caption = e.target.value.trim() || "우리 가족 인생네컷";
    clearTimeout(captionTimer);
    captionTimer = setTimeout(refreshPreview, 400);
  });

  document.getElementById("savePngBtn").addEventListener("click", () => {
    if (state.photo.pngBlob) saveBlob(state.photo.pngBlob, `${fileBaseName()}.png`);
  });
  document.getElementById("makeGifBtn").addEventListener("click", makeGif);
  document.getElementById("retakeBtn").addEventListener("click", () => {
    state.photo.stills = [];
    state.photo.bursts = [];
    state.photo.source = "";
    resetGif();
    renderCamera();
  });
  document.getElementById("photoNextBtn").addEventListener("click", () => {
    state.photo.skipped = false;
    goTo(4);
  });

  await refreshPreview();
}

async function makeGif() {
  const btn = document.getElementById("makeGifBtn");
  const gifArea = document.getElementById("gifArea");

  if (state.photo.gifBlob) {
    showGifReady();
    return;
  }

  btn.disabled = true;
  const overlay = document.createElement("div");
  overlay.className = "gif-overlay";
  overlay.innerHTML = `
    <div class="gif-loader">
      <div class="gif-loader-emoji">📸</div>
      <div class="gif-loader-line" id="gifLine">${GIF_LOADING_LINES[0]}</div>
      <div class="gif-loader-dots"><span></span><span></span><span></span></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const lines = shuffle(GIF_LOADING_LINES);
  let li = 0;
  const lineEl = overlay.querySelector("#gifLine");
  lineEl.textContent = lines[0];
  const ticker = setInterval(() => {
    li = (li + 1) % lines.length;
    lineEl.classList.remove("swap");
    void lineEl.offsetWidth;
    lineEl.textContent = lines[li];
    lineEl.classList.add("swap");
  }, 1000);

  try {
    // 너무 순식간에 끝나도 멘트 두세 개는 볼 수 있게
    const [blob] = await Promise.all([buildGif(), sleep(2600)]);
    state.photo.gifBlob = blob;
    state.photo.gifUrl = URL.createObjectURL(blob);
    showGifReady();
  } catch (err) {
    console.error(err);
    if (gifArea) {
      gifArea.innerHTML = `<div class="error-msg">움짤을 만들지 못했어요 😢 인터넷 연결을 확인하고 다시 눌러 주세요.</div>`;
    }
  } finally {
    clearInterval(ticker);
    overlay.remove();
    if (btn) btn.disabled = false;
  }
}

function showGifReady() {
  const gifArea = document.getElementById("gifArea");
  if (!gifArea) return;
  gifArea.innerHTML = `
    <div class="gif-ready">
      <div class="gif-ready-title">🎞️ 움짤 완성!</div>
      <img class="strip-img gif-img cols-${currentFrame().cols}" src="${state.photo.gifUrl}" alt="우리 가족 인생네컷 움짤" />
      <div class="btn-row" style="margin-top:14px;">
        <button class="btn-primary" id="saveGifBtn">💾 움짤 저장하기</button>
      </div>
    </div>
  `;
  document.getElementById("saveGifBtn").addEventListener("click", () => {
    saveBlob(state.photo.gifBlob, `${fileBaseName()}.gif`);
  });
  gifArea.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ---------------------------------------------------------
// 화면: ④ 소감 · 기도제목 + 제출
// ---------------------------------------------------------
function renderReflection() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">마지막으로</div>
    <h2>복음을 전하고 난 소감을 남겨요 ✏️</h2>
    <label class="field-label" for="familyInput">누구에게 복음을 전했나요?</label>
    <input type="text" id="familyInput" maxlength="30" placeholder="예: 엄마, 동생" />
    <label class="field-label" for="reflectionInput">소감</label>
    <textarea id="reflectionInput" placeholder="예: 검정 구슬 설명할 때 떨렸는데, 엄마가 끝까지 들어주셔서 좋았어요"></textarea>
    <label class="field-label" for="prayerInput">기도제목 (선택)</label>
    <textarea id="prayerInput" placeholder="예: 아빠가 교회에 같이 가면 좋겠어요"></textarea>
    <div id="submitError"></div>
    <div class="btn-row">
      <button class="btn-primary" id="submitBtn">제출하기</button>
    </div>
  `;
  screenEl.appendChild(wrap);

  const familyInput = document.getElementById("familyInput");
  const reflectionInput = document.getElementById("reflectionInput");
  const prayerInput = document.getElementById("prayerInput");
  const submitBtn = document.getElementById("submitBtn");
  familyInput.value = state.family;
  reflectionInput.value = state.reflection;
  prayerInput.value = state.prayerRequest;

  const sync = () => {
    state.family = familyInput.value;
    state.reflection = reflectionInput.value;
    state.prayerRequest = prayerInput.value;
    submitBtn.disabled = !state.reflection.trim();
  };
  [familyInput, reflectionInput, prayerInput].forEach((el) => el.addEventListener("input", sync));
  sync();

  submitBtn.addEventListener("click", async () => {
    sync();
    if (!state.reflection.trim()) return;
    submitBtn.disabled = true;
    submitBtn.textContent = "제출 중...";

    const photoStatus = state.photo.skipped || state.photo.stills.length < 4
      ? "이번엔 건너뜀"
      : `찍었어요 (${currentFrame().label} · ${currentTheme().label.replace(/^\S+\s/, "")}${state.photo.gifBlob ? " · 움짤도 만듦" : ""})`;

    const answers = [
      { label: "팔찌 꿰기", value: state.beadMistakes === 0 ? "한 번에 완성!" : `완성 (틀린 횟수 ${state.beadMistakes}번)` },
      { label: "4영리 퀴즈", value: `${QUIZ.length}문제 중 ${state.quizFirstTry}문제 한 번에 정답` },
      { label: "복음을 전한 사람", value: state.family.trim() || "(적지 않음)" },
      { label: "가족 인생네컷", value: photoStatus },
      { label: "소감", value: state.reflection.trim() },
    ];
    if (state.prayerRequest.trim()) answers.push({ label: "기도제목", value: state.prayerRequest.trim() });

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: GAME_ID,
          gameTitle: GAME_TITLE,
          category: GAME_CATEGORY,
          name: state.name,
          summary: `퀴즈 ${state.quizFirstTry}/${QUIZ.length} · 인생네컷 ${photoStatus.startsWith("찍었어요") ? "완료" : "건너뜀"}`,
          answers,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "제출에 실패했어요.");
      goTo(5);
    } catch (err) {
      document.getElementById("submitError").innerHTML = `<div class="error-msg">${escapeHtml(err.message)}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = "제출하기";
    }
  });
}

// ---------------------------------------------------------
// 화면: 완료
// ---------------------------------------------------------
function renderDone() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="result-badge">
      <div class="result-icon">🕊️</div>
      <h2>제출이 완료됐어요</h2>
    </div>
    <div class="bead-row-mini">${BEADS.map((b) => beadDotHtml(b, 22)).join("")}</div>
    <div class="verse-box">
      ${escapeHtml(state.name)}님, 이번 주 가족에게 복음을 전한 그 시간이 바로 증인의 삶이었어요.<br /><br />
      떨렸어도, 서툴렀어도 괜찮아요. 복음을 전하게 하시는 분은 성령님이세요.
    </div>
    <div class="closing-verse">
      <div class="eyebrow">오늘의 말씀</div>
      <p>"오직 성령이 너희에게 임하시면 너희가 권능을 받고 예루살렘과 온 유대와 사마리아와 땅 끝까지 이르러 내 증인이 되리라 하시니라"</p>
      <div class="closing-sub">사도행전 1:8</div>
    </div>
  `;
  screenEl.appendChild(wrap);
}

render();
