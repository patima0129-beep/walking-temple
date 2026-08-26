// app.js — 학생용 "걸어 다니는 교회" 시뮬레이션 로직

const SCENES = [
  {
    id: "scene1",
    title: "피곤한 주일 아침",
    text:
      "알람이 울린다. 어제 늦게까지 놀았더니 몸이 천근만근... 살짝 눈을 뜨니 예배 시간이 얼마 남지 않았다.",
    choices: [
      {
        letter: "A",
        text: "“5분만 더... 조금 늦어도 괜찮겠지”",
        feedback: "늦잠은 달콤하지만, 그 5분 사이 예배를 향한 마음의 자리가 조금씩 뒤로 밀릴 때가 있어요.",
        tag: "growing",
      },
      {
        letter: "B",
        text: "“피곤하지만 일어나서 준비한다”",
        feedback: "피곤함보다 예배를 택한 마음, 그 결정 자체가 이미 예배의 시작이에요.",
        tag: "devoted",
      },
      {
        letter: "C",
        text: "“오늘은 그냥 쉬고 싶다”",
        feedback: "쉼도 우리에게 필요해요. 다만 오늘 하나님과의 만남을 미룬 진짜 이유는 무엇이었을까요?",
        tag: "growing",
      },
    ],
  },
  {
    id: "scene2",
    title: "예배 시간, 스마트폰의 유혹",
    text:
      "설교가 시작됐는데 주머니 속 스마트폰이 자꾸 진동한다. 친구들 단체 채팅방에 새 메시지가 쌓이는 게 느껴진다.",
    choices: [
      {
        letter: "A",
        text: "“잠깐만 몰래 확인해야지”",
        feedback: "잠깐의 확인이 마음을 예배 밖으로 슬쩍 데려갈 때가 있어요.",
        tag: "growing",
      },
      {
        letter: "B",
        text: "무음으로 바꾸고 말씀에 집중한다",
        feedback: "내 시간과 마음을 구별해 드리는 것, 그것도 분명한 예배예요.",
        tag: "devoted",
      },
      {
        letter: "C",
        text: "일단 답장부터 빠르게 보낸다",
        feedback: "손은 빨라졌지만, 그 순간 마음은 어디에 가 있었을까요?",
        tag: "growing",
      },
    ],
  },
  {
    id: "scene3",
    title: "쉬는 시간, 은근한 뒷담화",
    text:
      "쉬는 시간, 무리 친구들이 한 친구를 은근히 흉보고 깎아내리며 나에게도 “너도 그렇게 생각하지 않아?” 하고 동조를 구한다.",
    choices: [
      {
        letter: "A",
        text: "분위기가 어색해질까 봐 맞장구치거나 웃어넘긴다",
        feedback: "내 입술과 귀가 머무는 자리도 하나님의 성전이에요. 오늘 그 자리엔 어떤 말이 채워졌을까요?",
        tag: "growing",
      },
      {
        letter: "B",
        text: "화제를 돌리거나 “너무 심한 거 아니야?” 하고 부드럽게 분위기를 바꾼다",
        feedback: "불편한 순간에도 지켜낸 그 한마디가, 관계 안에서 성전을 짓는 작은 벽돌이 돼요.",
        tag: "devoted",
      },
    ],
  },
  {
    id: "scene4",
    title: "단톡방, 자극적인 가십과 밈",
    text:
      "단톡방에 한 친구를 놀리는 영상과 근거 없는 소문이 올라오고, 다들 재미있다며 리액션과 공유를 이어간다.",
    choices: [
      {
        letter: "A",
        text: "나도 재밌어 보여서 리액션하고 다른 곳에 공유한다",
        feedback: "스마트폰을 들고 있는 나 자신도 하나님이 거하시는 성전이에요. 지금 이 공간에서 나는 무엇을 흘려보내고 있을까요?",
        tag: "growing",
      },
      {
        letter: "B",
        text: "조회수나 재미를 위해 누군가를 이용하는 흐름에서 조용히 거리를 둔다",
        feedback: "많이 하지 않아도 괜찮아요. 그 흐름에 휩쓸리지 않은 것만으로도, 디지털 공간 속 작은 거룩함이에요.",
        tag: "devoted",
      },
    ],
  },
  {
    id: "scene5",
    title: "하루를 마무리하며",
    text:
      "집에 돌아와 침대에 눕는다. 오늘 하루, 나는 계속 걸어 다니는 성전이었을까? 예배당 안에서도 밖에서도, 지금 예수님이 내 마음의 성전에 들어오신다면 무엇을 보실까?",
    choices: null, // 서술형 마무리 씬 (선택지 없음)
  },
];

