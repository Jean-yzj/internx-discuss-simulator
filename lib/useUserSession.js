import { useCallback, useEffect, useState } from "react";
import { INDUSTRIES, CATEGORIES } from "@/lib/store";
import {
    loadProfile,
    saveProfile,
    isOnboarded,
    hasCompletedSurvey,
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
        recordPollVote,
        saveSurveyResponse,
        isOnboarded: isOnboarded(profile),
        hasCompletedSurvey: hasCompletedSurvey(profile),
    };
}
