import dynamic from "next/dynamic";
import SimulatorBar from "@/components/SimulatorBar";
import Onboarding from "@/components/Onboarding";
import { useUserSession } from "@/lib/useUserSession";

const DiscussList = dynamic(() => import("@/components/Discuss/DiscussList"), {
    ssr: false,
});

export default function Home() {
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
                <DiscussList
                    profile={session.profile}
                    industries={session.industries}
                    onRequestEditProfile={session.openEditProfile}
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
