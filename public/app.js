// app.js — 학생용 "마음을 드리는 자 · KINGDOM BANK" 시뮬레이션 로직
// 월~토 동안 시간과 마음을 어떻게 쓸지 선택하고, 일요일(주일)에 예수님을 만나는 구조입니다.
// 선택 → 정도(슬라이더) 선택 → 행동 서술 + 캐릭터 대사/독백 + 성찰 멘트 → 다음 날
// 예수님께 드린 뒤에는 얼마가 남았든 항상 100까지 채워주시는 연출이 들어갑니다.

const GAME_ID = "2026-w37-kingdom-bank";
const GAME_TITLE = "마음을 드리는 자 · KINGDOM BANK";
const GAME_CATEGORY = "미니게임";

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

// ---------------------------------------------------------
// 하루하루의 상황 데이터
// ---------------------------------------------------------
// type: "npc" (사람을 만남) | "freetime" (자유시간) | "jesus" (예수님)
// choices/activities 각 항목: { action, dialogue, kind: "speech"(대사) | "thought"(독백), reflect }
const DAYS = [
  {
    type: "npc",
    who: "친구",
    img: "images/day1-friend.png",
    desc: "쉬는 시간, 짝꿍이 힘없는 얼굴로 다가온다.",
    line: "나 오늘 너무 힘든 일이 있었어. 혹시 내 얘기 좀 들어줄 수 있어?",
    allow: ["time", "heart"],
    choices: {
      time: {
        action: "하던 일을 잠시 멈추고, 친구 옆에 앉아 이야기를 끝까지 들어주었다.",
        dialogue: "정말 고마워… 얘기하니까 마음이 한결 편해졌어.",
        kind: "speech",
        reflect: "그 시간 동안 나는 무엇을 느꼈나요?",
      },
      heart: {
        action: "말은 많이 못 했지만, 진심을 담아 위로의 말을 건넸다.",
        dialogue: "그 한마디가 오늘 하루 나한테 정말 큰 힘이 됐어.",
        kind: "speech",
        reflect: "마음을 나눠준다는 건 쉬운 일이 아니에요. 지금 이 마음, 어디서 나온 걸까요?",
      },
      decline: {
        action: "미안하다고 말하고, 다음에 얘기하자며 자리를 떠났다.",
        dialogue: "…어, 그래. 알겠어.",
        kind: "speech",
        reflect: "지금은 어렵다고 말한 것도 솔직한 선택이에요. 왜 그런 마음이 들었을까요?",
      },
    },
  },
  {
    type: "freetime",
    who: "나 자신",
    img: "images/day2-freetime.png",
    desc: "학교가 일찍 끝난 화요일 오후. 딱히 정해진 일이 없다.",
    line: "오늘 하루, 무엇에 시간을 써볼까?",
    activities: [
      {
        key: "study",
        label: "공부하기",
        emoji: "📚",
        action: "책상에 앉아 밀린 공부에 집중했다.",
        dialogue: "그래도 하나는 끝냈다는 게 다행이다.",
        kind: "thought",
        reflect: "공부에 쓴 이 시간, 무엇을 위한 시간이었나요?",
      },
      {
        key: "game",
        label: "게임하기",
        emoji: "🎮",
        action: "방에서 게임에 몰두하며 시간을 보냈다.",
        dialogue: "시간 가는 줄도 몰랐네.",
        kind: "thought",
        reflect: "게임을 하며 보낸 시간, 그 순간 나는 무엇으로부터 쉬고 싶었던 걸까요?",
      },
      {
        key: "rest",
        label: "쉬기",
        emoji: "😴",
        action: "아무것도 하지 않고 침대에 누워 푹 쉬었다.",
        dialogue: "오랜만에 몸이 좀 가벼워진 것 같다.",
        kind: "thought",
        reflect: "쉼도 우리에게 필요해요. 다만 이 쉼이 나를 어디로 데려가고 있나요?",
      },
      {
        key: "hangout",
        label: "친구랑 놀러가기",
        emoji: "🎡",
        action: "친구를 만나 함께 시간을 보내며 놀았다.",
        dialogue: "재미있었어! 다음에 또 놀자!",
        kind: "speech",
        reflect: "친구와 함께한 시간, 우리는 무엇을 나눴을까요?",
      },
    ],
  },
  {
    type: "npc",
    who: "가족",
    img: "images/day3-family.png",
    desc: "저녁, 설거지가 잔뜩 쌓인 부엌에서 엄마가 나를 부른다.",
    line: "얘, 같이 이것 좀 해줄래?",
    allow: ["time"],
    choices: {
      time: {
        action: "하던 일을 미뤄두고, 엄마 옆에서 함께 설거지를 도왔다.",
        dialogue: "고마워, 덕분에 금방 끝났네.",
        kind: "speech",
        reflect: "가족을 위해 내어준 시간, 당연한 걸까요 아니면 선택이었을까요?",
      },
      decline: {
        action: "숙제가 있다고 말씀드리고 방으로 들어갔다.",
        dialogue: "그래, 알겠어. 숙제 열심히 해.",
        kind: "speech",
        reflect: "가족의 부탁을 미룬 것도 하나의 선택이에요. 그 순간 나에게 더 급했던 건 무엇이었나요?",
      },
    },
  },
  {
    type: "npc",
    who: "교회 친구",
    img: "images/day4-churchfriend.png",
    desc: "학원 가는 길, 교회 친구를 우연히 마주쳤다.",
    line: "이번 주에 나를 위해 기도해줄 수 있어?",
    allow: ["heart"],
    choices: {
      heart: {
        action: "그 자리에서 마음을 다해 기도해주겠다고 약속했다.",
        dialogue: "정말 고마워! 이번 주 잘 이겨낼 수 있을 것 같아.",
        kind: "speech",
        reflect: "중보기도는 그 사람을 마음에 품는 일이에요.",
      },
      decline: {
        action: "바쁘다는 핑계로 대답을 얼버무리고 지나갔다.",
        dialogue: "어… 그래, 괜찮아.",
        kind: "speech",
        reflect: "기도해주겠다는 대답이 쉽게 나오지 않았을 수도 있어요. 왜 망설여졌을까요?",
      },
    },
  },
  {
    type: "npc",
    who: "낯선 할머니",
    img: "images/day5-stranger.png",
    desc: "사람 많은 버스 정류장 근처, 할머니가 두리번거리며 서 계신다.",
    line: "학생, 미안한데 이 주소로 가려면 어디로 가야 하는지 좀 알려줄 수 있어?",
    allow: ["time", "heart"],
    choices: {
      heart: {
        action: "핸드폰 지도로 길을 찾아서 자세히 알려드렸다.",
        dialogue: "고마워요 학생, 덕분에 잘 찾아갈 수 있겠어요.",
        kind: "speech",
        reflect: "직접 데려다주지 않아도, 시간 내어 찾아본 마음도 도움이 돼요. 그 마음은 어디서 왔을까요?",
      },
      time: {
        action: "길을 찾아드린 뒤, 내가 가려던 방향과 조금 다르지만 직접 모셔다드렸다.",
        dialogue: "정말 고마워요, 학생 덕분에 편하게 왔네요.",
        kind: "speech",
        reflect: "잠깐이었지만 내 걸음을 돌려서 내어준 시간이었어요. 그 순간 무엇이 나를 멈춰 세웠을까요?",
      },
      decline: {
        action: "죄송하다고 말씀드리고 갈 길을 갔다.",
        dialogue: "괜찮아요, 다른 분께 여쭤볼게요.",
        kind: "speech",
        reflect: "바쁜 순간엔 지나칠 수도 있어요. 그 순간 무엇이 가장 크게 느껴졌나요?",
      },
    },
  },
  {
    type: "freetime",
    who: "나 자신",
    img: "images/day6-freetime.png",
    desc: "주말 아침. 오늘 하루는 온전히 내 시간이다.",
    line: "무엇을 하며 보낼까?",
    activities: [
      {
        key: "study",
        label: "공부하기",
        emoji: "📚",
        action: "주말에도 책상에 앉아 공부를 이어갔다.",
        dialogue: "그래도 뭔가 해냈다는 뿌듯함이 든다.",
        kind: "thought",
        reflect: "주말에도 공부를 선택했네요. 그 이유는 무엇이었나요?",
      },
      {
        key: "game",
        label: "게임하기",
        emoji: "🎮",
        action: "하루 종일 게임을 하며 시간을 보냈다.",
        dialogue: "정말 신나게 놀았다.",
        kind: "thought",
        reflect: "이 시간은 온전히 나를 위한 시간이었어요. 어떤 기분이었나요?",
      },
      {
        key: "rest",
        label: "쉬기",
        emoji: "😴",
        action: "특별한 계획 없이 느긋하게 쉬며 하루를 보냈다.",
        dialogue: "이런 여유도 참 오랜만이다.",
        kind: "thought",
        reflect: "충분히 쉬는 것도 나를 돌보는 방법이에요.",
      },
      {
        key: "hangout",
        label: "친구랑 놀러가기",
        emoji: "🎡",
        action: "친구들과 밖으로 나가 신나게 놀았다.",
        dialogue: "재미있었어! 월요일에 보자!",
        kind: "speech",
        reflect: "함께 보낸 시간이 이번 주 나에게 어떤 의미였을까요?",
      },
    ],
  },
  {
    type: "jesus",
    img: "images/day7-jesus.png",
  },
];

