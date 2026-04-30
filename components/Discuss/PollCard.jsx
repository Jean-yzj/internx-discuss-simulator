import { useState } from "react";
import { INDUSTRIES } from "@/lib/store";
import styles from "./PollCard.module.css";

/**
 * Multi-question poll card. Mirrors the staging needs-wall 投票牆 widget:
 * one card containing N questions, each with M options shown vertically.
 * Each row shows emoji + label + subtitle + vote-count + percentage; once
 * the user has voted on that question, a progress bar fills the row
 * showing the relative vote share.
 *
 * Props:
 * - poll        — multi-question poll JSON (see lib/store.js pollToJSON)
 * - myVotes     — { [questionId]: optionId } from profile.pollVotes[poll.id]
 * - userId      — caller's user id
 * - onVoted     — (pollId, questionId, optionId) → void  (parent records to localStorage)
 */
export default function PollCard({ poll: incomingPoll, myVotes = {}, userId, onVoted }) {
    const [poll, setPoll] = useState(incomingPoll);
    const [localVotes, setLocalVotes] = useState(myVotes || {});
    const [voting, setVoting] = useState(false);

    const industry = poll.industry ? INDUSTRIES.find((i) => i.id === poll.industry) : null;

    async function vote(questionId, optionId) {
        if (!userId || voting) return;
        setVoting(true);

        // Optimistic update — replicate server toggle/change logic
        setPoll((prev) => {
            const next = JSON.parse(JSON.stringify(prev));
            const q = next.questions.find((qq) => qq.id === questionId);
            if (!q) return prev;
            const newOpt = q.options.find((o) => o.id === optionId);
            const prevOptId = localVotes[questionId];
            const prevOpt = prevOptId ? q.options.find((o) => o.id === prevOptId) : null;

            const isToggleOff = prevOpt && prevOpt.id === newOpt.id;
            if (isToggleOff) {
                prevOpt.votes = Math.max(0, prevOpt.votes - 1);
            } else {
                if (prevOpt) prevOpt.votes = Math.max(0, prevOpt.votes - 1);
                newOpt.votes += 1;
            }
            // Recompute totals + percentages for this question
            q.totalVotes = q.options.reduce((acc, o) => acc + o.votes, 0);
            q.options.forEach((o) => {
                o.percent = q.totalVotes > 0 ? Math.round((o.votes / q.totalVotes) * 100) : 0;
            });
            // Recompute poll-level total
            next.totalVotes = next.questions.reduce((acc, qq) => acc + qq.totalVotes, 0);
            return next;
        });
        setLocalVotes((curr) => {
            const next = { ...curr };
            if (next[questionId] === optionId) delete next[questionId];
            else next[questionId] = optionId;
            return next;
        });

        try {
            const res = await fetch(`/api/discuss/polls/${poll.id}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, questionId, optionId }),
            });
            const json = await res.json();
            if (json.ok && json.poll) {
                setPoll(json.poll);
            }
            onVoted?.(poll.id, questionId, optionId);
        } catch (err) {
            console.error("vote failed", err);
        } finally {
            setVoting(false);
        }
    }

    const accentVar = { "--accent": industry?.accent };
    const totalAnswered = Object.keys(localVotes).length;

    return (
        <div className={styles.card} style={accentVar}>
            <div className={styles.header}>
                <div className={styles.icon}>
                    <i className="ri-bar-chart-grouped-fill" />
                </div>
                <div className={styles.titleBlock}>
                    <h3 className={styles.title}>{poll.title}</h3>
                    <p className={styles.subtitle}>
                        一次參與多題投票，快速標記你的需求方向。
                    </p>
                </div>
                {industry && (
                    <span className={styles.industryChip}>
                        {industry.emoji} {industry.label}
                    </span>
                )}
                <span className={styles.totalVotes}>
                    <i className="ri-group-line" />
                    <strong>{poll.totalVotes}</strong> 人已投
                </span>
            </div>

            {poll.questions.map((q, qIdx) => {
                const myVoteOptionId = localVotes[q.id];
                const hasVoted = !!myVoteOptionId;
                return (
                    <div key={q.id} className={styles.questionBlock}>
                        <h4 className={styles.questionTitle}>
                            {qIdx + 1}. {q.title}
                        </h4>
                        <div className={styles.optionsList}>
                            {q.options.map((opt) => {
                                const mine = myVoteOptionId === opt.id;
                                const rowClass = [
                                    styles.optionRow,
                                    hasVoted && styles.optionRowVoted,
                                    mine && styles.optionRowMine,
                                ].filter(Boolean).join(" ");
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        className={rowClass}
                                        onClick={() => vote(q.id, opt.id)}
                                        disabled={voting}
                                        title={hasVoted && !mine ? "點擊改變投票" : undefined}
                                    >
                                        {hasVoted && (
                                            <span
                                                className={styles.resultBar}
                                                style={{ width: `${Math.max(2, opt.percent)}%` }}
                                            />
                                        )}
                                        <span className={styles.optionContent}>
                                            <span className={styles.optionEmoji}>{opt.emoji}</span>
                                            <span className={styles.optionMain}>
                                                <span className={styles.optionLabel}>
                                                    {opt.label}
                                                    {mine && <span className={styles.myMark}>你的選擇</span>}
                                                </span>
                                                {opt.subtitle && (
                                                    <span className={styles.optionSubtitle}>{opt.subtitle}</span>
                                                )}
                                            </span>
                                            {hasVoted && (
                                                <span className={styles.optionStats}>
                                                    <span className={styles.optionPct}>{opt.percent}%</span>
                                                    <span className={styles.optionVoteCount}>{opt.votes} 票</span>
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {hasVoted && (
                            <span className={styles.questionStat}>
                                <i className="ri-check-line" />
                                你已投票 · {q.totalVotes} 人參與
                            </span>
                        )}
                    </div>
                );
            })}

            <div className={styles.footer}>
                <span>
                    <i className="ri-time-line" /> {new Date(poll.createdAt).toLocaleDateString("zh-TW")}
                </span>
                {totalAnswered > 0 && (
                    <span style={{ color: "var(--theme-color)", fontWeight: 600 }}>
                        ✓ 已回答 {totalAnswered} / {poll.questions.length} 題
                    </span>
                )}
            </div>
        </div>
    );
}
