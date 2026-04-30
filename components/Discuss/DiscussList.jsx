import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CATEGORIES } from "@/lib/store";
import { BadgeRow } from "@/components/Badge";
import styles from "./DiscussList.module.css";
import NewTopicModal from "./NewTopicModal";
import PollCard from "./PollCard";

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
    onPollVoted,
    onRecordActivity,
    hasCompletedSurvey,
}) {
    const router = useRouter();
    const [topics, setTopics] = useState(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [showNewTopic, setShowNewTopic] = useState(false);
    const [polls, setPolls] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    const [sortBy, setSortBy] = useState("latest"); // 'latest' | 'replies' | 'views'
    const [expertOnly, setExpertOnly] = useState(false);

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

    // Active polls — filter by joined industries on the client too so polls
    // immediately re-filter when industries change
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const params = new URLSearchParams();
                if (myIndustryParam) params.set("industries", myIndustryParam);
                const res = await fetch(`/api/discuss/polls?${params.toString()}`);
                const json = await res.json();
                if (!cancelled && json.ok) setPolls(json.polls.slice(0, 3));
            } catch (err) {
                console.error("load polls failed", err);
            }
        })();
        return () => { cancelled = true; };
    }, [myIndustryParam]);

    // Recommendations — re-fetch whenever profile changes
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const painPointIds = (profile?.painPoints?.painPoints || []).map((p) => p.id);
                // Flatten pollVotes shape { [pollId]: { [questionId]: optionId } }
                // → [{ pollId, questionId, optionId }] for the recommendation API
                const pollVotes = [];
                for (const [pollId, qMap] of Object.entries(profile?.pollVotes || {})) {
                    if (qMap && typeof qMap === "object") {
                        for (const [questionId, optionId] of Object.entries(qMap)) {
                            pollVotes.push({ pollId, questionId, optionId });
                        }
                    }
                }
                const res = await fetch("/api/discuss/recommendations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        industries: myIndustryIds,
                        painPointIds,
                        pollVotes,
                        limit: 6,
                    }),
                });
                const json = await res.json();
                if (!cancelled && json.ok) setRecommendations(json.topics);
            } catch (err) {
                console.error("recommendations failed", err);
            }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myIndustryParam, profile?.painPoints?.submittedAt, JSON.stringify(profile?.pollVotes || {})]);

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
                    <p className={styles.greeting}>
                        {greeting}，{profile?.displayName || "同學"} · 話題牆
                    </p>
                    <h1 className={styles.heroTitle}>
                        大家最近在<span className={styles.heroAccent}>關心什麼</span>？
                    </h1>
                    <p className={styles.heroSubtitle}>
                        投下你的需求，我們會根據大家的選擇媒合資源、活動與解決方案。
                        <br />
                        你訂閱了 <strong>{myIndustries.length}</strong> 個論壇：{myIndustries.map((i) => i.label).join("、")}
                    </p>
                    <div className={styles.actions}>
                        <button className={styles.primaryBtn} onClick={() => setShowNewTopic(true)} type="button">
                            <i className="ri-quill-pen-line" />
                            開一個新話題
                        </button>
                        <Link href="/experts" className={styles.ghostBtn} style={{ textDecoration: "none" }}>
                            <i className="ri-vip-crown-line" />
                            看認證專家
                        </Link>
                        <button className={styles.ghostBtn} onClick={onRequestEditProfile} type="button">
                            <i className="ri-equalizer-2-line" />
                            調整訂閱的論壇
                        </button>
                    </div>

                    {/* Survey CTA / completion summary */}
                    {!hasCompletedSurvey ? (
                        <div className={styles.surveyCta}>
                            <div className={styles.surveyCtaIcon}>🎯</div>
                            <div className={styles.surveyCtaBody}>
                                <h3 className={styles.surveyCtaTitle}>1 分鐘困擾調查，幫你過濾雜訊</h3>
                                <p className={styles.surveyCtaSubtitle}>
                                    告訴我們你最近在煩什麼，我們把<strong>有同樣困擾的學長姐怎麼解</strong>放在這頁最上面。
                                </p>
                            </div>
                            <Link href="/survey" className={styles.surveyCtaBtn}>
                                開始調查 <i className="ri-arrow-right-line" />
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.painSummary}>
                            <div className={styles.painSummaryEmoji}>✅</div>
                            <div className={styles.painSummaryText}>
                                <p className={styles.painSummaryTitle}>
                                    你的困擾調查已完成（{profile?.painPoints?.painPoints?.length || 0} 項）
                                </p>
                                <p className={styles.painSummaryHelp}>下面「為你推薦」就是依照你的回答排出來的。</p>
                            </div>
                            <Link href="/survey" className={styles.ghostBtn}>
                                <i className="ri-edit-2-line" /> 看結果／重填
                            </Link>
                        </div>
                    )}
                </div>

                {/* My activity (only when there is some) */}
                {Array.isArray(profile?.myActivity) && profile.myActivity.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <i className="ri-history-line" /> 我的活動
                            </h2>
                            <p className={styles.sectionHelp}>你開過或回過的話題</p>
                        </div>
                        <div className={styles.topicList}>
                            {profile.myActivity.slice(0, 5).map((act) => {
                                const ind = industries.find((i) => i.id === act.industry);
                                return (
                                    <Link key={act.id} href={`/topics/${act.id}`} className={styles.topicCard}>
                                        <div
                                            className={styles.topicAvatar}
                                            style={ind ? { background: ind.accent } : undefined}
                                        >
                                            <i className={act.role === "author" ? "ri-quill-pen-line" : "ri-reply-line"} />
                                        </div>
                                        <div className={styles.topicBody}>
                                            <h3 className={styles.topicTitle}>{act.title}</h3>
                                            <div className={styles.topicFooter}>
                                                <span
                                                    className={styles.tag}
                                                    style={{
                                                        background: act.role === "author" ? "rgba(1,130,253,0.10)" : "rgba(226,162,0,0.10)",
                                                        color: act.role === "author" ? "var(--theme-color)" : "var(--complementary-color)",
                                                    }}
                                                >
                                                    {act.role === "author" ? "你發起" : "你回覆過"}
                                                </span>
                                                {ind && (
                                                    <span
                                                        className={`${styles.tag} ${styles.industryTag}`}
                                                        style={{ "--accent": ind.accent }}
                                                    >
                                                        {ind.emoji} {ind.label}
                                                    </span>
                                                )}
                                                <span className={styles.metaItem}>
                                                    <i className="ri-time-line" /> {RELATIVE_TIME(act.lastTouchedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

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

                {/* Active polls */}
                {polls.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <i className="ri-bar-chart-grouped-fill" style={{ color: "#7c3aed" }} /> 本週投票
                            </h2>
                            <Link href="/polls" className={styles.sectionHelp} style={{ color: "#7c3aed", fontWeight: 700 }}>
                                看全部投票 →
                            </Link>
                        </div>
                        <div className={styles.pollList}>
                            {polls.map((p) => (
                                <PollCard
                                    key={p.id}
                                    poll={p}
                                    myVotes={profile?.pollVotes?.[p.id] || {}}
                                    userId={profile?.userId}
                                    onVoted={onPollVoted}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Personalized recommendations */}
                {recommendations.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                <i className="ri-magic-line" style={{ color: "var(--theme-color)" }} /> 為你推薦
                            </h2>
                            <p className={styles.sectionHelp}>
                                依你的訂閱、困擾、投票排序
                            </p>
                        </div>
                        <div className={styles.recList}>
                            {recommendations.map((t) => {
                                const ind = industries.find((i) => i.id === t.industry);
                                return (
                                    <Link key={t.id} href={`/topics/${t.id}`} className={styles.recCard}>
                                        <div className={styles.recReasons}>
                                            {(t.recReasons || []).map((r, idx) => (
                                                <span key={idx} className={styles.recReason}>
                                                    <i className="ri-sparkling-line" /> {r}
                                                </span>
                                            ))}
                                        </div>
                                        <h4 className={styles.recTitle}>{t.title}</h4>
                                        {t.description && <p className={styles.recDesc}>{t.description}</p>}
                                        <div className={styles.recFooter}>
                                            {ind && (
                                                <span
                                                    className={`${styles.tag} ${styles.industryTag}`}
                                                    style={{ "--accent": ind.accent }}
                                                >
                                                    {ind.emoji} {ind.label}
                                                </span>
                                            )}
                                            <span><i className="ri-chat-3-line" /> {t.replyCount}</span>
                                            <span><i className="ri-eye-line" /> {t.viewCount}</span>
                                        </div>
                                    </Link>
                                );
                            })}
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
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{
                                    appearance: "none",
                                    border: "1px solid #e5e5e5",
                                    background: "white",
                                    color: "#555",
                                    padding: "6px 28px 6px 12px",
                                    borderRadius: "var(--border-radius)",
                                    fontSize: 13,
                                    fontFamily: "inherit",
                                    cursor: "pointer",
                                }}
                            >
                                <option value="latest">最新活動</option>
                                <option value="replies">最多回覆</option>
                                <option value="views">最多瀏覽</option>
                            </select>
                            <label
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "6px 12px",
                                    border: "1px solid",
                                    borderColor: expertOnly ? "var(--theme-color)" : "#e5e5e5",
                                    background: expertOnly ? "var(--theme-white)" : "white",
                                    color: expertOnly ? "var(--theme-color)" : "#555",
                                    borderRadius: "var(--border-radius)",
                                    fontSize: 13,
                                    fontWeight: expertOnly ? 600 : 500,
                                    cursor: "pointer",
                                    userSelect: "none",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={expertOnly}
                                    onChange={(e) => setExpertOnly(e.target.checked)}
                                    style={{ display: "none" }}
                                />
                                <i className={expertOnly ? "ri-vip-crown-fill" : "ri-vip-crown-line"} />
                                只看專家
                            </label>
                        </div>
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
                        {Array.isArray(topics) && topics
                            .filter((t) => {
                                if (!expertOnly) return true;
                                return Array.isArray(t.authorBadges) && t.authorBadges.some((b) =>
                                    ["brand-expert", "industry-expert", "verified-creator", "kol"].includes(b)
                                );
                            })
                            .slice()
                            .sort((a, b) => {
                                if (sortBy === "replies") return (b.replyCount || 0) - (a.replyCount || 0);
                                if (sortBy === "views") return (b.viewCount || 0) - (a.viewCount || 0);
                                // latest (default already sorted by lastActivityAt desc from API)
                                return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
                            })
                            .map((t) => {
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
                                            {Array.isArray(t.authorBadges) && t.authorBadges.length > 0 && (
                                                <BadgeRow
                                                    badges={t.authorBadges}
                                                    brand={t.authorBrand}
                                                    variant="icon"
                                                />
                                            )}
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
                    profile={profile}
                    onClose={() => setShowNewTopic(false)}
                    onCreated={(topic) => {
                        setShowNewTopic(false);
                        onRecordActivity?.({
                            id: topic.id,
                            title: topic.title,
                            industry: topic.industry,
                            role: "author",
                        });
                        router.push(`/topics/${topic.id}`);
                    }}
                />
            )}
        </div>
    );
}