// ---------------------------------------------------------
// 상태 관리
// step: 0 인트로, 1~7 요일별 화면, 8 명세서, 9 기도제목/제출, 10 완료
// ---------------------------------------------------------
const state = {
  step: 0,
  name: "",
  time: 100,
  heart: 100,
  log: [], // { name, type: 'time'|'heart'|'decline', amount }
  jesusTime: 0,
  jesusHeart: 0,
  preJesusTime: 0,
  preJesusHeart: 0,
  timeRefill: 0,
  heartRefill: 0,
  prayerRequest: "",
};

const screenEl = document.getElementById("screen");
const pathEl = document.getElementById("steppingPath");

function render() {
  renderWeekdayTrack();
  screenEl.innerHTML = "";

  if (state.step === 0) return renderIntro();
  if (state.step >= 1 && state.step <= DAYS.length) return renderDay(DAYS[state.step - 1]);
  if (state.step === DAYS.length + 1) return renderStatement();
  if (state.step === DAYS.length + 2) return renderPrayerRequest();
  if (state.step === DAYS.length + 3) return renderDone();
}

function renderWeekdayTrack() {
  if (!pathEl) return;
  if (state.step === 0 || state.step > DAYS.length) {
    pathEl.style.visibility = "hidden";
    pathEl.innerHTML = "";
    return;
  }
  pathEl.style.visibility = "visible";
  pathEl.innerHTML = `
    <div class="weekday-track">
      ${WEEKDAY_LABELS.map((label, i) => {
        const dayNum = i + 1;
        let cls = "weekday-dot";
        if (dayNum < state.step) cls += " done";
        if (dayNum === state.step) cls += " current";
        return `<div class="${cls}">${label}</div>`;
      }).join("")}
    </div>
  `;
}

