const STORAGE_KEY = "qwerty-personal-state-v2";
const OLD_STORAGE_KEY = "qwerty-personal-state-v1";
const TODAY = new Date().toISOString().slice(0, 10);
const CHAPTER_SIZE = 20;
const OFFICIAL_DICTIONARIES = Array.isArray(window.OFFICIAL_DICTIONARIES) ? window.OFFICIAL_DICTIONARIES : [];
const dictionaryCache = new Map();

const fallbackWords = [
  ["practice", "练习，实践", "ˈpræktɪs"],
  ["memory", "记忆", "ˈmeməri"],
  ["keyboard", "键盘", "ˈkiːbɔːrd"],
  ["personal", "个人的", "ˈpɜːrsənl"]
];

const keySoundResources = [
  "Default.wav",
  "Alpacas.mp3",
  "Buckling Spring.mp3",
  "Cherry MX Blues.mp3",
  "Cherry MX Browns.mp3",
  "Gateron Red Inks.mp3",
  "Holy Pandas.mp3",
  "Topre.mp3"
];

const aiModelPresets = {
  openai: [
    { value: "gpt-4.1-mini", label: "OpenAI gpt-4.1-mini" },
    { value: "gpt-4o-mini", label: "OpenAI gpt-4o-mini" },
    { value: "gpt-4.1", label: "OpenAI gpt-4.1" }
  ],
  deepseek: [
    { value: "deepseek-v4-flash", label: "DeepSeek V4 Flash" },
    { value: "deepseek-v4-pro", label: "DeepSeek V4 Pro" }
  ],
  gemini: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" }
  ],
  custom: [
    { value: "custom-model", label: "自定义模型" }
  ]
};

const ttsVoices = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar"
];

const defaultProfile = (name = "我的账号") => ({
  id: crypto.randomUUID(),
  name,
  createdAt: Date.now(),
  goal: 30,
  targetWpm: 45,
  theme: "light",
  preferredDict: "cet4",
  note: "每天一组，保持手感。",
  customWords: [],
  favorites: [],
  mistakes: {},
  sessions: [],
  days: {},
  keyErrors: {},
  ngramErrors: {},
  settings: {
    sound: true,
    translation: true,
    dictation: false,
    strict: true,
    keySound: true,
    pron: "us",
    keySoundName: "Default.wav",
    aiProvider: "openai",
    aiApiKey: "",
    aiBaseUrl: "",
    aiModel: "gpt-4.1-mini",
    ttsProvider: "browser",
    ttsApiKey: "",
    ttsBaseUrl: "",
    ttsModel: "gpt-4o-mini-tts",
    ttsVoice: "marin",
    ttsSpeed: 0.9,
    ttsInstructions: "Speak like a patient English teacher. Clear, natural, slightly slow, and human-like."
  }
});

let state = loadState();
let profile = migrateProfile(getActiveProfile());
let queue = [];
let currentIndex = 0;
let session = null;
let timerId = null;
let typedValue = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  profileName: $("#profileName"),
  profileMeta: $("#profileMeta"),
  avatarButton: $("#avatarButton"),
  todayDone: $("#todayDone"),
  dailyGoal: $("#dailyGoal"),
  goalRing: $("#goalRing"),
  viewTitle: $("#viewTitle"),
  startButton: $("#startButton"),
  dictSelect: $("#dictSelect"),
  chapterSelect: $("#chapterSelect"),
  modeSelect: $("#modeSelect"),
  loopInput: $("#loopInput"),
  wordStage: $("#wordStage"),
  phoneticText: $("#phoneticText"),
  targetWord: $("#targetWord"),
  translationText: $("#translationText"),
  typedWord: $("#typedWord"),
  typingInput: $("#typingInput"),
  timeMetric: $("#timeMetric"),
  wpmMetric: $("#wpmMetric"),
  accuracyMetric: $("#accuracyMetric"),
  completeMetric: $("#completeMetric"),
  focusAdvice: $("#focusAdvice"),
  ngramAdvice: $("#ngramAdvice"),
  weakKeyLabel: $("#weakKeyLabel"),
  keyboard: $("#keyboard"),
  translationToggle: $("#translationToggle"),
  soundToggle: $("#soundToggle"),
  dictationToggle: $("#dictationToggle"),
  strictToggle: $("#strictToggle"),
  keySoundToggle: $("#keySoundToggle"),
  speakButton: $("#speakButton"),
  favoriteButton: $("#favoriteButton"),
  skipButton: $("#skipButton"),
  totalWords: $("#totalWords"),
  avgWpm: $("#avgWpm"),
  streakDays: $("#streakDays"),
  favCount: $("#favCount"),
  historyChart: $("#historyChart"),
  ngramList: $("#ngramList"),
  sessionList: $("#sessionList"),
  aiAnalyzeButton: $("#aiAnalyzeButton"),
  aiAskButton: $("#aiAskButton"),
  aiQuestion: $("#aiQuestion"),
  aiStatus: $("#aiStatus"),
  aiOutput: $("#aiOutput"),
  aiContextPreview: $("#aiContextPreview"),
  mistakeList: $("#mistakeList"),
  favoriteList: $("#favoriteList"),
  practiceMistakesButton: $("#practiceMistakesButton"),
  practiceFavsButton: $("#practiceFavsButton"),
  customWords: $("#customWords"),
  saveCustomButton: $("#saveCustomButton"),
  loadSampleButton: $("#loadSampleButton"),
  exportButton: $("#exportButton"),
  importInput: $("#importInput"),
  resetButton: $("#resetButton"),
  dataPreview: $("#dataPreview"),
  officialCount: $("#officialCount"),
  dictSearch: $("#dictSearch"),
  categoryFilter: $("#categoryFilter"),
  officialCatalog: $("#officialCatalog"),
  settingsForm: $("#settingsForm"),
  nameSetting: $("#nameSetting"),
  goalSetting: $("#goalSetting"),
  wpmSetting: $("#wpmSetting"),
  preferredDictSetting: $("#preferredDictSetting"),
  themeSetting: $("#themeSetting"),
  pronSetting: $("#pronSetting"),
  keySoundSetting: $("#keySoundSetting"),
  aiProviderSetting: $("#aiProviderSetting"),
  aiModelPresetSetting: $("#aiModelPresetSetting"),
  aiApiKeySetting: $("#aiApiKeySetting"),
  aiBaseUrlSetting: $("#aiBaseUrlSetting"),
  ttsProviderSetting: $("#ttsProviderSetting"),
  ttsApiKeySetting: $("#ttsApiKeySetting"),
  ttsBaseUrlSetting: $("#ttsBaseUrlSetting"),
  ttsModelSetting: $("#ttsModelSetting"),
  ttsVoiceSetting: $("#ttsVoiceSetting"),
  ttsSpeedSetting: $("#ttsSpeedSetting"),
  ttsInstructionsSetting: $("#ttsInstructionsSetting"),
  noteSetting: $("#noteSetting"),
  accountDialog: $("#accountDialog"),
  accountList: $("#accountList"),
  newAccountName: $("#newAccountName"),
  createAccountButton: $("#createAccountButton"),
  themeButton: $("#themeButton"),
  toast: $("#toast")
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
  if (!raw) {
    const first = defaultProfile("我的账号");
    return { activeProfileId: first.id, profiles: [first] };
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.profiles?.length) throw new Error("empty");
    parsed.profiles = parsed.profiles.map(migrateProfile);
    return parsed;
  } catch {
    const first = defaultProfile("我的账号");
    return { activeProfileId: first.id, profiles: [first] };
  }
}

