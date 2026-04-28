import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import SimulatorBar from "@/components/SimulatorBar";
import Onboarding from "@/components/Onboarding";
import { useUserSession } from "@/lib/useUserSession";

const IndustryForum = dynamic(() => import("@/components/Discuss/IndustryForum"), {
    ssr: false,
});

export default function IndustryForumPage() {
    const router = useRouter();
    const session = useUserSession();
    const { industry } = router.query;
    const id = Array.isArray(industry) ? industry[0] : industry;

    if (!session.hydrated) return null;

    return (
        <>
            <SimulatorBar
                profile={session.profile}
                industries={session.industries}
                onEditProfile={session.openEditProfile}
            />
            {session.isOnboarded && id ? (
                <IndustryForum
                    industries={session.industries}
                    industryId={id}
                    profile={session.profile}
                    onJoinIndustry={session.joinIndustry}
                    onLeaveIndustry={session.leaveIndustry}
                />
            ) : null}
            {session.showOnboarding && (
                <Onboarding
                    initialProfile={session.profile}
                    industries={session.industries}
                    closable={session.isOnboarded}
                    onClose={session.closeEditProfile}
                    onComplete={session.completeOnboarding}
                />
            )}
        </>
    );
}