function bankHeaderHtml() {
  const timePct = Math.max(0, Math.min(100, state.time));
  const heartPct = Math.max(0, Math.min(100, state.heart));
  return `
    <div class="bank-header">
      <div class="bank-title">🏦 KINGDOM BANK · 이번 주 ${state.name || "나"}님의 자원</div>
      <div class="meter-row">
        <span class="meter-label">⏰ TIME</span>
        <div class="meter-track"><div class="meter-fill time" id="meterFillTime" style="width:${timePct}%"></div></div>
        <span class="meter-value" id="meterValueTime">${state.time}분</span>
      </div>
      <div class="meter-row">
        <span class="meter-label">❤️ HEART</span>
        <div class="meter-track"><div class="meter-fill heart" id="meterFillHeart" style="width:${heartPct}%"></div></div>
        <span class="meter-value" id="meterValueHeart">${state.heart}%</span>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------
// 화면: 인트로
// ---------------------------------------------------------
function renderIntro() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">이번 주 셀프 스터디</div>
    <h2>🏦 KINGDOM BANK</h2>
    <div class="verse-box">
      “예수께서 눈을 들어 부자들이 연보궤에 헌금 넣는 것을 보시고 또 어떤 가난한 과부가
      두 렙돈 넣는 것을 보시고 이르시되 내가 참으로 너희에게 말하노니 이 가난한 과부가
      다른 모든 사람보다 많이 넣었도다 저들은 그 풍족한 중에서 헌금을 넣었거니와 이
      과부는 그 가난한 중에서 자기가 가진 생활비 전부를 넣었느니라 하시니라”<br />
      <span style="font-size:0.8em; opacity:0.7;">누가복음 21:1–4</span>
      <br /><br />
      월요일부터 일요일까지, 한 주 동안 만나는 사람들과 순간들에게<br />
      나의 시간과 마음을 어떻게 사용할지 선택해보세요.<br /><br />
      정답은 없습니다.<br />
      당신의 선택은 당신만의 기록으로 남습니다.
    </div>
    <label class="field-label" for="nameInput">이름을 알려주세요</label>
    <input type="text" id="nameInput" placeholder="예: 김은혜" maxlength="20" />
    <div class="hint">선생님이 제출 결과를 확인할 때 사용돼요.</div>
    <div class="btn-row">
      <button class="btn-primary" id="startBtn">이번 주 시작하기</button>
    </div>
  `;
  screenEl.appendChild(wrap);

  const input = document.getElementById("nameInput");
  const startBtn = document.getElementById("startBtn");
  input.addEventListener("input", () => {
    startBtn.disabled = !input.value.trim();
  });
  startBtn.disabled = true;

  startBtn.addEventListener("click", () => {
    state.name = input.value.trim();
    if (!state.name) return;
    state.step = 1;
    render();
  });
}