function migrateProfile(input) {
  const base = defaultProfile(input?.name || "我的账号");
  return {
    ...base,
    ...input,
    settings: { ...base.settings, ...(input?.settings || {}) },
    ngramErrors: input?.ngramErrors || {},
    keyErrors: input?.keyErrors || {},
    mistakes: input?.mistakes || {},
    favorites: input?.favorites || [],
    customWords: input?.customWords || []
  };
}

function saveState() {
  const index = state.profiles.findIndex((item) => item.id === profile.id);
  if (index >= 0) state.profiles[index] = profile;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveProfile() {
  return state.profiles.find((item) => item.id === state.activeProfileId) || state.profiles[0];
}

function dictionaryOptions() {
  const official = OFFICIAL_DICTIONARIES.length
    ? OFFICIAL_DICTIONARIES
    : [{ id: "fallback", name: "内置示例", description: "离线示例词库", category: "示例", url: "", length: fallbackWords.length, tags: ["本地"] }];
  return [
    ...official,
    { id: "custom", name: "我的词库", description: "个人导入词库", category: "个人", url: "custom", length: profile.customWords.length, tags: ["自定义"] }
  ];
}

function dictionaryById(id) {
  return dictionaryOptions().find((item) => item.id === id) || dictionaryOptions()[0];
}

function normalizeWord(item) {
  if (Array.isArray(item)) {
    return { word: String(item[0] || "").trim(), translation: item[1] || "未填写释义", phonetic: item[2] || "" };
  }
  const phone = profile.settings.pron === "uk" ? item.ukphone : item.usphone;
  return {
    word: String(item.name || item.word || item.title || "").trim(),
    translation: Array.isArray(item.trans) ? item.trans.join("；") : item.trans || item.translation || item.desc || "未填写释义",
    phonetic: phone ? `/${phone}/` : item.phonetic || "",
    sentence: item.sentence || item.example || ""
  };
}

async function loadDictionary(id = elements.dictSelect.value) {
  if (id === "custom") return profile.customWords.map(normalizeWord).filter((item) => item.word);
  if (id === "fallback" || !OFFICIAL_DICTIONARIES.length) return fallbackWords.map(normalizeWord);
  if (dictionaryCache.has(id)) return dictionaryCache.get(id);
  const meta = dictionaryById(id);
  const response = await fetch(meta.url);
  if (!response.ok) throw new Error(`无法读取词库：${meta.name}`);
  const words = (await response.json()).map(normalizeWord).filter((item) => item.word);
  dictionaryCache.set(id, words);
  return words;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove("show"), 1800);
}

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function populateSelects() {
  const groups = dictionaryOptions().reduce((map, item) => {
    const key = item.category || "其他";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
    return map;
  }, new Map());
  const optionHtml = [...groups.entries()].map(([category, items]) => {
    const options = items.map((item) => `<option value="${item.id}">${item.name} · ${item.length || 0}</option>`).join("");
    return `<optgroup label="${category}">${options}</optgroup>`;
  }).join("");
  elements.dictSelect.innerHTML = optionHtml;
  elements.preferredDictSetting.innerHTML = optionHtml;
  const dictId = dictionaryById(profile.preferredDict).id;
  elements.dictSelect.value = dictId;
  elements.preferredDictSetting.value = dictId;

  elements.keySoundSetting.innerHTML = keySoundResources
    .map((name) => `<option value="${name}">${name.replace(/\.(wav|mp3)$/i, "")}</option>`)
    .join("");
  elements.keySoundSetting.value = profile.settings.keySoundName;
  elements.ttsVoiceSetting.innerHTML = ttsVoices
    .map((voice) => `<option value="${voice}">${voice}</option>`)
    .join("");
  renderAiModelOptions();
  renderChapters();
  renderCatalogFilters();
}

