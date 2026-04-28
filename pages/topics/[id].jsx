import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import SimulatorBar from "@/components/SimulatorBar";
import Onboarding from "@/components/Onboarding";
import { useUserSession } from "@/lib/useUserSession";

const DiscussRoom = dynamic(() => import("@/components/Discuss/DiscussRoom"), {
    ssr: false,
});

export default function TopicPage() {
    const router = useRouter();
    const session = useUserSession();
    const { id } = router.query;
    const normalized = Array.isArray(id) ? id[0] : id;

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
            {session.isOnboarded && normalized ? (
                <DiscussRoom topicId={normalized} onRecordActivity={session.recordActivity} />
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
