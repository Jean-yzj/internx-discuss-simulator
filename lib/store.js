/**
 * In-memory simulator backend.
 *
 * No database, no Firebase, no shared infrastructure with the main InternX
 * platform. State lives in this module's scope on the Node server. The
 * simulator is intentionally ephemeral — restarting the container resets
 * the state to the seeded sample data.
 */

export const INDUSTRIES = [
    {
        id: "finance",
        label: "金融業",
        emoji: "💰",
        accent: "#1e3a8a",
        description: "投行、私募、商銀、保險、資產管理 — 嚴謹、節奏快、重結果。",
    },
    {
        id: "consulting",
        label: "管顧業",
        emoji: "📊",
        accent: "#7c3aed",
        description: "策略顧問、營運顧問、人資顧問 — Case、簡報、跨產業問題解法。",
    },
    {
        id: "tech",
        label: "科技業",
        emoji: "💻",
        accent: "#0891b2",
        description: "軟體、硬體、半導體、SaaS、AI — 工程、PM、設計三條主路徑。",
    },
    {
        id: "civil",
        label: "公職",
        emoji: "🏛️",
        accent: "#475569",
        description: "警政、行政、司法體系 — 穩定路徑、制度文化、準備策略。",
    },
    {
        id: "marketing",
        label: "行銷／廣告",
        emoji: "🎯",
        accent: "#f97316",
        description: "品牌、廣告代理、Performance、KOL、PR — 創意 + 數據。",
    },
    {
        id: "fmcg",
        label: "消費品 (FMCG)",
        emoji: "🛒",
        accent: "#16a34a",
        description: "P&G、Unilever、聯合利華、零售、餐飲 — 通路 + 品牌雙線。",
    },
    {
        id: "media",
        label: "媒體／內容",
        emoji: "🎬",
        accent: "#db2777",
        description: "新聞、社群媒體、podcast、影音平台 — 寫作、企劃、製作。",
    },
    {
        id: "biotech",
        label: "醫療／生技",
        emoji: "🧬",
        accent: "#0d9488",
        description: "製藥、醫材、CRO、digital health — 證照、研發、註冊。",
    },
    {
        id: "manufacturing",
        label: "製造業",
        emoji: "🏭",
        accent: "#6b7280",
        description: "傳產、半導體製造、汽車、能源 — 工廠端、PM、品保。",
    },
];

export const CATEGORIES = [
    { id: "all", label: "全部", emoji: "✨" },
    { id: "career", label: "職涯選擇", emoji: "🧭" },
    { id: "internship", label: "實習", emoji: "💼" },
    { id: "interview", label: "面試", emoji: "🎯" },
    { id: "skill", label: "技能學習", emoji: "📚" },
    { id: "salary", label: "薪資", emoji: "💰" },
    { id: "campus", label: "校園生活", emoji: "🎓" },
    { id: "side", label: "副業合作", emoji: "🤝" },
];

const RESPONDER_NAMES = ["其他同學", "學長 K", "學姐 M", "走過的人", "前實習生", "在職中", "剛 offer"];

