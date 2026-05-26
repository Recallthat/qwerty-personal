const STORAGE_KEY = "qwerty-personal-state-v2";
const OLD_STORAGE_KEY = "qwerty-personal-state-v1";
const TODAY = new Date().toISOString().slice(0, 10);
const CHAPTER_SIZE = 20;
const OFFICIAL_DICTIONARIES = Array.isArray(window.OFFICIAL_DICTIONARIES) ? window.OFFICIAL_DICTIONARIES : [];
const WORD_EXAMPLES = window.WORD_EXAMPLES || {};
const OFFICIAL_RAW_BASE = "https://raw.githubusercontent.com/RealKai42/qwerty-learner/master/public/";
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

const mimoTtsVoices = [
  { value: "mimo_default", label: "MiMo 默认" },
  { value: "Bingtang", label: "冰糖 · 中文女声" },
  { value: "Moli", label: "茉莉 · 中文女声" },
  { value: "Soda", label: "苏打 · 中文男声" },
  { value: "Baihua", label: "白桦 · 中文男声" },
  { value: "Mia", label: "Mia · 英文女声" },
  { value: "Chloe", label: "Chloe · 英文女声" },
  { value: "Milo", label: "Milo · 英文男声" },
  { value: "Dean", label: "Dean · 英文男声" }
];

const mimoTtsTones = [
  { value: "", label: "自然清晰" },
  { value: "变慢", label: "变慢" },
  { value: "变快", label: "变快" },
  { value: "开心", label: "开心" },
  { value: "悲伤", label: "悲伤" },
  { value: "生气", label: "生气" },
  { value: "悄悄话", label: "悄悄话" },
  { value: "夹子音", label: "夹子音" },
  { value: "台湾腔", label: "台湾腔" },
  { value: "东北话", label: "东北话" },
  { value: "四川话", label: "四川话" },
  { value: "河南话", label: "河南话" },
  { value: "粤语", label: "粤语" },
  { value: "孙悟空", label: "孙悟空" },
  { value: "林黛玉", label: "林黛玉" },
  { value: "唱歌", label: "唱歌" }
];

const petSkins = [
  { id: "default", name: "青柚原生", price: 0, label: "默认", className: "skin-default", theme: "mint" },
  { id: "rainbow", name: "彩糖晴空", price: 45, label: "炫彩", className: "skin-rainbow", theme: "candy" },
  { id: "neon", name: "极光薄荷", price: 60, label: "极光", className: "skin-neon", theme: "aurora" },
  { id: "cat_moe", name: "元气猫耳", price: 85, label: "猫耳", className: "skin-cat-moe", theme: "sakura" },
  { id: "cat_grace", name: "午后茶会", price: 120, label: "茶会", className: "skin-cat-grace", theme: "latte" },
  { id: "cat_queen", name: "紫藤舞台", price: 160, label: "紫藤", className: "skin-cat-queen", theme: "lavender" },
  { id: "sunny_boy", name: "柠檬少年", price: 70, label: "少年", className: "skin-sunny-boy", theme: "citrus" },
  { id: "cool_prince", name: "海盐清晨", price: 130, label: "海盐", className: "skin-cool-prince", theme: "sky" },
  { id: "star_idol", name: "星辉偶像", price: 220, label: "稀有", className: "skin-star-idol", theme: "idol" }
];

const petSuits = [
  { id: "study", name: "红开衫学习装", price: 0, label: "默认", image: "assets/pets/aoi-study.webp", theme: "mint" },
  { id: "mint", name: "薄荷卫衣", price: 80, label: "卫衣", image: "assets/pets/aoi-mint.webp", theme: "mint" },
  { id: "school", name: "学院西装", price: 120, label: "学院", image: "assets/pets/aoi-school.webp", theme: "sky" },
  { id: "tea", name: "午后茶会", price: 150, label: "茶会", image: "assets/pets/aoi-tea.webp", theme: "latte" },
  { id: "idol", name: "星光偶像", price: 220, label: "偶像", image: "assets/pets/aoi-idol.webp", theme: "idol" }
];

const themeOrder = ["light", "mint", "sky", "sakura", "citrus", "lavender", "candy", "aurora", "latte", "idol", "ink", "green"];

const petShopTabs = [
  { id: "suit", label: "套装", items: petSuits },
  { id: "skin", label: "光效", items: petSkins }
];

let activePetShopTab = "suit";
let petPreview = null;
let petPreviewTimer = null;
let petFrameTimer = null;
let petFrameResetTimer = null;
let petFrameToken = 0;
let petActionsRendered = false;
let petShopRenderKey = "";

const petActionFrameCounts = {
  angry: 10,
  celebrate: 14,
  cheer: 12,
  confused: 12,
  drink: 12,
  eat: 14,
  exercise: 12,
  focus: 12,
  happy: 12,
  hungry: 14,
  music: 12,
  relax: 12,
  review: 12,
  shy: 12,
  sleepy: 12,
  sparkle: 12,
  stretch: 12,
  surprise: 12,
  think: 12,
  wave: 14
};

const petActionDefs = [
  { id: "wave", label: "打招呼", icon: "Hi", motion: "wave", effects: ["Hi", "✦", "✦", "♡"], duration: 1500, message: "青柚向你挥手：今天也一起练吧。", delta: { mood: 3 } },
  { id: "hungry", label: "饿了", icon: "饭", motion: "hungry", effects: ["饭", "…", "🍙", "?"], duration: 1700, message: "青柚摸摸肚子：有点饿了，背几个词再给我换点好吃的吧。", delta: { mood: -1 } },
  { id: "eat", label: "吃饭", icon: "吃", motion: "eat", effects: ["🍙", "吃", "♪", "♡"], duration: 1500, message: "青柚吃饱了，状态恢复了一些。", delta: { health: 10, mood: 2 } },
  { id: "drink", label: "喝水", icon: "水", motion: "drink", effects: ["水", "💧", "💧", "OK"], duration: 1500, message: "喝口水，打字也要记得休息眼睛。", delta: { health: 3, mood: 2 } },
  { id: "sleepy", label: "犯困", icon: "Zz", motion: "sleepy", effects: ["Zz", "Z", "…", "☁"], duration: 1800, message: "青柚揉揉眼睛：有点困，想小睡一下。", delta: { mood: -1 } },
  { id: "stretch", label: "伸懒腰", icon: "伸", motion: "stretch", effects: ["伸", "呼", "✦", "OK"], duration: 1600, message: "青柚伸了个懒腰：肩膀放松，再继续。", delta: { health: 3, mood: 3 } },
  { id: "study", label: "陪练", icon: "书", motion: "focus", effects: ["书", "10", "词", "✓"], duration: 1700, message: "进入陪练模式：接下来 10 个词我都看着你。", delta: { mood: 4, health: 2 } },
  { id: "think", label: "思考", icon: "?", motion: "think", effects: ["?", "abc", "拆", "记"], duration: 1800, message: "青柚正在思考：这个词的拼写结构可以拆开记。", delta: { mood: 1 } },
  { id: "confused", label: "疑惑", icon: "错", motion: "confused", effects: ["?", "错", "!", "…"], duration: 1500, message: "青柚歪头：刚刚这个键位好像有点乱，我们慢一点。", delta: { mood: -1 } },
  { id: "cheer", label: "鼓励", icon: "加油", motion: "cheer", effects: ["加油", "↑", "✦", "✓"], duration: 1500, message: "青柚给你打气：稳定正确率，比硬冲速度更重要。", delta: { mood: 5 } },
  { id: "celebrate", label: "庆祝", icon: "✓", motion: "celebrate", effects: ["✓", "★", "★", "棒"], duration: 1700, message: "答对啦！青柚开心地转了一圈。", delta: { mood: 6, exp: 2 } },
  { id: "shy", label: "害羞", icon: "羞", motion: "shy", effects: ["羞", "♡", "///", "…"], duration: 1500, message: "被你夸了，青柚有点不好意思。", delta: { mood: 4 } },
  { id: "happy", label: "开心", icon: "乐", motion: "happy", effects: ["乐", "♡", "✦", "♪"], duration: 1400, message: "青柚今天心情很好，练词也会更顺。", delta: { mood: 6 } },
  { id: "angry", label: "认真", icon: "!", motion: "angry", effects: ["!", "错词", "复习", "!"], duration: 1400, message: "青柚认真起来了：错词不能放过，复习区见。", delta: { mood: 1 } },
  { id: "music", label: "哼歌", icon: "♪", motion: "music", effects: ["♪", "♫", "♪", "♬"], duration: 1700, message: "青柚小声哼歌，键盘节奏也跟着稳起来。", delta: { mood: 5 } },
  { id: "sparkle", label: "闪亮", icon: "星", motion: "sparkle", effects: ["星", "✦", "✧", "★"], duration: 1700, message: "今日手感闪闪发光，继续保持。", delta: { mood: 4 } },
  { id: "exercise", label: "活动", icon: "动", motion: "exercise", effects: ["动", "1", "2", "腕"], duration: 1700, message: "青柚活动了一下：久坐了也要动动手腕。", delta: { health: 5, mood: 2 } },
  { id: "review", label: "复习", icon: "复", motion: "review", effects: ["复", "错词", "本", "✓"], duration: 1700, message: "青柚翻开错词本：先复习最容易错的那几个。", delta: { health: 1, mood: 2 } },
  { id: "relax", label: "放松", icon: "茶", motion: "relax", effects: ["茶", "☁", "呼", "♪"], duration: 1800, message: "喝口茶，放松一下，下一组再冲。", delta: { health: 4, mood: 4 } },
  { id: "surprise", label: "惊喜", icon: "哇", motion: "surprise", effects: ["哇", "!", "★", "快"], duration: 1500, message: "青柚眼睛一亮：这个词你记得比上次快多了。", delta: { mood: 5, exp: 1 } }
];

