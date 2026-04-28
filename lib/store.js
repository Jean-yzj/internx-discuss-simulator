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
        description: "投行、私募、商銀、保險、資產管理 — 嚴謹、上鏡、加班 friendly。",
    },
    {
        id: "consulting",
        label: "管顧業",
        emoji: "📊",
        accent: "#7c3aed",
        description: "策略顧問、營運顧問、人資顧問 — Case interview、PPT、出差。",
    },
    {
        id: "tech",
        label: "科技業",
        emoji: "💻",
        accent: "#0891b2",
        description: "軟體、硬體、半導體、SaaS、AI — 工程、PM、設計三條主路徑。",
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
];

function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function makeStore() {
    const topics = [];
    const replies = [];

    const now = Date.now();

    SEED_TOPICS.forEach((seed, idx) => {
        const createdAt = new Date(now - (SEED_TOPICS.length - idx) * 1000 * 60 * 75);
        const topicId = uid("t");
        const topicReplies = (seed.replies || []).map((content, ridx) => ({
            id: uid("r"),
            topicId,
            authorId: `seed_${idx}_${ridx}`,
            authorName: RESPONDER_NAMES[(idx + ridx) % RESPONDER_NAMES.length],
            content,
            createdAt: new Date(createdAt.getTime() + (ridx + 1) * 1000 * 60 * (12 + ridx * 6)).toISOString(),
        }));

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
            createdAt: createdAt.toISOString(),
            lastActivityAt: lastActivity.toISOString(),
            replyCount: topicReplies.length,
            viewCount: 8 + Math.floor(Math.random() * 120),
        });
        replies.push(...topicReplies);
    });

    return { topics, replies };
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

    items.sort(
        (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );
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

export function listReplies(topicId) {
    return STATE.replies
        .filter((r) => r.topicId === topicId)
        .slice()
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function createTopic({ title, description, industry, category, authorName }) {
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
        authorId: uid("user"),
        authorName: (authorName || "匿名同學").trim().slice(0, 20),
        createdAt: now,
        lastActivityAt: now,
        replyCount: 0,
        viewCount: 0,
    };
    STATE.topics.push(topic);
    return topic;
}

export function postReply({ topicId, authorName, content }) {
    const trimmed = (content || "").trim();
    if (!trimmed) throw new Error("content required");
    const topic = STATE.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error("topic not found");
    const reply = {
        id: uid("r"),
        topicId,
        authorId: uid("user"),
        authorName: (authorName || "匿名同學").trim().slice(0, 20),
        content: trimmed.slice(0, 1000),
        createdAt: new Date().toISOString(),
    };
    STATE.replies.push(reply);
    topic.replyCount = (topic.replyCount || 0) + 1;
    topic.lastActivityAt = reply.createdAt;
    return reply;
}