// Seed data — each industry gets several topics so the forum feels alive
// when a student picks it.
const SEED_TOPICS = [
    // ── 金融業 ──────────────────────────────────────────────────
    {
        industry: "finance",
        category: "interview",
        title: "投行 SA 面試：brain teaser 跟 mental math 怎麼準備？",
        description: "拿到了 BB 投行的 SA OA 通過信，下一關是 phone interview，聽說會被問 brain teaser 跟心算速度題。求救！",
        authorName: "投行夢想家",
        replies: [
            "Heard on the Street + Wall Street Oasis 的 brain teaser pack 刷一遍就夠了。",
            "Mental math 我自己每天通勤練 Mental Math Trainer App，三週上手 12s 內 3 位數乘法。",
            "Brain teaser 重點不是答對，是讓對方看到你怎麼拆解問題。出聲想最重要。",
        ],
    },
    {
        industry: "finance",
        category: "career",
        title: "Sell-side vs Buy-side，新鮮人該怎麼選？",
        description: "兩邊都有 offer，sell-side 投行 vs buy-side hedge fund analyst。學長都說先 sell-side，但 buy-side 給的多 30%⋯",
        authorName: "兩家都不錯",
        replies: [
            "Sell-side 練的是節奏跟人脈，buy-side 練的是 view。第一份建議 sell-side，三年後想 jump 比較容易。",
            "我反例：buy-side 直接做就直接做了，唯一差別是學習曲線比較陡。看你個性。",
            "Hedge fund 的話 churn 很嚴重，要看 fund 規模跟導師。",
        ],
    },
    {
        industry: "finance",
        category: "salary",
        title: "外商投行台灣分行 SA 行情大概多少？",
        description: "聽說香港版本是 USD 80k base，台北會打折嗎？",
        authorName: "問薪水的",
        replies: [
            "TWD 60-80k 月薪 + sign-on 30-100k 看公司。Bonus 部分要看年終，去年 30-50% 之間。",
            "別只看 base，外商投行的 perk（早餐、Uber、加班 dinner 補助）算一算其實滿多的。",
        ],
    },

    // ── 管顧業 ──────────────────────────────────────────────────
    {
        industry: "consulting",
        category: "interview",
        title: "Case interview 練多久才會過 MBB？",
        description: "兼職做 case partner 一個月了，還是常常 case 結構亂掉。MBB 的 final 大概是什麼水準？",
        authorName: "Case 練不完",
        replies: [
            "我自己練了 80+ cases 才比較穩，重點不是做完幾題，是「為什麼這題我這樣切」。",
            "MBB final 看的是 polished + 跟 partner 互動的 chemistry，不是純解題能力。",
            "建議找已經拿 offer 的人 mock 至少 5 次，回饋會超有用。",
        ],
    },
    {
        industry: "consulting",
        category: "career",
        title: "從 BCG 跳出來 vs 留下做 PM，三年後差多少？",
        description: "Associate 第三年了，partner 路徑還很長，外面 ex-consultant PM 的 path 看起來很誘人⋯⋯",
        authorName: "升遷焦慮中",
        replies: [
            "Tech PM 的 cap 比 partner 低，但 work-life balance 好太多。看你想要什麼。",
            "如果你有真的喜歡的產品方向，跳。如果只是 burnout，先休假再決定。",
        ],
    },
    {
        industry: "consulting",
        category: "skill",
        title: "PPT 美化在管顧業真的這麼重要？",
        description: "聽說 BCG / McKinsey 內部會審 deck 到字距，這對 working analyst 真的這麼重要嗎？",
        authorName: "Deck 苦手",
        replies: [
            "重要程度：5/5。客戶 perceive 的就是 deck，內容再強亂排都白費。",
            "推薦 think-cell + 他們公司內部的 ghost deck 練習。",
        ],
    },

    // ── 科技業 ──────────────────────────────────────────────────
    {
        industry: "tech",
        category: "interview",
        title: "FAANG SDE intern leetcode 大概要刷到哪？",
        description: "目標明年暑假 Meta / Google intern。現在刷了 80 題 medium，還有什麼策略可以分享？",
        authorName: "leetcode 中",
        replies: [
            "Blind 75 + Top Interview 150 跑兩輪，再針對你弱的 topic 刷 50 題就差不多了。",
            "重點不是刷量，是「看到題目能在 30s 內判斷類型」。 mock interview 比刷題重要。",
            "我大三 100 題拿 Google offer。重點是 system design + behavioral，純 LC 反而不是瓶頸。",
        ],
    },
    {
        industry: "tech",
        category: "career",
        title: "做 SaaS 新創還是去 FAANG 第一份工作？",
        description: "Series B SaaS 給 SWE 1.6x base + meaningful equity。FAANG 給 standard package。我才大四⋯⋯",
        authorName: "猶豫中的 SWE",
        replies: [
            "FAANG 的價值不只是薪水，是 brand + scale 經驗。這個在台灣很值錢。",
            "新創的 equity 99% 會歸零，不要把它算進薪水。看純現金 vs 履歷。",
            "兩個都跑過：新創成長 3x 快，FAANG 學的東西更系統化。看你目前缺什麼。",
        ],
    },
    {
        industry: "tech",
        category: "skill",
        title: "想做 AI / ML 工程師，學歷需要碩士嗎？",
        description: "在台 CS 大三，想往 ML engineer 方向走。看 JD 都寫 MS preferred⋯⋯非碩士機會多嗎？",
        authorName: "想做 ML 的",
        replies: [
            "Applied ML（產品端）大學就夠，Research ML（model 設計）建議碩士。",
            "與其拼學歷，不如做 2-3 個 GitHub 公開的 ML side project + 寫 blog。",
            "我朋友大學畢業直接去 OpenAI，但他是 IOI 等級⋯⋯路徑因人而異。",
        ],
    },

    // ── 行銷／廣告 ──────────────────────────────────────────────
    {
        industry: "marketing",
        category: "internship",
        title: "4A 廣告代理商實習真的會被當廉價勞工嗎？",
        description: "拿到 Ogilvy 暑期實習，學長警告會做不完的雜事。能學到東西嗎？",
        authorName: "想去 4A",
        replies: [
            "看你跟到的 AD / GP，遇到好導師超級值。遇到雷的話真的就是端便當。",
            "我在奧美實習過：早上做 brief 整理，下午跟 pitch，晚上幫 producer 對 deck。學到超多。",
            "重點是進去就主動要事情做，不要等。",
        ],
    },
    {
        industry: "marketing",
        category: "career",
        title: "甲方 (品牌商) vs 乙方 (代理商)，第一份要怎麼選？",
        description: "兩邊 offer 都到了，甲方品牌端薪水高 20%，乙方代理商給的 title 比較高⋯⋯",
        authorName: "甲乙難",
        replies: [
            "乙方學「速度跟多樣性」，甲方學「規模化跟 P&L」。我建議先乙方再甲方。",
            "如果你 future goal 是 brand manager，直接甲方。",
            "考慮一下「你想跟誰共事 5 天 8 小時」這件事，文化超重要。",
        ],
    },
    {
        industry: "marketing",
        category: "skill",
        title: "想做 Performance Marketing，要先學什麼工具？",
        description: "聽說 Meta Ads / Google Ads / GA4 / Looker Studio 都要會，但學校沒教⋯⋯",
        authorName: "Perf 新手",
        replies: [
            "順序：Meta Ads Blueprint → Google Skillshop → GA4 demo account 玩一輪。三個月可以上手。",
            "找小朋友、社團幫他們投廣告，1k 預算就能練到很多。實戰最快。",
        ],
    },

    // ── 消費品 (FMCG) ──────────────────────────────────────────
    {
        industry: "fmcg",
        category: "career",
        title: "P&G CMK vs Unilever UFLP，怎麼選？",
        description: "都是 management trainee，rotation 設計差很多。CMK 偏 marketing research，UFLP 是 cross-functional。",
        authorName: "MT 兩家都過",
        replies: [
            "P&G 的訓練系統 + brand mgmt rep，履歷是 gold standard。",
            "Unilever 的 rotation 比較廣，culture 比較鬆，看你要 depth 還是 breadth。",
            "兩家都待過：P&G 是黃埔軍校，Unilever 比較像歐洲人的人生。",
        ],
    },
    {
        industry: "fmcg",
        category: "interview",
        title: "FMCG MT case interview 跟管顧業差很多嗎？",
        description: "都叫 case interview，但聽說 FMCG 的更聚焦在通路、定價、消費者洞察⋯⋯",
        authorName: "MT 面試準備中",
        replies: [
            "FMCG case 重點 = 4P（product/price/place/promotion） + consumer insight。比管顧業具象。",
            "建議讀 P&G case study 經典案例，模仿他們的 marketing approach。",
            "面試官常常會用真實品牌資料當題目，事先做點 desk research 加分。",
        ],
    },

    // ── 媒體／內容 ──────────────────────────────────────────────
    {
        industry: "media",
        category: "career",
        title: "新聞媒體實習：傳統媒體 vs 數位 native？",
        description: "聯合報 vs 報導者 vs 端傳媒 vs 換日線都拿到 offer，傳統媒體 vs 數位 native 該怎麼想？",
        authorName: "新聞夢",
        replies: [
            "傳統媒體學「編採紀律」，數位 native 學「敘事 + 受眾經營」。各有所長。",
            "我自己傳統媒體跑了一年，學到流程；後來去數位 native 學長文寫作 + SEO，組合拳很值得。",
        ],
    },
    {
        industry: "media",
        category: "side",
        title: "想經營一個 podcast，從 0 到 1 要先做什麼？",
        description: "想做職涯主題 podcast，但聽說發到 100 集才會有觀眾⋯⋯有沒有過來人分享？",
        authorName: "想開 pod",
        replies: [
            "前 30 集是練手，重點是固定每週發 + 內容 niche 一點。後面才有 compound effect。",
            "工具：Riverside / SquadCast 錄音，Descript 剪輯，Spotify for Podcasters 上架。",
            "找 5 個朋友當第一批聽眾 + 給回饋，比衝量重要。",
        ],
    },

    // ── 醫療／生技 ──────────────────────────────────────────────
    {
        industry: "biotech",
        category: "career",
        title: "藥廠 vs 醫材公司，職涯路徑差很多嗎？",
        description: "畢業是要去傳產的藥廠 (Pfizer / Roche)，還是醫材新創 (Medtronic / 本土醫材)？",
        authorName: "生技畢業生",
        replies: [
            "藥廠註冊路徑 longer 但更系統化，醫材 cycle 短、跨領域多。看你想做研發、註冊還是商業端。",
            "醫材新創的 equity 有機會，但藥廠的 pension 跟 perk 比較香。",
        ],
    },
    {
        industry: "biotech",
        category: "interview",
        title: "MR (醫藥代表) 的面試會問什麼？",
        description: "非醫學背景但對 MR 有興趣，面試重點是什麼？",
        authorName: "想當 MR",
        replies: [
            "Behavioral + 情境題：「醫師說我們的藥沒效時你怎麼回？」最常被問。",
            "事先讀 5 篇藥廠的 medical info paper，面試會展現你的學習意願。",
        ],
    },

    // ── 製造業 ──────────────────────────────────────────────────
    {
        industry: "manufacturing",
        category: "career",
        title: "台積電 vs 聯發科 vs 外商半導體，第一份工作怎麼選？",
        description: "電機所應屆，三家 offer 都拿到。台積電穩定，聯發科 culture 好，外商 work-life 強⋯",
        authorName: "三家都過",
        replies: [
            "台積電 = 系統化訓練 + 履歷金漆，但壓力大。聯發科 = 平衡，但成長要看 BU。",
            "外商（NVIDIA / AMD 台北）：學東西最廣，薪水也好，但組織小晉升 cap 低。",
            "看你 5 年後想做什麼。想當 IC engineer 就台積，想做 PM 就聯發或外商。",
        ],
    },
    {
        industry: "manufacturing",
        category: "internship",
        title: "傳產製造業實習感覺很無聊？要怎麼撐？",
        description: "進來才發現一天大半時間在巡產線、看 SPC 圖。學長說這是新人必經，但真的好乏味⋯⋯",
        authorName: "工廠菜鳥",
        replies: [
            "巡產線時主動問師傅每個機台的關鍵參數，他們會很樂意教。三個月後你會懂超多。",
            "找一個小 KPI 自己 ownership：例如「我這個月把 X 線 yield 從 92% 拉到 95%」。",
        ],
    },

    // ── 公職 ──────────────────────────────────────────────────
    {
        industry: "civil",
        category: "career",
        title: "刑事警察月薪 8 萬，但這份工作你真的會想做嗎？",
        description: "高薪背後可能代表高壓、輪班與風險，你會怎麼選？",
        authorName: "想考警特",
        replies: [
            "薪水數字看起來香，但實際的 burnout、家人擔心、社會輿論壓力你要先想清楚。",
            "警察的薪水是「總薪資」，扣掉夜班加給跟加班費後跟一般公務員差不多。",
            "我一個朋友考上後第二年離職，主因是排班完全沒生活。但也有同學樂在其中。",
        ],
    },
    {
        industry: "civil",
        category: "career",
        title: "輪班制度下，生活與工作怎麼平衡？",
        description: "排班三班制下，怎麼安排運動、家庭、進修？想聽過來人怎麼撐。",
        authorName: "三班輪班",
        replies: [
            "把睡眠當成最高優先級。其他事情排不進來就先放一邊。",
            "我自己會把運動跟早班配在一起，下班後直接去健身房。其他班別就純休息。",
        ],
    },
    {
        industry: "civil",
        category: "interview",
        title: "國考準備路線怎麼排最有效？",
        description: "在職備考、全職備考的現實差異與資源配置。",
        authorName: "備考新手",
        replies: [
            "在職備考至少 12-18 個月，全職 6-9 個月。前提是「真的能每天讀 4-6 小時」。",
            "選擇科目組合很重要，行政學跟政治學重複高。",
        ],
    },
];