const petActionHints = {
  wave: "抬手挥动",
  hungry: "摸肚子",
  eat: "拿饭团",
  drink: "举杯喝水",
  sleepy: "揉眼犯困",
  stretch: "双手伸展",
  study: "抱书陪练",
  think: "歪头思考",
  confused: "疑惑摇头",
  cheer: "举手打气",
  celebrate: "跳起庆祝",
  shy: "捂脸害羞",
  happy: "开心弹跳",
  angry: "认真皱眉",
  music: "跟拍哼歌",
  sparkle: "闪光特效",
  exercise: "活动手腕",
  review: "翻错词本",
  relax: "端茶放松",
  surprise: "张手惊喜"
};

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
  learnedWords: {},
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
    ttsTone: "",
    ttsSpeed: 0.9,
    ttsInstructions: "Speak like a patient English teacher. Clear, natural, slightly slow, and human-like."
  },
  pet: {
    name: "青柚",
    health: 72,
    mood: 68,
    energy: 60,
    exp: 0,
    level: 1,
    collapsed: false,
    x: null,
    y: null,
    sleeping: false,
    lastCare: Date.now(),
    lastNapAt: 0,
    suit: "study",
    suitsOwned: ["study"],
    skin: "default",
    skinsOwned: ["default"],
    outfit: {
      upper: "upper_sailor",
      lower: "lower_skirt",
      shoes: "shoes_canvas",
      socks: "socks_white"
    },
    outfitsOwned: {
      upper: ["upper_sailor"],
      lower: ["lower_skirt"],
      shoes: ["shoes_canvas"],
      socks: ["socks_white"]
    }
  }
});

let state = loadState();
let profile = migrateProfile(getActiveProfile());
let queue = [];
let currentIndex = 0;
let session = null;
let timerId = null;
let typedValue = "";
let inputErrorIndex = -1;
let inputErrorTimer = null;
let pendingSourceWords = null;
let pendingStartOptions = null;

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
  pauseButton: $("#pauseButton"),
  stopButton: $("#stopButton"),
  dictSelect: $("#dictSelect"),
  chapterSelect: $("#chapterSelect"),
  modeSelect: $("#modeSelect"),
  loopInput: $("#loopInput"),
  wordStage: $("#wordStage"),
  studyFlow: $("#studyFlow"),
  phaseText: $("#phaseText"),
  groupProgress: $("#groupProgress"),
  phoneticText: $("#phoneticText"),
  targetWord: $("#targetWord"),
  translationText: $("#translationText"),
  definitionList: $("#definitionList"),
  exampleCard: $("#exampleCard"),
  exampleEn: $("#exampleEn"),
  exampleCn: $("#exampleCn"),
  phraseCard: $("#phraseCard"),
  phraseList: $("#phraseList"),
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
  aiPanelToggle: $("#aiPanelToggle"),
  aiPanelBody: $("#aiPanelBody"),
  aiPanelChevron: $("#aiPanelChevron"),
  aiStatus: $("#aiStatus"),
  aiOutput: $("#aiOutput"),
  aiContextPreview: $("#aiContextPreview"),
  mistakeList: $("#mistakeList"),
  favoriteList: $("#favoriteList"),
  practiceMistakesButton: $("#practiceMistakesButton"),
  practiceFavsButton: $("#practiceFavsButton"),
  practiceLearnedButton: $("#practiceLearnedButton"),
  learnedList: $("#learnedList"),
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
  ttsToneSetting: $("#ttsToneSetting"),
  ttsSpeedSetting: $("#ttsSpeedSetting"),
  ttsInstructionsSetting: $("#ttsInstructionsSetting"),
  noteSetting: $("#noteSetting"),
  accountDialog: $("#accountDialog"),
  accountList: $("#accountList"),
  newAccountName: $("#newAccountName"),
  createAccountButton: $("#createAccountButton"),
  themeButton: $("#themeButton"),
  deskPet: $("#deskPet"),
  petCard: $("#petCard"),
  petBubble: $("#petBubble"),
  petName: $("#petName"),
  petMoodLabel: $("#petMoodLabel"),
  petFace: $("#petFace"),
  petAvatar: $("#petAvatar"),
  petLive2d: $("#petLive2d"),
  petCharacter: $("#petCharacter"),
  petMotionLayer: $("#petMotionLayer"),
  petMinimizeButton: $("#petMinimizeButton"),
  petDockButton: $("#petDockButton"),
  petFeedButton: $("#petFeedButton"),
  petPlayButton: $("#petPlayButton"),
  petSleepButton: $("#petSleepButton"),
  petWaveButton: $("#petWaveButton"),
  petFocusButton: $("#petFocusButton"),
  petActionGrid: $("#petActionGrid"),
  petHealthBar: $("#petHealthBar"),
  petMoodBar: $("#petMoodBar"),
  petEnergyBar: $("#petEnergyBar"),
  petHealthText: $("#petHealthText"),
  petMoodText: $("#petMoodText"),
  petEnergyText: $("#petEnergyText"),
  petEnergyWallet: $("#petEnergyWallet"),
  petSkinGrid: $("#petSkinGrid"),
  petShopTabs: $("#petShopTabs"),
  petShopHint: $("#petShopHint"),
  petUpperLayer: $("#petUpperLayer"),
  petLowerLayer: $("#petLowerLayer"),
  petSocksLayer: $("#petSocksLayer"),
  petShoesLayer: $("#petShoesLayer"),
  petLevelText: $("#petLevelText"),
  petExpText: $("#petExpText"),
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
  const inputPet = input?.pet || {};
  const migratedPetName = !inputPet.name || /^mi(?:mo|no)$/i.test(inputPet.name) ? base.pet.name : inputPet.name;
  return {
    ...base,
    ...input,
    settings: { ...base.settings, ...(input?.settings || {}) },
    ngramErrors: input?.ngramErrors || {},
    keyErrors: input?.keyErrors || {},
    mistakes: input?.mistakes || {},
    learnedWords: input?.learnedWords || {},
    favorites: input?.favorites || [],
    customWords: input?.customWords || [],
    pet: {
      ...base.pet,
      ...inputPet,
      name: migratedPetName,
      outfit: { ...base.pet.outfit, ...(inputPet.outfit || {}) },
      outfitsOwned: { ...base.pet.outfitsOwned, ...(inputPet.outfitsOwned || {}) },
      skinsOwned: inputPet.skinsOwned || base.pet.skinsOwned,
      suitsOwned: inputPet.suitsOwned || base.pet.suitsOwned
    }
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
    const word = String(item[0] || "").trim();
    const extra = WORD_EXAMPLES[word.toLowerCase()] || {};
    const translations = normalizeTranslations(item[1] || "未填写释义");
    return {
      word,
      translation: translations.join("；"),
      translations,
      phonetic: item[2] || "",
      example: extra.example || "",
      phrases: extra.phrases || []
    };
  }
  const phone = profile.settings.pron === "uk" ? item.ukphone : item.usphone;
  const word = String(item.name || item.word || item.title || "").trim();
  const extra = WORD_EXAMPLES[word.toLowerCase()] || {};
  const translations = normalizeTranslations(item.trans || item.translation || item.desc || "未填写释义");
  return {
    word,
    translation: translations.join("；"),
    translations,
    phonetic: phone ? `/${phone}/` : item.phonetic || "",
    example: firstText(item.sentence || item.example) || extra.example || "",
    exampleCn: firstText(item.sentenceCn || item.exampleCn || item.trans_zh || item.cn),
    phrases: normalizePhrases(item.phrases || item.phrase || item.collocations || item.collocation).concat(extra.phrases || []).slice(0, 6)
  };
}

