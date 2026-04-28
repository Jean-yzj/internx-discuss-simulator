import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import SimulatorBar from "@/components/SimulatorBar";
import Onboarding from "@/components/Onboarding";
import { useUserSession } from "@/lib/useUserSession";

const BrandPage = dynamic(() => import("@/components/Discuss/BrandPage"), {
    ssr: false,
});

export default function BrandPageRoute() {
    const router = useRouter();
    const session = useUserSession();
    const { brandId } = router.query;
    const id = Array.isArray(brandId) ? brandId[0] : brandId;

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
            {session.isOnboarded && id ? <BrandPage brandId={id} /> : null}
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