// ---------------------------------------------------------
// 화면: 요일별 상황 (분기)
// ---------------------------------------------------------
function renderDay(day) {
  if (day.type === "jesus") return renderJesus();
  if (day.type === "freetime") return renderFreetime(day);
  return renderNpcDay(day);
}

function sceneCardHtml(day) {
  return `
    <div class="scene-card">
      <img class="scene-image" src="${day.img}" alt="${day.who}" onerror="this.style.display='none'" />
      <div>
        <div class="scene-who">${day.who}</div>
        <div class="scene-desc">${day.desc}</div>
        <div class="scene-line">“${day.line}”</div>
      </div>
    </div>
  `;
}

// ---------- NPC가 있는 날 ----------
function renderNpcDay(day) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    ${bankHeaderHtml()}
    ${sceneCardHtml(day)}
    <div id="choiceArea"></div>
  `;
  screenEl.appendChild(wrap);
  renderNpcChoices(day);
}

function renderNpcChoices(day) {
  const area = document.getElementById("choiceArea");
  const timeBtn = day.allow.includes("time")
    ? `<button class="btn-secondary" id="giveTimeBtn" style="flex:1;">⏰ 시간을 드릴게요</button>`
    : "";
  const heartBtn = day.allow.includes("heart")
    ? `<button class="btn-secondary" id="giveHeartBtn" style="flex:1;">❤️ 마음을 드릴게요</button>`
    : "";

  area.innerHTML = `
    <div class="btn-row" style="flex-wrap:wrap;">
      ${timeBtn}
      ${heartBtn}
      <button class="btn-secondary" id="declineBtn" style="flex:1;">지금은 어렵다</button>
    </div>
  `;

  if (day.allow.includes("time")) {
    document.getElementById("giveTimeBtn").addEventListener("click", () => renderGivePanel(day, "time"));
  }
  if (day.allow.includes("heart")) {
    document.getElementById("giveHeartBtn").addEventListener("click", () => renderGivePanel(day, "heart"));
  }
  document.getElementById("declineBtn").addEventListener("click", () => {
    state.log.push({ name: day.who, type: "decline", amount: 0 });
    const c = day.choices.decline;
    showFeedbackThenNext(c.action, c.dialogue, c.kind, c.reflect);
  });
}

function renderGivePanel(day, type) {
  const area = document.getElementById("choiceArea");
  const max = type === "time" ? state.time : state.heart;
  const unit = type === "time" ? "분" : "%";
  const label = type === "time" ? "얼마나 시간을 줄까요?" : "얼마나 마음을 내어줄까요?";

  area.innerHTML = `
    <div class="give-panel">
      <label class="field-label">${label} (남은 ${type === "time" ? "시간" : "마음"}: ${max}${unit})</label>
      <input type="range" id="amountRange" min="0" max="${max}" value="0" />
      <div class="amount-value" id="amountValue">0${unit}</div>
      <div class="btn-row">
        <button class="btn-secondary" id="cancelGiveBtn">취소</button>
        <button class="btn-primary" id="confirmGiveBtn">드리기</button>
      </div>
    </div>
  `;

  const range = document.getElementById("amountRange");
  const valueEl = document.getElementById("amountValue");
  range.addEventListener("input", () => {
    valueEl.textContent = `${range.value}${unit}`;
  });

  document.getElementById("cancelGiveBtn").addEventListener("click", () => renderNpcChoices(day));
  document.getElementById("confirmGiveBtn").addEventListener("click", () => {
    const amount = Number(range.value);
    if (type === "time") state.time -= amount;
    else state.heart -= amount;
    state.log.push({ name: day.who, type, amount });
    const c = day.choices[type];
    showFeedbackThenNext(c.action, c.dialogue, c.kind, c.reflect);
  });
}

// ---------- 자유시간이 있는 날 ----------
function renderFreetime(day) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    ${bankHeaderHtml()}
    ${sceneCardHtml(day)}
    <div id="choiceArea"></div>
  `;
  screenEl.appendChild(wrap);
  renderActivityChoices(day);
}

function renderActivityChoices(day) {
  const area = document.getElementById("choiceArea");
  area.innerHTML = `
    <div class="activity-list">
      ${day.activities
        .map(
          (act) => `
        <button class="activity-btn" data-key="${act.key}">
          <span class="activity-emoji">${act.emoji}</span>
          <span>${act.label}</span>
        </button>`
        )
        .join("")}
    </div>
  `;

  day.activities.forEach((act) => {
    document.querySelector(`.activity-btn[data-key="${act.key}"]`).addEventListener("click", () => {
      renderActivityAmount(day, act);
    });
  });
}