function firstText(value) {
  if (Array.isArray(value)) return value.find(Boolean) || "";
  return value ? String(value).trim() : "";
}

function normalizeTranslations(value) {
  const list = Array.isArray(value) ? value : [value];
  return list
    .flatMap((item) => String(item || "").split(/\n+/))
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !looksLikeEnglishSentence(item));
}

function looksLikeEnglishSentence(text) {
  return /[a-zA-Z]/.test(text) && /\s/.test(text) && text.length > 18 && !/[\u4e00-\u9fff]/.test(text);
}

function normalizePhrases(value) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.map((item) => {
    if (typeof item === "string") return { text: item, translation: "" };
    return {
      text: item.text || item.name || item.phrase || item.word || "",
      translation: item.translation || item.trans || item.desc || ""
    };
  }).filter((item) => item.text);
}

async function loadDictionary(id = elements.dictSelect.value) {
  if (id === "custom") return profile.customWords.map(normalizeWord).filter((item) => item.word);
  if (id === "fallback" || !OFFICIAL_DICTIONARIES.length) return fallbackWords.map(normalizeWord);
  if (dictionaryCache.has(id)) return dictionaryCache.get(id);
  const meta = dictionaryById(id);
  const rawData = await fetchDictionaryJson(meta);
  const words = rawData.map(normalizeWord).filter((item) => item.word);
  dictionaryCache.set(id, words);
  return words;
}

async function fetchDictionaryJson(meta) {
  const localUrl = meta.url;
  const remoteUrl = `${OFFICIAL_RAW_BASE}${meta.url}`;
  const localResult = await fetchJsonFile(localUrl);
  if (localResult.ok) return localResult.data;
  const remoteResult = await fetchJsonFile(remoteUrl);
  if (remoteResult.ok) return remoteResult.data;
  throw new Error(`无法读取词库：${meta.name}。请确认 GitHub 仓库里已经上传 dicts 文件夹，或稍后再试官方远程资源。`);
}

