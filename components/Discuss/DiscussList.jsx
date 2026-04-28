import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CATEGORIES } from "@/lib/store";
import styles from "./DiscussList.module.css";
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
    if (days < 30) return `${Math.floor(days / 7)} 週前`;
    return d.toLocaleDateString("zh-TW");
};

function avatarInitial(name) {
    if (!name) return "💬";
    return name.trim().charAt(0) || "💬";
}

export default function DiscussList({
    profile,
    industries,
    onRequestEditProfile,
}) {
    const router = useRouter();
    const [topics, setTopics] = useState(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [showNewTopic, setShowNewTopic] = useState(false);

    const myIndustryIds = profile?.industries || [];
    const myIndustryParam = useMemo(() => myIndustryIds.join(","), [myIndustryIds]);

    async function load() {
        try {
            const params = new URLSearchParams();
            if (myIndustryParam) params.set("industries", myIndustryParam);
            if (activeCategory) params.set("category", activeCategory);
            const res = await fetch(`/api/discuss/topics?${params.toString()}`);
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
    }, [activeCategory, myIndustryParam]);

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

    const myIndustries = useMemo(
        () => industries.filter((i) => myIndustryIds.includes(i.id)),
        [industries, myIndustryIds]
    );
    const otherIndustries = useMemo(
        () => industries.filter((i) => !myIndustryIds.includes(i.id)),
        [industries, myIndustryIds]
    );

    const greeting = useMemo(() => {
        const hr = new Date().getHours();
        if (hr < 5) return "深夜好";
        if (hr < 11) return "早安";
        if (hr < 14) return "中午好";
        if (hr < 18) return "下午好";
        return "晚安";
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.hero}>
                    <p className={styles.greeting}>{greeting}，{profile?.displayName || "同學"}</p>
                    <h1 className={styles.heroTitle}>
                        你訂閱的<span className={styles.heroAccent}>{myIndustries.length}</span>個論壇
                    </h1>
                    <p className={styles.heroSubtitle}>
                        看看{myIndustries.map((i) => i.label).join("、")}的同行學長姐、實習生、面試者最近在聊什麼。
                    </p>
                    <div className={styles.actions}>
                        <button className={styles.primaryBtn} onClick={() => setShowNewTopic(true)} type="button">
                            <i className="ri-quill-pen-line" />
                            開一個新話題
                        </button>
                        <button className={styles.ghostBtn} onClick={onRequestEditProfile} type="button">
                            <i className="ri-equalizer-2-line" />
                            調整訂閱的論壇
                        </button>
                    </div>
                </div>

                {/* My forums */}
                {myIndustries.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <i className="ri-bookmark-3-line" /> 我的論壇
                            </h2>
                            <p className={styles.sectionHelp}>點進去看每個行業的完整討論</p>
                        </div>
                        <div className={styles.industryCardsRow}>
                            {myIndustries.map((ind) => (
                                <Link
                                    key={ind.id}
                                    href={`/forums/${ind.id}`}
                                    className={styles.industryCard}
                                    style={{ "--accent": ind.accent }}
                                >
                                    <div className={styles.industryCardHeader}>
                                        <span className={styles.industryCardEmoji} aria-hidden="true">{ind.emoji}</span>
                                        <span className={styles.industryCardLabel}>{ind.label}</span>
                                        <span className={styles.industryCardCount}>{ind.topicCount} 話題</span>
                                    </div>
                                    <p className={styles.industryCardDesc}>{ind.description}</p>
                                    <div className={styles.industryCardFooter}>
                                        <span>{ind.label}論壇</span>
                                        <span className={styles.industryCardCta}>
                                            進入 <i className="ri-arrow-right-line" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Trending across joined industries */}
                {trending.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <i className={`ri-fire-fill ${styles.fireIcon}`} />
                                你的論壇正熱
                            </h2>
                            <p className={styles.sectionHelp}>
                                依「回覆數 × 2 + 瀏覽數」計算
                            </p>
                        </div>
                        <div className={styles.trendingScroll}>
                            {trending.map((t) => {
                                const ind = industries.find((i) => i.id === t.industry);
                                return (
                                    <Link
                                        key={t.id}
                                        href={`/topics/${t.id}`}
                                        className={styles.trendingCard}
                                    >
                                        <div className={styles.trendingBadgeRow}>
                                            <span className={styles.trendingBadge}>🔥 熱門</span>
                                            {ind && (
                                                <span
                                                    className={styles.industryBadge}
                                                    style={{ "--accent": ind.accent }}
                                                >
                                                    {ind.emoji} {ind.label}
                                                </span>
                                            )}
                                        </div>
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
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Recent across my forums + sub-category filter */}
                <section className={styles.section} id="latest">
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>最新話題</h2>
                        <p className={styles.sectionHelp}>來自你訂閱的論壇</p>
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
                                <p>這個分類在你訂閱的論壇還沒有話題，當第一個發起的人吧？</p>
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
                        {Array.isArray(topics) && topics.map((t) => {
                            const ind = industries.find((i) => i.id === t.industry);
                            return (
                                <Link key={t.id} href={`/topics/${t.id}`} className={styles.topicCard}>
                                    <div className={styles.topicAvatar}>{avatarInitial(t.authorName)}</div>
                                    <div className={styles.topicBody}>
                                        <h3 className={styles.topicTitle}>{t.title}</h3>
                                        {t.description && <p className={styles.topicDesc}>{t.description}</p>}
                                        <div className={styles.topicFooter}>
                                            {ind && (
                                                <span
                                                    className={`${styles.tag} ${styles.industryTag}`}
                                                    style={{ "--accent": ind.accent }}
                                                >
                                                    {ind.emoji} {ind.label}
                                                </span>
                                            )}
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
                            );
                        })}
                    </div>
                </section>

                {/* Discover other industries */}
                {otherIndustries.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <i className="ri-compass-3-line" /> 探索其他論壇
                            </h2>
                            <p className={styles.sectionHelp}>逛逛其他行業在聊什麼</p>
                        </div>
                        <div className={styles.discoverRow}>
                            {otherIndustries.map((ind) => (
                                <Link
                                    key={ind.id}
                                    href={`/forums/${ind.id}`}
                                    className={styles.discoverChip}
                                >
                                    <span aria-hidden="true">{ind.emoji}</span>
                                    {ind.label}
                                    <span style={{ color: "#9ca3af" }}>· {ind.topicCount}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
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
                    industries={industries}
                    categories={CATEGORIES}
                    initialIndustry={myIndustryIds[0] || industries[0]?.id}
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