function renderAiModelOptions() {
  const provider = elements.aiProviderSetting?.value || profile.settings.aiProvider;
  const options = aiModelPresets[provider] || aiModelPresets.custom;
  const current = profile.settings.aiModel;
  elements.aiModelPresetSetting.innerHTML = options
    .map((item) => `<option value="${item.value}">${item.label}</option>`)
    .join("");
  elements.aiModelPresetSetting.value = options.some((item) => item.value === current) ? current : options[0].value;
}

function renderChapters() {
  const meta = dictionaryById(elements.dictSelect.value);
  const count = Math.max(1, Math.ceil((meta.length || 1) / Math.max(5, Number(elements.loopInput.value || CHAPTER_SIZE))));
  elements.chapterSelect.innerHTML = Array.from({ length: count }, (_, index) => {
    const size = Math.max(5, Number(elements.loopInput.value || CHAPTER_SIZE));
    const start = index * size + 1;
    const end = Math.min((index + 1) * size, meta.length || size);
    return `<option value="${index}">${start}-${end}</option>`;
  }).join("");
}

function renderKeyboard() {
  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  elements.keyboard.innerHTML = rows
    .map((row) => `<div class="key-row">${[...row].map((key) => `<div class="key" data-key="${key}">${key.toUpperCase()}</div>`).join("")}</div>`)
    .join("");
  updateKeyboardHeat();
}

function updateKeyboardHeat(activeKey = "") {
  const max = Math.max(1, ...Object.values(profile.keyErrors));
  $$(".key").forEach((keyNode) => {
    const key = keyNode.dataset.key;
    const ratio = (profile.keyErrors[key] || 0) / max;
    keyNode.className = "key";
    if (ratio > 0.66) keyNode.classList.add("hot");
    else if (ratio > 0.33) keyNode.classList.add("warm");
    else if (ratio > 0) keyNode.classList.add("cool");
    if (activeKey === key) keyNode.classList.add("active");
  });
  const weakKey = Object.entries(profile.keyErrors).sort((a, b) => b[1] - a[1])[0];
  const weakGram = Object.entries(profile.ngramErrors).sort((a, b) => b[1] - a[1])[0];
  elements.weakKeyLabel.textContent = weakKey ? `薄弱键：${weakKey[0].toUpperCase()} (${weakKey[1]} 次)` : "暂无薄弱键";
  elements.focusAdvice.textContent = weakKey
    ? `当前建议放慢 ${weakKey[0].toUpperCase()} 键附近的节奏，先稳住正确率。`
    : "先完成一组热身，系统会根据错键给你建议。";
  elements.ngramAdvice.textContent = weakGram
    ? `自适应模式会优先抽取包含 ${weakGram[0]} 的词，直到这个组合稳定下来。`
    : "完成几次输入后，会统计最容易出错的字母组合。";
}

function renderProfile() {
  document.body.className = `theme-${profile.theme}`;
  elements.profileName.textContent = profile.name;
  elements.avatarButton.textContent = profile.name.slice(0, 1).toUpperCase();
  elements.profileMeta.textContent = profile.note || "本地个人账号";
  elements.dailyGoal.textContent = profile.goal;
  elements.todayDone.textContent = profile.days[TODAY] || 0;
  const percent = Math.min(100, Math.round(((profile.days[TODAY] || 0) / profile.goal) * 100));
  elements.goalRing.textContent = `${percent}%`;
  elements.goalRing.style.background = `conic-gradient(var(--accent) ${percent}%, var(--line) ${percent}%)`;
}

function renderSettings() {
  elements.nameSetting.value = profile.name;
  elements.goalSetting.value = profile.goal;
  elements.wpmSetting.value = profile.targetWpm;
  elements.themeSetting.value = profile.theme;
  elements.pronSetting.value = profile.settings.pron;
  elements.aiProviderSetting.value = profile.settings.aiProvider;
  renderAiModelOptions();
  elements.aiModelPresetSetting.value = profile.settings.aiModel || elements.aiModelPresetSetting.value;
  elements.aiApiKeySetting.value = profile.settings.aiApiKey || "";
  elements.aiBaseUrlSetting.value = profile.settings.aiBaseUrl || "";
  elements.ttsProviderSetting.value = profile.settings.ttsProvider;
  elements.ttsApiKeySetting.value = profile.settings.ttsApiKey || "";
  elements.ttsBaseUrlSetting.value = profile.settings.ttsBaseUrl || "";
  elements.ttsModelSetting.value = profile.settings.ttsModel;
  elements.ttsVoiceSetting.value = profile.settings.ttsVoice;
  elements.ttsSpeedSetting.value = profile.settings.ttsSpeed;
  elements.ttsInstructionsSetting.value = profile.settings.ttsInstructions;
  elements.noteSetting.value = profile.note;
  elements.preferredDictSetting.value = profile.preferredDict;
}

function renderToggles() {
  elements.soundToggle.classList.toggle("active", profile.settings.sound);
  elements.translationToggle.classList.toggle("active", profile.settings.translation);
  elements.dictationToggle.classList.toggle("active", profile.settings.dictation);
  elements.strictToggle.classList.toggle("active", profile.settings.strict);
  elements.keySoundToggle.classList.toggle("active", profile.settings.keySound);
  elements.translationText.style.display = profile.settings.translation ? "block" : "none";
  elements.targetWord.classList.toggle("hidden", profile.settings.dictation);
}

