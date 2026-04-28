import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CATEGORIES } from "@/lib/store";
import styles from "./IndustryForum.module.css";
import NewTopicModal from "./NewTopicModal";

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
    return d.toLocaleDateString("zh-TW");
};

function avatarInitial(name) {
    if (!name) return "💬";
    return name.trim().charAt(0) || "💬";
}

export default function IndustryForum({
    industries,
    industryId,
    profile,
    onJoinIndustry,
    onLeaveIndustry,
}) {
    const router = useRouter();
    const industry = industries.find((i) => i.id === industryId);

    const [topics, setTopics] = useState(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [showNewTopic, setShowNewTopic] = useState(false);

    async function load() {
        if (!industryId) return;
        try {
            const params = new URLSearchParams();
            params.set("industry", industryId);
            if (activeCategory) params.set("category", activeCategory);
            const res = await fetch(`/api/discuss/topics?${params.toString()}`);
            const json = await res.json();
            if (json.ok) setTopics(json.topics);
        } catch (err) {
            console.error("load failed", err);
            setTopics([]);
        }
    }

    useEffect(() => {
        setTopics(null);
        load();
    }, [industryId, activeCategory]);

    const trending = useMemo(() => {
        if (!Array.isArray(topics) || topics.length === 0) return [];
        return [...topics]
            .sort((a, b) => {
                const aScore = a.replyCount * 2 + a.viewCount;
                const bScore = b.replyCount * 2 + b.viewCount;
                return bScore - aScore;
            })
            .slice(0, 5);
    }, [topics]);

    const stats = useMemo(() => {
        if (!Array.isArray(topics)) return null;
        const totalReplies = topics.reduce((acc, t) => acc + (t.replyCount || 0), 0);
        const totalViews = topics.reduce((acc, t) => acc + (t.viewCount || 0), 0);
        const lastActive = topics.reduce((latest, t) => {
            const ts = new Date(t.lastActivityAt).getTime();
            return ts > latest ? ts : latest;
        }, 0);
        return {
            topicCount: topics.length,
            totalReplies,
            totalViews,
            lastActive: lastActive ? new Date(lastActive) : null,
        };
    }, [topics]);

    if (!industry) {
        return (
            <div className={styles.page}>
                <div className={styles.notFound}>
                    <h2>找不到這個論壇</h2>
                    <p>網址可能拼錯了。</p>
                    <Link href="/">回到首頁</Link>
                </div>
            </div>
        );
    }

    const isJoined = profile?.industries?.includes(industry.id);

    return (
        <div
            className={styles.page}
            style={{ "--accent": industry.accent }}
        >
            <div className={styles.banner}>
                <div className={styles.bannerInner}>
                    <div className={styles.crumbs}>
                        <Link href="/"><i className="ri-home-3-line" /> 首頁</Link>
                        <i className="ri-arrow-right-s-line" />
                        <span>{industry.label}論壇</span>
                    </div>
                    <div className={styles.headerRow}>
                        <div className={styles.headerLeft}>
                            <div className={styles.bannerEmoji} aria-hidden="true">{industry.emoji}</div>
                            <div>
                                <h1 className={styles.bannerTitle}>{industry.label}論壇</h1>
                                <div className={styles.bannerStat}>
                                    {stats && (
                                        <>
                                            <span><i className="ri-chat-3-line" /> {stats.topicCount} 個話題</span>
                                            <span><i className="ri-message-3-line" /> {stats.totalReplies} 則回覆</span>
                                            <span><i className="ri-eye-line" /> {stats.totalViews} 次瀏覽</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.bannerActions}>
                            {isJoined ? (
                                <button
                                    type="button"
                                    className={styles.bannerGhostBtn}
                                    onClick={() => onLeaveIndustry?.(industry.id)}
                                    title="從你的訂閱中移除"
                                >
                                    <i className="ri-check-double-line" /> 已訂閱
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.bannerPrimaryBtn}
                                    onClick={() => onJoinIndustry?.(industry.id)}
                                >
                                    <i className="ri-bookmark-3-line" /> 加入這個論壇
                                </button>
                            )}
                            <button
                                type="button"
                                className={styles.bannerPrimaryBtn}
                                onClick={() => setShowNewTopic(true)}
                            >
                                <i className="ri-quill-pen-line" /> 開新話題
                            </button>
                        </div>
                    </div>
                    <p className={styles.bannerDesc}>{industry.description}</p>
                </div>
            </div>

            <div className={styles.body}>
                <div className={styles.topRow}>
                    <div className={styles.trendingCard}>
                        <h3>
                            <i className="ri-fire-fill" style={{ color: "#ff6a00" }} /> 本論壇熱門
                        </h3>
                        {topics === null ? (
                            <div className={styles.skeleton} style={{ height: 200 }} />
                        ) : trending.length === 0 ? (
                            <p style={{ margin: 0, color: "#888", fontSize: 14 }}>還沒有話題，當第一個發起的人吧！</p>
                        ) : (
                            trending.map((t, idx) => (
                                <Link key={t.id} href={`/topics/${t.id}`} className={styles.trendingItem}>
                                    <span className={`${styles.trendingRank} ${idx === 0 ? styles.trendingRankTop : ""}`}>
                                        {idx + 1}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 className={styles.trendingItemTitle}>{t.title}</h4>
                                        <span className={styles.trendingItemMeta}>
                                            <span><i className="ri-chat-3-line" /> {t.replyCount}</span>
                                            <span><i className="ri-eye-line" /> {t.viewCount}</span>
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    <div className={styles.statsCard}>
                        <h3 className={styles.statsTitle}>
                            <i className="ri-bar-chart-2-line" /> 論壇概況
                        </h3>
                        {stats && (
                            <>
                                <div className={styles.statRow}>
                                    <span>話題</span>
                                    <span className={styles.statValue}>{stats.topicCount}</span>
                                </div>
                                <div className={styles.statRow}>
                                    <span>回覆</span>
                                    <span className={styles.statValue}>{stats.totalReplies}</span>
                                </div>
                                <div className={styles.statRow}>
                                    <span>瀏覽</span>
                                    <span className={styles.statValue}>{stats.totalViews}</span>
                                </div>
                                {stats.lastActive && (
                                    <div className={styles.statRow}>
                                        <span>最近活動</span>
                                        <span style={{ color: "#111" }}>{RELATIVE_TIME(stats.lastActive)}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{industry.label}的所有話題</h2>
                        <p className={styles.sectionHelp}>依最新活動排序</p>
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
                                <span aria-hidden="true">{c.emoji}</span> {c.label}
                            </button>
                        ))}
                    </div>

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
                                <p>{industry.label}還沒有「{CATEGORIES.find((c) => c.id === activeCategory)?.label}」的話題</p>
                                <button
                                    type="button"
                                    onClick={() => setShowNewTopic(true)}
                                    style={{
                                        marginTop: 8,
                                        appearance: "none",
                                        border: "none",
                                        background: industry.accent,
                                        color: "white",
                                        padding: "10px 18px",
                                        borderRadius: 999,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                    }}
                                >
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
                                        <span className={styles.tag}>
                                            {CATEGORIES.find((c) => c.id === t.category)?.label || "其他"}
                                        </span>
                                        {t.replyCount >= 3 && (
                                            <span className={`${styles.tag} ${styles.tagHot}`}>🔥 熱聊中</span>
                                        )}
                                        <span><i className="ri-chat-3-line" /> {t.replyCount}</span>
                                        <span><i className="ri-time-line" /> {RELATIVE_TIME(t.lastActivityAt)}</span>
                                        <span><i className="ri-user-line" /> {t.authorName}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            {showNewTopic && (
                <NewTopicModal
                    industries={industries}
                    categories={CATEGORIES}
                    initialIndustry={industry.id}
                    defaultName={profile?.displayName}
                    onClose={() => setShowNewTopic(false)}
                    onCreated={(topic) => {
                        setShowNewTopic(false);
                        router.push(`/topics/${topic.id}`);
                    }}
                />
            )}
        </div>
    );
}
