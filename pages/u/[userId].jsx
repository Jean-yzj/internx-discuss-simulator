import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import SimulatorBar from "@/components/SimulatorBar";
import Onboarding from "@/components/Onboarding";
import { useUserSession } from "@/lib/useUserSession";

const UserProfile = dynamic(() => import("@/components/Discuss/UserProfile"), {
    ssr: false,
});

export default function UserProfilePage() {
    const router = useRouter();
    const session = useUserSession();
    const { userId } = router.query;
    const id = Array.isArray(userId) ? userId[0] : userId;

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
            {session.isOnboarded && id ? <UserProfile userId={id} /> : null}
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