// ── Polls ─────────────────────────────────────────────────────────
/*
 * Polls now mirror the staging.internx.me /dashboard/needs-wall structure:
 * one Poll bundles MANY Questions, each Question has 3+ Options with
 * label / subtitle / emoji and individual vote counts. The home page
 * renders a "投票牆" card showing all questions in one widget.
 */
const SEED_POLLS = [
    {
        title: "本週話題投票牆",
        industry: null,
        questions: [
            {
                title: "最近你最想解決的問題是？",
                options: [
                    { label: "職涯方向不明確", subtitle: "方向太多，不知道先選哪條", emoji: "🧭", seedVotes: 124 },
                    { label: "想學習新技能", subtitle: "先補職場真的用得到的能力", emoji: "📚", seedVotes: 167 },
                    { label: "想了解某個行業真實情況", subtitle: "想看業界真實工作樣貌", emoji: "🔭", seedVotes: 141 },
                ],
            },
            {
                title: "你現在最需要哪種支持？",
                options: [
                    { label: "和前輩聊真實經驗", subtitle: "和前輩聊真實路徑與選擇", emoji: "🗣️", seedVotes: 96 },
                    { label: "參加工作坊快速上手", subtitle: "希望有可立即上手的練習", emoji: "🛠️", seedVotes: 88 },
                    { label: "整理好的學習資源清單", subtitle: "想要整理好的資源地圖", emoji: "🗂️", seedVotes: 72 },
                ],
            },
            {
                title: "你希望什麼時候開始改善？",
                options: [
                    { label: "這週就開始", subtitle: "希望馬上開始調整", emoji: "🔥", seedVotes: 132 },
                    { label: "這個月內", subtitle: "一個月內安排好節奏", emoji: "🗓️", seedVotes: 109 },
                    { label: "這學期結束後", subtitle: "學期後再集中規劃", emoji: "🎓", seedVotes: 63 },
                ],
            },
        ],
    },
    {
        title: "金融業怎麼選",
        industry: "finance",
        questions: [
            {
                title: "投行 SA 拿到後，你會⋯⋯",
                options: [
                    { label: "拼 return offer", subtitle: "兩年買得了房", emoji: "💼", seedVotes: 89 },
                    { label: "用來跳 PE / HF", subtitle: "兩年後再 jump", emoji: "🦅", seedVotes: 142 },
                    { label: "走 Buy-side 直接做", subtitle: "略過投行直接 invest", emoji: "📈", seedVotes: 38 },
                ],
            },
            {
                title: "金融證照優先順序？",
                options: [
                    { label: "CFA Level 1", subtitle: "投資端通行證", emoji: "📜", seedVotes: 156 },
                    { label: "FRM", subtitle: "風控端的硬幣", emoji: "🛡️", seedVotes: 47 },
                    { label: "證券分析師（高業）", subtitle: "本土投顧/IB 必備", emoji: "🏦", seedVotes: 92 },
                ],
            },
        ],
    },
    {
        title: "科技業選擇題",
        industry: "tech",
        questions: [
            {
                title: "第一份工作要選哪個？",
                options: [
                    { label: "新創", subtitle: "成長快、equity、學從 0 到 1", emoji: "🚀", seedVotes: 312 },
                    { label: "FAANG / 大廠", subtitle: "系統訓練、履歷金漆", emoji: "🏢", seedVotes: 458 },
                    { label: "中型 SaaS", subtitle: "不大不小，PM 練最廣", emoji: "🧱", seedVotes: 187 },
                ],
            },
            {
                title: "Pre-IPO 還是 post-IPO 加入？",
                options: [
                    { label: "Pre-IPO", subtitle: "賭 equity，賭得起", emoji: "🎲", seedVotes: 134 },
                    { label: "Post-IPO", subtitle: "現金為王", emoji: "💰", seedVotes: 211 },
                    { label: "看人不看時機", subtitle: "找對 leader 比較重要", emoji: "🤝", seedVotes: 156 },
                ],
            },
        ],
    },
    {
        title: "面試 / 職涯快問快答",
        industry: null,
        questions: [
            {
                title: "面試前一晚，你會⋯⋯",
                options: [
                    { label: "再刷 5 題", subtitle: "把弱點補完才能睡", emoji: "📝", seedVotes: 156 },
                    { label: "早點睡", subtitle: "精神比準備重要", emoji: "😴", seedVotes: 487 },
                    { label: "找朋友 mock 一遍", subtitle: "壓力測試最後一次", emoji: "🎤", seedVotes: 92 },
                ],
            },
            {
                title: "你比較怕哪種主管？",
                options: [
                    { label: "微管理王", subtitle: "細節控、永遠在 review", emoji: "🔍", seedVotes: 234 },
                    { label: "完全放生", subtitle: "不指引、自己摸索", emoji: "🌳", seedVotes: 198 },
                    { label: "情緒化", subtitle: "今天好朋友、明天嗆人", emoji: "🎭", seedVotes: 312 },
                ],
            },
            {
                title: "你會把實習薪水拿來⋯⋯",
                options: [
                    { label: "存起來投資", subtitle: "未來的本金", emoji: "📈", seedVotes: 421 },
                    { label: "犒賞自己", subtitle: "辛苦了，先爽再說", emoji: "🎁", seedVotes: 367 },
                    { label: "報名課程進修", subtitle: "投資自己回報最高", emoji: "📚", seedVotes: 198 },
                ],
            },
        ],
    },
];