function renderActivityAmount(day, act) {
  const area = document.getElementById("choiceArea");
  const max = state.time;

  area.innerHTML = `
    <div class="give-panel">
      <label class="field-label">${act.label}에 얼마나 시간을 쓸까요? (남은 시간: ${max}분)</label>
      <input type="range" id="amountRange" min="0" max="${max}" value="0" />
      <div class="amount-value" id="amountValue">0분</div>
      <div class="btn-row">
        <button class="btn-secondary" id="cancelActBtn">취소</button>
        <button class="btn-primary" id="confirmActBtn">결정하기</button>
      </div>
    </div>
  `;

  const range = document.getElementById("amountRange");
  const valueEl = document.getElementById("amountValue");
  range.addEventListener("input", () => {
    valueEl.textContent = `${range.value}분`;
  });

  document.getElementById("cancelActBtn").addEventListener("click", () => renderActivityChoices(day));
  document.getElementById("confirmActBtn").addEventListener("click", () => {
    const amount = Number(range.value);
    state.time -= amount;
    state.log.push({ name: act.label, type: "time", amount });
    showFeedbackThenNext(act.action, act.dialogue, act.kind, act.reflect);
  });
}

// ---------- 선택 후 "행동 서술 + 대사/독백 + 성찰 멘트" → 다음 날 ----------
function showFeedbackThenNext(actionText, dialogueText, dialogueKind, reflectText) {
  const area = document.getElementById("choiceArea");
  let dialogueHtml = "";
  if (dialogueText) {
    dialogueHtml =
      dialogueKind === "thought"
        ? `<div class="feedback-monologue">${dialogueText}</div>`
        : `<div class="feedback-dialogue">“${dialogueText}”</div>`;
  }
  area.innerHTML = `
    <div class="feedback-box">
      <div class="feedback-action">${actionText}</div>
      ${dialogueHtml}
      <div class="feedback-reflect">${reflectText}</div>
    </div>
    <div class="btn-row">
      <button class="btn-primary" id="nextDayBtn">다음 날로</button>
    </div>
  `;
  document.getElementById("nextDayBtn").addEventListener("click", () => {
    state.step += 1;
    render();
  });
}

