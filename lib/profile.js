/**
 * Client-side "registration" — a minimal profile saved to localStorage.
 *
 * Records: display name, joined industries, pain-point survey response,
 * poll votes, and the user's "demo role" — a way for reviewers to
 * impersonate different badge holders (creator, brand expert, moderator,
 * top contributor) without us having to spin up real auth.
 */

const PROFILE_KEY = "discuss-demo-profile";

function makeUid() {
    return `me_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function emptyProfile() {
    return {
        userId: makeUid(),
        displayName: "",
        industries: [],
        onboardedAt: null,
        painPoints: null,
        pollVotes: {},
        // Activity history — topics I created + topics I replied to.
        // Each entry: { id, title, industry, role: 'author' | 'replier', lastTouchedAt }
        myActivity: [],
        demoRole: "student", // see DEMO_ROLES
        // The next three fields are computed from `demoRole` whenever the
        // profile is loaded, but persisted alongside so they stay in sync
        // with what the server saw at post-time.
        badges: [],
        brand: null,
        moderates: [],
    };
}

// Demo-role table. Lets reviewers switch their identity in the simulator
// to see how each badge type looks in the UI without us having to
// implement real auth, KYC, or admin tools. Mirrored on the server side
// only via the `badges`/`brand`/`moderates` snapshots stored on each
// reply / topic.
export const DEMO_ROLES = [
    {
        id: "student",
        label: "一般學生",
        emoji: "🎓",
        description: "預設身份，沒有特殊標籤。",
        badges: [],
        brand: null,
        moderates: [],
    },
    {
        id: "top-contributor",
        label: "熱心助人",
        emoji: "💖",
        description: "在版上回覆超過 20 則、收到大量 helpful 票的活躍學長姐。",
        badges: ["top-contributor"],
        brand: null,
        moderates: [],
    },
    {
        id: "verified-creator",
        label: "認證創作者",
        emoji: "✍️",
        description: "經平台驗證的職涯內容創作者。",
        badges: ["verified-creator"],
        brand: null,
        moderates: [],
    },
    {
        id: "industry-expert",
        label: "業界專家",
        emoji: "🎓",
        description: "5 年以上業界資歷、經審核通過。",
        badges: ["industry-expert"],
        brand: null,
        moderates: [],
    },
    {
        id: "hangtuo-consultant",
        label: "航拓資深顧問",
        emoji: "⛵",
        description: "由 ex-McKinsey 顧問創立的精品策略顧問公司「航拓」的成員。",
        badges: ["brand-expert", "verified-creator"],
        brand: { brandId: "hangtuo", role: "資深策略顧問" },
        moderates: [],
    },
    {
        id: "consulting-mod",
        label: "管顧版版主",
        emoji: "🛡️",
        description: "管顧業論壇版主，可刪違規留言、置頂優質話題。",
        badges: ["moderator", "top-contributor"],
        brand: null,
        moderates: ["consulting"],
    },
    {
        id: "tech-mod",
        label: "科技業版主",
        emoji: "🛡️",
        description: "科技業論壇版主，可管理該版內容。",
        badges: ["moderator", "verified-creator"],
        brand: null,
        moderates: ["tech"],
    },
];

export function getDemoRole(id) {
    return DEMO_ROLES.find((r) => r.id === id) || DEMO_ROLES[0];
}

export function loadProfile() {
    if (typeof window === "undefined") return emptyProfile();
    try {
        const raw = window.localStorage.getItem(PROFILE_KEY);
        if (!raw) return emptyProfile();
        const parsed = JSON.parse(raw);
        const role = getDemoRole(parsed.demoRole || "student");
        return {
            userId: parsed.userId || makeUid(),
            displayName: parsed.displayName || "",
            industries: Array.isArray(parsed.industries) ? parsed.industries : [],
            onboardedAt: parsed.onboardedAt || null,
            painPoints:
                parsed.painPoints && Array.isArray(parsed.painPoints.painPoints)
                    ? parsed.painPoints
                    : null,
            pollVotes: parsed.pollVotes && typeof parsed.pollVotes === "object" ? parsed.pollVotes : {},
            myActivity: Array.isArray(parsed.myActivity) ? parsed.myActivity : [],
            demoRole: role.id,
            badges: role.badges,
            brand: role.brand,
            moderates: role.moderates,
        };
    } catch {
        return emptyProfile();
    }
}

export function saveProfile(profile) {
    if (typeof window === "undefined") return;
    try {
        // Re-derive badges/brand/moderates from demoRole on save, so they
        // can never drift even if a caller mutates the profile by hand.
        const role = getDemoRole(profile.demoRole || "student");
        const toSave = {
            ...profile,
            demoRole: role.id,
            badges: role.badges,
            brand: role.brand,
            moderates: role.moderates,
        };
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(toSave));
    } catch {
        /* quota / private mode → silently ignore */
    }
}

export function clearProfile() {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(PROFILE_KEY);
    } catch {}
}

export function isOnboarded(profile) {
    return !!(profile && profile.onboardedAt && Array.isArray(profile.industries) && profile.industries.length > 0);
}

export function hasCompletedSurvey(profile) {
    return !!(profile?.painPoints && Array.isArray(profile.painPoints.painPoints) && profile.painPoints.painPoints.length > 0);
}

export function isModeratorOf(profile, industryId) {
    return !!(
        profile &&
        Array.isArray(profile.badges) &&
        profile.badges.includes("moderator") &&
        Array.isArray(profile.moderates) &&
        profile.moderates.includes(industryId)
    );
}