// ── Pain points (困擾調查) ────────────────────────────────────────
export const PAIN_POINTS = [
    { id: "direction", label: "不知道自己適合什麼方向", emoji: "🧭", category: "career" },
    { id: "noexp", label: "履歷上沒有亮眼經驗", emoji: "📄", category: "career" },
    { id: "internship", label: "找不到實習，常被已讀不回", emoji: "💼", category: "internship" },
    { id: "interview", label: "面試常常表現不好", emoji: "🎯", category: "interview" },
    { id: "skills", label: "想學的太多，不知道從哪學起", emoji: "📚", category: "skill" },
    { id: "salary", label: "薪資不知道怎麼開、怎麼談", emoji: "💰", category: "salary" },
    { id: "reject", label: "常被拒絕，越來越沒自信", emoji: "😔", category: "mindset" },
    { id: "compare", label: "看到同學表現好就焦慮", emoji: "📉", category: "mindset" },
    { id: "network", label: "認識的人少、沒有人脈", emoji: "🤝", category: "network" },
    { id: "family", label: "家人不支持我的選擇", emoji: "👨‍👩‍👧", category: "mindset" },
    { id: "english", label: "英文還不夠好", emoji: "🗣️", category: "skill" },
    { id: "balance", label: "課業跟實習無法兼顧", emoji: "⚖️", category: "campus" },
    { id: "burnout", label: "已經 burnout，提不起勁", emoji: "🪫", category: "mindset" },
    { id: "industry", label: "不確定要進哪個行業", emoji: "🏢", category: "career" },
];

// Map a pain-point to which topic categories should be boosted
// for that user when generating recommendations.
const PAIN_TO_CATEGORY = {
    direction: ["career"],
    noexp: ["internship", "skill"],
    internship: ["internship"],
    interview: ["interview"],
    skills: ["skill"],
    salary: ["salary"],
    reject: ["interview", "career"],
    compare: ["career"],
    network: ["side"],
    family: ["career"],
    english: ["skill"],
    balance: ["campus", "internship"],
    burnout: ["career"],
    industry: ["career"],
};

// ── Brands (career-content brand partners) ──────────────────────────
export const BRANDS = [
    {
        id: "hangtuo",
        name: "航拓",
        fullName: "航拓策略顧問",
        emoji: "⛵",
        color: "#0c4a6e",
        accent: "#0ea5e9",
        tagline: "前麥肯錫顧問創立的精品策略顧問",
        description:
            "由 ex-McKinsey 顧問創立的精品策略顧問公司。專注於台灣 PE / 跨國企業 / SaaS 的策略議題。航拓的成員會在這個論壇分享 case interview、management consulting career 跟產業洞察。",
        websiteUrl: "https://example.com/hangtuo",
    },
];

// ── Badge definitions ──────────────────────────────────────────────
//
// IMPORTANT: matches the InternX main site's existing BADGES_CONFIG
// (lib/config.js) for the badges that already exist there:
//   - admin, kol, early-access, business, school-org
//
// Plus the simulator adds five new types that the main site can adopt
// as a small extension to BadgeType:
//   - brand-expert, industry-expert, top-contributor, moderator,
//     verified-creator (alias for kol with chip styling)
//
// Each badge has:
//   - icon:  Remix Icon name (matches main-site ProfileBadge.tsx)
//   - color: CSS color (uses --theme-color where the main site does)
//   - emoji: only used in chip/large display modes (main site renders icons)
export const BADGE_DEFINITIONS = [
    // From the main-site BADGES_CONFIG ─────────────────────────────
    {
        id: "admin",
        label: "管理員",
        description: "平臺管理員",
        icon: "admin-line",
        emoji: "⚙️",
        color: "#0182fd", // var(--theme-color)
    },
    {
        id: "kol",
        label: "KOL",
        description: "認證過的公眾人物或社群領導者",
        icon: "verified-badge-fill",
        emoji: "✨",
        color: "#0182fd",
    },
    {
        id: "early-access",
        label: "早期使用者",
        description: "參與封測的人員",
        icon: "heart-2-fill",
        emoji: "💝",
        color: "#ff4f4e",
    },
    {
        id: "business",
        label: "企業帳號",
        description: "認證過的企業帳號",
        icon: "suitcase-fill",
        emoji: "💼",
        color: "#0182fd",
    },
    {
        id: "school-org",
        label: "校園組織",
        description: "認證過的校園組織",
        icon: "graduation-cap-fill",
        emoji: "🎓",
        color: "#0182fd",
    },
    // New badges added by the discussion simulator ─────────────────
    {
        id: "verified-creator",
        label: "認證創作者",
        description: "經平台驗證的職涯內容創作者，分享內容品質高、有大量追蹤者。",
        icon: "quill-pen-fill",
        emoji: "✍️",
        color: "#7c3aed",
    },
    {
        id: "brand-expert",
        label: "品牌專家",
        description: "與職涯顧問品牌合作的專家，會出現品牌標籤。",
        icon: "vip-crown-fill",
        emoji: "🌟",
        // color comes from the brand
    },
    {
        id: "industry-expert",
        label: "業界專家",
        description: "5 年以上業界資歷、經審核通過。回覆會被優先推薦。",
        icon: "medal-2-fill",
        emoji: "🎯",
        color: "#0891b2",
    },
    {
        id: "top-contributor",
        label: "熱心助人",
        description: "在版上累積大量回覆 + 高 helpful 票的活躍學長姐。",
        icon: "heart-3-fill",
        emoji: "💖",
        color: "#dc2626",
    },
    {
        id: "moderator",
        label: "版主",
        description: "協助管理特定行業論壇，可刪除違規留言、置頂優質話題。",
        icon: "shield-user-fill",
        emoji: "🛡️",
        color: "#16a34a",
    },
];