// 결과 유형: 잘함/못함이 아니라, 오늘 하루의 패턴을 비추는 거울입니다.
// devotedCount(3개 시나리오 중 "구별된 선택"의 개수)에 따라 톤을 다르게 보여줍니다.
const RESULT_TYPES = [
  {
    min: 4,
    label: "온전히 마음을 드린 하루",
    icon: "🕊️",
    desc:
      "오늘 하루, 예수님을 향해 마음을 지켜내려 애쓴 흔적이 곳곳에 보여요. 완벽해서가 아니라, 매 순간 '이쪽으로 갈래'라고 선택했다는 것 자체가 예배예요.",
  },
  {
    min: 3,
    label: "많이 걷고, 잠깐 머뭇거린 하루",
    icon: "🌤️",
    desc:
      "오늘 대부분의 순간, 마음을 성전답게 지키려 했어요. 흔들린 순간도 있었지만 그것도 자연스러운 일이에요. 예수님은 완벽한 성전이 아니라, 자신을 향해 돌아오는 마음을 기뻐하세요.",
  },
  {
    min: 1,
    label: "많이 흔들렸지만, 다시 돌아보는 하루",
    icon: "🌱",
    desc:
      "오늘은 피곤함과 유혹 앞에서 자주 흔들렸을 수도 있어요. 괜찮아요. 예수님이 성전에서 상을 둘러 엎으신 건 정죄하기 위해서가 아니라, 다시 거룩한 자리로 회복시키기 위해서였어요.",
  },
  {
    min: 0,
    label: "정직하게 나를 마주한 하루",
    icon: "🌱",
    desc:
      "오늘 나의 연약한 모습을 있는 그대로 마주했어요. 그 정직함이 이미 회복의 시작이에요. 예수님은 완벽한 사람이 아니라, 솔직하게 돌아보는 마음을 찾고 계세요.",
  },
];

function getResultType(devotedCount) {
  return RESULT_TYPES.find((t) => devotedCount >= t.min);
}

const CLEAN_UP_OPTIONS = [
  "게으름",
  "스마트폰 · 미디어 중독",
  "거짓말 · 핑계",
  "미움 · 시기",
  "정욕적인 생각",
  "이기심",
  "불평 · 원망",
  "욕설 · 거친 말",
];

// ---------------------------------------------------------
// 상태 관리
// ---------------------------------------------------------
const state = {
  step: 0, // 0: 인트로, 1~4: 시나리오, 5: 셀프스터디1, 6: 셀프스터디2, 7: 확인, 8: 완료
  name: "",
  scenarioAnswers: [], // [{ id, title, choiceLetter, choiceText }]
  selfStudy1: { checked: [], other: "" },
  selfStudy2: "",
};

const TOTAL_STONES = SCENES.length + 2; // 시나리오 4개 + 셀프스터디 2개

const screenEl = document.getElementById("screen");
const pathEl = document.getElementById("steppingPath");

function renderSteppingPath() {
  pathEl.innerHTML = "";
  if (state.step === 0 || state.step >= 7) {
    pathEl.style.visibility = "hidden";
    return;
  }
  pathEl.style.visibility = "visible";
  for (let i = 1; i <= TOTAL_STONES; i++) {
    if (i > 1) {
      const line = document.createElement("div");
      line.className = "stone-line";
      pathEl.appendChild(line);
    }
    const stone = document.createElement("div");
    stone.className = "stone";
    if (i < state.step) stone.classList.add("done");
    if (i === state.step) stone.classList.add("current");
    pathEl.appendChild(stone);
  }
}