async function fetchJsonFile(url) {
  try {
    const response = await fetch(url, { cache: "force-cache" });
    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";
    const looksLikeHtml = text.trim().startsWith("<");
    if (!response.ok || looksLikeHtml || (!contentType.includes("json") && !text.trim().startsWith("["))) {
      return { ok: false };
    }
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
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
  renderTtsOptions();
  renderAiModelOptions();
  renderChapters();
  renderCatalogFilters();
}

function renderTtsOptions() {
  const provider = elements.ttsProviderSetting?.value || profile.settings.ttsProvider;
  const voices = provider === "mimo"
    ? mimoTtsVoices
    : ttsVoices.map((voice) => ({ value: voice, label: voice }));
  elements.ttsVoiceSetting.innerHTML = voices
    .map((voice) => `<option value="${voice.value}">${voice.label}</option>`)
    .join("");
  elements.ttsToneSetting.innerHTML = mimoTtsTones
    .map((tone) => `<option value="${tone.value}">${tone.label}</option>`)
    .join("");
  elements.ttsVoiceSetting.value = voices.some((voice) => voice.value === profile.settings.ttsVoice)
    ? profile.settings.ttsVoice
    : voices[0].value;
  elements.ttsToneSetting.value = profile.settings.ttsTone || "";
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
  document.body.className = `theme-${profile.theme || "light"}`;
  elements.profileName.textContent = profile.name;
  elements.avatarButton.textContent = profile.name.slice(0, 1).toUpperCase();
  elements.profileMeta.textContent = profile.note || "本地个人账号";
  elements.dailyGoal.textContent = profile.goal;
  elements.todayDone.textContent = profile.days[TODAY] || 0;
  const percent = Math.min(100, Math.round(((profile.days[TODAY] || 0) / profile.goal) * 100));
  elements.goalRing.textContent = `${percent}%`;
  elements.goalRing.style.background = `conic-gradient(var(--accent) ${percent}%, var(--line) ${percent}%)`;
  renderPet();
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
  renderTtsOptions();
  if ([...elements.ttsVoiceSetting.options].some((option) => option.value === profile.settings.ttsVoice)) {
    elements.ttsVoiceSetting.value = profile.settings.ttsVoice;
  }
  if ([...elements.ttsToneSetting.options].some((option) => option.value === profile.settings.ttsTone)) {
    elements.ttsToneSetting.value = profile.settings.ttsTone || "";
  }
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
  elements.translationText.style.display = "none";
  elements.definitionList.style.display = profile.settings.translation ? "grid" : "none";
  elements.exampleCard.style.display = profile.settings.translation && !elements.exampleCard.hidden ? "block" : "none";
  elements.phraseCard.style.display = profile.settings.translation && !elements.phraseCard.hidden ? "block" : "none";
  elements.targetWord.classList.toggle("hidden", profile.settings.dictation);
}

async function buildQueue(sourceWords = null, options = {}) {
  const words = sourceWords || await loadDictionary();
  const size = options.review ? Math.min(10, Math.max(1, Number(elements.loopInput.value || 10))) : 10;
  const mode = elements.modeSelect.value;
  let baseWords;
  if (sourceWords) baseWords = shuffle(words).slice(0, Math.min(size, words.length));
  else if (mode === "random") baseWords = shuffle(words).slice(0, Math.min(size, words.length));
  else if (mode === "adaptive") baseWords = adaptiveWords(words, size);
  else {
    const chapter = Number(elements.chapterSelect.value || 0);
    baseWords = words.slice(chapter * size, chapter * size + size);
  }
  if (options.review || options.forceRecall) return baseWords.map((item, index) => decorateStudyItem(item, "recall", 1, index));
  return [
    ...baseWords.map((item, index) => decorateStudyItem(item, "learn", 1, index)),
    ...baseWords.map((item, index) => decorateStudyItem(item, "learn", 2, index)),
    ...baseWords.map((item, index) => decorateStudyItem(item, "recall", 3, index))
  ];
}

function decorateStudyItem(item, phase, pass, groupIndex) {
  return { ...item, studyPhase: phase, studyPass: pass, groupIndex };
}

function isRecallItem(item) {
  return item?.studyPhase === "recall";
}

function currentBaseGroupSize() {
  if (!session?.baseWordCount) return 10;
  return session.baseWordCount;
}

function recallCompletedCount() {
  if (!session) return 0;
  return session.completed;
}

function sessionElapsedSeconds() {
  if (!session) return 0;
  const paused = session.paused ? Date.now() - (session.pausedAt || Date.now()) : 0;
  return Math.max(1, Math.round((Date.now() - session.startedAt - (session.pausedMs || 0) - paused) / 1000));
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

async function startPractice(sourceWords = null, options = {}) {
  if (session) return;
  try {
    pendingSourceWords = sourceWords;
    pendingStartOptions = options;
    elements.startButton.disabled = true;
    elements.startButton.textContent = "读取词库...";
    const words = await buildQueue(sourceWords, options);
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
      drilled: 0,
      errors: 0,
      words: [],
      baseWordCount: options.review || options.forceRecall ? words.length : Math.max(1, words.filter((item) => item.studyPhase === "recall").length),
      review: !!options.review,
      forceRecall: !!options.forceRecall,
      paused: false,
      pausedAt: 0,
      pausedMs: 0,
      dictionary: dictionaryById(elements.dictSelect.value).name,
      mode: options.review ? "review" : "learn-recall"
    };
    clearInterval(timerId);
    timerId = setInterval(updateSessionMetrics, 500);
    renderWord();
    updateSessionMetrics();
    updateTrainingButtons();
    elements.typingInput.focus();
    showToast(options.review ? "复习开始：看中文写英文。" : "训练开始：先熟悉两轮，再看中文默写。");
  } catch (error) {
    showToast(error.message || "词库读取失败。");
  } finally {
    elements.startButton.disabled = false;
    updateTrainingButtons();
  }
}

function pausePractice() {
  if (!session) return;
  if (session.paused) {
    session.pausedMs += Date.now() - (session.pausedAt || Date.now());
    session.paused = false;
    session.pausedAt = 0;
    showToast("继续训练。");
    elements.typingInput.focus();
  } else {
    session.paused = true;
    session.pausedAt = Date.now();
    showToast("已暂停。");
  }
  updateTrainingButtons();
}

function stopPractice() {
  if (!session) return;
  finishPractice("已停止，本组记录已保存。");
}

function updateTrainingButtons() {
  const running = !!session;
  elements.startButton.classList.toggle("hidden", running);
  elements.pauseButton?.classList.toggle("hidden", !running);
  elements.stopButton?.classList.toggle("hidden", !running);
  if (elements.pauseButton) elements.pauseButton.textContent = session?.paused ? "继续" : "暂停";
  if (!running) elements.startButton.textContent = "开始训练";
}

function finishPractice(message = "这一组完成，记录已保存。") {
  if (!session) return;
  const elapsed = sessionElapsedSeconds();
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
  pendingSourceWords = null;
  pendingStartOptions = null;
  saveState();
  renderAll();
  updateTrainingButtons();
  showToast(message);
}

function renderWord() {
  if (!queue[currentIndex]) {
    if (session) finishPractice();
    else {
      const fallback = fallbackWords[0];
      elements.targetWord.textContent = fallback[0];
      elements.translationText.textContent = fallback[1];
      elements.phoneticText.textContent = `/${fallback[2]}/`;
      renderStudyDetails({ word: fallback[0], translations: [fallback[1]], example: "", phrases: [] });
    }
    return;
  }
  const item = queue[currentIndex];
  typedValue = "";
  inputErrorIndex = -1;
  elements.typingInput.value = "";
  const recall = isRecallItem(item);
  elements.wordStage.classList.toggle("recall-mode", recall);
  elements.targetWord.textContent = item.word;
  elements.targetWord.setAttribute("aria-label", item.word);
  elements.phoneticText.textContent = recall ? "看中文写英文" : item.phonetic || " ";
  elements.translationText.textContent = item.translation;
  renderStudyDetails(item);
  renderTyped();
  renderToggles();
  elements.targetWord.classList.toggle("hidden", recall || profile.settings.dictation);
  elements.phaseText.textContent = recall
    ? "真正记忆：只看中文，把英文打出来"
    : `熟悉拼写：第 ${item.studyPass || 1} 轮，跟着英文练一遍`;
  elements.groupProgress.textContent = `${Math.min(recallCompletedCount() + (recall ? 1 : 0), currentBaseGroupSize())}/${currentBaseGroupSize()}`;
  updateFavoriteButton();
  if (profile.settings.sound && !recall) speak(item.word);
}

function renderStudyDetails(item) {
  const translations = item.translations?.length ? item.translations : normalizeTranslations(item.translation);
  elements.definitionList.innerHTML = translations.length
    ? translations.slice(0, 5).map((line) => renderDefinitionLine(line)).join("")
    : `<div class="definition-line"><span></span><strong>未填写释义</strong></div>`;
  elements.translationText.textContent = translations[0] || item.translation || "";
  const example = item.example || WORD_EXAMPLES[item.word?.toLowerCase()]?.example || "";
  const phrases = item.phrases?.length ? item.phrases : WORD_EXAMPLES[item.word?.toLowerCase()]?.phrases || [];
  elements.exampleCard.hidden = !example;
  elements.exampleEn.innerHTML = example ? highlightWord(example, item.word) : "";
  elements.exampleCn.textContent = item.exampleCn || "";
  elements.exampleCn.hidden = !item.exampleCn;
  elements.phraseCard.hidden = !phrases.length;
  elements.phraseList.innerHTML = phrases.slice(0, 5).map((phrase) => `
    <div class="phrase-item">
      <span>${escapeHtml(phrase.text)}</span>
      <em>${escapeHtml(String(phrase.translation || "").replace(/^phrase\\.\\s*/i, ""))}</em>
    </div>
  `).join("");
}

function renderDefinitionLine(line) {
  const match = line.match(/^([a-z]+\\.|[a-z]+)\\s+(.+)$/i);
  const pos = match ? match[1] : "";
  const text = match ? match[2] : line;
  return `<div class="definition-line"><span>${escapeHtml(pos)}</span><strong>${formatDefinitionText(text)}</strong></div>`;
}

function formatDefinitionText(text) {
  return escapeHtml(text)
    .replace(/[;；]/g, '<i></i>')
    .replace(/[,，]/g, '<small></small>');
}

function highlightWord(sentence, word) {
  const safe = escapeHtml(sentence);
  if (!word) return safe;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(`\\b(${escaped})\\b`, "ig"), "<strong>$1</strong>");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderTyped() {
  const target = queue[currentIndex]?.word || "";
  const recall = isRecallItem(queue[currentIndex]);
  elements.targetWord.innerHTML = [...target].map((char, index) => {
    const typed = typedValue[index];
    const classes = ["target-char"];
    if (typed === char) classes.push("filled");
    else if (index === inputErrorIndex) classes.push("wrong");
    else if (index === typedValue.length) classes.push("current");
    const display = recall && typed !== char ? "•" : char;
    return `<span class="${classes.join(" ")}">${escapeHtml(display)}</span>`;
  }).join("");
  elements.typedWord.textContent = `${typedValue.length}/${target.length}`;
}

function handleInput(event) {
  if (!session || !queue[currentIndex]) return;
  if (session.paused) {
    event.preventDefault();
    return;
  }
  const key = event.key;
  if (key === "Escape") {
    typedValue = "";
    clearInputError();
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
    clearInputError();
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
    clearInputError();
    typedValue += typed;
    session.correctChars += 1;
    playSound("key");
  } else {
    session.errors += 1;
    flashInputError(typedValue.length);
    recordMistake(expected, target, queue[currentIndex]);
    nudgePetForMistake();
    playSound("wrong");
    if (!profile.settings.strict) typedValue += typed;
  }

  updateKeyboardHeat(expected?.toLowerCase());
  renderTyped();
  updateSessionMetrics();
  if (typedValue === target) completeWord();
}

function flashInputError(index) {
  inputErrorIndex = index;
  clearTimeout(inputErrorTimer);
  inputErrorTimer = setTimeout(() => {
    inputErrorIndex = -1;
    renderTyped();
  }, 360);
}

function clearInputError() {
  inputErrorIndex = -1;
  clearTimeout(inputErrorTimer);
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
  const recall = isRecallItem(item);
  session.drilled += 1;
  if (recall) {
    session.completed += 1;
    session.words.push(item.word);
    addLearnedWord(item);
    rewardPetForWord(item.word);
  } else {
    triggerPetAction("study", `熟悉了一遍 ${item.word}，后面会看中文默写。`, { mood: 1 });
  }
  playSound("correct");
  if (recall && profile.mistakes[item.word]?.count > 0) {
    profile.mistakes[item.word].count = Math.max(0, profile.mistakes[item.word].count - 1);
    if (profile.mistakes[item.word].count === 0) delete profile.mistakes[item.word];
  }
  currentIndex += 1;
  saveState();
  renderProfile();
  renderReview();
  renderWord();
}

function addLearnedWord(item) {
  profile.learnedWords ||= {};
  const current = profile.learnedWords[item.word] || {};
  profile.learnedWords[item.word] = {
    word: item.word,
    translation: item.translation,
    phonetic: item.phonetic,
    translations: item.translations,
    example: item.example,
    exampleCn: item.exampleCn,
    phrases: item.phrases,
    learnedAt: current.learnedAt || Date.now(),
    reviewedAt: Date.now(),
    count: (current.count || 0) + 1
  };
}

function updateSessionMetrics() {
  if (!session) return;
  const elapsed = sessionElapsedSeconds();
  const wpm = Math.round((session.correctChars / 5 / elapsed) * 60);
  const accuracy = Math.round((session.correctChars / Math.max(1, session.totalChars)) * 100);
  elements.timeMetric.textContent = formatTime(elapsed);
  elements.wpmMetric.textContent = wpm;
  elements.accuracyMetric.textContent = `${accuracy}%`;
  elements.completeMetric.textContent = `${session.completed}/${session.baseWordCount || 10}`;
}

async function speak(word) {
  if (!word) return;
  if (profile.settings.ttsProvider === "openai" || profile.settings.ttsProvider === "custom" || profile.settings.ttsProvider === "mimo") {
    try {
      await speakWithAi(word);
      return;
    } catch (error) {
      console.warn("AI TTS failed:", error);
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
  if (profile.settings.ttsProvider === "mimo") {
    return speakWithMimo(word, key);
  }
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

async function speakWithMimo(word, key) {
  const baseUrl = normalizeBaseUrl(profile.settings.ttsBaseUrl || "https://api.xiaomimimo.com/v1");
  const assistantText = buildMimoAssistantText(word);
  const userInstruction = buildMimoUserInstruction();
  const isVoiceDesign = profile.settings.ttsModel === "mimo-v2.5-tts-voicedesign";
  const audio = {
    format: "wav",
    ...(isVoiceDesign
      ? { optimize_text_preview: true }
      : { voice: profile.settings.ttsVoice || "mimo_default" })
  };
  const payload = {
    model: profile.settings.ttsModel || "mimo-v2.5-tts",
    messages: [
      {
        role: "user",
        content: userInstruction
      },
      {
        role: "assistant",
        content: assistantText
      }
    ],
    audio
  };
  const response = await requestMimoTts(baseUrl, key, payload);
  if (!response.ok) throw new Error(await response.text());
  const contentType = response.headers.get("content-type") || "";
  if (contentType.startsWith("audio/")) {
    const blob = await response.blob();
    return playAudioBlob(blob);
  }
  const data = await response.json();
  const audioData = findAudioPayload(data);
  if (!audioData) throw new Error("MiMo 没有返回可播放音频。");
  const blob = base64ToAudioBlob(audioData);
  return playAudioBlob(blob);
}

async function requestMimoTts(baseUrl, key, payload) {
  if (location.protocol.startsWith("http")) {
    try {
      const proxy = await fetch("/api/mimo-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key, baseUrl, payload })
      });
      if (proxy.status !== 404 && proxy.headers.get("content-type") !== "text/html") {
        return proxy;
      }
    } catch (error) {
      console.warn("MiMo proxy unavailable, trying direct request:", error);
    }
  }
  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "api-key": key
    },
    body: JSON.stringify(payload)
  });
}