async function buildQueue(sourceWords = null) {
  const words = sourceWords || await loadDictionary();
  const size = Math.max(5, Number(elements.loopInput.value || CHAPTER_SIZE));
  const mode = elements.modeSelect.value;
  if (sourceWords) return shuffle(words).slice(0, Math.min(size, words.length));
  if (mode === "random") return shuffle(words).slice(0, Math.min(size, words.length));
  if (mode === "adaptive") return adaptiveWords(words, size);
  const chapter = Number(elements.chapterSelect.value || 0);
  return words.slice(chapter * size, chapter * size + size);
}

function adaptiveWords(words, size) {
  const weakKeys = Object.keys(profile.keyErrors);
  const weakGrams = Object.keys(profile.ngramErrors);
  if (!weakKeys.length && !weakGrams.length) return shuffle(words).slice(0, Math.min(size, words.length));
  return shuffle(words)
    .map((item) => {
      const lower = item.word.toLowerCase();
      const keyScore = weakKeys.reduce((score, key) => score + (lower.includes(key) ? profile.keyErrors[key] : 0), 0);
      const gramScore = weakGrams.reduce((score, gram) => score + (lower.includes(gram) ? profile.ngramErrors[gram] * 2 : 0), 0);
      return { item, score: keyScore + gramScore + Math.random() };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(size, words.length))
    .map((entry) => entry.item);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

async function startPractice(sourceWords = null) {
  try {
    elements.startButton.disabled = true;
    elements.startButton.textContent = "读取词库...";
    const words = await buildQueue(sourceWords);
    if (!words.length) {
      showToast("这个词库还没有词。");
      return;
    }
    queue = words;
    currentIndex = 0;
    typedValue = "";
    session = {
      startedAt: Date.now(),
      correctChars: 0,
      totalChars: 0,
      completed: 0,
      errors: 0,
      words: [],
      dictionary: dictionaryById(elements.dictSelect.value).name,
      mode: elements.modeSelect.value
    };
    clearInterval(timerId);
    timerId = setInterval(updateSessionMetrics, 500);
    renderWord();
    elements.typingInput.focus();
    showToast("练习开始。");
  } catch (error) {
    showToast(error.message || "词库读取失败。");
  } finally {
    elements.startButton.disabled = false;
    elements.startButton.textContent = "开始练习";
  }
}

function finishPractice() {
  if (!session) return;
  const elapsed = Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));
  const accuracy = Math.round((session.correctChars / Math.max(1, session.totalChars)) * 100);
  const wpm = Math.round((session.correctChars / 5 / elapsed) * 60);
  profile.sessions.unshift({
    date: new Date().toISOString(),
    completed: session.completed,
    accuracy,
    wpm,
    seconds: elapsed,
    dictionary: session.dictionary,
    mode: session.mode
  });
  profile.sessions = profile.sessions.slice(0, 100);
  profile.days[TODAY] = (profile.days[TODAY] || 0) + session.completed;
  clearInterval(timerId);
  session = null;
  saveState();
  renderAll();
  showToast("这一组完成，记录已保存。");
}

function renderWord() {
  if (!queue[currentIndex]) {
    if (session) finishPractice();
    else {
      const fallback = fallbackWords[0];
      elements.targetWord.textContent = fallback[0];
      elements.translationText.textContent = fallback[1];
      elements.phoneticText.textContent = `/${fallback[2]}/`;
    }
    return;
  }
  const item = queue[currentIndex];
  typedValue = "";
  elements.typingInput.value = "";
  elements.targetWord.textContent = item.word;
  elements.phoneticText.textContent = item.phonetic || " ";
  elements.translationText.textContent = item.translation;
  renderTyped();
  renderToggles();
  updateFavoriteButton();
  if (profile.settings.sound) speak(item.word);
}

function renderTyped() {
  const target = queue[currentIndex]?.word || "";
  elements.typedWord.innerHTML = [...target].map((char, index) => {
    const typed = typedValue[index];
    if (typed == null) return `<span>${char}</span>`;
    return `<span class="${typed === char ? "ok" : "bad"}">${char}</span>`;
  }).join("");
}

function handleInput(event) {
  if (!session || !queue[currentIndex]) return;
  const key = event.key;
  if (key === "Escape") {
    typedValue = "";
    elements.typingInput.value = "";
    renderTyped();
    return;
  }
  if (key === "Enter" || key === " ") {
    event.preventDefault();
    if (typedValue === queue[currentIndex].word) completeWord();
    return;
  }
  if (key === "Backspace") {
    typedValue = typedValue.slice(0, -1);
    renderTyped();
    return;
  }
  if (key.length !== 1) return;

  event.preventDefault();
  const target = queue[currentIndex].word;
  const expected = target[typedValue.length];
  const typed = key;
  session.totalChars += 1;

  if (typed === expected) {
    typedValue += typed;
    session.correctChars += 1;
    playSound("key");
  } else {
    session.errors += 1;
    recordMistake(expected, target, queue[currentIndex]);
    playSound("wrong");
    if (!profile.settings.strict) typedValue += typed;
  }

  updateKeyboardHeat(expected?.toLowerCase());
  renderTyped();
  updateSessionMetrics();
  if (typedValue === target) completeWord();
}

