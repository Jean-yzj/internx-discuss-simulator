import { useCallback, useEffect, useState } from "react";
import { INDUSTRIES, CATEGORIES } from "@/lib/store";
import {
    loadProfile,
    saveProfile,
    isOnboarded,
    hasCompletedSurvey,
    getDemoRole,
    DEMO_ROLES,
} from "@/lib/profile";

/**
 * Shared client-side session hook.
 *
 * - Bootstraps the profile from localStorage.
 * - Fetches industry stats for onboarding.
 * - Exposes profile mutators: onboarding, join/leave industry,
 *   recordPollVote, saveSurveyResponse.
 *
 * Pages embed this and pass profile + helpers down. Until the profile has
 * loaded we render `null` to prevent hydration mismatches.
 */
export function useUserSession() {
    const [hydrated, setHydrated] = useState(false);
    const [profile, setProfile] = useState(null);
    const [industries, setIndustries] = useState(
        INDUSTRIES.map((i) => ({ ...i, topicCount: 0 }))
    );
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const p = loadProfile();
        setProfile(p);
        setHydrated(true);
        if (!isOnboarded(p)) {
            setShowOnboarding(true);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/discuss/industries");
                const json = await res.json();
                if (!cancelled && json.ok && Array.isArray(json.industries)) {
                    setIndustries(json.industries);
                }
            } catch (err) {
                console.error("load industries failed", err);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const completeOnboarding = useCallback((data) => {
        setProfile((curr) => {
            const next = {
                ...(curr || {}),
                userId: curr?.userId || `me_${Math.random().toString(36).slice(2, 12)}`,
                displayName: data.displayName,
                industries: data.industries,
                onboardedAt: curr?.onboardedAt || new Date().toISOString(),
                painPoints: curr?.painPoints || null,
                pollVotes: curr?.pollVotes || {},
            };
            saveProfile(next);
            return next;
        });
        setShowOnboarding(false);
    }, []);

    const openEditProfile = useCallback(() => setShowOnboarding(true), []);
    const closeEditProfile = useCallback(() => {
        setShowOnboarding((prev) => (isOnboarded(profile) ? false : prev));
    }, [profile]);

    const joinIndustry = useCallback((id) => {
        setProfile((curr) => {
            const list = Array.isArray(curr?.industries) ? curr.industries : [];
            if (list.includes(id)) return curr;
            const next = { ...(curr || {}), industries: [...list, id] };
            saveProfile(next);
            return next;
        });
    }, []);

    const leaveIndustry = useCallback((id) => {
        setProfile((curr) => {
            const list = Array.isArray(curr?.industries) ? curr.industries : [];
            const filtered = list.filter((x) => x !== id);
            const next = { ...(curr || {}), industries: filtered };
            saveProfile(next);
            return next;
        });
    }, []);

    const recordPollVote = useCallback((pollId, choice) => {
        setProfile((curr) => {
            const next = {
                ...(curr || {}),
                pollVotes: { ...(curr?.pollVotes || {}), [pollId]: choice },
            };
            saveProfile(next);
            return next;
        });
    }, []);

    const recordActivity = useCallback((entry) => {
        // entry: { id, title, industry, role }
        setProfile((curr) => {
            const list = Array.isArray(curr?.myActivity) ? curr.myActivity : [];
            // De-dupe on topic id; if existing entry was 'replier' but new is 'author' → upgrade.
            const filtered = list.filter((e) => e.id !== entry.id);
            const next = {
                ...(curr || {}),
                myActivity: [
                    { ...entry, lastTouchedAt: new Date().toISOString() },
                    ...filtered,
                ].slice(0, 30),
            };
            saveProfile(next);
            return next;
        });
    }, []);

    const setDemoRole = useCallback((roleId) => {
        const role = getDemoRole(roleId);
        setProfile((curr) => {
            const next = {
                ...(curr || {}),
                demoRole: role.id,
                badges: role.badges,
                brand: role.brand,
                moderates: role.moderates,
            };
            saveProfile(next);
            return next;
        });
    }, []);

    const saveSurveyResponse = useCallback((painPointsArr) => {
        const submission = {
            painPoints: painPointsArr,
            submittedAt: new Date().toISOString(),
        };
        setProfile((curr) => {
            const next = { ...(curr || {}), painPoints: submission };
            saveProfile(next);
            return next;
        });
        return submission;
    }, []);

    // Simulated notifications derived from profile state.
    // The simulator has no real-time backend, so we synthesise plausible
    // activity events based on what the user has and hasn't done.
    const notifications = computeNotifications(profile);

    const markNotificationsRead = useCallback(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem("discuss-demo-notif-read", String(Date.now()));
        } catch {}
        // Force a re-render so unread count drops to 0
        setProfile((curr) => (curr ? { ...curr, _notifReadAt: Date.now() } : curr));
    }, []);

    return {
        hydrated,
        profile,
        industries,
        categories: CATEGORIES,
        demoRoles: DEMO_ROLES,
        showOnboarding,
        completeOnboarding,
        openEditProfile,
        closeEditProfile,
        joinIndustry,
        leaveIndustry,
        recordPollVote,
        saveSurveyResponse,
        setDemoRole,
        recordActivity,
        notifications,
        markNotificationsRead,
        isOnboarded: isOnboarded(profile),
        hasCompletedSurvey: hasCompletedSurvey(profile),
    };
}

