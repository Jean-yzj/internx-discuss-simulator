/**
 * In-memory simulator backend.
 *
 * No database, no Firebase, no shared infrastructure with the main InternX
 * platform. State lives in this module's scope on the Node server. The
 * simulator is intentionally ephemeral — restarting the container resets
 * the state to the seeded sample data.
 *
 * Why in-memory: this app is a UX simulator demo for technical reviewers.
 * It must not be wired into any production data source.
 */

const SEED_TOPICS = [
    {
        title: "大三才開始準備實習會不會太晚？",
        description: "身邊朋友大一就在累積經驗，覺得自己起步太晚有點焦慮，想聽聽大家的想法和故事。",
        category: "career",
        authorName: "焦慮的大三生",
        replies: [
            "完全不晚！我大三下才第一份實習，大四直接拿到 return offer。",
            "重點是「現在就動手」，不是「比別人早」——我朋友大四暑假才開始，現在做得超好。",
            "建議先盤點自己有什麼，再去找跟你目標公司風格相近的小型實習練手感。",
        ],
    },
    {
        title: "面試被問「你最大的弱點」要怎麼回答？",
        description: "每次都不知道要講什麼，講太誠實怕被刷掉，講太假又被一眼看穿。求救！",
        category: "interview",
        authorName: "面試新手",
        replies: [
            "講一個真的弱點 + 你正在怎麼改善它。例如：我容易過度追求細節，所以我學會用時間箱限制自己。",
            "千萬不要說「我太完美主義」，HR 聽到就翻白眼。",
            "我都直接說我不擅長 public speaking，但我加入了學校演講社在練。面試官超喜歡這種真誠。",
        ],
    },
    {
        title: "新創 vs 大公司實習，你會怎麼選？",
        description: "拿到一間 50 人新創跟一間外商大公司的 offer，薪水差不多，學習方向完全不同——大家都怎麼想的？",
        category: "startup",
        authorName: "兩難中",
        replies: [
            "看你想學什麼。新創學「從 0 到 1」，大公司學「規模化的 SOP」。兩個都很值得但很不一樣。",
            "如果你對創業有興趣 → 新創，可以看到老闆怎麼決策。否則大公司履歷比較好賣。",
            "我自己跑過兩種，新創真的會 burnout 但成長最快，建議大三做新創、大四去大公司鍍金。",
        ],
    },
    {
        title: "想自學前端，路徑要怎麼安排比較不會迷路？",
        description: "目標是半年內能做出一個能 demo 的個人作品。教材太多反而選擇障礙，求一個務實的順序！",
        category: "skill",
        authorName: "想轉碼的同學",
        replies: [
            "HTML/CSS/JS 基本功 → React → 一個 side project → 部署到 Vercel。三個月就能跑完。",
            "別陷入「教學地獄」。學一週就動手做東西，邊做邊查比看完課再做有效十倍。",
            "推薦 The Odin Project + Frontend Mentor 的 challenge，做完一輪能力會跳一階。",
        ],
    },
    {
        title: "第一份實習的薪水該怎麼談？",
        description: "公司給了一個 offer，覺得有點低但不知道行情，也怕一開口就被 reject。台灣大學生實習行情大概多少？",
        category: "salary",
        authorName: "第一次談薪",
        replies: [
            "可以參考 比薪水 / Glassdoor 上同職位同產業的數字。",
            "第一份薪水比較不重要，先進去學東西。第二份再認真談。",
            "禮貌地問：「想了解這個職位的薪資範圍是怎麼定的？」會讓對方主動透露上限。",
        ],
    },
    {
        title: "社團經驗在履歷上怎麼寫才不會像流水帳？",
        description: "辦過幾個活動，但寫上去都很像「辦了 XX 活動，參加人數 XX 人」⋯⋯怎麼寫才有亮點？",
        category: "campus",
        authorName: "履歷困擾",
        replies: [
            "用 STAR 法：Situation / Task / Action / Result。每一條都帶一個量化結果。",
            "比起「辦了什麼」，寫「解決了什麼」更有畫面感。例如：把報名率從 30% 拉到 70%。",
            "面試官想看的是「思考過程」，不是「做了多少事」。把你的決策寫出來。",
        ],
    },
    {
        title: "找副業合作夥伴，一個人開發太孤單⋯⋯",
        description: "在做一個校園活動工具，技術 OK 但沒人一起 brainstorm 跟測試。有人想一起聊聊嗎？",
        category: "side",
        authorName: "想找隊友",
        replies: [
            "我也是一個人做 side project 的，可以聊聊看你的想法！",
            "建議找一個願意「先用起來」的使用者，比找隊友更重要。",
        ],
    },
    {
        title: "實習被當免費勞工，要不要直接離職？",
        description: "進去之後發現都在做整理 Excel、訂便當之類的雜事，學不到專業。但又怕履歷上空白⋯⋯",
        category: "internship",
        authorName: "實習踩雷",
        replies: [
            "先主動跟主管講你想學什麼，給他兩週機會調整。沒改善再走。",
            "履歷空白比待在爛實習好。三個月可以做更多事。",
            "我之前也踩雷，後來提離職時主管才認真給我專案做⋯⋯也是奇葩。",
        ],
    },
];