// ── Seed users (real identities behind some seed topics/replies) ───
//
// These users have badges. Their userId is referenced in the seed reply
// data below so when we render a thread the bubble shows the right
// badges + brand affiliation. Anonymous students are still allowed
// (they just have no badges).
const SEED_USERS = [
    {
        userId: "u_lin_hangtuo",
        displayName: "林顧問",
        avatarSeed: "林",
        badges: ["brand-expert", "verified-creator"],
        brand: { brandId: "hangtuo", role: "資深策略顧問", years: 6 },
        moderates: [],
        bio: "前麥肯錫，現為航拓資深策略顧問。case 興趣：PE due diligence、SaaS GTM。歡迎 case interview 提問。",
        joinedAt: "2026-01-08",
        helpfulCount: 156,
    },
    {
        userId: "u_chen_hangtuo",
        displayName: "陳顧問",
        avatarSeed: "陳",
        badges: ["brand-expert"],
        brand: { brandId: "hangtuo", role: "顧問", years: 3 },
        moderates: ["consulting"],
        bio: "航拓顧問，協助管理「管顧業」論壇。專長：consumer goods、零售業策略。",
        joinedAt: "2026-02-14",
        helpfulCount: 87,
    },
    {
        userId: "u_wang_kol",
        displayName: "Wang｜職涯不孤單",
        avatarSeed: "W",
        badges: ["verified-creator"],
        brand: null,
        moderates: ["tech"],
        bio: "Podcast「職涯不孤單」主持人，採訪過 80+ 業界人士。同時是科技業論壇版主。",
        joinedAt: "2025-11-02",
        helpfulCount: 213,
    },
    {
        userId: "u_huang_finance",
        displayName: "黃學長",
        avatarSeed: "黃",
        badges: ["industry-expert"],
        brand: null,
        moderates: ["finance"],
        bio: "前 Goldman Sachs 投行 SA，現任 PE Associate。金融業論壇版主。",
        joinedAt: "2026-01-22",
        helpfulCount: 134,
    },
    {
        userId: "u_lee_helper",
        displayName: "小李",
        avatarSeed: "李",
        badges: ["top-contributor"],
        brand: null,
        moderates: [],
        bio: "大四，已實習 4 次。喜歡分享自己踩過的雷。",
        joinedAt: "2026-03-04",
        helpfulCount: 92,
    },
    {
        userId: "u_zhang_helper",
        displayName: "Zhang",
        avatarSeed: "Z",
        badges: ["top-contributor"],
        brand: null,
        moderates: [],
        bio: "工程師，業餘指導學弟妹刷 leetcode。",
        joinedAt: "2026-02-18",
        helpfulCount: 76,
    },
];

function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

// Map (industryId, replyIndex) → expert userId so industry-relevant
// experts show up in seed threads. The first reply in each industry's
// first seed topic is from a brand expert; first reply in interview /
// career topics goes to industry experts; some replies in non-expert
// topics go to top-contributors.
const REPLY_AUTHOR_MAP = {
    // Consulting → Hangtuo experts dominate
    consulting: {
        0: "u_lin_hangtuo",
        1: "u_chen_hangtuo",
    },
    // Finance → Goldman / PE expert
    finance: {
        0: "u_huang_finance",
        1: "u_lin_hangtuo", // cross-industry strategy advice
    },
    // Tech → KOL podcast host + helper
    tech: {
        0: "u_wang_kol",
        2: "u_zhang_helper",
    },
    // Other industries get top contributors sprinkled in
    marketing: { 1: "u_lee_helper" },
    fmcg: { 0: "u_lin_hangtuo" }, // Hangtuo also covers FMCG
    media: { 0: "u_wang_kol" },
    biotech: { 0: "u_lee_helper" },
    manufacturing: { 1: "u_zhang_helper" },
    internship: { 1: "u_lee_helper" },
};

export const REACTION_EMOJIS = ["👍", "❤️", "🤔", "😮", "💡"];