function buildMimoAssistantText(word) {
  const style = profile.settings.ttsTone;
  const stylePrefix = style ? `(${style})` : "";
  return `${stylePrefix}${word}`;
}

function buildMimoUserInstruction() {
  const custom = profile.settings.ttsInstructions?.trim();
  if (profile.settings.ttsModel === "mimo-v2.5-tts-voicedesign") {
    return custom || "A clear, warm, patient English teacher voice. Natural and human-like, slightly slow, with precise pronunciation.";
  }
  const tone = profile.settings.ttsTone ? `Use a ${profile.settings.ttsTone} style.` : "Use a natural and clear style.";
  const speed = Number(profile.settings.ttsSpeed || 1);
  const speedText = speed < 0.95 ? "Speak slightly slower." : speed > 1.05 ? "Speak slightly faster." : "Keep a steady teaching pace.";
  return [tone, speedText, custom].filter(Boolean).join(" ");
}

function findAudioPayload(data) {
  const candidates = [];
  walkAudioPayload(data, candidates);
  return candidates.find(Boolean) || "";
}

function walkAudioPayload(value, candidates) {
  if (!value || candidates.length > 0) return;
  if (typeof value === "string") {
    if (/^data:audio\/[^;]+;base64,/i.test(value) || /^[A-Za-z0-9+/=]{120,}$/.test(value)) {
      candidates.push(value);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => walkAudioPayload(item, candidates));
    return;
  }
  if (typeof value === "object") {
    [
      "audio",
      "audio_data",
      "audioData",
      "data",
      "b64_json",
      "base64",
      "url",
      "content"
    ].forEach((key) => walkAudioPayload(value[key], candidates));
    Object.values(value).forEach((item) => walkAudioPayload(item, candidates));
  }
}