function recordMistake(expected, target, item) {
  const key = String(expected || "").toLowerCase();
  if (key) profile.keyErrors[key] = (profile.keyErrors[key] || 0) + 1;
  const position = typedValue.length;
  const gram = target.slice(Math.max(0, position - 1), Math.min(target.length, position + 2)).toLowerCase();
  if (gram.length >= 2) profile.ngramErrors[gram] = (profile.ngramErrors[gram] || 0) + 1;
  profile.mistakes[target] = {
    word: target,
    translation: item.translation,
    phonetic: item.phonetic,
    count: (profile.mistakes[target]?.count || 0) + 1,
    last: Date.now()
  };
}

function completeWord() {
  const item = queue[currentIndex];
  session.completed += 1;
  session.words.push(item.word);
  playSound("correct");
  if (profile.mistakes[item.word]?.count > 0) {
    profile.mistakes[item.word].count = Math.max(0, profile.mistakes[item.word].count - 1);
    if (profile.mistakes[item.word].count === 0) delete profile.mistakes[item.word];
  }
  currentIndex += 1;
  saveState();
  renderProfile();
  renderReview();
  renderWord();
}

function updateSessionMetrics() {
  if (!session) return;
  const elapsed = Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));
  const wpm = Math.round((session.correctChars / 5 / elapsed) * 60);
  const accuracy = Math.round((session.correctChars / Math.max(1, session.totalChars)) * 100);
  elements.timeMetric.textContent = formatTime(elapsed);
  elements.wpmMetric.textContent = wpm;
  elements.accuracyMetric.textContent = `${accuracy}%`;
  elements.completeMetric.textContent = session.completed;
}

async function speak(word) {
  if (!word) return;
  if (profile.settings.ttsProvider === "openai" || profile.settings.ttsProvider === "custom") {
    try {
      await speakWithAi(word);
      return;
    } catch (error) {
      showToast("AI 发音失败，已使用浏览器发音。");
    }
  }
  speakWithBrowser(word);
}

function speakWithBrowser(word) {
  if (!("speechSynthesis" in window) || !word) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = profile.settings.pron === "uk" ? "en-GB" : "en-US";
  utterance.rate = 0.86;
  speechSynthesis.speak(utterance);
}