function makeStore() {
    const topics = [];
    const replies = [];
    const polls = [];
    const painPointResponses = []; // { userId, painPoints: [{id, intensity}], submittedAt }
    const helpfulVotes = {};       // replyId → Set of userIds
    const reportedReplies = new Set();
    const deletedReplies = new Set();
    // replyId → { '👍': Set<userId>, '❤️': Set<userId>, ... }
    const reactions = {};

    const now = Date.now();

    // Track which industry topic index we're on, so the per-industry
    // REPLY_AUTHOR_MAP picks the right reply slot.
    const industryTopicCount = {};

    SEED_TOPICS.forEach((seed, idx) => {
        const createdAt = new Date(now - (SEED_TOPICS.length - idx) * 1000 * 60 * 75);
        const topicId = uid("t");

        // Only the first topic per industry uses the author map (so
        // experts visibly cluster on top topics rather than everywhere)
        const isFirstInIndustry = !industryTopicCount[seed.industry];
        industryTopicCount[seed.industry] = (industryTopicCount[seed.industry] || 0) + 1;
        const authorMap = isFirstInIndustry ? (REPLY_AUTHOR_MAP[seed.industry] || {}) : {};

        const topicReplies = (seed.replies || []).map((content, ridx) => {
            const expertUserId = authorMap[ridx];
            const expert = expertUserId ? SEED_USERS.find((u) => u.userId === expertUserId) : null;
            return {
                id: uid("r"),
                topicId,
                authorId: expert ? expert.userId : `seed_${idx}_${ridx}`,
                authorName: expert ? expert.displayName : RESPONDER_NAMES[(idx + ridx) % RESPONDER_NAMES.length],
                content,
                createdAt: new Date(createdAt.getTime() + (ridx + 1) * 1000 * 60 * (12 + ridx * 6)).toISOString(),
                // Snapshot the badge state at post time so even if user
                // later loses a badge the reply keeps its original one.
                authorBadges: expert ? expert.badges.slice() : [],
                authorBrand: expert?.brand ? { ...expert.brand } : null,
                helpfulCount: expert ? Math.floor(Math.random() * 12) + 3 : Math.floor(Math.random() * 5),
            };
        });

        const lastActivity =
            topicReplies.length > 0
                ? new Date(topicReplies[topicReplies.length - 1].createdAt)
                : createdAt;

        topics.push({
            id: topicId,
            title: seed.title,
            description: seed.description,
            industry: seed.industry,
            category: seed.category,
            authorId: `seed_user_${idx}`,
            authorName: seed.authorName,
            authorBadges: [],
            authorBrand: null,
            createdAt: createdAt.toISOString(),
            lastActivityAt: lastActivity.toISOString(),
            replyCount: topicReplies.length,
            viewCount: 8 + Math.floor(Math.random() * 120),
            pinned: false,
            locked: false,
        });
        replies.push(...topicReplies);
    });

    SEED_POLLS.forEach((seed, idx) => {
        const createdAt = new Date(now - (SEED_POLLS.length - idx) * 1000 * 60 * 60 * 6);
        const pollId = uid("poll");
        polls.push({
            id: pollId,
            title: seed.title,
            industry: seed.industry || null,
            createdAt: createdAt.toISOString(),
            questions: seed.questions.map((q, qIdx) => ({
                id: `q${qIdx + 1}`,
                title: q.title,
                options: q.options.map((opt, oIdx) => ({
                    id: ["a", "b", "c", "d", "e"][oIdx] || `o${oIdx}`,
                    label: opt.label,
                    subtitle: opt.subtitle,
                    emoji: opt.emoji,
                    votes: opt.seedVotes || 0,
                    voters: new Set(),
                })),
            })),
        });
    });

    // Seed some aggregate pain-point responses so "X% of students share
    // this pain" feels real on first visit.
    const SEED_RESPONSES = [
        ["seed_1", ["direction", "noexp", "interview"]],
        ["seed_2", ["interview", "salary", "compare"]],
        ["seed_3", ["direction", "industry", "skills"]],
        ["seed_4", ["internship", "noexp", "english"]],
        ["seed_5", ["compare", "burnout", "family"]],
        ["seed_6", ["interview", "reject", "salary"]],
        ["seed_7", ["network", "noexp", "direction"]],
        ["seed_8", ["balance", "burnout", "skills"]],
        ["seed_9", ["direction", "compare", "industry"]],
        ["seed_10", ["interview", "salary", "english"]],
        ["seed_11", ["noexp", "internship", "network"]],
        ["seed_12", ["skills", "direction", "burnout"]],
    ];
    SEED_RESPONSES.forEach(([userId, ids]) => {
        painPointResponses.push({
            userId,
            painPoints: ids.map((id, i) => ({ id, intensity: 5 - i })),
            submittedAt: new Date(now - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
        });
    });

    return {
        topics,
        replies,
        polls,
        painPointResponses,
        users: SEED_USERS.slice(),
        helpfulVotes,
        reportedReplies,
        deletedReplies,
        reactions,
    };
}

const STATE = makeStore();

export function listTopics({ industry, industries, category } = {}) {
    let items = STATE.topics.slice();

    // industry: single id (back-compat). industries: array of ids.
    if (industries && Array.isArray(industries) && industries.length > 0) {
        items = items.filter((t) => industries.includes(t.industry));
    } else if (industry && industry !== "all") {
        items = items.filter((t) => t.industry === industry);
    }

    if (category && category !== "all") {
        items = items.filter((t) => t.category === category);
    }

    items.sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });
    return items;
}

export function getIndustryStats() {
    const counts = {};
    for (const t of STATE.topics) {
        counts[t.industry] = (counts[t.industry] || 0) + 1;
    }
    return INDUSTRIES.map((ind) => ({
        ...ind,
        topicCount: counts[ind.id] || 0,
    }));
}

export function getTopic(id) {
    const t = STATE.topics.find((t) => t.id === id);
    if (!t) return null;
    t.viewCount = (t.viewCount || 0) + 1;
    return t;
}

function reactionsToMap(replyId) {
    const buckets = STATE.reactions[replyId];
    if (!buckets) return {};
    const out = {};
    for (const [emoji, set] of Object.entries(buckets)) {
        out[emoji] = Array.from(set);
    }
    return out;
}

export function listReplies(topicId) {
    return STATE.replies
        .filter((r) => r.topicId === topicId && !STATE.deletedReplies.has(r.id))
        .slice()
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((r) => ({ ...r, reactions: reactionsToMap(r.id) }));
}

export function createTopic({ title, description, industry, category, authorName, userId, badges, brand }) {
    const cleanTitle = (title || "").trim();
    if (!cleanTitle) throw new Error("title required");
    const safeInd = INDUSTRIES.find((i) => i.id === industry) ? industry : null;
    if (!safeInd) throw new Error("industry required");
    const safeCat = CATEGORIES.find((c) => c.id === category && c.id !== "all") ? category : "career";
    const now = new Date().toISOString();
    const topic = {
        id: uid("t"),
        title: cleanTitle.slice(0, 80),
        description: (description || "").trim().slice(0, 400),
        industry: safeInd,
        category: safeCat,
        authorId: userId || uid("user"),
        authorName: (authorName || "匿名同學").trim().slice(0, 20),
        authorBadges: Array.isArray(badges) ? badges.slice() : [],
        authorBrand: brand && brand.brandId ? { ...brand } : null,
        createdAt: now,
        lastActivityAt: now,
        replyCount: 0,
        viewCount: 0,
        pinned: false,
        locked: false,
    };
    STATE.topics.push(topic);
    return topic;
}

export function postReply({ topicId, userId, authorName, content, badges, brand }) {
    const trimmed = (content || "").trim();
    if (!trimmed) throw new Error("content required");
    const topic = STATE.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error("topic not found");
    if (topic.locked) throw new Error("topic is locked");
    const reply = {
        id: uid("r"),
        topicId,
        authorId: userId || uid("user"),
        authorName: (authorName || "匿名同學").trim().slice(0, 20),
        content: trimmed.slice(0, 1000),
        createdAt: new Date().toISOString(),
        // Snapshot the badge state for tamper-resistance
        authorBadges: Array.isArray(badges) ? badges.slice() : [],
        authorBrand: brand && brand.brandId ? { ...brand } : null,
        helpfulCount: 0,
    };
    STATE.replies.push(reply);
    topic.replyCount = (topic.replyCount || 0) + 1;
    topic.lastActivityAt = reply.createdAt;
    return reply;
}

// ── Users / brands ─────────────────────────────────────────────────

export function listUsers({ industryModeratedBy, badge } = {}) {
    let items = STATE.users.slice();
    if (industryModeratedBy) {
        items = items.filter((u) => Array.isArray(u.moderates) && u.moderates.includes(industryModeratedBy));
    }
    if (badge) {
        items = items.filter((u) => Array.isArray(u.badges) && u.badges.includes(badge));
    }
    return items;
}

export function getUser(userId) {
    if (!userId) return null;
    return STATE.users.find((u) => u.userId === userId) || null;
}

/** Recent activity (topics + replies) by a given user. */
export function listUserActivity(userId, { limit = 20 } = {}) {
    if (!userId) return { topics: [], replies: [] };
    const userTopics = STATE.topics
        .filter((t) => t.authorId === userId)
        .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
        .slice(0, limit);
    const userReplies = STATE.replies
        .filter((r) => r.authorId === userId && !STATE.deletedReplies.has(r.id))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
        .map((r) => {
            const topic = STATE.topics.find((t) => t.id === r.topicId);
            return {
                ...r,
                topicTitle: topic?.title || "",
                topicIndustry: topic?.industry,
            };
        });
    return { topics: userTopics, replies: userReplies };
}