function base64ToAudioBlob(value) {
  const clean = value.includes(",") ? value.split(",").pop() : value;
  const mime = value.match(/^data:([^;]+)/)?.[1] || "audio/mpeg";
  const bytes = Uint8Array.from(atob(clean), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

async function playAudioBlob(blob) {
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
  const learned = Object.values(profile.learnedWords || {}).sort((a, b) => (b.reviewedAt || b.learnedAt || 0) - (a.reviewedAt || a.learnedAt || 0));
  if (elements.learnedList) {
    elements.learnedList.innerHTML = learned.length
      ? learned.slice(0, 80).map((item) => `
        <div class="word-item">
          <div><strong>${item.word}</strong><br><span>${item.translation} · 已记 ${item.count || 1} 次</span></div>
          <button class="ghost-button" data-review-learned="${item.word}" type="button">复习</button>
        </div>
      `).join("")
      : `<p class="empty">完成“看中文写英文”后，背过的词会进入这里。</p>`;
  }
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
    learnedWords: Object.keys(profile.learnedWords || {}).length,
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

function clampStat(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function petSay(message) {
  if (!elements.petBubble) return;
  elements.petBubble.textContent = message;
}

function renderPet() {
  if (!elements.deskPet || !profile.pet) return;
  const pet = profile.pet;
  const maxExp = pet.level * 30;
  elements.deskPet.classList.toggle("collapsed", !!pet.collapsed);
  elements.petName.textContent = pet.name || "青柚";
  elements.petHealthBar.style.width = `${pet.health}%`;
  elements.petMoodBar.style.width = `${pet.mood}%`;
  elements.petEnergyBar.style.width = `${Math.min(100, pet.energy)}%`;
  elements.petHealthText.textContent = pet.health;
  elements.petMoodText.textContent = pet.mood;
  elements.petEnergyText.textContent = pet.energy;
  elements.petEnergyWallet.textContent = `${pet.energy} 精力`;
  elements.petLevelText.textContent = `Lv.${pet.level}`;
  elements.petExpText.textContent = `${pet.exp}/${maxExp}`;
  renderPetShop();
  renderPetActions();
  applyPetLook();
  const low = Math.min(pet.health, pet.mood) < 35;
  elements.petAvatar.classList.toggle("low", low);
  elements.petAvatar.classList.toggle("sleeping", !!pet.sleeping);
  if (pet.sleeping) {
    elements.petFace.textContent = "－ᴗ－";
    elements.petMoodLabel.textContent = "小睡恢复中";
  } else if (low) {
    elements.petFace.textContent = "•︵•";
    elements.petMoodLabel.textContent = "需要背词恢复";
  } else if (pet.mood > 82) {
    elements.petFace.textContent = "＾ᴗ＾";
    elements.petMoodLabel.textContent = "学习状态很好";
  } else {
    elements.petFace.textContent = "•ᴗ•";
    elements.petMoodLabel.textContent = "陪你练习中";
  }
  if (pet.x != null && pet.y != null) {
    const petWidth = elements.deskPet.offsetWidth || 220;
    const petHeight = elements.deskPet.offsetHeight || 360;
    const x = Math.max(8, Math.min(window.innerWidth - petWidth - 8, pet.x));
    const y = Math.max(8, Math.min(window.innerHeight - petHeight - 8, pet.y));
    profile.pet.x = Math.round(x);
    profile.pet.y = Math.round(y);
    elements.deskPet.style.left = `${x}px`;
    elements.deskPet.style.top = `${y}px`;
    elements.deskPet.style.right = "auto";
    elements.deskPet.style.bottom = "auto";
  }
}

function getPetOutfitItem(type, id) {
  const tab = petShopTabs.find((item) => item.id === type);
  return tab?.items.find((item) => item.id === id) || tab?.items[0];
}

function getActivePetSuit() {
  const suitId = petPreview?.suit || profile.pet?.suit || "study";
  return petSuits.find((item) => item.id === suitId) || petSuits[0];
}

function stopPetFrameSequence(resetImage = true) {
  if (petFrameTimer) window.clearInterval(petFrameTimer);
  if (petFrameResetTimer) window.clearTimeout(petFrameResetTimer);
  petFrameTimer = null;
  petFrameResetTimer = null;
  petFrameToken += 1;
  elements.petAvatar?.classList.remove("frame-playing");
  if (resetImage && elements.petCharacter) {
    const suit = getActivePetSuit();
    elements.petCharacter.src = suit.image;
    elements.petCharacter.alt = suit.name;
  }
}

function playPetFrameSequence(motion, duration = 1200) {
  if (elements.petLive2d) return;
  const frameCount = petActionFrameCounts[motion];
  if (!frameCount || !elements.petCharacter) return;
  stopPetFrameSequence(false);
  const token = ++petFrameToken;
  let frameIndex = 0;
  const interval = Math.max(55, Math.round(duration / frameCount));
  const setFrame = () => {
    if (token !== petFrameToken) return;
    const frame = String(frameIndex).padStart(2, "0");
    elements.petCharacter.src = `assets/pets/actions/${motion}/${frame}.webp`;
    frameIndex = (frameIndex + 1) % frameCount;
  };
  elements.petAvatar?.classList.add("frame-playing");
  setFrame();
  petFrameTimer = window.setInterval(setFrame, interval);
  petFrameResetTimer = window.setTimeout(() => {
    if (token === petFrameToken) stopPetFrameSequence(true);
  }, duration + 80);
}

function applyPetLook() {
  const preview = petPreview || {};
  const outfit = { ...(profile.pet.outfit || {}), ...(preview.outfit || {}) };
  const suit = getActivePetSuit();
  const skinId = preview.skin || profile.pet.skin;
  const skin = petSkins.find((item) => item.id === skinId) || petSkins[0];
  stopPetFrameSequence(false);
  elements.petAvatar.className = `pet-avatar has-art ${skin.className}`;
  elements.petAvatar.dataset.suit = suit.id;
  elements.petAvatar.dataset.skinLabel = skin.label;
  if (elements.petCharacter) {
    elements.petCharacter.src = suit.image;
    elements.petCharacter.alt = suit.name;
  }
  [
    ["upper", elements.petUpperLayer],
    ["lower", elements.petLowerLayer],
    ["socks", elements.petSocksLayer],
    ["shoes", elements.petShoesLayer]
  ].forEach(([type, node]) => {
    if (!node) return;
    const item = getPetOutfitItem(type, outfit[type]);
    node.className = `pet-outfit ${type} ${item?.className || ""}`;
  });
}

function renderPetShop() {
  if (!elements.petSkinGrid) return;
  const activeTab = petShopTabs.find((tab) => tab.id === activePetShopTab) || petShopTabs[0];
  const activeId = activeTab.id === "suit" ? profile.pet.suit : activeTab.id === "skin" ? profile.pet.skin : profile.pet.outfit?.[activeTab.id];
  const ownedKey = activeTab.id === "suit"
    ? (profile.pet.suitsOwned || ["study"]).join(",")
    : activeTab.id === "skin"
    ? (profile.pet.skinsOwned || ["default"]).join(",")
    : (profile.pet.outfitsOwned?.[activeTab.id] || []).join(",");
  const nextRenderKey = [
    activeTab.id,
    activeId || "",
    ownedKey,
    JSON.stringify(petPreview || {})
  ].join("|");
  if (nextRenderKey === petShopRenderKey) return;
  petShopRenderKey = nextRenderKey;
  if (elements.petShopTabs) {
    elements.petShopTabs.innerHTML = petShopTabs.map((tab) => `
      <button type="button" class="${tab.id === activeTab.id ? "active" : ""}" data-pet-shop-tab="${tab.id}">${tab.label}</button>
    `).join("");
  }
  if (elements.petShopHint) {
    elements.petShopHint.textContent = "左键解锁/穿戴，右键预览。套装会直接更换角色立绘。";
  }
  const owned = activeTab.id === "suit"
    ? new Set(profile.pet.suitsOwned || ["study"])
    : activeTab.id === "skin"
    ? new Set(profile.pet.skinsOwned || ["default"])
    : new Set(profile.pet.outfitsOwned?.[activeTab.id] || []);
  elements.petSkinGrid.innerHTML = activeTab.items.map((item) => {
    const isOwned = owned.has(item.id);
    const active = activeId === item.id;
    const previewing = activeTab.id === "suit" ? petPreview?.suit === item.id : activeTab.id === "skin" ? petPreview?.skin === item.id : petPreview?.outfit?.[activeTab.id] === item.id;
    const action = active ? "使用中" : isOwned ? "换上" : `${item.price} 精力`;
    const previewClass = activeTab.id === "suit" ? "suit-preview" : activeTab.id === "skin" ? "skin-preview" : `outfit-preview ${activeTab.id}`;
    const style = activeTab.id === "suit" ? ` style="--suit-image: url('${item.image}')"` : "";
    return `
      <button class="skin-card ${active ? "active" : ""} ${previewing ? "previewing" : ""}" type="button" data-shop-type="${activeTab.id}" data-shop-id="${item.id}">
        <span class="${previewClass} ${item.className || ""}" data-skin-label="${item.label}"${style}></span>
        <strong>${item.name}</strong>
        <em>${action}</em>
      </button>
    `;
  }).join("");
}

function renderPetActions() {
  if (!elements.petActionGrid) return;
  if (petActionsRendered) return;
  petActionsRendered = true;
  elements.petActionGrid.innerHTML = petActionDefs.map((action) => `
    <button type="button" data-pet-action="${action.id}" data-motion="${action.motion || action.id}" title="${escapeHtml(action.message || action.label)}">
      <span class="action-preview" data-motion="${action.motion || action.id}">
        <i class="mini-head"></i>
        <i class="mini-body"></i>
        <i class="mini-arm left"></i>
        <i class="mini-arm right"></i>
      </span>
      <strong>${action.label}</strong>
      <em>${petActionHints[action.id] || "点击触发"}</em>
    </button>
  `).join("");
}

function renderPetMotionEffects(definition) {
  if (!elements.petMotionLayer) return;
  const effects = definition.effects?.length ? definition.effects : [definition.icon || ""];
  const slots = Array.from({ length: 8 }, (_, index) => effects[index % effects.length] || "");
  elements.petMotionLayer.innerHTML = slots.map((effect, index) => `<i style="--i:${index}">${escapeHtml(effect)}</i>`).join("");
}

function unlockOrEquipPetItem(type, itemId) {
  if (type === "suit") return choosePetSuit(itemId);
  if (type === "skin") return choosePetSkin(itemId);
  const tab = petShopTabs.find((item) => item.id === type);
  const item = tab?.items.find((entry) => entry.id === itemId);
  if (!item) return;
  profile.pet.outfit ||= {};
  profile.pet.outfitsOwned ||= {};
  profile.pet.outfitsOwned[type] ||= [];
  const owned = profile.pet.outfitsOwned[type].includes(itemId);
  if (!owned) {
    if (profile.pet.energy < item.price) {
      petSay(`还差 ${item.price - profile.pet.energy} 精力，背几个词再来解锁。`);
      return;
    }
    profile.pet.energy = Math.max(0, Math.round(profile.pet.energy - item.price));
    profile.pet.outfitsOwned[type].push(itemId);
    petSay(`解锁了 ${item.name}。`);
  } else {
    petSay(`换上 ${item.name}。`);
  }
  profile.pet.outfit[type] = itemId;
  clearPetPreview();
  renderPet();
  saveState();
}

function previewPetItem(type, itemId) {
  if (petPreviewTimer) clearTimeout(petPreviewTimer);
  petPreview = type === "suit"
    ? { suit: itemId, outfit: {} }
    : type === "skin"
    ? { skin: itemId, outfit: {} }
    : { outfit: { [type]: itemId } };
  const tab = petShopTabs.find((item) => item.id === type);
  const item = tab?.items.find((entry) => entry.id === itemId);
  if (type === "skin" || type === "suit") {
    document.body.className = `theme-${item?.theme || profile.theme || "light"}`;
  }
  petSay(`预览 ${item?.name || "装扮"}，5 秒后自动恢复。`);
  renderPet();
  petPreviewTimer = setTimeout(clearPetPreview, 5000);
}

function clearPetPreview() {
  if (petPreviewTimer) clearTimeout(petPreviewTimer);
  petPreviewTimer = null;
  petPreview = null;
  renderProfile();
}

function choosePetSkin(skinId) {
  const skin = petSkins.find((item) => item.id === skinId);
  if (!skin) return;
  profile.pet.skinsOwned ||= ["default"];
  const owned = profile.pet.skinsOwned.includes(skinId);
  if (!owned) {
    if (profile.pet.energy < skin.price) {
      petSay(`还差 ${skin.price - profile.pet.energy} 精力，背几个词再来解锁。`);
      return;
    }
    profile.pet.energy = Math.max(0, Math.round(profile.pet.energy - skin.price));
    profile.pet.skinsOwned.push(skinId);
    petSay(`解锁了 ${skin.name}。`);
  } else {
    petSay(`换上 ${skin.name}。`);
  }
  profile.pet.skin = skinId;
  profile.theme = skin.theme || profile.theme;
  if (elements.themeSetting) elements.themeSetting.value = profile.theme;
  clearPetPreview();
  renderPet();
  saveState();
}

function choosePetSuit(suitId) {
  const suit = petSuits.find((item) => item.id === suitId);
  if (!suit) return;
  profile.pet.suitsOwned ||= ["study"];
  const owned = profile.pet.suitsOwned.includes(suitId);
  if (!owned) {
    if (profile.pet.energy < suit.price) {
      petSay(`还差 ${suit.price - profile.pet.energy} 精力，背几个词再来解锁。`);
      return;
    }
    profile.pet.energy = Math.max(0, Math.round(profile.pet.energy - suit.price));
    profile.pet.suitsOwned.push(suitId);
    petSay(`解锁了 ${suit.name}。`);
  } else {
    petSay(`换上 ${suit.name}。`);
  }
  profile.pet.suit = suitId;
  profile.theme = suit.theme || profile.theme;
  if (elements.themeSetting) elements.themeSetting.value = profile.theme;
  clearPetPreview();
  triggerPetAction("change", `青柚换上了 ${suit.name}。`, { mood: 4 });
  saveState();
}

function updatePet(delta, message = "") {
  const pet = profile.pet;
  pet.health = clampStat(pet.health + (delta.health || 0));
  pet.mood = clampStat(pet.mood + (delta.mood || 0));
  pet.energy = Math.max(0, Math.round(pet.energy + (delta.energy || 0)));
  pet.exp = Math.max(0, pet.exp + (delta.exp || 0));
  while (pet.exp >= pet.level * 30) {
    pet.exp -= pet.level * 30;
    pet.level += 1;
    message = `升级到 Lv.${pet.level}，今天的记忆很稳。`;
  }
  pet.lastCare = Date.now();
  if (message) petSay(message);
  renderPet();
  saveState();
}

function triggerPetAction(actionId, message = "", delta = {}) {
  const definition = petActionDefs.find((item) => item.id === actionId) || { id: actionId, motion: actionId, icon: "", message, delta };
  const motion = definition.motion || definition.id;
  if (motion !== "sleep") profile.pet.sleeping = false;
  updatePet({ ...(definition.delta || {}), ...delta }, message || definition.message || "");
  renderPetMotionEffects(definition);
  if (elements.petAvatar) {
    const actionClasses = petActionDefs.map((item) => `action-${item.motion || item.id}`).concat(["action-pat", "action-play", "action-focus", "action-change", "actioning"]);
    elements.petAvatar.classList.remove(...new Set(actionClasses));
    elements.petAvatar.dataset.motion = motion;
    elements.petAvatar.dataset.effect = definition.icon || "";
    void elements.petAvatar.offsetWidth;
    elements.petAvatar.classList.add("actioning", `action-${motion}`);
    playPetFrameSequence(motion, definition.duration || 1200);
    window.setTimeout(() => {
      elements.petAvatar?.classList.remove("actioning", `action-${motion}`);
      if (elements.petAvatar) {
        elements.petAvatar.dataset.effect = "";
        elements.petAvatar.dataset.motion = "";
      }
      if (elements.petMotionLayer) elements.petMotionLayer.innerHTML = "";
    }, definition.duration || 1200);
  }
}

function randomPetIdleTalk() {
  if (!profile?.pet || profile.pet.collapsed || profile.pet.sleeping) return;
  const lines = [
    "我在旁边陪练，背完一个词就给你加 1 精力。",
    "今天可以先冲一个小目标，不用一次背太多。",
    "要不要换套装？精力够了就可以解锁。",
    "手感卡住的时候，慢一点反而更稳。"
  ];
  petSay(lines[Math.floor(Math.random() * lines.length)]);
}

function rewardPetForWord(word) {
  profile.pet.sleeping = false;
  triggerPetAction("celebrate", `记住 ${word} 了，我恢复了一点状态，也获得了 1 精力。`, {
    health: 6,
    mood: 4,
    energy: 1,
    exp: 5
  });
  return;
}

function nudgePetForMistake() {
  triggerPetAction("confused");
}

function decayPet() {
  const pet = profile.pet;
  const elapsedMinutes = Math.floor((Date.now() - (pet.lastCare || Date.now())) / 60000);
  if (elapsedMinutes < 8) return;
  pet.health = clampStat(pet.health - Math.min(8, Math.floor(elapsedMinutes / 8)));
  pet.mood = clampStat(pet.mood - Math.min(10, Math.floor(elapsedMinutes / 6)));
  pet.lastCare = Date.now();
  petSay("有点没精神，背一个词就能恢复。");
  renderPet();
  saveState();
}

function bindPetDrag() {
  let start = null;
  const handle = elements.petCard;
  if (!handle) return;
  handle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, input, select, summary")) return;
    const rect = elements.deskPet.getBoundingClientRect();
    start = {
      pointerId: event.pointerId,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top
    };
    elements.deskPet.classList.add("dragging");
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener("pointermove", (event) => {
    if (!start || event.pointerId !== start.pointerId) return;
    const width = elements.deskPet.offsetWidth;
    const height = elements.deskPet.offsetHeight;
    const x = Math.max(8, Math.min(window.innerWidth - width - 8, event.clientX - start.dx));
    const y = Math.max(8, Math.min(window.innerHeight - height - 8, event.clientY - start.dy));
    elements.deskPet.style.left = `${x}px`;
    elements.deskPet.style.top = `${y}px`;
    elements.deskPet.style.right = "auto";
    elements.deskPet.style.bottom = "auto";
  });
  handle.addEventListener("pointerup", (event) => {
    if (!start || event.pointerId !== start.pointerId) return;
    const rect = elements.deskPet.getBoundingClientRect();
    profile.pet.x = Math.round(rect.left);
    profile.pet.y = Math.round(rect.top);
    saveState();
    elements.deskPet.classList.remove("dragging");
    start = null;
  });
}

function bindPetPanels() {
  $$(".pet-action-panel, .pet-shop").forEach((panel) => {
    panel.addEventListener("toggle", () => {
      if (!panel.open || !elements.petCard) return;
      window.requestAnimationFrame(() => {
        elements.petCard.scrollTo({
          top: Math.max(0, panel.offsetTop - 10),
          behavior: "smooth"
        });
      });
    });
  });
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
  updateTrainingButtons();
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
  if (!target) return;
  target.classList.add("active");
  elements.viewTitle.textContent = target.dataset.title;
  if (id === "dashboard") renderDashboard();
  if (id === "review") renderReview();
  if (id === "library") {
    renderDataPreview();
    renderCatalog();
  }
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
  elements.pauseButton?.addEventListener("click", pausePractice);
  elements.stopButton?.addEventListener("click", stopPractice);
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
    profile.settings.ttsTone = elements.ttsToneSetting.value;
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
    renderTtsOptions();
    if (elements.ttsProviderSetting.value === "openai" && !elements.ttsBaseUrlSetting.value) {
      elements.ttsBaseUrlSetting.value = "https://api.openai.com/v1";
    }
    if (elements.ttsProviderSetting.value === "mimo") {
      elements.ttsBaseUrlSetting.value = elements.ttsBaseUrlSetting.value || "https://api.xiaomimimo.com/v1";
      elements.ttsModelSetting.value = "mimo-v2.5-tts";
    }
  });

  elements.aiPanelToggle.addEventListener("click", () => {
    const isOpen = elements.aiPanelBody.classList.toggle("open");
    elements.aiPanelChevron.textContent = isOpen ? "-" : "+";
    if (isOpen) renderAiContextPreview();
  });

  elements.aiAnalyzeButton.addEventListener("click", () => analyzeWithAi());
  elements.aiAskButton.addEventListener("click", () => {
    const question = elements.aiQuestion.value.trim();
    analyzeWithAi(question);
  });

  elements.petMinimizeButton.addEventListener("click", () => {
    profile.pet.collapsed = true;
    saveState();
    renderPet();
  });
  elements.petDockButton.addEventListener("click", () => {
    profile.pet.collapsed = false;
    saveState();
    renderPet();
  });
  elements.petAvatar.addEventListener("click", () => triggerPetAction("happy", "摸摸有效，青柚精神了一点。", { mood: 6 }));
  elements.petFeedButton.addEventListener("click", () => triggerPetAction("eat"));
  elements.petPlayButton.addEventListener("click", () => triggerPetAction("cheer"));
  elements.petWaveButton?.addEventListener("click", () => triggerPetAction("wave"));
  elements.petFocusButton?.addEventListener("click", () => triggerPetAction("study"));
  elements.petSleepButton.addEventListener("click", () => {
    profile.pet.sleeping = !profile.pet.sleeping;
    if (profile.pet.sleeping) {
      const now = Date.now();
      const canRecover = now - (profile.pet.lastNapAt || 0) > 30 * 60 * 1000;
      if (canRecover) profile.pet.lastNapAt = now;
      updatePet(canRecover ? { energy: 5, mood: 2 } : { mood: 1 }, canRecover ? "小睡恢复了 5 精力，背词时会醒来。" : "刚刚睡过啦，休息一会再恢复精力。");
    } else {
      updatePet({ energy: 0 }, "醒了，继续陪你练。");
    }
  });
  elements.petSkinGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-shop-id]");
    if (card) unlockOrEquipPetItem(card.dataset.shopType, card.dataset.shopId);
  });
  elements.petSkinGrid.addEventListener("contextmenu", (event) => {
    const card = event.target.closest("[data-shop-id]");
    if (!card) return;
    event.preventDefault();
    previewPetItem(card.dataset.shopType, card.dataset.shopId);
  });
  elements.petShopTabs?.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-pet-shop-tab]")?.dataset.petShopTab;
    if (!tab) return;
    activePetShopTab = tab;
    clearPetPreview();
    renderPetShop();
  });
  elements.petActionGrid?.addEventListener("click", (event) => {
    const actionId = event.target.closest("[data-pet-action]")?.dataset.petAction;
    if (actionId) triggerPetAction(actionId);
  });
  bindPetPanels();
  bindPetDrag();
  setInterval(decayPet, 60000);
  setInterval(randomPetIdleTalk, 45000);

  elements.themeButton.addEventListener("click", () => {
    profile.theme = themeOrder[(themeOrder.indexOf(profile.theme) + 1) % themeOrder.length] || "light";
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
    startPractice(words, { review: true, forceRecall: true });
  });

  elements.practiceFavsButton.addEventListener("click", () => {
    setView("practice");
    startPractice(profile.favorites, { review: true, forceRecall: true });
  });

  elements.practiceLearnedButton?.addEventListener("click", () => {
    const words = Object.values(profile.learnedWords || {}).map(normalizeWord);
    setView("practice");
    startPractice(words, { review: true, forceRecall: true });
  });

  elements.dictSearch.addEventListener("input", renderCatalog);
  elements.categoryFilter.addEventListener("change", renderCatalog);

  document.addEventListener("click", (event) => {
    const mistake = event.target.dataset.removeMistake;
    const fav = event.target.dataset.removeFav;
    const reviewLearned = event.target.dataset.reviewLearned;
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
    if (reviewLearned) {
      const item = profile.learnedWords?.[reviewLearned];
      if (item) {
        setView("practice");
        startPractice([item], { review: true, forceRecall: true });
      }
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
