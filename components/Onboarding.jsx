import { useEffect, useState } from "react";
import styles from "./Onboarding.module.css";

/**
 * Onboarding modal — the simulator's "registration" flow.
 *
 * Two steps in one card: pick a display name, then pick at least one
 * industry. Saves to localStorage via the parent's onComplete callback.
 *
 * If `closable` is true a top-right × button shows up — we use that for
 * "edit my interests" later, but the first-visit flow blocks closing
 * until the student picks an industry.
 */
export default function Onboarding({
    initialProfile,
    industries,
    closable = false,
    onClose,
    onComplete,
}) {
    const [name, setName] = useState(initialProfile?.displayName || "");
    const [selected, setSelected] = useState(
        Array.isArray(initialProfile?.industries) ? initialProfile.industries : []
    );

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    function toggle(id) {
        setSelected((curr) => (curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]));
    }

    function backdropClick(e) {
        if (!closable) return;
        if (e.target === e.currentTarget) onClose?.();
    }

    function submit() {
        const cleanName = (name || "").trim().slice(0, 20) || "匿名同學";
        onComplete?.({
            displayName: cleanName,
            industries: selected,
        });
    }

    const canSubmit = selected.length > 0;

    return (
        <div className={styles.backdrop} onClick={backdropClick}>
            <div className={styles.card}>
                {closable && (
                    <button
                        type="button"
                        className={styles.closeBtn}
                        aria-label="關閉"
                        onClick={onClose}
                    >
                        <i className="ri-close-line" />
                    </button>
                )}

                <span className={styles.heroBadge}>
                    <i className="ri-sparkling-line" /> 加入話題討論
                </span>
                <h2 className={styles.title}>歡迎來到實習通．話題</h2>
                <p className={styles.subtitle}>
                    告訴我們一點關於你自己的事，我們會把<strong>跟你方向相關的討論</strong>放在最上面，
                    讓你可以直接看到「同行的人」在聊什麼。
                </p>

                <div>
                    <div className={styles.stepLabel}>1. 顯示名稱</div>
                    <p className={styles.stepHelp}>留言時會顯示這個名字，可以是匿稱。</p>
                    <input
                        className={styles.input}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="匿名同學 / 想去 BCG 的 K"
                        maxLength={20}
                        autoFocus
                    />
                </div>

                <div>
                    <div className={styles.stepLabel}>2. 你對哪些行業有興趣？（可複選）</div>
                    <p className={styles.stepHelp}>
                        每個行業都是一個獨立論壇，有自己的熱門話題、薪資情報、面試經驗。
                    </p>
                    <div className={styles.industryGrid}>
                        {industries.map((ind) => {
                            const active = selected.includes(ind.id);
                            return (
                                <button
                                    key={ind.id}
                                    type="button"
                                    className={`${styles.industryCard} ${active ? styles.industryCardActive : ""}`}
                                    onClick={() => toggle(ind.id)}
                                    aria-pressed={active}
                                >
                                    <div className={styles.industryHeader}>
                                        <span className={styles.industryEmoji} aria-hidden="true">{ind.emoji}</span>
                                        <span className={styles.industryLabel}>{ind.label}</span>
                                        {active && (
                                            <span className={styles.checkMark} aria-hidden="true">
                                                <i className="ri-check-line" />
                                            </span>
                                        )}
                                    </div>
                                    <p className={styles.industryDesc}>{ind.description}</p>
                                    {typeof ind.topicCount === "number" && (
                                        <span className={styles.industryStats}>
                                            <i className="ri-chat-3-line" /> {ind.topicCount} 個話題
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {selected.length > 0 && (
                    <div className={styles.summary}>
                        進入後你會看到 <strong>{selected.length}</strong> 個論壇的話題，
                        包含 {selected
                            .map((id) => industries.find((i) => i.id === id)?.label)
                            .filter(Boolean)
                            .join("、")} ⸺ 之後也可以隨時調整。
                    </div>
                )}

                <div className={styles.actions}>
                    {closable && (
                        <button type="button" className={styles.ghostBtn} onClick={onClose}>
                            取消
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.primaryBtn}
                        disabled={!canSubmit}
                        onClick={submit}
                    >
                        {canSubmit ? "進入討論 →" : "選擇至少一個行業"}
                    </button>
                </div>
            </div>
        </div>
    );
}
