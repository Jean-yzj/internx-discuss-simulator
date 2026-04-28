import { useState } from "react";
import { INDUSTRIES } from "@/lib/store";
import styles from "./PollCard.module.css";

export default function PollCard({
    poll: incomingPoll,
    myChoice: incomingChoice,
    userId,
    onVoted,
}) {
    const [poll, setPoll] = useState(incomingPoll);
    const [myChoice, setMyChoice] = useState(incomingChoice || null);
    const [voting, setVoting] = useState(false);

    const industry = poll.industry ? INDUSTRIES.find((i) => i.id === poll.industry) : null;

    async function vote(choice) {
        if (!userId || voting || myChoice) return;
        setVoting(true);
        // Optimistic update
        const optimistic = {
            ...poll,
            votes: { ...poll.votes, [choice]: (poll.votes[choice] || 0) + 1 },
            totalVotes: (poll.totalVotes || 0) + 1,
        };
        const total = optimistic.totalVotes;
        optimistic.percentA = total ? Math.round((optimistic.votes.a / total) * 100) : 50;
        optimistic.percentB = total ? Math.round((optimistic.votes.b / total) * 100) : 50;
        setPoll(optimistic);
        setMyChoice(choice);
        try {
            const res = await fetch(`/api/discuss/polls/${poll.id}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, choice }),
            });
            const json = await res.json();
            if (json.ok && json.poll) {
                setPoll(json.poll);
            }
            onVoted?.(poll.id, choice);
        } catch (err) {
            console.error("vote failed", err);
        } finally {
            setVoting(false);
        }
    }

    const accentVar = { "--accent": industry?.accent };

    return (
        <div className={styles.card} style={accentVar}>
            <div className={styles.header}>
                <span className={styles.badge}>
                    <i className="ri-bar-chart-fill" /> 投票
                </span>
                {industry && (
                    <span className={styles.industryChip}>
                        {industry.emoji} {industry.label}
                    </span>
                )}
                <span className={styles.totalVotes}>
                    <i className="ri-group-line" /> {poll.totalVotes} 人已投
                </span>
            </div>

            <h3 className={styles.question}>{poll.question}</h3>

            {!myChoice ? (
                <div className={styles.options}>
                    <button
                        type="button"
                        className={styles.optionBtn}
                        onClick={() => vote("a")}
                        disabled={voting}
                    >
                        <span className={styles.optionEmoji}>{poll.optionA.emoji}</span>
                        <span className={styles.optionLabel}>{poll.optionA.label}</span>
                        <span className={styles.optionSubtitle}>{poll.optionA.subtitle}</span>
                    </button>
                    <button
                        type="button"
                        className={styles.optionBtn}
                        onClick={() => vote("b")}
                        disabled={voting}
                    >
                        <span className={styles.optionEmoji}>{poll.optionB.emoji}</span>
                        <span className={styles.optionLabel}>{poll.optionB.label}</span>
                        <span className={styles.optionSubtitle}>{poll.optionB.subtitle}</span>
                    </button>
                </div>
            ) : (
                <div className={styles.resultRow}>
                    <div className={`${styles.resultOption} ${myChoice === "a" ? styles.myChoice : ""}`}>
                        <div className={styles.resultBar} style={{ width: `${poll.percentA}%` }} />
                        <div className={styles.resultContent}>
                            <span className={styles.resultEmoji}>{poll.optionA.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div className={styles.resultLabel}>
                                    {poll.optionA.label}
                                    {myChoice === "a" && (
                                        <span className={styles.myChoiceTag} style={{ marginLeft: 8 }}>你的選擇</span>
                                    )}
                                </div>
                                <div className={styles.resultSubtitle}>{poll.optionA.subtitle}</div>
                            </div>
                            <span className={styles.resultPercent}>{poll.percentA}%</span>
                        </div>
                    </div>
                    <div className={`${styles.resultOption} ${myChoice === "b" ? styles.myChoice : ""}`}>
                        <div className={styles.resultBar} style={{ width: `${poll.percentB}%` }} />
                        <div className={styles.resultContent}>
                            <span className={styles.resultEmoji}>{poll.optionB.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div className={styles.resultLabel}>
                                    {poll.optionB.label}
                                    {myChoice === "b" && (
                                        <span className={styles.myChoiceTag} style={{ marginLeft: 8 }}>你的選擇</span>
                                    )}
                                </div>
                                <div className={styles.resultSubtitle}>{poll.optionB.subtitle}</div>
                            </div>
                            <span className={styles.resultPercent}>{poll.percentB}%</span>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.footer}>
                <span><i className="ri-time-line" /> {new Date(poll.createdAt).toLocaleDateString("zh-TW")}</span>
                {myChoice && (
                    <span style={{ color: "var(--theme-color)", fontWeight: 700 }}>
                        ✓ 已投給 {myChoice === "a" ? poll.optionA.label : poll.optionB.label}
                    </span>
                )}
            </div>
        </div>
    );
}
