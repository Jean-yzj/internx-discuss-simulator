/**
 * Client-side "registration" — a minimal profile saved to localStorage.
 *
 * The simulator has no auth backend; this just records the student's
 * display name + which industries they "joined". Used to:
 *   - decide whether to show the onboarding modal
 *   - filter topics on the home page to their joined industries
 *   - tag topics they create
 *   - mark their own replies as "self" in the chat-style detail page
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
    };
}

export function loadProfile() {
    if (typeof window === "undefined") return emptyProfile();
    try {
        const raw = window.localStorage.getItem(PROFILE_KEY);
        if (!raw) return emptyProfile();
        const parsed = JSON.parse(raw);
        return {
            userId: parsed.userId || makeUid(),
            displayName: parsed.displayName || "",
            industries: Array.isArray(parsed.industries) ? parsed.industries : [],
            onboardedAt: parsed.onboardedAt || null,
        };
    } catch {
        return emptyProfile();
    }
}

export function saveProfile(profile) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
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
