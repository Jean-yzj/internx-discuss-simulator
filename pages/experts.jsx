import dynamic from "next/dynamic";
import SimulatorBar from "@/components/SimulatorBar";
import Onboarding from "@/components/Onboarding";
import { useUserSession } from "@/lib/useUserSession";

const ExpertsList = dynamic(() => import("@/components/Discuss/ExpertsList"), {
    ssr: false,
});

export default function ExpertsPage() {
    const session = useUserSession();
    if (!session.hydrated) return null;

    return (
        <>
            <SimulatorBar
                profile={session.profile}
                industries={session.industries}
                onEditProfile={session.openEditProfile}
                onSwitchRole={session.setDemoRole}
                notifications={session.notifications}
                onMarkNotificationsRead={session.markNotificationsRead}
            />
            {session.isOnboarded ? <ExpertsList /> : null}
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