function render() {
  renderSteppingPath();
  screenEl.innerHTML = "";

  if (state.step === 0) return renderIntro();
  if (state.step >= 1 && state.step <= SCENES.length) {
    return renderScene(SCENES[state.step - 1], state.step);
  }
  if (state.step === SCENES.length + 1) return renderSelfStudy1();
  if (state.step === SCENES.length + 2) return renderSelfStudy2();
  if (state.step === SCENES.length + 3) return renderReview();
  if (state.step === SCENES.length + 4) return renderDone();
}

// ---------------------------------------------------------
// 화면: 인트로
// ---------------------------------------------------------
function renderIntro() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">오늘의 말씀</div>
    <h2>걸어 다니는 교회</h2>
    <div class="verse-box">
      예수님은 성전에서 장사하는 사람들을 보시고 상을 둘러 엎으셨어요.
      "내 집은 만민이 기도하는 집이라 부름을 받으리라" 하시며
      성전을 향한 마음을 보이셨죠. (마가복음 11:15–19)<br /><br />
      바울은 고린도전서 3:16에서 <b>"너희는 하나님의 성전인 것과
      하나님의 성령이 너희 안에 거하시는 것을 알지 못하느냐"</b>라고 말합니다.
      <br /><br />
      우리 몸과 마음이 곧 하나님이 거하시는 성전이에요.
      오늘 하루, 나는 그 성전을 어떻게 대하고 있을까요?
      함께 하루를 걸어가 보아요.
    </div>
    <label class="field-label" for="nameInput">이름을 알려주세요</label>
    <input type="text" id="nameInput" placeholder="예: 김은혜" maxlength="20" />
    <div class="hint">선생님이 제출 결과를 확인할 때 사용돼요.</div>
    <div class="btn-row">
      <button class="btn-primary" id="startBtn">여정 시작하기</button>
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
// 화면: 시나리오 씬
// ---------------------------------------------------------
function renderScene(scene, stepNum) {
  const existing = state.scenarioAnswers.find((a) => a.id === scene.id);

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">SCENE ${stepNum} / ${SCENES.length}</div>
    <h2>${scene.title}</h2>
    <p class="scene-text">${scene.text}</p>
    <div class="choice-list" id="choiceList"></div>
    <div id="feedbackHolder"></div>
    <div class="btn-row" id="btnRow" style="display:none;">
      <button class="btn-secondary" id="backBtn">이전</button>
      <button class="btn-primary" id="nextBtn">다음</button>
    </div>
  `;
  screenEl.appendChild(wrap);

  const choiceListEl = document.getElementById("choiceList");
  const feedbackHolder = document.getElementById("feedbackHolder");
  const btnRow = document.getElementById("btnRow");

  function selectChoice(choice) {
    const filtered = state.scenarioAnswers.filter((a) => a.id !== scene.id);
    filtered.push({
      id: scene.id,
      title: scene.title,
      choiceLetter: choice.letter,
      choiceText: choice.text,
      feedback: choice.feedback || "",
      tag: choice.tag || null,
    });
    state.scenarioAnswers = filtered;
    renderChoices(choice.letter);
    feedbackHolder.innerHTML = `<div class="feedback-box">${choice.feedback}</div>`;
    btnRow.style.display = "flex";
  }

  function renderChoices(selectedLetter) {
    choiceListEl.innerHTML = "";
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn" + (choice.letter === selectedLetter ? " selected" : "");
      btn.innerHTML = `<span class="choice-letter">${choice.letter}</span>${choice.text}`;
      btn.addEventListener("click", () => selectChoice(choice));
      choiceListEl.appendChild(btn);
    });
  }

  if (scene.choices) {
    renderChoices(existing ? existing.choiceLetter : null);
    if (existing) {
      const choiceObj = scene.choices.find((c) => c.letter === existing.choiceLetter);
      feedbackHolder.innerHTML = `<div class="feedback-box">${choiceObj.feedback}</div>`;
      btnRow.style.display = "flex";
    }
  } else {
    // 선택지 없는 서술형 마무리 씬
    btnRow.style.display = "flex";
  }

  document.getElementById("backBtn").addEventListener("click", () => {
    state.step = Math.max(0, state.step - 1);
    render();
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    state.step += 1;
    render();
  });
}

// ---------------------------------------------------------
// 화면: 셀프 스터디 ①
// ---------------------------------------------------------
function renderSelfStudy1() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">셀프 스터디 ①</div>
    <h2>정리가 필요한 성전</h2>
    <p class="scene-text">
      예수님께서 성전에서 장사치들의 상을 둘러 엎으신 것처럼,
      내 마음의 성전에도 정리하고 청소해야 할 모습이 있을 거예요.
      해당하는 것을 골라보세요. (중복 선택 가능)
    </p>
    <div class="check-list" id="checkList"></div>
    <label class="field-label" for="otherInput">조금 더 구체적으로 적어볼까요?</label>
    <textarea id="otherInput" placeholder="예: 예배 시간에도 게임 생각이 자꾸 떠나지 않아요"></textarea>
    <div class="hint">선택하지 않아도, 이 칸에만 적어도 괜찮아요.</div>
    <div class="btn-row">
      <button class="btn-secondary" id="backBtn">이전</button>
      <button class="btn-primary" id="nextBtn">다음</button>
    </div>
  `;
  screenEl.appendChild(wrap);

  const checkListEl = document.getElementById("checkList");
  CLEAN_UP_OPTIONS.forEach((option) => {
    const item = document.createElement("label");
    item.className = "check-item" + (state.selfStudy1.checked.includes(option) ? " checked" : "");
    item.innerHTML = `<input type="checkbox" ${
      state.selfStudy1.checked.includes(option) ? "checked" : ""
    } /><span>${option}</span>`;
    const input = item.querySelector("input");
    input.addEventListener("change", () => {
      if (input.checked) {
        if (!state.selfStudy1.checked.includes(option)) state.selfStudy1.checked.push(option);
        item.classList.add("checked");
      } else {
        state.selfStudy1.checked = state.selfStudy1.checked.filter((v) => v !== option);
        item.classList.remove("checked");
      }
    });
    checkListEl.appendChild(item);
  });

  const otherInput = document.getElementById("otherInput");
  otherInput.value = state.selfStudy1.other;
  otherInput.addEventListener("input", () => {
    state.selfStudy1.other = otherInput.value;
  });

  document.getElementById("backBtn").addEventListener("click", () => {
    state.step -= 1;
    render();
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    state.step += 1;
    render();
  });
}

