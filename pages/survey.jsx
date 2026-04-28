import dynamic from "next/dynamic";
import SimulatorBar from "@/components/SimulatorBar";
import Onboarding from "@/components/Onboarding";
import { useUserSession } from "@/lib/useUserSession";

const Survey = dynamic(() => import("@/components/Discuss/Survey"), {
    ssr: false,
});

export default function SurveyPage() {
    const session = useUserSession();
    if (!session.hydrated) return null;

    return (
        <>
            <SimulatorBar
                profile={session.profile}
                industries={session.industries}
                onEditProfile={session.openEditProfile}
            />
            {session.isOnboarded ? (
                <Survey
                    profile={session.profile}
                    onSubmitted={session.saveSurveyResponse}
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
