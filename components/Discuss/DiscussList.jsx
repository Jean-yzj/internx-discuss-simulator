import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CATEGORIES } from "@/lib/store";
import styles from "./DiscussList.module.css";

const RELATIVE_TIME = (date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    const diffMs = Date.now() - d.getTime();
    if (diffMs < 0) return "剛剛";
    const m = Math.floor(diffMs / 60000);
    if (m < 1) return "剛剛";
    if (m < 60) return `${m} 分鐘前`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} 小時前`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days} 天前`;
    if (days < 30) return `${Math.floor(days / 7)} 週前`;
    return d.toLocaleDateString("zh-TW");
};

function avatarInitial(name) {
    if (!name) return "💬";
    return name.trim().charAt(0) || "💬";
}

export default function DiscussList() {
    const router = useRouter();
    const [topics, setTopics] = useState(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [showNewTopic, setShowNewTopic] = useState(false);

    async function load() {
        try {
            const res = await fetch(`/api/discuss/topics?category=${encodeURIComponent(activeCategory)}`);
            const json = await res.json();
            if (json.ok) setTopics(json.topics);
        } catch (err) {
            console.error("load topics failed", err);
            setTopics([]);
        }
    }

    useEffect(() => {
        setTopics(null);
        load();
    }, [activeCategory]);

    const trending = useMemo(() => {
        if (!Array.isArray(topics) || topics.length === 0) return [];
        return [...topics]
            .sort((a, b) => {
                const aScore = a.replyCount * 2 + a.viewCount;
                const bScore = b.replyCount * 2 + b.viewCount;
                return bScore - aScore;
            })
            .slice(0, 4);
    }, [topics]);

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.hero}>
                    <h1 className={styles.heroTitle}>
                        討論話題<span className={styles.heroAccent}>．</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        看看大家最近在聊什麼，找到跟你有同樣困惑的人，留言一起聊聊。
                    </p>
                    <div className={styles.actions}>
                        <button className={styles.primaryBtn} onClick={() => setShowNewTopic(true)} type="button">
                            <i className="ri-quill-pen-line" />
                            開一個新話題
                        </button>
                        <a className={styles.ghostBtn} href="#latest">
                            看看大家在聊什麼
                        </a>
                    </div>
                </div>

                {trending.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <i className={`ri-fire-fill ${styles.fireIcon}`} />
                                熱門話題
                            </h2>
                        </div>
                        <div className={styles.trendingScroll}>
                            {trending.map((t) => (
                                <Link
                                    key={t.id}
                                    href={`/topics/${t.id}`}
                                    className={styles.trendingCard}
                                >
                                    <span className={styles.trendingBadge}>🔥 熱門</span>
                                    <h3 className={styles.trendingTitle}>{t.title}</h3>
                                    <div className={styles.trendingMeta}>
                                        <span className={styles.metaItem}>
                                            <i className="ri-chat-3-line" /> {t.replyCount} 則回覆
                                        </span>
                                        <span className={styles.metaItem}>
                                            <i className="ri-eye-line" /> {t.viewCount}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section className={styles.section} id="latest">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>所有話題</h2>
                    </div>
                    <div className={styles.categoryRow}>
                        {CATEGORIES.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                className={`${styles.categoryChip} ${
                                    activeCategory === c.id ? styles.categoryChipActive : ""
                                }`}
                                onClick={() => setActiveCategory(c.id)}
                            >
                                <span aria-hidden="true">{c.emoji}</span>
                                {c.label}
                            </button>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.topicList}>
                        {topics === null && (
                            <>
                                <div className={styles.skeleton} />
                                <div className={styles.skeleton} />
                                <div className={styles.skeleton} />
                            </>
                        )}
                        {Array.isArray(topics) && topics.length === 0 && (
                            <div className={styles.empty}>
                                <div className={styles.emptyEmoji}>💭</div>
                                <p>這個分類還沒有話題，要不要當第一個發起的人？</p>
                                <button
                                    type="button"
                                    className={styles.primaryBtn}
                                    onClick={() => setShowNewTopic(true)}
                                    style={{ marginTop: 12 }}
                                >
                                    <i className="ri-quill-pen-line" />
                                    我來開個話題
                                </button>
                            </div>
                        )}
                        {Array.isArray(topics) && topics.map((t) => (
                            <Link key={t.id} href={`/topics/${t.id}`} className={styles.topicCard}>
                                <div className={styles.topicAvatar}>{avatarInitial(t.authorName)}</div>
                                <div className={styles.topicBody}>
                                    <h3 className={styles.topicTitle}>{t.title}</h3>
                                    {t.description && <p className={styles.topicDesc}>{t.description}</p>}
                                    <div className={styles.topicFooter}>
                                        {t.replyCount >= 3 && (
                                            <span className={`${styles.tag} ${styles.tagHot}`}>🔥 熱聊中</span>
                                        )}
                                        <span className={styles.tag}>
                                            {CATEGORIES.find((c) => c.id === t.category)?.label || "其他"}
                                        </span>
                                        <span className={styles.metaItem}>
                                            <i className="ri-chat-3-line" /> {t.replyCount}
                                        </span>
                                        <span className={styles.metaItem}>
                                            <i className="ri-time-line" /> {RELATIVE_TIME(t.lastActivityAt)}
                                        </span>
                                        <span className={styles.metaItem}>
                                            <i className="ri-user-line" /> {t.authorName}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            <button
                className={styles.fab}
                type="button"
                onClick={() => setShowNewTopic(true)}
                aria-label="開新話題"
            >
                <i className="ri-quill-pen-line" />
            </button>

            {showNewTopic && (
                <NewTopicModal
                    onClose={() => setShowNewTopic(false)}
                    onCreated={(id) => {
                        setShowNewTopic(false);
                        router.push(`/topics/${id}`);
                    }}
                />
            )}
        </div>
    );
}

function NewTopicModal({ onClose, onCreated }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("career");
    const [authorName, setAuthorName] = useState("");
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState("");

    async function submit() {
        const t = title.trim();
        if (!t) return;
        setPosting(true);
        setError("");
        try {
            const res = await fetch("/api/discuss/topics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: t,
                    description,
                    category,
                    authorName: authorName.trim() || "匿名同學",
                }),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.error || "create failed");
            onCreated?.(json.topic.id);
        } catch (err) {
            setError(err.message || "發布失敗");
        } finally {
            setPosting(false);
        }
    }

    return (
        <div className={styles.modalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
            <div className={styles.modal}>
                <h3 className={styles.modalTitle}>開一個新話題</h3>

                <label className={styles.modalLabel}>主題標題</label>
                <input
                    className={styles.modalInput}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：大三才開始準備實習會不會太晚？"
                    maxLength={80}
                    autoFocus
                />

                <label className={styles.modalLabel}>分類</label>
                <select
                    className={styles.modalInput}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                </select>

                <label className={styles.modalLabel}>顯示名稱（可選，預設「匿名同學」）</label>
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
                        disabled={posting || !title.trim()}
                    >
                        {posting ? "發布中…" : "發布話題"}
                    </button>
                </div>
            </div>
        </div>
    );
}