async function speakWithAi(word) {
  const key = profile.settings.ttsApiKey || profile.settings.aiApiKey;
  if (!key) throw new Error("missing api key");
  const baseUrl = normalizeBaseUrl(
    profile.settings.ttsProvider === "custom"
      ? profile.settings.ttsBaseUrl || profile.settings.aiBaseUrl
      : profile.settings.ttsBaseUrl || "https://api.openai.com/v1"
  );
  const response = await fetch(`${baseUrl}/audio/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model: profile.settings.ttsModel,
      input: word,
      voice: profile.settings.ttsVoice,
      instructions: profile.settings.ttsInstructions,
      speed: Number(profile.settings.ttsSpeed || 1),
      response_format: "mp3"
    })
  });
  if (!response.ok) throw new Error(await response.text());
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  await audio.play();
}

function normalizeBaseUrl(url) {
  return (url || "").replace(/\/+$/, "");
}

function playSound(kind) {
  if (!profile.settings.keySound) return;
  const file = kind === "wrong" ? "beep.wav" : kind === "correct" ? "correct.wav" : `key-sound/${profile.settings.keySoundName}`;
  const audio = new Audio(`sounds/${file}`);
  audio.volume = kind === "key" ? 0.32 : 0.5;
  audio.play().catch(() => {});
}

function updateFavoriteButton() {
  const word = queue[currentIndex]?.word;
  elements.favoriteButton.textContent = profile.favorites.some((item) => item.word === word) ? "取消收藏" : "收藏";
}

function toggleFavorite() {
  const item = queue[currentIndex];
  if (!item) return;
  const index = profile.favorites.findIndex((fav) => fav.word === item.word);
  if (index >= 0) profile.favorites.splice(index, 1);
  else profile.favorites.push(item);
  saveState();
  updateFavoriteButton();
  renderReview();
  showToast(index >= 0 ? "已取消收藏。" : "已加入收藏。");
}

function renderDashboard() {
  const total = profile.sessions.reduce((sum, item) => sum + item.completed, 0);
  const avgWpm = profile.sessions.length
    ? Math.round(profile.sessions.reduce((sum, item) => sum + item.wpm, 0) / profile.sessions.length)
    : 0;
  elements.totalWords.textContent = total;
  elements.avgWpm.textContent = avgWpm;
  elements.streakDays.textContent = calculateStreak();
  elements.favCount.textContent = profile.favorites.length;

  const recent = profile.sessions.slice(0, 10).reverse();
  elements.historyChart.innerHTML = recent.length
    ? recent.map((item) => {
        const height = Math.min(100, Math.max(6, Math.round((item.wpm / Math.max(profile.targetWpm, 1)) * 100)));
        return `<div class="bar"><span style="height:${height}%"></span><small>${item.wpm}</small></div>`;
      }).join("")
    : `<p class="empty">完成一次练习后，这里会出现速度变化。</p>`;

  elements.ngramList.innerHTML = renderRank(profile.ngramErrors, "组合");
  elements.sessionList.innerHTML = profile.sessions.length
    ? profile.sessions.slice(0, 12).map((item) => `
      <div class="session-item">
        <div><strong>${new Date(item.date).toLocaleString()}</strong><br><span>${item.dictionary || "练习"} · ${item.completed} 词 · ${item.accuracy}% 正确率 · ${formatTime(item.seconds)}</span></div>
        <strong>${item.wpm} WPM</strong>
      </div>
    `).join("")
    : `<p class="empty">暂无练习记录。</p>`;
}

function renderRank(record, label) {
  const items = Object.entries(record).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return items.length
    ? items.map(([name, count]) => `
      <div class="session-item">
        <div><strong>${name}</strong><br><span>${label}错误统计</span></div>
        <strong>${count}</strong>
      </div>
    `).join("")
    : `<p class="empty">还没有足够数据。</p>`;
}

function calculateStreak() {
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if ((profile.days[key] || 0) <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderReview() {
  const mistakes = Object.values(profile.mistakes).sort((a, b) => b.count - a.count);
  elements.mistakeList.innerHTML = mistakes.length
    ? mistakes.map((item) => `
      <div class="word-item">
        <div><strong>${item.word}</strong><br><span>${item.translation} · 错 ${item.count} 次</span></div>
        <button class="ghost-button" data-remove-mistake="${item.word}" type="button">移除</button>
      </div>
    `).join("")
    : `<p class="empty">很好，暂时没有错词。</p>`;

  elements.favoriteList.innerHTML = profile.favorites.length
    ? profile.favorites.map((item) => `
      <div class="word-item">
        <div><strong>${item.word}</strong><br><span>${item.translation}</span></div>
        <button class="ghost-button" data-remove-fav="${item.word}" type="button">移除</button>
      </div>
    `).join("")
    : `<p class="empty">收藏想重点练的词，它们会出现在这里。</p>`;
}

function renderDataPreview() {
  const preview = {
    account: profile.name,
    officialDictionaries: OFFICIAL_DICTIONARIES.length,
    dailyGoal: profile.goal,
    sessions: profile.sessions.length,
    favorites: profile.favorites.length,
    mistakes: Object.keys(profile.mistakes).length,
    customWords: profile.customWords.length
  };
  elements.dataPreview.textContent = JSON.stringify(preview, null, 2);
}

function buildAiContext(extraQuestion = "") {
  const recentSessions = profile.sessions.slice(0, 12);
  const weakKeys = Object.entries(profile.keyErrors).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const weakNgrams = Object.entries(profile.ngramErrors).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const mistakes = Object.values(profile.mistakes).sort((a, b) => b.count - a.count).slice(0, 18);
  const favorites = profile.favorites.slice(0, 12);
  return {
    account: profile.name,
    dailyGoal: profile.goal,
    targetWpm: profile.targetWpm,
    todayCompleted: profile.days[TODAY] || 0,
    streakDays: calculateStreak(),
    preferredDictionary: dictionaryById(profile.preferredDict).name,
    recentSessions,
    weakKeys,
    weakNgrams,
    mistakes,
    favorites,
    userQuestion: extraQuestion
  };
}

function renderAiContextPreview() {
  if (!elements.aiContextPreview) return;
  elements.aiContextPreview.textContent = JSON.stringify(buildAiContext(), null, 2);
}

function renderAiOutput(text) {
  elements.aiOutput.textContent = text;
}

async function analyzeWithAi(extraQuestion = "") {
  const context = buildAiContext(extraQuestion);
  renderAiContextPreview();
  if (!profile.settings.aiApiKey) {
    setView("settings");
    showToast("先在设置里填写 AI API Key。");
    return;
  }
  elements.aiAnalyzeButton.disabled = true;
  elements.aiAskButton.disabled = true;
  elements.aiStatus.textContent = "正在把练习摘要发给你选择的 AI 模型...";
  renderAiOutput("分析中...");
  try {
    const prompt = [
      "你是一个英语单词输入训练教练，目标是帮助用户提高英文键盘肌肉记忆和单词掌握。",
      "请基于 JSON 练习摘要给出具体、可执行的中文建议。",
      "要求：",
      "1. 先用 3 句话总结当前状态。",
      "2. 给出薄弱键位、薄弱字母组合、错词复习优先级。",
      "3. 给出下一次 15 分钟训练计划。",
      "4. 如果数据不足，明确说明还需要哪些练习数据。",
      "5. 不要编造没有出现在摘要里的成绩。",
      "",
      JSON.stringify(context, null, 2)
    ].join("\n");
    const text = await callAiText(prompt);
    elements.aiStatus.textContent = `已由 ${profile.settings.aiProvider} / ${profile.settings.aiModel} 完成分析。`;
    renderAiOutput(text);
  } catch (error) {
    elements.aiStatus.textContent = "AI 调用失败。";
    renderAiOutput(error.message || "请检查 API Key、模型名、Base URL 或浏览器网络权限。");
  } finally {
    elements.aiAnalyzeButton.disabled = false;
    elements.aiAskButton.disabled = false;
  }
}

async function callAiText(prompt) {
  const provider = profile.settings.aiProvider;
  if (provider === "gemini") return callGemini(prompt);
  return callOpenAiCompatible(prompt);
}

async function callOpenAiCompatible(prompt) {
  const provider = profile.settings.aiProvider;
  const baseUrl = normalizeBaseUrl(
    provider === "deepseek"
      ? "https://api.deepseek.com"
      : provider === "custom"
        ? profile.settings.aiBaseUrl
        : "https://api.openai.com/v1"
  );
  if (!baseUrl) throw new Error("自定义接口需要填写 Base URL。");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${profile.settings.aiApiKey}`
    },
    body: JSON.stringify({
      model: profile.settings.aiModel,
      temperature: 0.35,
      messages: [
        { role: "system", content: "你是严谨、耐心的英文输入训练教练。" },
        { role: "user", content: prompt }
      ]
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || `请求失败：${response.status}`);
  return data.choices?.[0]?.message?.content || "模型没有返回内容。";
}

async function callGemini(prompt) {
  const model = profile.settings.aiModel;
  const key = encodeURIComponent(profile.settings.aiApiKey);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.35 }
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || `请求失败：${response.status}`);
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n") || "模型没有返回内容。";
}

