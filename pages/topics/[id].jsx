import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import SimulatorBar from "@/components/SimulatorBar";

const DiscussRoom = dynamic(() => import("@/components/Discuss/DiscussRoom"), {
    ssr: false,
});

export default function TopicPage() {
    const router = useRouter();
    const { id } = router.query;
    const normalized = Array.isArray(id) ? id[0] : id;

    return (
        <>
            <SimulatorBar />
            {normalized ? <DiscussRoom topicId={normalized} /> : null}
        </>
    );
}