export const CATEGORIES = [
    { id: "all", label: "全部", emoji: "✨" },
    { id: "career", label: "職涯選擇", emoji: "🧭" },
    { id: "internship", label: "實習", emoji: "💼" },
    { id: "interview", label: "面試", emoji: "🎯" },
    { id: "skill", label: "技能學習", emoji: "📚" },
    { id: "salary", label: "薪資", emoji: "💰" },
    { id: "startup", label: "新創", emoji: "🚀" },
    { id: "campus", label: "校園生活", emoji: "🎓" },
    { id: "side", label: "副業合作", emoji: "🤝" },
];

const RESPONDER_NAMES = ["其他同學", "學長 K", "學姐 M", "匿名同學", "走過的人", "前實習生"];

function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function makeStore() {
    const topics = [];
    const replies = []; // flat list with topicId

    const now = Date.now();

    SEED_TOPICS.forEach((seed, idx) => {
        const createdAt = new Date(now - (SEED_TOPICS.length - idx) * 1000 * 60 * 90);
        const topicId = uid("t");
        const topicReplies = (seed.replies || []).map((content, ridx) => ({
            id: uid("r"),
            topicId,
            authorId: `seed_${idx}_${ridx}`,
            authorName: RESPONDER_NAMES[(idx + ridx) % RESPONDER_NAMES.length],
            content,
            createdAt: new Date(createdAt.getTime() + (ridx + 1) * 1000 * 60 * (15 + ridx * 7)).toISOString(),
        }));

        const lastActivity =
            topicReplies.length > 0
                ? new Date(topicReplies[topicReplies.length - 1].createdAt)
                : createdAt;

        topics.push({
            id: topicId,
            title: seed.title,
            description: seed.description,
            category: seed.category,
            authorId: `seed_user_${idx}`,
            authorName: seed.authorName,
            createdAt: createdAt.toISOString(),
            lastActivityAt: lastActivity.toISOString(),
            replyCount: topicReplies.length,
            viewCount: 5 + Math.floor(Math.random() * 80),
        });
        replies.push(...topicReplies);
    });

    return { topics, replies };
}

// Module-scoped singleton (lives for the lifetime of the Node process).
const STATE = makeStore();

export function listTopics({ category } = {}) {
    let items = STATE.topics.slice();
    if (category && category !== "all") {
        items = items.filter((t) => t.category === category);
    }
    items.sort(
        (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );
    return items;
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

export function createTopic({ title, description, category, authorName }) {
    const cleanTitle = (title || "").trim();
    if (!cleanTitle) throw new Error("title required");
    const safeCat = CATEGORIES.find((c) => c.id === category) ? category : "career";
    const now = new Date().toISOString();
    const topic = {
        id: uid("t"),
        title: cleanTitle.slice(0, 80),
        description: (description || "").trim().slice(0, 400),
        category: safeCat === "all" ? "career" : safeCat,
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
