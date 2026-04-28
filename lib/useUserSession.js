import { useCallback, useEffect, useState } from "react";
import { INDUSTRIES, CATEGORIES } from "@/lib/store";
import { loadProfile, saveProfile, isOnboarded } from "@/lib/profile";

/**
 * Shared client-side session hook.
 *
 * - Bootstraps the profile from localStorage.
 * - Fetches industry stats (topic counts) from the API for the onboarding modal.
 * - Exposes update/join/leave/forceOnboard helpers.
 *
 * Pages embed this and pass profile + helpers down. Until the profile has
 * loaded we render `null` to prevent hydration mismatches.
 */
export function useUserSession() {
    const [hydrated, setHydrated] = useState(false);
    const [profile, setProfile] = useState(null);
    const [industries, setIndustries] = useState(
        // Server-side: fall back to constant list with 0 counts so the page
        // can render the cards before the API hits.
        INDUSTRIES.map((i) => ({ ...i, topicCount: 0 }))
    );
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Load profile once on mount
    useEffect(() => {
        const p = loadProfile();
        setProfile(p);
        setHydrated(true);
        if (!isOnboarded(p)) {
            setShowOnboarding(true);
        }
    }, []);

    // Fetch industry stats
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
            };
            saveProfile(next);
            return next;
        });
        setShowOnboarding(false);
    }, []);

    const openEditProfile = useCallback(() => setShowOnboarding(true), []);
    const closeEditProfile = useCallback(() => {
        // Only allow closing if onboarded
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

    return {
        hydrated,
        profile,
        industries,
        categories: CATEGORIES,
        showOnboarding,
        completeOnboarding,
        openEditProfile,
        closeEditProfile,
        joinIndustry,
        leaveIndustry,
        isOnboarded: isOnboarded(profile),
    };
}