export function listBrands() {
    return BRANDS.map((b) => ({
        ...b,
        // Attach the experts who belong to this brand
        experts: STATE.users.filter((u) => u.brand?.brandId === b.id),
    }));
}

export function getBrand(brandId) {
    return BRANDS.find((b) => b.id === brandId) || null;
}

// ── Moderation: helpful, delete, report, pin/lock ─────────────────

export function helpfulReply({ replyId, userId }) {
    if (!userId) throw new Error("userId required");
    const reply = STATE.replies.find((r) => r.id === replyId);
    if (!reply) throw new Error("reply not found");
    if (!STATE.helpfulVotes[replyId]) STATE.helpfulVotes[replyId] = new Set();
    const voters = STATE.helpfulVotes[replyId];
    let toggled;
    if (voters.has(userId)) {
        voters.delete(userId);
        reply.helpfulCount = Math.max(0, (reply.helpfulCount || 0) - 1);
        toggled = "removed";
    } else {
        voters.add(userId);
        reply.helpfulCount = (reply.helpfulCount || 0) + 1;
        toggled = "added";
    }
    return { reply, toggled };
}

function canModerate(user, industryId) {
    if (!user) return false;
    if (Array.isArray(user.badges) && user.badges.includes("moderator")) {
        // platform-wide moderator badge
        if (Array.isArray(user.moderates) && user.moderates.length > 0) {
            return user.moderates.includes(industryId);
        }
    }
    // Brand-experts and creators don't moderate by default unless they
    // also have `moderator` badge (they were configured with it).
    return false;
}

export function deleteReply({ replyId, userId, badges, moderates }) {
    const reply = STATE.replies.find((r) => r.id === replyId);
    if (!reply) throw new Error("reply not found");
    const topic = STATE.topics.find((t) => t.id === reply.topicId);
    if (!topic) throw new Error("topic not found");

    // Authorize: either the original author, or a moderator of the topic's industry
    const isOwn = reply.authorId === userId;
    const isMod =
        Array.isArray(badges) &&
        badges.includes("moderator") &&
        Array.isArray(moderates) &&
        moderates.includes(topic.industry);
    if (!isOwn && !isMod) throw new Error("forbidden");

    STATE.deletedReplies.add(replyId);
    topic.replyCount = Math.max(0, (topic.replyCount || 0) - 1);
    return { ok: true, deletedBy: isMod ? "moderator" : "author" };
}

/** Toggle a reaction on a reply. One emoji per user per reply (toggle off if already set). */
export function toggleReaction({ replyId, userId, emoji }) {
    if (!userId) throw new Error("userId required");
    if (!REACTION_EMOJIS.includes(emoji)) throw new Error("invalid emoji");
    const reply = STATE.replies.find((r) => r.id === replyId);
    if (!reply) throw new Error("reply not found");
    if (!STATE.reactions[replyId]) STATE.reactions[replyId] = {};
    const buckets = STATE.reactions[replyId];
    if (!buckets[emoji]) buckets[emoji] = new Set();
    let toggled;
    if (buckets[emoji].has(userId)) {
        buckets[emoji].delete(userId);
        toggled = "removed";
    } else {
        buckets[emoji].add(userId);
        toggled = "added";
    }
    return { reactions: reactionsToMap(replyId), toggled };
}

/** Edit a reply (only if you are the original author). */
export function editOwnReply({ replyId, userId, content }) {
    const reply = STATE.replies.find((r) => r.id === replyId);
    if (!reply) throw new Error("reply not found");
    if (reply.authorId !== userId) throw new Error("forbidden");
    const trimmed = (content || "").trim();
    if (!trimmed) throw new Error("content required");
    reply.content = trimmed.slice(0, 1000);
    reply.editedAt = new Date().toISOString();
    return reply;
}

/** Delete your own reply (no badge needed). */
export function deleteOwnReply({ replyId, userId }) {
    const reply = STATE.replies.find((r) => r.id === replyId);
    if (!reply) throw new Error("reply not found");
    if (reply.authorId !== userId) throw new Error("forbidden");
    const topic = STATE.topics.find((t) => t.id === reply.topicId);
    STATE.deletedReplies.add(replyId);
    if (topic) topic.replyCount = Math.max(0, (topic.replyCount || 0) - 1);
    return { ok: true };
}

export function reportReply({ replyId, userId, reason }) {
    const reply = STATE.replies.find((r) => r.id === replyId);
    if (!reply) throw new Error("reply not found");
    STATE.reportedReplies.add(replyId);
    reply.reportedBy = reply.reportedBy || [];
    reply.reportedBy.push({ userId: userId || "anon", reason: (reason || "").slice(0, 200), at: new Date().toISOString() });
    return { ok: true, reportCount: reply.reportedBy.length };
}

export function setPinTopic({ topicId, userId, badges, moderates, pinned }) {
    const topic = STATE.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error("topic not found");
    const isMod =
        Array.isArray(badges) &&
        badges.includes("moderator") &&
        Array.isArray(moderates) &&
        moderates.includes(topic.industry);
    if (!isMod) throw new Error("forbidden");
    topic.pinned = !!pinned;
    return { ok: true, topic };
}

export function setLockTopic({ topicId, badges, moderates, locked }) {
    const topic = STATE.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error("topic not found");
    const isMod =
        Array.isArray(badges) &&
        badges.includes("moderator") &&
        Array.isArray(moderates) &&
        moderates.includes(topic.industry);
    if (!isMod) throw new Error("forbidden");
    topic.locked = !!locked;
    return { ok: true, topic };
}

// ── Polls API ─────────────────────────────────────────────────────

/*
 * pollToJSON returns a poll with its questions + options + computed
 * percentages. Total vote count is sum of all option.votes across all
 * questions (matches the staging "投票牆 · 432 人已投" behaviour).
 */
function pollToJSON(p) {
    if (!p) return null;
    let totalAcrossPoll = 0;
    const questions = (p.questions || []).map((q) => {
        const qTotal = (q.options || []).reduce((acc, o) => acc + (o.votes || 0), 0);
        totalAcrossPoll += qTotal;
        return {
            id: q.id,
            title: q.title,
            totalVotes: qTotal,
            options: (q.options || []).map((o) => ({
                id: o.id,
                label: o.label,
                subtitle: o.subtitle,
                emoji: o.emoji,
                votes: o.votes || 0,
                percent: qTotal > 0 ? Math.round(((o.votes || 0) / qTotal) * 100) : 0,
            })),
        };
    });
    return {
        id: p.id,
        title: p.title,
        industry: p.industry,
        questions,
        totalVotes: totalAcrossPoll,
        createdAt: p.createdAt,
    };
}

export function listPolls({ industry, industries } = {}) {
    let items = STATE.polls.slice();
    if (industries && Array.isArray(industries) && industries.length > 0) {
        items = items.filter((p) => p.industry === null || industries.includes(p.industry));
    } else if (industry && industry !== "all") {
        items = items.filter((p) => p.industry === industry || p.industry === null);
    }
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items.map(pollToJSON);
}