// ---------------------------------------------------------
// 화면: 예수님 (일요일 · 주일)
// ---------------------------------------------------------
function renderJesus() {
  const jesusDay = DAYS[DAYS.length - 1];
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    ${bankHeaderHtml()}
    <div class="scene-card">
      <img class="scene-image" src="${jesusDay.img}" alt="예수님" onerror="this.style.display='none'" />
      <div>
        <div class="scene-who">예수님</div>
        <div class="scene-desc">
          한 주가 저물고, 주일 아침이 되었다. 예수님이 조용히 다가와 앉으신다.<br />
          “이번 주, 네가 친구와 가족과 낯선 이에게 나눈 시간과 마음, 그 모든 순간에도
          나는 너와 함께 있었단다. 네가 어떤 마음으로 시간과 마음을 나누어주었는지,
          무엇 때문에 바쁘고 망설였던 것인지, 주어진 상황 속에서 줄 수 있는 최선을
          준 것도 나는 다 알고 있단다.”
        </div>
        <div class="scene-line">“이제 나에게도 조금 나눠줄 수 있겠니?”</div>
      </div>
    </div>
    <div id="jesusGiveArea"></div>
  `;
  screenEl.appendChild(wrap);
  renderJesusGivePanel();
}

function renderJesusGivePanel() {
  const area = document.getElementById("jesusGiveArea");
  area.innerHTML = `
    <label class="field-label">⏰ 시간을 드릴까요? (남은 시간: ${state.time}분)</label>
    <input type="range" id="jesusTimeRange" min="0" max="${state.time}" value="0" />
    <div class="amount-value" id="jesusTimeValue">0분</div>
    <label class="field-label" style="margin-top:14px;">❤️ 마음을 드릴까요? (남은 마음: ${state.heart}%)</label>
    <input type="range" id="jesusHeartRange" min="0" max="${state.heart}" value="0" />
    <div class="amount-value" id="jesusHeartValue">0%</div>
    <div class="btn-row">
      <button class="btn-primary" id="jesusNextBtn">드리기</button>
    </div>
  `;

  const timeRange = document.getElementById("jesusTimeRange");
  const heartRange = document.getElementById("jesusHeartRange");
  timeRange.addEventListener("input", () => {
    document.getElementById("jesusTimeValue").textContent = `${timeRange.value}분`;
  });
  heartRange.addEventListener("input", () => {
    document.getElementById("jesusHeartValue").textContent = `${heartRange.value}%`;
  });

  document.getElementById("jesusNextBtn").addEventListener("click", () => {
    const givenTime = Number(timeRange.value);
    const givenHeart = Number(heartRange.value);

    state.preJesusTime = state.time;
    state.preJesusHeart = state.heart;
    state.jesusTime = givenTime;
    state.jesusHeart = givenHeart;

    const remainingTime = state.preJesusTime - givenTime;
    const remainingHeart = state.preJesusHeart - givenHeart;

    // 화면에는 우선 "드린 뒤 남은 만큼"을 즉시 반영한다 (아직 채워주시기 전)
    state.time = remainingTime;
    state.heart = remainingHeart;
    const fillTimeNow = document.getElementById("meterFillTime");
    const fillHeartNow = document.getElementById("meterFillHeart");
    const valueTimeNow = document.getElementById("meterValueTime");
    const valueHeartNow = document.getElementById("meterValueHeart");
    if (fillTimeNow) fillTimeNow.style.width = `${Math.max(0, Math.min(100, remainingTime))}%`;
    if (fillHeartNow) fillHeartNow.style.width = `${Math.max(0, Math.min(100, remainingHeart))}%`;
    if (valueTimeNow) valueTimeNow.textContent = `${remainingTime}분`;
    if (valueHeartNow) valueHeartNow.textContent = `${remainingHeart}%`;

    renderJesusRefill(remainingTime, remainingHeart);
  });
}

function renderJesusRefill(remainingTime, remainingHeart) {
  const area = document.getElementById("jesusGiveArea");
  const bothEmpty = remainingTime === 0 && remainingHeart === 0;
  const message = bothEmpty
    ? "아무것도 남지 않았어도 괜찮아. 오늘도 내가 너를 채워줄게."
    : "얼마가 남았든 상관없어. 오늘도 내가 너를 채워줄게.";

  area.innerHTML = `
    <div class="feedback-box">
      <div class="feedback-dialogue">“${message}”</div>
    </div>
    <div class="btn-row">
      <button class="btn-primary" id="jesusFillNextBtn" disabled>채워지는 중…</button>
    </div>
  `;

  // 잠깐 뒤 게이지가 100까지 차오르는 연출
  setTimeout(() => {
    state.timeRefill = 100 - remainingTime;
    state.heartRefill = 100 - remainingHeart;
    state.time = 100;
    state.heart = 100;

    const fillTime = document.getElementById("meterFillTime");
    const fillHeart = document.getElementById("meterFillHeart");
    const valueTime = document.getElementById("meterValueTime");
    const valueHeart = document.getElementById("meterValueHeart");

    // 클래스 추가와 너비 변경이 같은 프레임에 묶여 트랜지션이 씹히지 않도록
    // 두 번의 requestAnimationFrame으로 강제 분리한다.
    if (fillTime) fillTime.classList.add("refill");
    if (fillHeart) fillHeart.classList.add("refill");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (fillTime) fillTime.style.width = "100%";
        if (fillHeart) fillHeart.style.width = "100%";
        if (valueTime) valueTime.textContent = "100분";
        if (valueHeart) valueHeart.textContent = "100%";
      });
    });

    const nextBtn = document.getElementById("jesusFillNextBtn");
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = "다음";
      nextBtn.addEventListener("click", () => {
        state.step += 1;
        render();
      });
    }
  }, 700);
}

// ---------------------------------------------------------
// 화면: 은행 명세서 (+ 보너스 성찰 텍스트)
// 인쇄되듯 위에서 아래로, 줄마다 글자를 왼쪽부터 하나씩 채워 넣는 연출
// ---------------------------------------------------------
function buildBreakdown() {
  const map = {};
  state.log.forEach((entry) => {
    if (!map[entry.name]) map[entry.name] = { time: 0, heart: 0 };
    if (entry.type === "time") map[entry.name].time += entry.amount;
    if (entry.type === "heart") map[entry.name].heart += entry.amount;
  });
  return map;
}

function renderStatement() {
  const breakdown = buildBreakdown();
  const names = Object.keys(breakdown);

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">나의 은행 명세서</div>
    <h2>KINGDOM BANK · WEEKLY STATEMENT</h2>
    <div class="statement-box statement-typewriter" id="statementBox"></div>

    <div class="bonus-think" id="bonusThink" style="opacity:0;">
      <div class="bonus-think-label">BONUS: Just Think</div>
      <p>예수님께 드릴 시간과 마음, 나는 언제부터 생각하고 있었을까요? 처음부터였는지, 마지막 순간이었는지, 아니면 미처 생각하지 못했는지 — 잠깐 떠올려보세요.</p>
      <p>나는 누구에게 가장 많은 시간과 마음을 나눴을까요? 친구, 가족, 낯선 이, 혹은 나 자신 — 답은 없어요. 잠깐 떠올려보세요.</p>
      <p>나는 무엇을 가장 아끼고 싶었을까요? 시간, 마음, 아니면 에너지 — 그 이유도 함께 떠올려보세요.</p>
    </div>

    <div class="btn-row" id="statementNextRow" style="opacity:0;">
      <button class="btn-primary" id="nextBtn">다음</button>
    </div>
  `;
  screenEl.appendChild(wrap);

  document.getElementById("nextBtn").addEventListener("click", () => {
    state.step += 1;
    render();
  });

  runStatementAnimation(breakdown, names);
}

