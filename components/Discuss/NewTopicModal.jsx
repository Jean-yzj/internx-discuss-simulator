import { useState } from "react";
import styles from "./DiscussList.module.css";

export default function NewTopicModal({
    industries,
    categories,
    initialIndustry,
    defaultName,
    profile,
    onClose,
    onCreated,
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [industry, setIndustry] = useState(initialIndustry || (industries[0]?.id ?? ""));
    const [category, setCategory] = useState("career");
    const [authorName, setAuthorName] = useState(defaultName || "");
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState("");

    async function submit() {
        const t = title.trim();
        if (!t) return;
        if (!industry) {
            setError("請選擇一個行業");
            return;
        }
        setPosting(true);
        setError("");
        try {
            const res = await fetch("/api/discuss/topics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: t,
                    description,
                    industry,
                    category,
                    authorName: authorName.trim() || "匿名同學",
                    userId: profile?.userId,
                    badges: profile?.badges || [],
                    brand: profile?.brand || null,
                }),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.error || "create failed");
            onCreated?.(json.topic);
        } catch (err) {
            setError(err.message || "發布失敗");
        } finally {
            setPosting(false);
        }
    }

    return (
        <div
            className={styles.modalBackdrop}
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div className={styles.modal}>
                <h3 className={styles.modalTitle}>開一個新話題</h3>

                <label className={styles.modalLabel}>主題標題</label>
                <input
                    className={styles.modalInput}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：投行 SA 面試 brain teaser 怎麼準備？"
                    maxLength={80}
                    autoFocus
                />

                <label className={styles.modalLabel}>行業</label>
                <select
                    className={styles.modalInput}
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                >
                    {industries.map((i) => (
                        <option key={i.id} value={i.id}>{i.emoji} {i.label}</option>
                    ))}
                </select>

                <label className={styles.modalLabel}>子分類</label>
                <select
                    className={styles.modalInput}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {categories.filter((c) => c.id !== "all").map((c) => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                </select>

                <label className={styles.modalLabel}>顯示名稱（可選）</label>
                <input
                    className={styles.modalInput}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="匿名同學"
                    maxLength={20}
                />

                <label className={styles.modalLabel}>補充說明（可選）</label>
                <textarea
                    className={styles.modalTextarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="多說一點背景，讓大家更知道怎麼回你⋯⋯"
                    maxLength={400}
                />

                {error && <div style={{ color: "#c43e3e", marginBottom: 10 }}>{error}</div>}

                <div className={styles.modalActions}>
                    <button type="button" className={styles.ghostBtn} onClick={onClose} disabled={posting}>
                        取消
                    </button>
                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={submit}
                        disabled={posting || !title.trim() || !industry}
                    >
                        {posting ? "發布中…" : "發布話題"}
                    </button>
                </div>
            </div>
        </div>
    );
}