function renderCatalogFilters() {
  const categories = ["全部", ...new Set(OFFICIAL_DICTIONARIES.map((item) => item.category || "其他"))];
  elements.categoryFilter.innerHTML = categories.map((name) => `<option value="${name}">${name}</option>`).join("");
  elements.officialCount.textContent = `${OFFICIAL_DICTIONARIES.length} 个官方词库`;
  renderCatalog();
}

function renderCatalog() {
  const keyword = elements.dictSearch.value.trim().toLowerCase();
  const category = elements.categoryFilter.value || "全部";
  const items = OFFICIAL_DICTIONARIES
    .filter((item) => category === "全部" || item.category === category)
    .filter((item) => {
      const text = `${item.name} ${item.description} ${item.tags?.join(" ")} ${item.id}`.toLowerCase();
      return !keyword || text.includes(keyword);
    })
    .slice(0, 80);
  elements.officialCatalog.innerHTML = items.length
    ? items.map((item) => `
      <div class="catalog-item">
        <div><strong>${item.name}</strong><br><span>${item.description || item.category}</span></div>
        <div class="tag-row">
          <span class="tag">${item.category}</span>
          <span class="tag">${item.length} 词</span>
          ${(item.tags || []).slice(0, 2).map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <button class="ghost-button" type="button" data-use-dict="${item.id}">使用这个词库</button>
      </div>
    `).join("")
    : `<p class="empty">没有找到匹配词库。</p>`;
}

function renderAccounts() {
  elements.accountList.innerHTML = state.profiles.map((item) => `
    <div class="account-choice">
      <div><strong>${item.name}</strong><br><span>${item.sessions.length} 次记录 · ${item.goal} 词/天</span></div>
      <button class="ghost-button" data-account="${item.id}" type="button">${item.id === profile.id ? "当前" : "切换"}</button>
    </div>
  `).join("");
}

function renderAll() {
  populateSelects();
  renderProfile();
  renderSettings();
  renderToggles();
  renderKeyboard();
  renderDashboard();
  renderReview();
  renderDataPreview();
  renderAiContextPreview();
  renderAccounts();
}

function setView(id) {
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === id));
  $$(".view").forEach((view) => view.classList.remove("active"));
  const target = $(`#${id}View`);
  target.classList.add("active");
  elements.viewTitle.textContent = target.dataset.title;
  if (id === "dashboard") renderDashboard();
  if (id === "review") renderReview();
  if (id === "library") {
    renderDataPreview();
    renderCatalog();
  }
  if (id === "ai") renderAiContextPreview();
}

function parseCustomWords(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [word, translation, phonetic] = line.split(/[,，\t]/).map((part) => part.trim());
      return word ? [word, translation || "自定义词", phonetic || ""] : null;
    })
    .filter(Boolean);
}