function runStatementAnimation(breakdown, names) {
  const box = document.getElementById("statementBox");

  const timeRowLines = names
    .filter((n) => breakdown[n].time > 0)
    .map((n) => ({ text: `${n} · ${breakdown[n].time}분` }));
  if (timeRowLines.length === 0) {
    timeRowLines.push({ text: "이번 주엔 아무에게도 시간을 쓰지 않았어요" });
  }
  const heartRowLines = names
    .filter((n) => breakdown[n].heart > 0)
    .map((n) => ({ text: `${n} · ${breakdown[n].heart}%` }));
  if (heartRowLines.length === 0) {
    heartRowLines.push({ text: "이번 주엔 아무에게도 마음을 쓰지 않았어요" });
  }

  // 최종 배치는 "시간 블록 전체 → 마음 블록 전체" 구조를 유지하되,
  // 타이핑 애니메이션은 시간/마음 두 블록에 동시에(같은 파도 단위로) 진행된다.
  const timeBlock = document.createElement("div");
  const heartBlock = document.createElement("div");
  box.appendChild(timeBlock);
  box.appendChild(heartBlock);

  // 1파도: 사용한 시간·남은 시간  ⇄  사용한 마음·남은 마음 (동시)
  const wave1Time = [
    { text: "⏰ 사용한 시간", cls: "line-header" },
    ...timeRowLines,
    { text: `남은 시간 (드리기 전 기준) · ${state.preJesusTime}분`, cls: "line-sub" },
  ];
  const wave1Heart = [
    { text: "❤️ 사용한 마음", cls: "line-header" },
    ...heartRowLines,
    { text: `남은 마음 (드리기 전 기준) · ${state.preJesusHeart}%`, cls: "line-sub" },
  ];

  // 2파도: 예수님께 드린 시간  ⇄  예수님께 드린 마음 (동시)
  const wave2Time = [{ text: `✝️ 예수님께 드린 시간 · ${state.jesusTime}분` }];
  const wave2Heart = [{ text: `✝️ 예수님께 드린 마음 · ${state.jesusHeart}%` }];

  // 3파도: 채워주신 시간+현재 시간  ⇄  채워주신 마음+현재 마음 (동시)
  const wave3Time = [
    { text: `✝️ 예수님이 채워주신 시간 · ${state.timeRefill}분` },
    { counter: true, label: "현재 시간", unit: "분", to: 100, cls: "line-total" },
  ];
  const wave3Heart = [
    { text: `✝️ 예수님이 채워주신 마음 · ${state.heartRefill}%` },
    { counter: true, label: "현재 마음", unit: "%", to: 100, cls: "line-total" },
  ];

  const waves = [
    [
      { container: timeBlock, lines: wave1Time },
      { container: heartBlock, lines: wave1Heart },
    ],
    [
      { container: timeBlock, lines: wave2Time },
      { container: heartBlock, lines: wave2Heart },
    ],
    [
      { container: timeBlock, lines: wave3Time },
      { container: heartBlock, lines: wave3Heart },
    ],
  ];

  function typeLine(container, line, onDone) {
    const div = document.createElement("div");
    div.className = `statement-line ${line.cls || ""}`;
    container.appendChild(div);

    if (line.counter) {
      // "현재 시간 · " 라벨은 즉시 표시하고, 숫자만 0→목표값으로 카운트업
      div.textContent = `${line.label} · `;
      const numSpan = document.createElement("span");
      numSpan.textContent = "0" + line.unit;
      div.appendChild(numSpan);

      const duration = 700;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(eased * line.to);
        numSpan.textContent = `${value}${line.unit}`;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          onDone();
        }
      }
      requestAnimationFrame(tick);
      return;
    }

    const text = line.text;
    let i = 0;
    const charDelay = 16;
    function typeChar() {
      if (i <= text.length) {
        div.textContent = text.slice(0, i);
        i += 1;
        setTimeout(typeChar, charDelay);
      } else {
        onDone();
      }
    }
    typeChar();
  }

  function typeLinesInSequence(container, lines, index, onDone) {
    if (index >= lines.length) return onDone();
    typeLine(container, lines[index], () => {
      setTimeout(() => typeLinesInSequence(container, lines, index + 1, onDone), 180);
    });
  }

  // 한 파도(wave) 안의 여러 트랙(시간/마음)을 동시에 진행하고, 전부 끝나면 다음 파도로
  function runWave(waveIndex) {
    if (waveIndex >= waves.length) {
      // 모든 파도 완료 → 보너스 성찰 문구 + 다음 버튼 페이드인
      const bonus = document.getElementById("bonusThink");
      const nextRow = document.getElementById("statementNextRow");
      if (bonus) bonus.style.transition = "opacity 0.6s ease";
      if (nextRow) nextRow.style.transition = "opacity 0.6s ease";
      requestAnimationFrame(() => {
        if (bonus) bonus.style.opacity = "1";
        if (nextRow) nextRow.style.opacity = "1";
      });
      return;
    }

    const tracks = waves[waveIndex];
    let remaining = tracks.length;
    tracks.forEach((track) => {
      typeLinesInSequence(track.container, track.lines, 0, () => {
        remaining -= 1;
        if (remaining === 0) {
          setTimeout(() => runWave(waveIndex + 1), 500);
        }
      });
    });
  }

  runWave(0);
}