// Synthesised "what's new" feed. Stable across the simulator process —
// driven by the user's own profile signals so each visitor sees something
// relevant. The `read` flag becomes true after they open the dropdown.
function computeNotifications(profile) {
    if (!profile) return [];
    const items = [];
    const readAt = (typeof window !== "undefined" ? Number(window.localStorage.getItem("discuss-demo-notif-read")) : 0) || 0;
    const now = Date.now();
    const hoursSinceRead = (now - readAt) / 3_600_000;

    // Industries newly subscribed → suggest joining the experts page
    if (Array.isArray(profile.industries) && profile.industries.length > 0) {
        items.push({
            id: "n_welcome",
            icon: "ri-sparkling-line",
            text: `你訂閱了 ${profile.industries.length} 個行業論壇，已經把熱門話題排到首頁。`,
            time: "剛剛",
            href: "/",
            read: hoursSinceRead < 24 ? false : true,
        });
    }

    // Survey not done → nudge
    if (!hasCompletedSurvey(profile)) {
        items.push({
            id: "n_survey",
            icon: "ri-emotion-sad-line",
            text: "做完困擾調查可以解鎖「為你推薦」內容。",
            time: "今天",
            href: "/survey",
            read: false,
        });
    }

    // Hangtuo announcement
    items.push({
        id: "n_hangtuo",
        icon: "ri-vip-crown-line",
        text: "新合作品牌：航拓策略顧問加入了「認證專家」名單。",
        time: "1 天前",
        href: "/experts",
        read: hoursSinceRead < 24 ? false : true,
    });

    // Brand expert reply (simulated based on votes)
    const voteCount = Object.keys(profile.pollVotes || {}).length;
    if (voteCount >= 1) {
        items.push({
            id: "n_pollresult",
            icon: "ri-bar-chart-grouped-line",
            text: `你投了 ${voteCount} 個投票，看看大家現在的意見分佈。`,
            time: "幾小時前",
            href: "/polls",
            read: hoursSinceRead < 24 ? false : true,
        });
    }

    // Moderator reminder if they switched to a moderator role
    if (Array.isArray(profile.moderates) && profile.moderates.length > 0) {
        items.push({
            id: "n_mod",
            icon: "ri-shield-user-line",
            text: `你是 ${profile.moderates.join("、")} 論壇的版主。試試在話題頁右上看到「版主工具」。`,
            time: "今天",
            href: `/forums/${profile.moderates[0]}`,
            read: false,
        });
    }

    return items;
}
