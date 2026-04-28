import { useEffect, useState } from "react";
import Link from "next/link";
import PollCard from "./PollCard";
import styles from "./PollsList.module.css";

export default function PollsList({ profile, onPollVoted }) {
    const [polls, setPolls] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/discuss/polls");
                const json = await res.json();
                if (!cancelled && json.ok) setPolls(json.polls);
            } catch (err) {
                console.error("load polls failed", err);
                if (!cancelled) setPolls([]);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.crumbs}>
                    <Link href="/">← 回到首頁</Link>
                </div>
                <div className={styles.hero}>
                    <span className={styles.heroBadge}>
                        <i className="ri-bar-chart-grouped-fill" /> 投票區
                    </span>
                    <h1 className={styles.heroTitle}>A 還是 B？</h1>
                    <p className={styles.heroSubtitle}>
                        快問快答，看看大家怎麼選。投完就能看到大家的選擇分佈。
                    </p>
                </div>

                {polls === null && (
                    <div className={styles.empty}>載入中⋯⋯</div>
                )}
                {Array.isArray(polls) && polls.length === 0 && (
                    <div className={styles.empty}>還沒有投票，敬請期待。</div>
                )}
                {Array.isArray(polls) && polls.length > 0 && (
                    <div className={styles.list}>
                        {polls.map((p) => (
                            <PollCard
                                key={p.id}
                                poll={p}
                                myChoice={profile?.pollVotes?.[p.id]}
                                userId={profile?.userId}
                                onVoted={onPollVoted}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
