import dynamic from "next/dynamic";
import SimulatorBar from "@/components/SimulatorBar";
import Onboarding from "@/components/Onboarding";
import { useUserSession } from "@/lib/useUserSession";

const PollsList = dynamic(() => import("@/components/Discuss/PollsList"), {
    ssr: false,
});

export default function PollsPage() {
    const session = useUserSession();
    if (!session.hydrated) return null;

    return (
        <>
            <SimulatorBar
                profile={session.profile}
                industries={session.industries}
                onEditProfile={session.openEditProfile}
                onSwitchRole={session.setDemoRole}
            />
            {session.isOnboarded ? (
                <PollsList profile={session.profile} onPollVoted={session.recordPollVote} />
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