function exportProfile() {
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${profile.name}-qwerty-backup.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  $$(".nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
  elements.dictSelect.addEventListener("change", () => {
    profile.preferredDict = elements.dictSelect.value;
    saveState();
    renderChapters();
  });
  elements.loopInput.addEventListener("change", renderChapters);
  elements.modeSelect.addEventListener("change", renderChapters);
  elements.startButton.addEventListener("click", () => startPractice());
  elements.wordStage.addEventListener("click", () => elements.typingInput.focus());
  document.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea, select") && event.target !== elements.typingInput) return;
    handleInput(event);
  });
  elements.speakButton.addEventListener("click", () => speak(queue[currentIndex]?.word || elements.targetWord.textContent));
  elements.favoriteButton.addEventListener("click", toggleFavorite);
  elements.skipButton.addEventListener("click", () => {
    if (!session) return;
    currentIndex += 1;
    renderWord();
  });

  [
    ["translation", elements.translationToggle],
    ["sound", elements.soundToggle],
    ["dictation", elements.dictationToggle],
    ["strict", elements.strictToggle],
    ["keySound", elements.keySoundToggle]
  ].forEach(([setting, node]) => {
    node.addEventListener("click", () => {
      profile.settings[setting] = !profile.settings[setting];
      saveState();
      renderToggles();
    });
  });

  elements.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    profile.name = elements.nameSetting.value.trim() || profile.name;
    profile.goal = Number(elements.goalSetting.value || 30);
    profile.targetWpm = Number(elements.wpmSetting.value || 45);
    profile.preferredDict = elements.preferredDictSetting.value;
    profile.theme = elements.themeSetting.value;
    profile.settings.pron = elements.pronSetting.value;
    profile.settings.keySoundName = elements.keySoundSetting.value;
    profile.settings.aiProvider = elements.aiProviderSetting.value;
    profile.settings.aiModel = elements.aiModelPresetSetting.value;
    profile.settings.aiApiKey = elements.aiApiKeySetting.value.trim();
    profile.settings.aiBaseUrl = elements.aiBaseUrlSetting.value.trim();
    profile.settings.ttsProvider = elements.ttsProviderSetting.value;
    profile.settings.ttsApiKey = elements.ttsApiKeySetting.value.trim();
    profile.settings.ttsBaseUrl = elements.ttsBaseUrlSetting.value.trim();
    profile.settings.ttsModel = elements.ttsModelSetting.value;
    profile.settings.ttsVoice = elements.ttsVoiceSetting.value;
    profile.settings.ttsSpeed = Number(elements.ttsSpeedSetting.value || 1);
    profile.settings.ttsInstructions = elements.ttsInstructionsSetting.value.trim();
    profile.note = elements.noteSetting.value.trim();
    saveState();
    renderAll();
    showToast("设置已保存。");
  });

  elements.aiProviderSetting.addEventListener("change", () => {
    const provider = elements.aiProviderSetting.value;
    const options = aiModelPresets[provider] || aiModelPresets.custom;
    elements.aiModelPresetSetting.innerHTML = options
      .map((item) => `<option value="${item.value}">${item.label}</option>`)
      .join("");
    elements.aiModelPresetSetting.value = options[0].value;
    if (provider === "deepseek") elements.aiBaseUrlSetting.value = "https://api.deepseek.com";
    if (provider === "openai") elements.aiBaseUrlSetting.value = "https://api.openai.com/v1";
    if (provider === "gemini") elements.aiBaseUrlSetting.value = "";
  });

  elements.ttsProviderSetting.addEventListener("change", () => {
    if (elements.ttsProviderSetting.value === "openai" && !elements.ttsBaseUrlSetting.value) {
      elements.ttsBaseUrlSetting.value = "https://api.openai.com/v1";
    }
  });

  elements.aiAnalyzeButton.addEventListener("click", () => analyzeWithAi());
  elements.aiAskButton.addEventListener("click", () => {
    const question = elements.aiQuestion.value.trim();
    analyzeWithAi(question);
  });

  elements.themeButton.addEventListener("click", () => {
    const themes = ["light", "ink", "green"];
    profile.theme = themes[(themes.indexOf(profile.theme) + 1) % themes.length];
    saveState();
    renderAll();
  });

  elements.avatarButton.addEventListener("click", () => {
    renderAccounts();
    elements.accountDialog.showModal();
  });

  elements.createAccountButton.addEventListener("click", () => {
    const name = elements.newAccountName.value.trim();
    if (!name) return showToast("先输入一个昵称。");
    const account = defaultProfile(name);
    state.profiles.push(account);
    state.activeProfileId = account.id;
    profile = account;
    elements.newAccountName.value = "";
    saveState();
    renderAll();
    elements.accountDialog.close();
  });

  elements.accountList.addEventListener("click", (event) => {
    const id = event.target.dataset.account;
    if (!id) return;
    state.activeProfileId = id;
    profile = migrateProfile(getActiveProfile());
    saveState();
    renderAll();
    elements.accountDialog.close();
  });

  elements.saveCustomButton.addEventListener("click", () => {
    profile.customWords = parseCustomWords(elements.customWords.value);
    profile.preferredDict = "custom";
    saveState();
    renderAll();
    elements.dictSelect.value = "custom";
    renderChapters();
    showToast(`已保存 ${profile.customWords.length} 个自定义词。`);
  });

  elements.loadSampleButton.addEventListener("click", () => {
    elements.customWords.value = [
      "curiosity, 好奇心, /ˌkjʊəriˈɒsəti/",
      "discipline, 自律，训练, /ˈdɪsəplɪn/",
      "momentum, 势头，动力, /məˈmentəm/",
      "reflection, 反思，映像, /rɪˈflekʃn/"
    ].join("\n");
  });

  elements.exportButton.addEventListener("click", exportProfile);
  elements.importInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const imported = migrateProfile(JSON.parse(await file.text()));
    imported.id = crypto.randomUUID();
    imported.name = `${imported.name || "导入账号"}（导入）`;
    state.profiles.push(imported);
    state.activeProfileId = imported.id;
    profile = imported;
    saveState();
    renderAll();
    showToast("备份已作为新账号导入。");
  });

  elements.resetButton.addEventListener("click", () => {
    if (!confirm("确认清空当前账号的练习数据吗？")) return;
    const reset = defaultProfile(profile.name);
    reset.id = profile.id;
    reset.theme = profile.theme;
    reset.goal = profile.goal;
    reset.preferredDict = profile.preferredDict;
    profile = reset;
    saveState();
    renderAll();
  });

  elements.practiceMistakesButton.addEventListener("click", () => {
    const words = Object.values(profile.mistakes).map(normalizeWord);
    setView("practice");
    startPractice(words);
  });

  elements.practiceFavsButton.addEventListener("click", () => {
    setView("practice");
    startPractice(profile.favorites);
  });

  elements.dictSearch.addEventListener("input", renderCatalog);
  elements.categoryFilter.addEventListener("change", renderCatalog);

  document.addEventListener("click", (event) => {
    const mistake = event.target.dataset.removeMistake;
    const fav = event.target.dataset.removeFav;
    const useDict = event.target.dataset.useDict;
    if (mistake) delete profile.mistakes[mistake];
    if (fav) profile.favorites = profile.favorites.filter((item) => item.word !== fav);
    if (useDict) {
      profile.preferredDict = useDict;
      elements.dictSelect.value = useDict;
      setView("practice");
      saveState();
      renderAll();
      showToast("已切换到这个官方词库。");
    }
    if (mistake || fav) {
      saveState();
      renderReview();
      renderDashboard();
    }
  });
}

bindEvents();
elements.customWords.value = profile.customWords.map((item) => item.join(", ")).join("\n");
renderAll();
renderWord();
