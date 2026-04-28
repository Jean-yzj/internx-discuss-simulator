import dynamic from "next/dynamic";
import SimulatorBar from "@/components/SimulatorBar";

const DiscussList = dynamic(() => import("@/components/Discuss/DiscussList"), {
    ssr: false,
});

export default function Home() {
    return (
        <>
            <SimulatorBar />
            <DiscussList />
        </>
    );
}