// ---------------------------------------------------------
// 화면: 기도제목 / 전도사님께 하고 싶은 말 + 제출
// ---------------------------------------------------------
function renderPrayerRequest() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">마지막으로</div>
    <h2>기도제목이나 전도사님께 하고 싶은 말이 있나요?</h2>
    <label class="field-label" for="prayerInput">편하게 적어보세요 (선택사항)</label>
    <textarea id="prayerInput" placeholder="예: 이번 주 시험을 위해 기도해주세요 / 요즘 이런 게 고민이에요"></textarea>
    <div id="submitError"></div>
    <div class="btn-row">
      <button class="btn-primary" id="submitBtn">제출하기</button>
    </div>
  `;
  screenEl.appendChild(wrap);

  const input = document.getElementById("prayerInput");
  input.value = state.prayerRequest;
  input.addEventListener("input", () => {
    state.prayerRequest = input.value;
  });

  document.getElementById("submitBtn").addEventListener("click", async (e) => {
    state.prayerRequest = input.value.trim();
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = "제출 중...";
    try {
      const breakdown = buildBreakdown();
      const names = Object.keys(breakdown);
      const answers = [];
      names.forEach((n) => {
        if (breakdown[n].time > 0) answers.push({ label: `${n}에게 준 시간`, value: `${breakdown[n].time}분` });
        if (breakdown[n].heart > 0) answers.push({ label: `${n}에게 준 마음`, value: `${breakdown[n].heart}%` });
      });
      answers.push({ label: "남은 시간 (드리기 전 기준)", value: `${state.preJesusTime}분` });
      answers.push({ label: "예수님께 드린 시간", value: `${state.jesusTime}분` });
      answers.push({ label: "예수님이 채워주신 시간", value: `${state.timeRefill}분` });
      answers.push({ label: "남은 마음 (드리기 전 기준)", value: `${state.preJesusHeart}%` });
      answers.push({ label: "예수님께 드린 마음", value: `${state.jesusHeart}%` });
      answers.push({ label: "예수님이 채워주신 마음", value: `${state.heartRefill}%` });
      if (state.prayerRequest) {
        answers.push({ label: "기도제목 / 전도사님께 하고 싶은 말", value: state.prayerRequest });
      }

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: GAME_ID,
          gameTitle: GAME_TITLE,
          category: GAME_CATEGORY,
          name: state.name,
          summary: `예수님께 시간 ${state.jesusTime}분 · 마음 ${state.jesusHeart}% 드림`,
          answers,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "제출에 실패했어요.");
      state.step += 1;
      render();
    } catch (err) {
      document.getElementById("submitError").innerHTML = `<div class="error-msg">${err.message}</div>`;
      btn.disabled = false;
      btn.textContent = "제출하기";
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
    <div class="verse-box">
      친구에게, 가족에게, 낯선 이에게, 그리고 나 자신에게 쓴 시간과 마음도
      모두 이번 주 나의 삶이었어요.<br /><br />
      헌금함에 넣는 순간만이 드림이 아니라, 이 한 주를 어떻게 살아냈는지 —
      그 전부가 하나님 앞에 드려진 예배였습니다. 그리고 예수님은 우리의 모든 순간을 아십니다.
    </div>
    <div class="closing-verse">
      <div class="eyebrow">오늘의 말씀</div>
      <p>"사람은 외모를 보거니와 나 여호와는 중심을 보느니라."</p>
      <div class="closing-sub">사무엘상 16:7</div>
    </div>
  `;
  screenEl.appendChild(wrap);
}

render();