// ---------------------------------------------------------
// 화면: 셀프 스터디 ②
// ---------------------------------------------------------
function renderSelfStudy2() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">셀프 스터디 ②</div>
    <h2>예수님의 도우심이 필요한 연약함</h2>
    <p class="scene-text">
      고린도전서 3:16처럼 내 안에 성령님이 계시지만,
      나는 여전히 자꾸 넘어지는 부분이 있어요.
      예수님의 도우심이 꼭 필요한 나의 연약함은 무엇인가요?
    </p>
    <label class="field-label" for="ss2Input">솔직하게 적어보세요</label>
    <textarea id="ss2Input" placeholder="예: 화가 나면 감정을 조절하기 어려워요"></textarea>
    <div id="errorMsg"></div>
    <div class="btn-row">
      <button class="btn-secondary" id="backBtn">이전</button>
      <button class="btn-primary" id="nextBtn">다음</button>
    </div>
  `;
  screenEl.appendChild(wrap);

  const input = document.getElementById("ss2Input");
  input.value = state.selfStudy2;
  input.addEventListener("input", () => {
    state.selfStudy2 = input.value;
  });

  document.getElementById("backBtn").addEventListener("click", () => {
    state.step -= 1;
    render();
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (!state.selfStudy2.trim()) {
      document.getElementById("errorMsg").innerHTML =
        '<div class="error-msg">한 문장이라도 좋아요. 적어야 다음으로 넘어갈 수 있어요.</div>';
      return;
    }
    state.step += 1;
    render();
  });
}

// ---------------------------------------------------------
// 화면: 최종 확인
// ---------------------------------------------------------
function renderReview() {
  const wrap = document.createElement("div");

  const scenarioHtml = state.scenarioAnswers
    .map(
      (a) =>
        `<div class="detail-block"><div class="q">${a.title}</div><div class="a">${a.choiceText}</div></div>`
    )
    .join("");

  const ss1Text =
    [...state.selfStudy1.checked, state.selfStudy1.other].filter(Boolean).join(", ") || "(작성 없음)";

  wrap.innerHTML = `
    <div class="eyebrow">마지막으로</div>
    <h2>${state.name} 님의 여정 요약</h2>
    <div class="detail-block">
      <div class="q">셀프 스터디 ① 정리가 필요한 성전</div>
      <div class="a">${ss1Text}</div>
    </div>
    <div class="detail-block">
      <div class="q">셀프 스터디 ② 예수님의 도우심이 필요한 연약함</div>
      <div class="a">${state.selfStudy2}</div>
    </div>
    ${scenarioHtml}
    <div id="submitError"></div>
    <div class="btn-row">
      <button class="btn-secondary" id="backBtn">이전</button>
      <button class="btn-primary" id="submitBtn">제출하기</button>
    </div>
  `;
  screenEl.appendChild(wrap);

  document.getElementById("backBtn").addEventListener("click", () => {
    state.step -= 1;
    render();
  });

  document.getElementById("submitBtn").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = "제출 중...";
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          scenarioAnswers: state.scenarioAnswers,
          selfStudy1: state.selfStudy1,
          selfStudy2: state.selfStudy2,
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
// 화면: 완료 (결과 페이지)
// ---------------------------------------------------------
function renderDone() {
  const devotedCount = state.scenarioAnswers.filter((a) => a.tag === "devoted").length;
  const result = getResultType(devotedCount);
  const growingAnswers = state.scenarioAnswers.filter((a) => a.tag === "growing");

  const careHtml =
    growingAnswers.length > 0
      ? growingAnswers
          .map(
            (a) => `
        <div class="detail-block">
          <div class="q">${a.title}</div>
          <div class="a">${a.feedback}</div>
        </div>`
          )
          .join("")
      : `<div class="detail-block">
          <div class="a">오늘은 특별히 흔들린 순간이 보이지 않았어요. 그래도 우리는 매일 예수님의 도우심이 필요한 존재예요. 계속 이 마음을 지켜달라고 기도해봐요.</div>
        </div>`;

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="eyebrow">${state.name} 님의 오늘의 결과</div>
    <div class="result-badge">
      <span class="result-icon">${result.icon}</span>
      <h2 style="margin:0;">${result.label}</h2>
    </div>
    <p class="scene-text">${result.desc}</p>

    <div class="detail-block">
      <div class="q">예수님이 돌봐주셔야 할 나의 모습</div>
      <div class="a" style="font-size:0.85rem; color:var(--ink-soft);">오늘의 선택 중, 조금 더 기도가 필요한 순간들이에요.</div>
    </div>
    ${careHtml}

    <div class="closing-verse">
      <div class="eyebrow" style="color:#e4c766;">한 번 더 마음에 담아볼 말씀</div>
      <p>
        "너희는 하나님의 성전인 것과 하나님의 성령이 너희 안에 거하시는 것을
        알지 못하느냐" — 고린도전서 3:16
      </p>
      <p class="closing-sub">
        오늘 하루, 나는 예수님이 계신 성전이었어요.<br />
        완벽하지 않아도 괜찮아요. 예수님은 지금 이 마음을 다시 정리하며
        나아오는 걸음을 가장 기뻐하세요.<br /><br />
        이 문장을 한 번 소리 내어 읽고, 오늘 하루를 마무리해봐요.
      </p>
    </div>

    <p class="footer-note" style="margin-top:22px; color:rgba(35,37,58,0.4);">
      선생님께도 잘 전달되었어요 · 한 주간, 걸어 다니는 성전으로 살아봐요
    </p>
  `;
  screenEl.appendChild(wrap);
}

render();