export function getPoll(id) {
    const p = STATE.polls.find((p) => p.id === id);
    return p ? pollToJSON(p) : null;
}

/**
 * Vote on one question of a poll. One vote per user per question.
 * Allows changing your vote (atomic decrement of old, increment of new).
 */
export function votePoll({ pollId, questionId, optionId, userId }) {
    if (!userId) throw new Error("userId required");
    if (!questionId || !optionId) throw new Error("questionId and optionId required");
    const p = STATE.polls.find((p) => p.id === pollId);
    if (!p) throw new Error("poll not found");
    const q = (p.questions || []).find((x) => x.id === questionId);
    if (!q) throw new Error("question not found");
    const newOpt = (q.options || []).find((x) => x.id === optionId);
    if (!newOpt) throw new Error("option not found");

    // Find the user's previous choice on this question, if any
    let prevOpt = null;
    for (const o of q.options) {
        if (o.voters?.has?.(userId)) {
            prevOpt = o;
            break;
        }
    }
    if (prevOpt && prevOpt.id === newOpt.id) {
        // Toggle off
        prevOpt.voters.delete(userId);
        prevOpt.votes = Math.max(0, (prevOpt.votes || 0) - 1);
        return { poll: pollToJSON(p), action: "removed" };
    }
    if (prevOpt) {
        prevOpt.voters.delete(userId);
        prevOpt.votes = Math.max(0, (prevOpt.votes || 0) - 1);
    }
    if (!newOpt.voters) newOpt.voters = new Set();
    newOpt.voters.add(userId);
    newOpt.votes = (newOpt.votes || 0) + 1;
    return { poll: pollToJSON(p), action: prevOpt ? "changed" : "added" };
}

// ── Pain points API ───────────────────────────────────────────────

export function getPainPoints() {
    return PAIN_POINTS.slice();
}

export function submitPainPointResponse({ userId, painPoints }) {
    if (!userId) throw new Error("userId required");
    if (!Array.isArray(painPoints) || painPoints.length === 0) {
        throw new Error("at least one pain point required");
    }
    const validIds = new Set(PAIN_POINTS.map((p) => p.id));
    const cleaned = painPoints
        .filter((p) => p && typeof p.id === "string" && validIds.has(p.id))
        .map((p) => ({
            id: p.id,
            intensity: Math.max(1, Math.min(5, Number(p.intensity) || 3)),
        }));
    if (cleaned.length === 0) throw new Error("no valid pain points");

    // Replace any prior response from this userId
    const existingIdx = STATE.painPointResponses.findIndex((r) => r.userId === userId);
    const entry = {
        userId,
        painPoints: cleaned,
        submittedAt: new Date().toISOString(),
    };
    if (existingIdx >= 0) STATE.painPointResponses[existingIdx] = entry;
    else STATE.painPointResponses.push(entry);
    return entry;
}

export function getPainPointStats() {
    // Aggregate intensity-weighted votes per pain point
    const totals = {};
    let respondents = 0;
    for (const resp of STATE.painPointResponses) {
        respondents++;
        for (const p of resp.painPoints) {
            totals[p.id] = totals[p.id] || { count: 0, intensitySum: 0 };
            totals[p.id].count += 1;
            totals[p.id].intensitySum += p.intensity || 3;
        }
    }
    const items = PAIN_POINTS.map((pp) => {
        const t = totals[pp.id] || { count: 0, intensitySum: 0 };
        return {
            ...pp,
            count: t.count,
            avgIntensity: t.count > 0 ? +(t.intensitySum / t.count).toFixed(1) : 0,
            sharePct: respondents > 0 ? Math.round((t.count / respondents) * 100) : 0,
        };
    });
    items.sort((a, b) => b.count - a.count);
    return { respondents, items };
}

// ── Search ────────────────────────────────────────────────────────

/**
 * Lightweight in-memory search across topics + users + brands.
 * Case-insensitive substring match on title/description (topics),
 * displayName/bio (users), name/fullName/description (brands).
 */
export function searchAll(rawQuery, { limit = 8 } = {}) {
    const q = (rawQuery || "").trim().toLowerCase();
    if (!q) return { topics: [], users: [], brands: [] };

    const topicMatches = [];
    for (const t of STATE.topics) {
        const haystack = `${t.title} ${t.description}`.toLowerCase();
        if (haystack.includes(q)) {
            topicMatches.push(t);
            if (topicMatches.length >= limit) break;
        }
    }
    const userMatches = [];
    for (const u of STATE.users) {
        const haystack = `${u.displayName} ${u.bio || ""}`.toLowerCase();
        if (haystack.includes(q)) {
            userMatches.push(u);
            if (userMatches.length >= limit) break;
        }
    }
    const brandMatches = [];
    for (const b of BRANDS) {
        const haystack = `${b.name} ${b.fullName || ""} ${b.description || ""} ${b.tagline || ""}`.toLowerCase();
        if (haystack.includes(q)) {
            brandMatches.push({ ...b, experts: STATE.users.filter((u) => u.brand?.brandId === b.id) });
        }
    }
    return { topics: topicMatches, users: userMatches, brands: brandMatches };
}

// ── Recommendations ───────────────────────────────────────────────

/**
 * Score topics for a given user profile and return the top N.
 * Scoring:
 *   +5  topic.industry in user's joined industries
 *   +3  topic.category matches a category boosted by user's pain points
 *   +1  topic.category matches a category that the user voted on a poll about
 *   +0.05 * replyCount (popularity tiebreaker)
 */
export function recommendTopics({
    industries: userIndustries = [],
    painPointIds = [],
    pollVotes = [],   // [{pollId, choice}]
    excludeIds = [],
    limit = 6,
} = {}) {
    const boostedCategories = new Set();
    for (const pid of painPointIds) {
        const cats = PAIN_TO_CATEGORY[pid] || [];
        cats.forEach((c) => boostedCategories.add(c));
    }
    const pollCats = new Set();
    for (const v of pollVotes) {
        const p = STATE.polls.find((pp) => pp.id === v.pollId);
        if (p?.category) pollCats.add(p.category);
    }

    const exclude = new Set(excludeIds);
    const ranked = STATE.topics
        .filter((t) => !exclude.has(t.id))
        .map((t) => {
            let score = 0;
            const reasons = [];
            if (userIndustries.includes(t.industry)) {
                score += 5;
                reasons.push(`你訂閱了${INDUSTRIES.find((i) => i.id === t.industry)?.label || ""}`);
            }
            if (boostedCategories.has(t.category)) {
                score += 3;
                reasons.push("跟你的困擾相關");
            }
            if (pollCats.has(t.category)) {
                score += 1;
                reasons.push("跟你投過的票相關");
            }
            score += (t.replyCount || 0) * 0.05;
            return { topic: t, score, reasons };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return ranked.map((r) => ({
        ...r.topic,
        recScore: +r.score.toFixed(2),
        recReasons: r.reasons,
    }));
}
